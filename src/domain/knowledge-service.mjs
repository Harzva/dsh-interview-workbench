import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

// Repository text is untrusted reference material. Nothing fetched is executed.
export const KNOWLEDGE_LIMITS = Object.freeze({ repositories: 12, filesPerRepository: 24, fileBytes: 262144, repositoryBytes: 4194304, chunkCharacters: 12000, requestTimeoutMs: 15000, syncTimeoutMs: 120000, results: 12 });
export const RECOMMENDED_REPOSITORIES = Object.freeze([
  { repo: 'ombharatiya/AI-Engineer-Interview-Questions', title: 'AI 工程 · RAG 与 Agent 原题', license: 'MIT', query: 'RAG retrieval' },
  { repo: 'alirezadir/AIMLInterviews', title: 'AI / ML 面试 · 系统与基础', license: 'MIT', query: 'Agent evaluation' },
]);
const QUEUES = new Map();
const SHA = /^[a-f0-9]{40}$/i;
const clone = value => structuredClone(value);
const empty = () => ({ schemaVersion: 1, repositories: [] });
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 32);
function fail(code, message) { const error = new Error(message); error.name = 'KnowledgeError'; error.code = code; throw error; }
function check(value, message) { if (!value) fail('KNOWLEDGE_INVALID_INPUT', message); }
function aborted(signal) { if (signal?.aborted) fail('KNOWLEDGE_CANCELLED', '资料同步已取消；已有索引保持不变'); }
function normalizeRepo(input) {
  check(typeof input === 'string' && input.length <= 300, '请填写公开 GitHub 仓库 owner/repo 或仓库首页地址');
  let value = input.trim();
  if (value.startsWith('https://')) {
    let url; try { url = new URL(value); } catch { check(false, 'GitHub 仓库地址无效'); }
    check(url.origin === 'https://github.com' && !url.username && !url.password && !url.search && !url.hash, '只支持公开 github.com 仓库首页');
    value = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  }
  value = value.replace(/\.git$/i, '');
  check(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(value) && !value.endsWith('/.') && !value.endsWith('/..'), '请填写 owner/repo，不包含分支、路径或访问凭据');
  return value;
}
const keyFor = repo => repo.toLowerCase();
function serial(key, operation) {
  const pending = (QUEUES.get(key) ?? Promise.resolve()).catch(() => {}).then(operation);
  QUEUES.set(key, pending);
  pending.finally(() => { if (QUEUES.get(key) === pending) QUEUES.delete(key); }).catch(() => {});
  return pending;
}
function validateState(state) {
  check(state?.schemaVersion === 1 && Array.isArray(state.repositories) && state.repositories.length <= KNOWLEDGE_LIMITS.repositories, '知识库文件格式无效');
  const ids = new Set();
  for (const repository of state.repositories) {
    normalizeRepo(repository.repo); check(SHA.test(repository.commit) && typeof repository.license === 'string' && Array.isArray(repository.chunks), '知识库版本或片段无效');
    check(!ids.has(keyFor(repository.repo)), '知识库仓库重复'); ids.add(keyFor(repository.repo));
    const chunkIds = new Set();
    for (const chunk of repository.chunks) {
      check(/^chunk:[a-f0-9]{32}$/.test(chunk.id) && !chunkIds.has(chunk.id) && typeof chunk.text === 'string' && chunk.text.length <= KNOWLEDGE_LIMITS.chunkCharacters && chunk.repo === repository.repo && chunk.commit === repository.commit, '知识库片段损坏');
      chunkIds.add(chunk.id);
      check(typeof chunk.title === 'string' && chunk.title.length > 0 && typeof chunk.path === 'string' && chunk.path.length <= 1000 && typeof chunk.license === 'string' && chunk.license === repository.license, '知识库来源元数据损坏');
      check(typeof chunk.url === 'string' && chunk.url.startsWith(`https://github.com/${repository.repo}/blob/${repository.commit}/`) && Number.isInteger(chunk.lineStart) && chunk.lineStart >= 1 && Number.isInteger(chunk.lineEnd) && chunk.lineEnd >= chunk.lineStart && typeof chunk.truncated === 'boolean', '知识库来源定位损坏');
      if (chunk.question) check(typeof chunk.question.title === 'string' && chunk.question.title.length > 0 && typeof chunk.question.prompt === 'string' && chunk.question.prompt.length > 0 && typeof chunk.question.answer === 'string' && chunk.question.answer.length > 0 && Array.isArray(chunk.question.followUps) && chunk.question.followUps.every(x => typeof x === 'string'), '知识库原题损坏');
    }
  }
  return state;
}
async function readState(path) {
  let raw;
  try { raw = await readFile(path, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return empty(); fail('KNOWLEDGE_STORAGE_READ', '无法读取本地知识库，请检查私有数据目录权限'); }
  try { return validateState(JSON.parse(raw)); } catch { fail('KNOWLEDGE_STORAGE_CORRUPT', '本地知识库损坏或版本不兼容；已保留原文件'); }
}
async function persist(path, state, signal) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const file = await open(temporary, 'wx', 0o600);
    try { await file.writeFile(`${JSON.stringify(state)}\n`); await file.sync(); } finally { await file.close(); }
    aborted(signal); await rename(temporary, path);
  } catch (error) { await rm(temporary, { force: true }).catch(() => {}); if (error.code === 'KNOWLEDGE_CANCELLED') throw error; fail('KNOWLEDGE_STORAGE_WRITE', '资料保存失败；已有索引保持不变'); }
}
const cleanHeading = value => value.replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').replace(/^\s*(?:Q(?:uestion)?\s*)?\d+[.):、]\s*/i, '').trim();
function questionLike(value) {
  const title = cleanHeading(value);
  if (/^(how to (?:use|install|contribute|run|navigate)|getting started|table of contents|如何(?:使用本|安装|贡献))/i.test(title)) return false;
  return title.length >= 12 && title.length <= 1500 && (/[?？]\s*$/.test(title) || /^(?:what|why|how|when|where|which|explain|describe|compare|design|walk me through|implement|discuss)\b/i.test(title) || /^(?:什么|为什么|如何|解释|比较|设计|请说明)/u.test(title));
}
function extractQuestion(title, body) {
  if (!questionLike(title)) return undefined;
  let answer = body.trim();
  let prompt = cleanHeading(title);
  const details = /<details[^>]*>\s*<summary[^>]*>[\s\S]*?(?:answer|solution|答案|解答)[\s\S]*?<\/summary>/i.exec(answer);
  if (details) { const context = answer.slice(0, details.index).trim(); if (context) prompt += `\n\n${context}`; answer = answer.slice(details.index + details[0].length); }
  answer = answer.replace(/<\/?(?:details|summary|b|strong)(?:\s[^>]*)?>/gi, '').replace(/^\s*(?:\*\*)?(?:answer|solution|答案|解答)(?:\*\*)?\s*[:：]?\s*/i, '').trim();
  let followUps = [];
  const follow = /(?:^|\n)\s*(?:\*\*)?(?:follow[- ]?ups?|追问)(?:\*\*)?\s*[:：](?:\*\*)?\s*([\s\S]*)$/i.exec(answer);
  if (follow) { followUps = follow[1].trim().split(/(?<=[?？])\s+|\n+/u).map(x => x.replace(/^[-*]\s*/, '').trim()).filter(Boolean).slice(0, 8); answer = answer.slice(0, follow.index).trim(); }
  // A list of links / a question index is not an answer.
  const substance = answer.replace(/\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]*>/g, '').replace(/https?:\/\/\S+/g, '').replace(/[#*_`\s|>\-]/g, '');
  if (substance.length < 40 || /^\s*(?:see |read |参见|详见|查看)/i.test(answer) && substance.length < 120) return undefined;
  return { title: cleanHeading(title), prompt, answer, followUps };
}
function chunksFor(repo, commit, license, path, markdown) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const marks = [{ index: 0, level: 0, title: path.split('/').at(-1).replace(/\.md$/i, ''), question: false }];
  let fence = null;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const delimiter = /^\s*(`{3,}|~{3,})/.exec(line);
    if (delimiter) { if (!fence) fence = delimiter[1][0]; else if (fence === delimiter[1][0]) fence = null; continue; }
    if (fence) continue;
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    const numbered = /^\s{0,3}(?:\d+[.)、]|Q\d+[.:])\s+(.+)$/i.exec(line);
    if (heading) marks.push({ index, level: heading[1].length, title: cleanHeading(heading[2]), question: questionLike(heading[2]) });
    else if (numbered && questionLike(numbered[1])) marks.push({ index, level: 7, title: cleanHeading(numbered[1]), question: true });
  }
  const chunks = [];
  for (let index = 0; index < marks.length;) {
    const mark = marks[index]; let next = index + 1;
    if (mark.question) while (next < marks.length && !marks[next].question && marks[next].level > mark.level) next++;
    const end = next < marks.length ? marks[next].index : lines.length;
    const text = lines.slice(mark.index, end).join('\n').trim();
    if (text.length >= 40) {
      const question = mark.question && text.length <= KNOWLEDGE_LIMITS.chunkCharacters ? extractQuestion(mark.title, lines.slice(mark.index + 1, end).join('\n')) : undefined;
      for (let offset = 0; offset < text.length; offset += KNOWLEDGE_LIMITS.chunkCharacters) {
        const fragment = text.slice(offset, offset + KNOWLEDGE_LIMITS.chunkCharacters);
        const lineStart = mark.index + 1 + (text.slice(0, offset).match(/\n/g)?.length ?? 0);
        const lineEnd = lineStart + (fragment.match(/\n/g)?.length ?? 0);
        chunks.push({ id: `chunk:${hash(`${repo}:${commit}:${path}:${mark.index}:${offset}`)}`, repo, path, commit, url: `https://github.com/${repo}/blob/${commit}/${path.split('/').map(encodeURIComponent).join('/')}#L${lineStart}-L${lineEnd}`, title: mark.title, text: fragment, license, lineStart, lineEnd, truncated: text.length > KNOWLEDGE_LIMITS.chunkCharacters, ...(question ? { question } : {}) });
      }
    }
    index = next;
  }
  return chunks;
}
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'what', 'how', 'why', 'is', 'are', 'of', 'to', 'in', 'a', 'an', '面试', '题目', '问题']);
const ALIASES = [
  { pattern: /检索|知识库|rag/i, terms: ['rag', 'retrieval'] },
  { pattern: /智能体|agent/i, terms: ['agent', 'agents', 'agentic'] },
  { pattern: /评估|测评|evaluation/i, terms: ['evaluation', 'evaluate'] },
  { pattern: /向量|embedding/i, terms: ['embedding', 'embeddings', 'vector'] },
  { pattern: /微调|fine.?tun/i, terms: ['fine-tuning', 'finetuning'] },
  { pattern: /注意力|attention/i, terms: ['attention'] },
  { pattern: /工具调用|tool.?call/i, terms: ['tool', 'function calling'] },
];
function queryTerms(query) {
  const original = [...new Set((query.toLowerCase().match(/[a-z0-9]+(?:[-_][a-z0-9]+)*|[\p{Script=Han}]{2,}/gu) ?? []).filter(x => !STOP_WORDS.has(x)))];
  const expandedTerms = [...new Set(ALIASES.filter(alias => alias.pattern.test(query)).flatMap(alias => alias.terms))];
  return { terms: [...new Set([...original, ...expandedTerms])], expandedTerms };
}
function occurrences(text, term) {
  if (/^[a-z0-9-]+$/.test(term)) return (text.match(new RegExp(`\\b${term.replace(/[-]/g, '\\-')}\\b`, 'g')) ?? []).length;
  return text.split(term).length - 1;
}
const repositoryDto = ({ chunks, ...repository }) => ({ ...repository, chunkCount: chunks.length, status: 'ready' });

export async function createKnowledgeService({ storagePath, readonly = false, fetchImpl = globalThis.fetch } = {}) {
  check(typeof fetchImpl === 'function', '资料下载器不可用');
  const path = storagePath ? resolve(storagePath) : null;
  const queueKey = path ?? Symbol('knowledge');
  let state = path ? await readState(path) : empty();
  async function refresh() { if (path) state = await readState(path); return state; }
  async function request(url, { signal, maxBytes, json = false } = {}) {
    check(url.startsWith('https://api.github.com/repos/'), '资料请求地址无效');
    aborted(signal);
    const combined = AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(KNOWLEDGE_LIMITS.requestTimeoutMs)]);
    let response;
    try { response = await fetchImpl(url, { signal: combined, redirect: 'error', credentials: 'omit', headers: { 'User-Agent': 'dsh-interview-workbench', Accept: json ? 'application/vnd.github+json' : 'application/vnd.github.raw+json', 'X-GitHub-Api-Version': '2022-11-28' } }); }
    catch { aborted(signal); fail('KNOWLEDGE_NETWORK', 'GitHub 资料请求超时或网络不可用；已有索引保持不变'); }
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) fail('KNOWLEDGE_RATE_LIMIT', 'GitHub 暂时限制匿名请求，请稍后同步；已有索引仍可检索');
      if (response.status === 404) fail('KNOWLEDGE_NOT_FOUND', '未找到公开仓库或资料；请检查仓库名称');
      fail('KNOWLEDGE_HTTP', `GitHub 请求失败（${response.status}）；已有索引保持不变`);
    }
    const advertised = Number(response.headers?.get?.('content-length') ?? 0);
    if (advertised > maxBytes) { await response.body?.cancel?.().catch(() => {}); fail('KNOWLEDGE_LIMIT', 'GitHub 响应超过大小上限；已有索引保持不变'); }
    let raw;
    try {
      if (response.body?.getReader) {
        const reader = response.body.getReader(); const buffers = []; let size = 0;
        try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > maxBytes) { await reader.cancel(); fail('KNOWLEDGE_LIMIT', 'GitHub 响应超过大小上限；已有索引保持不变'); } buffers.push(Buffer.from(part.value)); } } finally { reader.releaseLock(); }
        raw = Buffer.concat(buffers).toString('utf8');
      } else { raw = await response.text(); if (Buffer.byteLength(raw) > maxBytes) fail('KNOWLEDGE_LIMIT', 'GitHub 响应超过大小上限'); }
    } catch (error) { if (error.code) throw error; aborted(signal); fail('KNOWLEDGE_NETWORK', 'GitHub 资料读取中断；已有索引保持不变'); }
    aborted(signal);
    if (!json) return raw;
    try { return JSON.parse(raw); } catch { fail('KNOWLEDGE_RESPONSE', 'GitHub 返回了无法识别的资料格式'); }
  }
  return {
    async snapshot() {
      await refresh();
      const repositories = state.repositories.map(repositoryDto);
      for (const recommendation of RECOMMENDED_REPOSITORIES) if (!repositories.some(x => keyFor(x.repo) === keyFor(recommendation.repo))) repositories.push({ ...recommendation, id: keyFor(recommendation.repo), url: `https://github.com/${recommendation.repo}`, commit: null, syncedAt: null, fileCount: 0, chunkCount: 0, status: 'available', recommended: true });
      return clone({ repositories, stats: { repositoryCount: state.repositories.length, fileCount: state.repositories.reduce((sum, x) => sum + x.fileCount, 0), chunkCount: state.repositories.reduce((sum, x) => sum + x.chunks.length, 0) }, limits: KNOWLEDGE_LIMITS, readonly, retrieval: 'lexical', storage: path ? 'local' : 'memory' });
    },
    async sync({ repo } = {}, signal) {
      if (readonly) fail('KNOWLEDGE_READONLY', '当前工作台为只读，不能同步资料');
      const requested = normalizeRepo(repo);
      return serial(queueKey, async () => {
        aborted(signal); await refresh();
        check(state.repositories.some(x => keyFor(x.repo) === keyFor(requested)) || state.repositories.length < KNOWLEDGE_LIMITS.repositories, '本地仓库已达到数量上限');
        const bounded = AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(KNOWLEDGE_LIMITS.syncTimeoutMs)]);
        const base = `https://api.github.com/repos/${requested}`;
        const metadata = await request(base, { signal: bounded, maxBytes: 262144, json: true });
        check(metadata?.private === false && typeof metadata.default_branch === 'string' && metadata.default_branch.length <= 250, '只支持具有默认分支的公开 GitHub 仓库');
        const canonical = normalizeRepo(metadata.full_name ?? requested);
        check(keyFor(canonical) === keyFor(requested), '仓库已迁移，请使用新的仓库首页地址');
        const version = await request(`${base}/commits/${encodeURIComponent(metadata.default_branch)}`, { signal: bounded, maxBytes: 2097152, json: true });
        check(SHA.test(version?.sha), '无法确定仓库固定版本');
        const commit = version.sha;
        const existing = state.repositories.find(x => keyFor(x.repo) === keyFor(canonical));
        if (existing?.commit === commit) {
          existing.checkedAt = new Date().toISOString();
          if (path) await persist(path, state, bounded);
          return clone({ ...repositoryDto(existing), unchanged: true });
        }
        const tree = await request(`${base}/git/trees/${commit}?recursive=1`, { signal: bounded, maxBytes: 8388608, json: true });
        check(Array.isArray(tree?.tree), 'GitHub 文件列表格式无效');
        const blobs = tree.tree.filter(x => x.type === 'blob' && x.mode !== '120000' && typeof x.path === 'string' && x.path.length <= 1000 && !x.path.split('/').some(part => part === '.' || part === '..') && !/[\u0000-\u001f\u007f?#\\]/u.test(x.path));
        const license = typeof metadata.license?.spdx_id === 'string' && metadata.license.spdx_id !== 'NOASSERTION' ? metadata.license.spdx_id : 'unknown';
        const licenseFile = blobs.find(x => /^(?:license|copying)(?:\.(?:md|txt))?$/i.test(x.path) && x.size <= 65536);
        const licenseText = licenseFile ? await request(`${base}/contents/${encodeURIComponent(licenseFile.path)}?ref=${commit}`, { signal: bounded, maxBytes: 65536 }) : null;
        const markdown = blobs.filter(x => /\.(?:md|markdown)$/i.test(x.path) && !/(?:^|\/)(?:node_modules|\.github|vendor|_book|assets)(?:\/|$)/i.test(x.path) && !/(?:^|\/)(?:license|contributing|code_of_conduct|changelog)(?:\.|$)/i.test(x.path));
        const priority = path => (/question/i.test(path) ? 8 : 0) + (/rag|retriev|agent/i.test(path) ? 6 : 0) + (/^(?:cn|zh|zh-cn)\//i.test(path) ? 4 : 0) + (/llm|fundamental|interview/i.test(path) ? 2 : 0) - (/readme/i.test(path) ? 2 : 0);
        markdown.sort((a, b) => priority(b.path) - priority(a.path) || a.path.localeCompare(b.path, 'en'));
        const selected = []; let plannedBytes = 0; let skippedOversize = 0;
        for (const item of markdown) {
          if (!Number.isInteger(item.size) || item.size > KNOWLEDGE_LIMITS.fileBytes) { skippedOversize++; continue; }
          if (selected.length >= KNOWLEDGE_LIMITS.filesPerRepository || plannedBytes + item.size > KNOWLEDGE_LIMITS.repositoryBytes) continue;
          selected.push(item); plannedBytes += item.size;
        }
        check(selected.length > 0, '仓库中没有本次可索引的 Markdown 文件（单文件上限 256 KiB）');
        const chunks = []; const files = []; let totalBytes = 0;
        // Four bounded public reads at a time; any failure leaves the previous index intact.
        for (let offset = 0; offset < selected.length; offset += 4) {
          const batch = await Promise.all(selected.slice(offset, offset + 4).map(async item => {
            const text = await request(`${base}/contents/${item.path.split('/').map(encodeURIComponent).join('/')}?ref=${commit}`, { signal: bounded, maxBytes: KNOWLEDGE_LIMITS.fileBytes });
            return { item, text, bytes: Buffer.byteLength(text) };
          }));
          for (const entry of batch) {
            totalBytes += entry.bytes; check(totalBytes <= KNOWLEDGE_LIMITS.repositoryBytes, '资料总量超过本次同步上限');
            files.push({ path: entry.item.path, bytes: entry.bytes, sha: entry.item.sha });
            chunks.push(...chunksFor(canonical, commit, license, entry.item.path, entry.text));
          }
        }
        const recommendation = RECOMMENDED_REPOSITORIES.find(x => keyFor(x.repo) === keyFor(canonical));
        const repository = { id: keyFor(canonical), repo: canonical, title: recommendation?.title ?? canonical, query: recommendation?.query ?? 'RAG', url: `https://github.com/${canonical}`, license, licensePath: licenseFile?.path ?? null, licenseText, commit, syncedAt: new Date().toISOString(), fileCount: files.length, totalBytes, scope: { discoveredMarkdown: markdown.length, indexedPaths: files.map(x => x.path), omittedFiles: markdown.length - files.length, skippedOversize, treeTruncated: tree.truncated === true, truncated: tree.truncated === true || files.length < markdown.length }, files, chunks, recommended: Boolean(recommendation) };
        aborted(bounded);
        const next = { schemaVersion: 1, repositories: [...state.repositories.filter(x => keyFor(x.repo) !== keyFor(canonical)), repository] };
        if (path) await persist(path, next, bounded);
        state = next;
        return clone(repositoryDto(repository));
      });
    },
    async retrieve({ query, repo, limit = 8 } = {}) {
      check(typeof query === 'string' && query.trim().length > 0 && query.length <= 500, '请输入 1–500 字符的检索内容');
      check(Number.isInteger(limit) && limit >= 1 && limit <= KNOWLEDGE_LIMITS.results, '检索数量须为 1–12');
      const filter = repo ? keyFor(normalizeRepo(repo)) : null;
      await refresh();
      const { terms, expandedTerms } = queryTerms(query);
      const results = state.repositories.filter(x => !filter || keyFor(x.repo) === filter).flatMap(x => x.chunks).map(chunk => {
        const title = chunk.title.toLowerCase(); const body = chunk.text.toLowerCase();
        const matches = terms.map(term => ({ term, title: occurrences(title, term), count: occurrences(body, term) })).filter(x => x.count > 0 || x.title > 0);
        const score = matches.reduce((sum, x) => sum + (x.title ? 5 : 0) + Math.min(x.count, 8), 0);
        return { ...chunk, score, matchedTerms: matches.map(x => x.term) };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
      return clone({ query: query.trim(), results, expandedTerms, retrieval: 'lexical' });
    },
    async evidence({ chunkIds } = {}) {
      check(Array.isArray(chunkIds) && chunkIds.length >= 1 && chunkIds.length <= 12 && chunkIds.every(x => typeof x === 'string' && /^chunk:[a-f0-9]{32}$/.test(x)), '来源片段须为 1–12 个有效 id');
      await refresh();
      const byId = new Map(state.repositories.flatMap(x => x.chunks).map(x => [x.id, x]));
      return clone([...new Set(chunkIds)].map(id => { const chunk = byId.get(id); if (!chunk) fail('KNOWLEDGE_EVIDENCE_MISSING', '来源片段已不存在或资料已更新，请重新检索后出题'); return { ...chunk, score: 0 }; }));
    },
  };
}
