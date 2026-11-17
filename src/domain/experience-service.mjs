import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { EXPERIENCE_ROUNDS, EXPERIENCE_GAPS, INTERVIEW_PLAYBOOKS, ALGORITHM_PATTERNS } from '../content/interview-playbooks.mjs';

const QUEUES = new Map();
const TRACKS = ['ai-algorithm', 'agent-engineer'];
const KINDS = ['personal', 'practice', 'source'];
const STATUS = ['planned', 'practicing', 'verified'];
const LABELS = { title: '经验标题', company: '公司', role: '岗位', questions: '问题与追问', actualAnswer: '当时的回答 / 资料中的做法', gap: '卡点与原因', nextAction: '下一步行动', evidence: '证据或资料出处', verification: '复练结果' };
const empty = () => ({ schemaVersion: 1, records: [] });
const fail = message => { throw new Error(message); };
function checkedRecord(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('经验记录格式无效');
  if (!TRACKS.includes(input.track) || !KINDS.includes(input.kind) || !STATUS.includes(input.status) || !EXPERIENCE_ROUNDS.some(r => r.id === input.round)) fail('经验分类无效');
  const result = Object.fromEntries(['track', 'kind', 'status', 'round'].map(key => [key, input[key]]));
  for (const [key, label] of Object.entries(LABELS)) {
    const value = input[key] ?? '';
    const max = ['title', 'company', 'role'].includes(key) ? 200 : 20000;
    if (typeof value !== 'string' || value.length > max) fail(`${label}格式无效或过长`);
    result[key] = value.trim();
  }
  for (const key of ['title', 'questions', 'actualAnswer', 'gap', 'nextAction']) if (!result[key]) fail(`请填写${LABELS[key]}`);
  if (result.kind === 'source' && !result.evidence) fail('资料提炼必须填写出处');
  if (result.status === 'verified' && !result.verification) fail('标记已复练验证前，请填写实际复练结果');
  if (typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(input.date)) || new Date(input.date).toISOString().slice(0, 10) !== input.date) fail('请填写有效的面试 / 学习日期');
  result.date = input.date;
  if (!EXPERIENCE_GAPS.includes(input.category)) fail('请选择主要卡点');
  result.category = input.category;
  return result;
}
function validateState(state) {
  if (state?.schemaVersion !== 1 || !Array.isArray(state.records)) fail('经验存储格式无效');
  const ids = new Set();
  for (const record of state.records) {
    checkedRecord(record);
    if (typeof record.id !== 'string' || !/^experience:[a-f0-9-]{36}$/.test(record.id) || ids.has(record.id) || !Number.isSafeInteger(record.revision) || record.revision < 1 || !Number.isFinite(Date.parse(record.updatedAt)) || !Number.isFinite(Date.parse(record.createdAt))) fail('经验存储记录无效');
    ids.add(record.id);
  }
  return state;
}

/** Separate private storage: damage here cannot prevent question practice. */
export async function createExperienceService({ catalog, storagePath, readonly = false }) {
  const path = storagePath ? resolve(storagePath) : null;
  const key = path ?? Symbol('experiences');
  let memory = empty();
  async function read() {
    if (!path) return structuredClone(memory);
    try { return validateState(JSON.parse(await readFile(path, 'utf8'))); }
    catch (error) {
      if (error.code === 'ENOENT') return empty();
      fail('经验档案暂时无法读取，原文件已保留；题库和训练可继续使用。');
    }
  }
  await read();
  const resources = Array.isArray(catalog.resources) ? catalog.resources.filter(r => r && typeof r.id === 'string' && typeof r.title === 'string' && typeof r.body === 'string' && r.source && typeof r.source.path === 'string') : [];
  const summaries = [
    { match: 'Transformer 被深挖', title: '从项目概念追问到实现，再回看机考', summary: '这篇面经转述了围绕 Transformer 架构、机考复盘与手撕题展开的追问。可把它转化为准备顺序：画结构 → 解释选择 → 写最小实现 → 复盘当时不会的题。文章中的个人判断及公司流程描述尚未独立核实。' },
    { match: '技术岗线下面试全流程详解', title: '二面准备要覆盖项目深挖与现场表达', summary: '资料提到技术一面、技术二面和主管面，以及项目问答与白板编程。可用作准备范围参考；面试轮次、时长、是否换题等安排，应以本次招聘通知为准。' },
    { match: 'JAVA后端二面手撕', title: '从题型识别走向推导，避免只记原题', summary: '资料展示了字符串循环移位和矩阵旋转的手撕案例。可复用的练法是：先从小样例找不变量，再解释推导并处理边界；不能据此推断所有二面都考同类题。' },
  ].flatMap(item => { const resource = resources.find(r => r.title.includes(item.match)); return resource ? [{ title: item.title, summary: item.summary, resourceId: resource.id, sourceTitle: resource.title, publishedAt: resource.source.publishedAt }] : []; });
  return {
    async experienceSnapshot({ track = 'ai-algorithm', round = '', query = '' } = {}) {
      if (!TRACKS.includes(track) || typeof query !== 'string' || query.length > 1000 || (round && !EXPERIENCE_ROUNDS.some(r => r.id === round))) fail('经验筛选无效');
      const state = await read(); const all = state.records.filter(r => r.track === track);
      const records = all.filter(r => (!round || r.round === round) && (!query.trim() || Object.values(r).filter(v => typeof v === 'string').join(' ').toLowerCase().includes(query.trim().toLowerCase()))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const questions = catalog.questions.filter(q => q.tracks.includes(track) && q.source.id === 'tazige-html');
      const patterns = ALGORITHM_PATTERNS.map(({ match, ...pattern }) => {
        const matched = questions.filter(q => match.test([q.topic, ...(q.tags ?? [])].join(' ')));
        return { ...pattern, count: matched.length, examples: matched.slice(-3).map(q => ({ id: q.id, title: q.title, sourceDate: q.source.publishedAt })) };
      }).filter(p => p.count);
      return { track, readonly, records, rounds: EXPERIENCE_ROUNDS, gaps: EXPERIENCE_GAPS, playbooks: INTERVIEW_PLAYBOOKS, patterns, summaries,
        resources: resources.map(({ body, ...meta }) => meta),
        stats: { total: all.length, verified: all.filter(r => r.status === 'verified').length, pending: all.filter(r => r.status !== 'verified').length,
          recurringGaps: EXPERIENCE_GAPS.map(category => ({ category, count: all.filter(r => r.category === category && r.status !== 'verified').length })).filter(x => x.count).sort((a, b) => b.count - a.count) } };
    },
    async experienceResource({ id } = {}) {
      const resource = resources.find(r => r.id === id);
      if (!resource) fail('资料不存在');
      return structuredClone(resource);
    },
    async saveExperience(options = {}, signal) {
      signal?.throwIfAborted();
      if (readonly) fail('当前工作台为只读模式，无法保存经验');
      const record = checkedRecord(options);
      if (options.id !== undefined && (typeof options.id !== 'string' || !/^experience:[a-f0-9-]{36}$/.test(options.id))) fail('经验 id 无效');
      const previous = QUEUES.get(key) ?? Promise.resolve();
      const pending = previous.catch(() => {}).then(async () => {
        signal?.throwIfAborted();
        const state = await read(); const old = state.records.find(r => r.id === options.id);
        if (options.id && !old) fail('经验记录不存在，请刷新后重试');
        if (old && options.revision !== old.revision) fail('这条经验已在其他页面更新，请重新打开后再保存；当前草稿已保留。');
        const timestamp = new Date().toISOString();
        const saved = { ...record, id: old?.id ?? `experience:${randomUUID()}`, revision: (old?.revision ?? 0) + 1, createdAt: old?.createdAt ?? timestamp, updatedAt: timestamp };
        state.records = old ? state.records.map(r => r.id === old.id ? saved : r) : [...state.records, saved];
        signal?.throwIfAborted();
        if (path) {
          const temporary = `${path}.${randomUUID()}.tmp`;
          try {
            await mkdir(dirname(path), { recursive: true, mode: 0o700 });
            await writeFile(temporary, JSON.stringify(state, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
            signal?.throwIfAborted(); await rename(temporary, path);
          } catch (error) { await rm(temporary, { force: true }).catch(() => {}); signal?.throwIfAborted(); fail('经验保存失败，已有档案保持不变'); }
        } else memory = state;
        return structuredClone(saved);
      });
      QUEUES.set(key, pending); pending.finally(() => { if (QUEUES.get(key) === pending) QUEUES.delete(key); }).catch(() => {});
      return pending;
    },
  };
}
