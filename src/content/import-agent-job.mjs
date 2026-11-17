import { createHash } from 'node:crypto';

export const REPOSITORY = 'Harzva/Agent-Job-Interview';
export const SOURCE_PATHS = { practice: 'apps/practice/public/topics.json', interview: 'apps/interview/public/data.json' };
const CATEGORY = {
  algo_rl: ['算法与强化学习', ['ai-algorithm']],
  engineering: ['工程实现', ['agent-engineer']],
  data_strategy: ['数据策略', ['ai-algorithm', 'agent-engineer']],
  product: ['产品设计与落地', ['agent-engineer']],
  system: ['系统设计', ['agent-engineer']],
  behavior: ['项目表达与复盘', ['ai-algorithm', 'agent-engineer']],
};
const PLACEHOLDER = /具体题目内容请参考|具体答案内容请参考|相关技术问题\s*\d+|相关技术答案\s*\d+|技术专题题[-—]\d+/;
const hash = value => createHash('sha256').update(value).digest('hex');
const required = (value, label) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} 缺失或不是文本`); return value; };

/** Convert source HTML to plain text, never execute or render imported markup. */
export function plainText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/<(script|style|iframe|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(?:div|p|h[1-6]|ul|ol|pre|blockquote)>/gi, '\n')
    .replace(/<\/?(?:a|abbr|article|aside|b|blockquote|br|button|caption|code|col|colgroup|dd|del|details|div|dl|dt|em|figcaption|figure|font|form|h[1-6]|hr|i|img|input|label|li|main|mark|nav|ol|option|p|pre|s|section|select|small|span|strong|sub|summary|sup|table|tbody|td|textarea|th|thead|tr|u|ul|video)\b[^>]*>/gi, '')
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[name])
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, digits) => { const n = digits[0].toLowerCase() === 'x' ? parseInt(digits.slice(1), 16) : Number(digits); return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ''; })
    .replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function importAgentJob({ practice, interview, commit }) {
  if (!/^[a-f0-9]{40}$/.test(commit ?? '')) throw new Error('导入要求可验证的完整 Git commit');
  if (!Array.isArray(practice) || !interview || typeof interview.questions !== 'object') throw new Error('不支持的源题库结构');
  const questions = []; const seen = new Set();
  const report = { sourceRecords: 0, imported: 0, excludedPlaceholders: 0, excludedCategories: 0, duplicatePromptGroups: 0 };
  const sources = ['practice', 'general', 'company', 'choice'].map(kind => ({ id: `harzva-agent-job-${kind}`, repo: REPOSITORY, commit,
    path: kind === 'practice' ? SOURCE_PATHS.practice : SOURCE_PATHS.interview,
    url: `https://github.com/${REPOSITORY}/blob/${commit}/${kind === 'practice' ? SOURCE_PATHS.practice : SOURCE_PATHS.interview}`,
    label: kind === 'practice' ? 'Harzva Agent 实战专题' : kind === 'general' ? 'Harzva 通用面试训练' : kind === 'choice' ? 'Harzva 选择题训练' : 'Harzva 公司主题练习（非已核实真题）',
    license: 'not-declared-local-only', reviewStatus: 'source-unverified',
    notice: '本地导入；原仓库未声明许可证。内容未经逐题审核，可能含不准确或过时表述；题目条目数不代表独立真题数量。',
  }));
  function add(q, { kind, group, topic, tracks, tags = [] }) {
    if (!q || (typeof q.id !== 'string' && typeof q.id !== 'number')) throw new Error('源题目缺少 id');
    const sourceId = `${kind}/${group}/${q.id}`;
    if (seen.has(sourceId)) throw new Error(`重复源题目 id: ${sourceId}`); seen.add(sourceId);
    let prompt = plainText(required(q.question, `${sourceId} 题干`));
    let answer = plainText(required(q.answer, `${sourceId} 答案`));
    if (!prompt || !answer) throw new Error(`源题目正文为空: ${sourceId}`);
    if (PLACEHOLDER.test(`${q.title ?? ''}\n${prompt}\n${answer}`)) { report.excludedPlaceholders++; return; }
    if (kind === 'choice' || q.isChoice === true) {
      if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 26 || !Number.isInteger(q.correctOption) || q.correctOption < 0 || q.correctOption >= q.options.length) throw new Error(`${sourceId} 选择题选项或答案索引无效`);
      const options = q.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${plainText(required(option, `${sourceId} 选项`))}`);
      if (options.some(option => !option.slice(3).trim())) throw new Error(`${sourceId} 选项正文为空`);
      prompt += `\n\n${options.join('\n\n')}`;
      answer = `参考选项：${options[q.correctOption]}\n\n${answer}`;
      tags.push('选择题');
    }
    const source = sources.find(s => s.id === `harzva-agent-job-${kind}`);
    const followUps = plainText(q.followUp ?? '').split('\n').map(s => s.replace(/^\s*(?:[-*]|追问[:：])\s*/, '').trim()).filter(s => s && !/^-+$/.test(s));
    questions.push({ id: `aji:${kind}:${hash(sourceId).slice(0, 24)}`, title: plainText(q.title || prompt).slice(0, 300), prompt, answer, followUps,
      topic, tracks, difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'unspecified',
      tags: [...new Set([...(Array.isArray(q.tags) ? q.tags.filter(t => typeof t === 'string') : []), ...tags, REPOSITORY])],
      source: { ...source, sourceId }, reviewStatus: 'source-unverified', contentHash: hash(prompt.replace(/\s+/g, ' ').toLowerCase()) });
  }
  for (const section of practice) {
    if (!section || typeof section.id !== 'string' || !Array.isArray(section.questions)) throw new Error('实战专题结构无效');
    const topic = required(section.title, '专题标题');
    for (const q of section.questions) { report.sourceRecords++; add(q, { kind: 'practice', group: section.id, topic, tracks: ['agent-engineer'] }); }
  }
  for (const [category, records] of Object.entries(interview.questions)) {
    if (!Array.isArray(records)) throw new Error(`通用题目分类不是数组: ${category}`);
    for (const q of records) {
      report.sourceRecords++;
      if (!CATEGORY[category]) { report.excludedCategories++; continue; }
      const [topic, tracks] = CATEGORY[category]; add(q, { kind: 'general', group: category, topic, tracks });
    }
  }
  if (interview.choiceQuestions !== undefined && !Array.isArray(interview.choiceQuestions)) throw new Error('选择题必须是数组');
  for (const q of interview.choiceQuestions ?? []) {
    report.sourceRecords++;
    if (!CATEGORY[q?.category]) { report.excludedCategories++; continue; }
    const [topic, tracks] = CATEGORY[q.category];
    add(q, { kind: 'choice', group: q.category, topic: `选择题 · ${topic}`, tracks });
  }
  const companies = new Map((interview.companies ?? []).map(company => [company.id, company.name]));
  for (const [company, records] of Object.entries(interview.companyQuestions ?? {})) {
    if (!Array.isArray(records)) throw new Error(`公司主题不是数组: ${company}`);
    for (const q of records) {
      report.sourceRecords++;
      if (!CATEGORY[q.category]) { report.excludedCategories++; continue; }
      const [topic, tracks] = CATEGORY[q.category]; add(q, { kind: 'company', group: company, topic: `公司主题 · ${topic}`, tracks, tags: ['公司专项', company, companies.get(company) || company] });
    }
  }
  const counts = new Map(); for (const q of questions) counts.set(q.contentHash, (counts.get(q.contentHash) ?? 0) + 1);
  for (const q of questions) if (counts.get(q.contentHash) > 1) q.duplicateGroup = q.contentHash;
  report.duplicatePromptGroups = [...counts.values()].filter(n => n > 1).length;
  report.imported = questions.length;
  return { schemaVersion: 1, sources: sources.map(s => ({ ...s, questionCount: questions.filter(q => q.source.id === s.id).length })), questions, importReport: report };
}
