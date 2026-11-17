import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { buildLearningMemory } from './learning-memory.mjs';

export const TRACKS = ['ai-algorithm', 'agent-engineer'];
const FILE_QUEUES = new Map();
const ID = /^[A-Za-z0-9][A-Za-z0-9:_-]{0,199}$/;
const DIFFICULTIES = ['easy', 'medium', 'hard', 'unspecified'];
const PROGRESS_FILTERS = ['all', 'unanswered', 'needs-review', 'reviewed'];
const clone = value => structuredClone(value);
const now = () => new Date().toISOString();
const emptyState = () => ({ schemaVersion: 1, practices: [] });

export class InterviewError extends Error {
  constructor(code, message) { super(message); this.name = 'InterviewError'; this.code = code; }
}
function fail(code, message) { throw new InterviewError(code, message); }
function check(ok, message) { if (!ok) fail('DOMAIN_INVALID_INPUT', message); }
function object(value, name = '参数') { check(value && typeof value === 'object' && !Array.isArray(value), `${name}必须是对象`); }
function id(value, name = 'id') { check(typeof value === 'string' && ID.test(value), `${name}格式无效`); return value; }
function text(value, name, max = 100_000) { check(typeof value === 'string' && value.trim().length > 0 && value.length <= max, `${name}须为 1–${max} 字符的非空文本`); return value; }
function practiceTitle(value) {
  check(typeof value === 'string' && !/[\u0000-\u001f\u007f-\u009f]/u.test(value), '训练名称须为不含控制字符的文本');
  const title = value.trim(); check(title.length <= 80, '训练名称不能超过 80 字符');
  return title || null;
}
function track(value) { check(TRACKS.includes(value), '未知岗位方向'); return value; }
function integer(value, name, min, max) { check(Number.isInteger(value) && value >= min && value <= max, `${name}须为 ${min}–${max} 的整数`); return value; }
function sourceUrl(value, name) {
  text(value, name, 4096);
  let parsed; try { parsed = new URL(value); } catch { check(false, `${name}无效`); }
  check(parsed.protocol === 'https:' && !parsed.username && !parsed.password, `${name}须为 HTTPS 来源链接`);
}
function validateProvenance(q) {
  if (q.source.url !== undefined && q.source.url !== null) sourceUrl(q.source.url, '来源链接');
  if (q.source.license !== undefined) text(q.source.license, '来源许可', 500);
  if (q.origin === undefined && q.citations === undefined) return;
  check(['extracted', 'generated'].includes(q.origin), '题目类型须为 extracted 或 generated');
  check(Array.isArray(q.citations) && q.citations.length >= 1 && q.citations.length <= 12, '题目须保留 1–12 个资料引用');
  const seen = new Set();
  for (const citation of q.citations) {
    object(citation, '引用'); id(citation.id, '引用 id'); check(!seen.has(citation.id), '重复资料引用'); seen.add(citation.id);
    text(citation.repo, '引用仓库', 500); text(citation.path, '引用路径', 1000); text(citation.commit, '引用版本', 500);
    text(citation.title, '引用标题', 2000); text(citation.license, '引用许可', 500); sourceUrl(citation.url, '引用链接');
    check(Object.keys(citation).every(key => ['id', 'repo', 'path', 'commit', 'url', 'title', 'license'].includes(key)), '引用只能包含来源元数据');
  }
  check(q.citations.some(citation => citation.id === q.source.sourceId), '主要来源须在引用中');
  if (q.difficulty !== undefined) check(DIFFICULTIES.includes(q.difficulty), '题目难度无效');
}
function validateQuestion(q) {
  object(q, '题目'); id(q.id); text(q.title, '标题', 2000); text(q.prompt, '题干'); text(q.answer, '参考答案', 250_000);
  check(Array.isArray(q.followUps) && q.followUps.every(x => typeof x === 'string'), '追问须为文本数组');
  text(q.topic, '专题', 300); check(Array.isArray(q.tracks) && q.tracks.length > 0 && q.tracks.every(x => TRACKS.includes(x)), '题目岗位无效');
  object(q.source, '来源'); text(q.source.id, '来源 id', 500); text(q.source.repo, '来源仓库', 500); text(q.source.path, '来源路径', 1000); text(q.source.sourceId, '源题 id', 500);
  check(q.source.commit === null || typeof q.source.commit === 'string', '来源版本无效');
  validateProvenance(q);
  return q;
}
function validateCatalog(catalog) {
  object(catalog, '题库'); check(catalog.schemaVersion === 1 && Array.isArray(catalog.questions) && Array.isArray(catalog.sources), '题库格式/版本无效');
  const seen = new Set();
  for (const q of catalog.questions) { validateQuestion(q); check(!seen.has(q.id), `重复题目 id: ${q.id}`); seen.add(q.id); }
  return clone(catalog);
}
function validateState(state) {
  object(state, '进度'); check(state.schemaVersion === 1 && Array.isArray(state.practices), '进度格式/版本无效');
  if (state.addedQuestions !== undefined) {
    check(Array.isArray(state.addedQuestions), '动态题库须为数组'); const questionIds = new Set();
    for (const q of state.addedQuestions) {
      validateQuestion(q); check(['extracted', 'generated'].includes(q.origin), '动态题目缺少来源类型');
      check(!questionIds.has(q.id), '重复动态题目 id'); questionIds.add(q.id);
    }
  }
  const seen = new Set();
  for (const p of state.practices) {
    object(p, '练习'); id(p.id); check(!seen.has(p.id), '重复练习 id'); seen.add(p.id); track(p.track);
    if (p.title !== undefined && p.title !== null) p.title = practiceTitle(p.title);
    check(['coach', 'mock'].includes(p.mode) && ['active', 'finished'].includes(p.status), '练习状态无效');
    check(typeof p.createdAt === 'string' && typeof p.updatedAt === 'string' && (p.finishedAt === null || typeof p.finishedAt === 'string'), '练习时间无效');
    check(Array.isArray(p.questions) && p.questions.length > 0 && Array.isArray(p.attempts), '练习题目或作答缺失');
    const qids = new Set();
    for (const q of p.questions) { validateQuestion(q); check(!qids.has(q.id), '重复练习题'); qids.add(q.id); }
    const aids = new Set();
    for (const a of p.attempts) {
      id(a.id); check(!aids.has(a.id) && qids.has(a.questionId), '作答关联无效'); aids.add(a.id); text(a.answer, '作答');
      check(typeof a.createdAt === 'string' && Array.isArray(a.reviews), '作答格式无效');
      for (const r of a.reviews) { id(r.id); integer(r.score, '评分', 0, 4); text(r.notes, '评分依据', 20_000); check(['self', 'agent'].includes(r.reviewer) && typeof r.createdAt === 'string', '评分归属无效'); }
    }
  }
  return state;
}

async function readState(path) {
  let raw;
  try { raw = await readFile(path, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return emptyState(); throw new InterviewError('DOMAIN_STORAGE_READ', '无法读取练习存储，请检查私有数据目录权限'); }
  try { return validateState(JSON.parse(raw)); } catch { fail('DOMAIN_STORAGE_CORRUPT', '练习存储损坏或版本不兼容；已保留原文件，请先恢复备份再继续'); }
}
async function writeState(path, state, signal) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    signal?.throwIfAborted();
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const file = await open(temporary, 'wx', 0o600);
    try { await file.writeFile(`${JSON.stringify(state, null, 2)}\n`, 'utf8'); await file.sync(); } finally { await file.close(); }
    signal?.throwIfAborted();
    await rename(temporary, path);
  } catch { await rm(temporary, { force: true }).catch(() => {}); signal?.throwIfAborted(); fail('DOMAIN_STORAGE_WRITE', '练习保存失败；未覆盖已有进度，请检查空间和权限后重试'); }
}
function serial(key, operation) {
  const preceding = FILE_QUEUES.get(key) ?? Promise.resolve();
  const pending = preceding.catch(() => {}).then(operation);
  FILE_QUEUES.set(key, pending);
  pending.finally(() => { if (FILE_QUEUES.get(key) === pending) FILE_QUEUES.delete(key); }).catch(() => {});
  return pending;
}
function publicQuestion(q, reveal = false) {
  const { answer, followUps, ...metadata } = q;
  return clone(reveal ? q : metadata);
}
function visibleReviews(p, attempt) { return p.mode === 'mock' && p.status !== 'finished' ? [] : attempt.reviews; }
function latestReview(reviews) { return reviews.reduce((latest, review) => !latest || review.createdAt >= latest.createdAt ? review : latest, null); }
const unanswered = () => ({ status: 'unanswered', attemptCount: 0, score: null, reviewer: null, lastPracticeId: null, updatedAt: null });
function learningProgress(practices) {
  const records = new Map();
  for (const p of practices) for (const attempt of p.attempts) {
    const previous = records.get(attempt.questionId);
    const attemptCount = (previous?.attemptCount ?? 0) + 1;
    if (!previous || attempt.createdAt >= previous.attempt.createdAt) records.set(attempt.questionId, { practice: p, attempt, attemptCount });
    else previous.attemptCount = attemptCount;
  }
  return new Map([...records].map(([questionId, { practice, attempt, attemptCount }]) => {
    const review = latestReview(visibleReviews(practice, attempt));
    return [questionId, { status: !review ? 'unreviewed' : review.score < 3 ? 'needs-review' : 'reviewed', attemptCount,
      score: review?.score ?? null, reviewer: review?.reviewer ?? null, lastPracticeId: practice.id, updatedAt: review?.createdAt ?? attempt.createdAt }];
  }));
}
function catalogFilters({ query = '', topic, difficulty, progress = 'all', sourceId }) {
  check(typeof query === 'string' && query.length <= 1000, '搜索词过长或无效');
  if (topic !== undefined) text(topic, '专题', 300);
  if (difficulty !== undefined) check(DIFFICULTIES.includes(difficulty), '难度须为 easy、medium、hard 或 unspecified');
  if (sourceId !== undefined) text(sourceId, '来源 id', 500);
  check(PROGRESS_FILTERS.includes(progress), '学习进度筛选无效');
  return { needle: query.trim().toLocaleLowerCase(), topic, difficulty, progress, sourceId: sourceId?.trim() || undefined };
}
function needsReview(learning) { return learning.status === 'unreviewed' || learning.status === 'needs-review'; }
function matchesQuestion(q, filters, learning) {
  return (!filters.topic || q.topic === filters.topic)
    && (!filters.difficulty || (DIFFICULTIES.includes(q.difficulty) ? q.difficulty : 'unspecified') === filters.difficulty)
    && (!filters.sourceId || q.source?.id === filters.sourceId)
    && (filters.progress === 'all' || (filters.progress === 'needs-review' ? needsReview(learning) : learning.status === filters.progress))
    && (!filters.needle || [q.title, q.prompt, q.topic, ...(q.tags ?? [])].join(' ').toLocaleLowerCase().includes(filters.needle));
}
function shuffle(questions) {
  for (let i = questions.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [questions[i], questions[j]] = [questions[j], questions[i]]; }
  return questions;
}
function latestAttempts(p) {
  const latest = new Map(); for (const a of p.attempts) latest.set(a.questionId, a); return [...latest.values()];
}
function summary(p) {
  const latest = latestAttempts(p); const reviewed = latest.map(a => latestReview(visibleReviews(p, a))).filter(Boolean);
  return { id: p.id, title: p.title ?? null, previewTitle: p.questions[0]?.title ?? '面试训练', track: p.track, mode: p.mode, status: p.status, createdAt: p.createdAt, updatedAt: p.updatedAt, finishedAt: p.finishedAt,
    questionCount: p.questions.length, answeredCount: latest.length, reviewedCount: reviewed.length,
    averageScore: reviewed.length ? Math.round(reviewed.reduce((n, r) => n + r.score, 0) / reviewed.length * 100) / 100 : null };
}
function practiceDto(p) {
  const reveal = p.mode === 'coach' || p.status === 'finished';
  return { ...summary(p), questionIds: p.questions.map(q => q.id), questions: p.questions.map(q => publicQuestion(q, reveal)),
    attempts: p.attempts.map(a => ({ ...clone(a), reviews: reveal ? clone(a.reviews) : [] })) };
}
function findPractice(state, value) { id(value, 'practiceId'); const p = state.practices.find(p => p.id === value); if (!p) fail('DOMAIN_NOT_FOUND', '练习不存在'); return p; }
function active(p) { if (p.status !== 'active') fail('DOMAIN_FINISHED', '该轮练习已结束；请新建练习后重答'); }

/** Best-effort redaction supplements omission; it cannot detect all sensitive business details. */
export function redactExport(value) {
  return value
    .replace(/\b(?:Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, 'Bearer [已脱敏]')
    .replace(/\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9]{15,}|github_pat_[A-Za-z0-9_]{15,})\b/g, '[密钥已脱敏]')
    .replace(/((?:api[_ -]?key|token|password|secret|cookie|密码|密钥)\s*[:=：]\s*)[^\s,;，；]+/gi, '$1[已脱敏]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[邮箱已脱敏]')
    .replace(/(?<!\d)(?:\+?86[- ]?)?1[3-9]\d{9}(?!\d)/g, '[手机号已脱敏]')
    .replace(/(?:\/Users\/|\/home\/|\/Volumes\/)[^\s\n`<>"']+/g, '[本地路径已脱敏]')
    .replace(/[A-Za-z]:\\(?:Users|Documents and Settings)\\[^\s\n`<>"']+/g, '[本地路径已脱敏]');
}

/** A single Host service owns writes. Same-process instances serialize shared-file writes. */
export async function createInterviewService({ catalog, storagePath, readonly = false } = {}) {
  const content = validateCatalog(catalog); check(typeof readonly === 'boolean', 'readonly 须为布尔值');
  if (storagePath !== undefined) text(storagePath, 'storagePath', 4096);
  const path = storagePath === undefined ? null : resolve(storagePath);
  const queueKey = path ?? Symbol('interview-memory');
  let memory = path ? await readState(path) : emptyState();
  const staticIds = new Set(content.questions.map(q => q.id));
  function validateMergedState(state) {
    if ((state.addedQuestions ?? []).some(q => staticIds.has(q.id))) fail('DOMAIN_STORAGE_CORRUPT', '动态题库与内置题库 id 冲突；已保留原文件，请先恢复备份再继续');
    return state;
  }
  validateMergedState(memory);
  const current = async () => validateMergedState(path ? await readState(path) : clone(memory));
  const questionsIn = state => [...content.questions, ...(state.addedQuestions ?? [])];
  const questionsById = state => new Map(questionsIn(state).map(q => [q.id, q]));
  async function mutate(fn, signal) {
    signal?.throwIfAborted();
    if (readonly) fail('DOMAIN_READONLY', '当前工作台为只读模式，无法更改练习记录');
    return serial(queueKey, async () => { signal?.throwIfAborted(); const state = await current(); signal?.throwIfAborted(); const result = fn(state); if (path) await writeState(path, state, signal); else memory = state; return clone(result); });
  }
  const service = {
    async learningSnapshot(options = {}) {
      object(options); const chosen = track(options.track);
      const state = await current();
      return buildLearningMemory({ questions: questionsIn(state), practices: state.practices, progress: learningProgress(state.practices), track: chosen });
    },
    async addQuestions(options = {}, signal) {
      object(options); check(Array.isArray(options.questions) && options.questions.length >= 1 && options.questions.length <= 30, '每次须保存 1–30 道题目');
      const questions = clone(options.questions);
      for (const q of questions) { validateQuestion(q); check(['extracted', 'generated'].includes(q.origin), '动态题目缺少来源类型'); check(!staticIds.has(q.id), '动态题目不能覆盖内置题目'); }
      return mutate(state => {
        const added = new Map((state.addedQuestions ?? []).map(q => [q.id, q])); const result = new Map();
        for (const q of questions) {
          const previous = added.get(q.id); check(!previous || isDeepStrictEqual(previous, q), '题目 id 已存在且内容不同，请保存为新题目');
          if (!previous) added.set(q.id, q); result.set(q.id, previous ?? q);
        }
        state.addedQuestions = [...added.values()]; return { questionIds: [...result.keys()], questions: [...result.values()] };
      }, signal);
    },
    async snapshot(options = {}) {
      object(options); const { track: chosen, limit = 30, offset = 0 } = options;
      if (chosen !== undefined) track(chosen); const filters = catalogFilters(options);
      integer(limit, 'limit', 1, 200); integer(offset, 'offset', 0, 1_000_000);
      const state = await current(); const progress = learningProgress(state.practices);
      const learning = q => progress.get(q.id) ?? unanswered();
      const questions = questionsIn(state); const trackQuestions = questions.filter(q => !chosen || q.tracks.includes(chosen));
      const filtered = trackQuestions.filter(q => matchesQuestion(q, filters, learning(q)));
      const counts = { all: trackQuestions.length, unanswered: 0, needsReview: 0, reviewed: 0 };
      const topicsById = new Map();
      for (const q of trackQuestions) {
        const l = learning(q); counts[l.status === 'unanswered' ? 'unanswered' : needsReview(l) ? 'needsReview' : 'reviewed']++;
        const topic = topicsById.get(q.topic) ?? { id: q.topic, title: q.topic, count: 0, answeredCount: 0, needsReviewCount: 0 };
        topic.count++; if (l.attemptCount) topic.answeredCount++; if (needsReview(l)) topic.needsReviewCount++; topicsById.set(q.topic, topic);
      }
      const sourceById = new Map(content.sources.map(source => [source.id, source]));
      for (const q of trackQuestions) if (!sourceById.has(q.source.id)) sourceById.set(q.source.id, q.source);
      const sourceCounts = new Map();
      for (const q of trackQuestions) sourceCounts.set(q.source.id, (sourceCounts.get(q.source.id) ?? 0) + 1);
      const sources = [...sourceById.values()].map(source => ({ ...source, trackQuestionCount: sourceCounts.get(source.id) ?? 0 }));
      const practices = state.practices.filter(p => !chosen || p.track === chosen);
      const attempts = practices.flatMap(p => p.attempts); const reviewed = practices.flatMap(p => p.attempts.map(a => latestReview(visibleReviews(p, a))).filter(Boolean));
      return { catalog: { total: questions.length, trackTotal: trackQuestions.length, counts, filtered: filtered.length,
        questions: filtered.slice(offset, offset + limit).map(q => ({ ...publicQuestion(q), learning: clone(learning(q)) })), topics: [...topicsById.values()], sources: clone(sources) },
        practices: [...practices].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(summary),
        stats: { practiceCount: practices.length, completedCount: practices.filter(p => p.status === 'finished').length, attemptCount: attempts.length, reviewedCount: reviewed.length,
          averageScore: reviewed.length ? Math.round(reviewed.reduce((n, r) => n + r.score, 0) / reviewed.length * 100) / 100 : null,
          needsReview: trackQuestions.filter(q => needsReview(learning(q))).map(q => q.id) }, readonly, persistence: { mode: path ? 'file' : 'memory', status: 'ready' } };
    },
    async question({ id: value } = {}) { id(value); const state = await current(); const q = questionsById(state).get(value); if (!q) fail('DOMAIN_NOT_FOUND', '题目不存在');
      return { ...publicQuestion(q, true), learning: learningProgress(state.practices).get(value) ?? unanswered() }; },
    async start(options = {}, signal) {
      object(options); const { track: chosen, mode, questionIds, count = 5, selection = 'ordered' } = options; track(chosen); check(['coach', 'mock'].includes(mode), '模式须为 coach 或 mock');
      const title = options.title === undefined ? null : practiceTitle(options.title);
      integer(count, '题量', 1, 30); const filters = catalogFilters(options); check(['ordered', 'shuffle'].includes(selection), '选题顺序须为 ordered 或 shuffle');
      if (questionIds !== undefined) {
        check(Array.isArray(questionIds) && questionIds.length >= 1 && questionIds.length <= 30, '请选择 1–30 道题');
        check(new Set(questionIds).size === questionIds.length, '同一轮不能重复选题');
        questionIds.forEach(value => id(value, 'questionId'));
      }
      return mutate(state => {
        const byId = questionsById(state);
        let questions = questionIds?.map(value => { const q = byId.get(value); check(q && q.tracks.includes(chosen), '题目不存在或不属于当前岗位'); return clone(q); });
        if (!questions) {
          const progress = learningProgress(state.practices);
          const matched = questionsIn(state).filter(q => q.tracks.includes(chosen) && matchesQuestion(q, filters, progress.get(q.id) ?? unanswered()));
          questions = (selection === 'shuffle' ? shuffle(matched) : matched).slice(0, count).map(clone);
        }
        check(questions.length > 0, '当前筛选下没有可练习题目');
        const at = now(); const p = { id: `p_${randomUUID()}`, title, track: chosen, mode, status: 'active', createdAt: at, updatedAt: at, finishedAt: null, questions, attempts: [] }; state.practices.push(p); return practiceDto(p);
      }, signal);
    },
    async practice({ id: value } = {}) { return practiceDto(findPractice(await current(), value)); },
    async rename(options = {}) {
      object(options); const title = practiceTitle(options.title);
      return mutate(state => { const p = findPractice(state, options.practiceId);
        if ((p.title ?? null) !== title) { p.title = title; p.updatedAt = now(); }
        return practiceDto(p);
      });
    },
    async answer({ practiceId, questionId, answer } = {}) {
      id(questionId, 'questionId'); text(answer, '作答');
      return mutate(state => { const p = findPractice(state, practiceId); active(p); check(p.questions.some(q => q.id === questionId), '题目不属于本轮练习');
        const at = now(); p.attempts.push({ id: `a_${randomUUID()}`, questionId, answer, createdAt: at, reviews: [] }); p.updatedAt = at; return practiceDto(p); });
    },
    async review({ practiceId, questionId, attemptId, score, notes, reviewer = 'self' } = {}, signal) {
      id(questionId, 'questionId'); id(attemptId, 'attemptId'); integer(score, '评分', 0, 4); text(notes, '评分依据', 20_000); check(['self', 'agent'].includes(reviewer), '评分来源须为 self 或 agent');
      return mutate(state => { const p = findPractice(state, practiceId); if (p.mode === 'mock' && p.status !== 'finished') fail('DOMAIN_MOCK_ACTIVE', '请先结束模拟面试，再记录评分与复盘依据');
        const attempt = p.attempts.find(a => a.id === attemptId && a.questionId === questionId); check(attempt, '未找到本轮题目对应的作答');
        const at = now(); attempt.reviews.push({ id: `r_${randomUUID()}`, reviewer, score, notes, createdAt: at }); p.updatedAt = at; return practiceDto(p); }, signal);
    },
    async finish({ practiceId } = {}) {
      return mutate(state => { const p = findPractice(state, practiceId); if (p.status !== 'finished') { p.status = 'finished'; p.finishedAt = now(); p.updatedAt = p.finishedAt; } return practiceDto(p); });
    },
    async export({ practiceId, includeAnswers = false } = {}) {
      check(typeof includeAnswers === 'boolean', 'includeAnswers 须为布尔值'); const p = findPractice(await current(), practiceId); const s = summary(p);
      const lines = ['# 面试训练复盘', '', `方向：${p.track === 'ai-algorithm' ? 'AI 算法' : 'Agent 工程'}`, `模式：${p.mode === 'mock' ? '模拟面试' : '教练练习'}`, `状态：${p.status === 'finished' ? '已结束' : '进行中'}`, `题目：${s.questionCount}；已作答：${s.answeredCount}；已评分：${s.reviewedCount}`, '', '评分来源标记为自评或 Agent 点评，表示该次记录，不代表已掌握。', includeAnswers ? '已按明确选择包含作答与评分依据；常见敏感标识已做尽力脱敏，分享前仍需自行检查内容。' : '默认省略原始作答与评分依据等自由文本；仅导出题目和分数摘要。', ''];
      for (const q of p.questions) {
        lines.push(`## ${q.title}`, '', `专题：${q.topic}`, `来源：${q.source.repo} / ${q.source.sourceId}`, '');
        const attempts = p.attempts.filter(a => a.questionId === q.id);
        lines.push(`作答次数：${attempts.length}`);
        attempts.forEach((a, index) => {
          lines.push(`- 第 ${index + 1} 次作答`);
          if (includeAnswers) lines.push('', a.answer, '');
          for (const r of a.reviews) if (p.mode !== 'mock' || p.status === 'finished') { lines.push(`  - ${r.reviewer === 'self' ? '自评' : 'Agent 评分'}：${r.score}/4`); if (includeAnswers) lines.push('', r.notes, ''); }
        }); lines.push('');
      }
      return redactExport(lines.join('\n'));
    },
  };
  return Object.freeze(service);
}
