import { createHash } from 'node:crypto';
import { createInterviewService, InterviewError, TRACKS } from './interview-service.mjs';
import { createKnowledgeService } from './knowledge-service.mjs';
import { createAiOperations } from './ai-operations.mjs';
import { createExperienceService } from './experience-service.mjs';

function requireInput(ok, message) { if (!ok) throw new InterviewError('DOMAIN_INVALID_INPUT', message); }
function string(value, name, max) {
  requireInput(typeof value === 'string' && value.trim() && value.length <= max, `${name}须为 1–${max} 字符的文本`);
  return value.trim();
}
function citation(value) {
  return Object.fromEntries(['id', 'repo', 'path', 'commit', 'url', 'title', 'license'].map(key => [key, value[key]]));
}
function authoredQuestion(input, evidence, origin) {
  const references = evidence.map(citation);
  const first = references[0];
  const question = {
    title: string(input.title, '题目标题', 2000), prompt: string(input.prompt, '题干', 100_000),
    answer: string(input.answer, '参考答案', 250_000),
    followUps: input.followUps ?? [], topic: string(input.topic, '专题', 300),
    tracks: input.tracks, difficulty: input.difficulty ?? 'unspecified', origin,
    source: { id: `github:${first.repo}`, repo: first.repo, path: first.path, sourceId: first.id,
      commit: first.commit, url: first.url, license: first.license }, citations: references,
  };
  requireInput(Array.isArray(question.followUps) && question.followUps.length <= 10 && question.followUps.every(value => typeof value === 'string' && value.length <= 4000), '追问须为最多 10 条文本');
  requireInput(Array.isArray(question.tracks) && question.tracks.length > 0 && question.tracks.length <= 2 && question.tracks.every(value => TRACKS.includes(value)), '请选择有效岗位方向');
  requireInput(['easy', 'medium', 'hard', 'unspecified'].includes(question.difficulty), '难度无效');
  return { id: `${origin}:${createHash('sha256').update(JSON.stringify(question)).digest('hex').slice(0, 32)}`, ...question };
}

/** UI and model tools share this composition; citations come only from the local source index. */
export async function createWorkbenchService({ catalog, storagePath, readonly = false, fetchImpl, model } = {}) {
  const interview = await createInterviewService({ catalog, storagePath, readonly });
  let experiences;
  try { experiences = await createExperienceService({ catalog, storagePath: storagePath ? `${storagePath}.experiences.json` : undefined, readonly }); }
  catch {
    const unavailable = async () => { throw new InterviewError('EXPERIENCE_UNAVAILABLE', '经验档案暂时无法读取，原文件已保留；题库和训练可继续使用。'); };
    experiences = { experienceSnapshot: unavailable, experienceResource: unavailable, saveExperience: unavailable };
  }
  let knowledge;
  try {
    knowledge = await createKnowledgeService({ storagePath: storagePath ? `${storagePath}.knowledge.json` : undefined, readonly, ...(fetchImpl ? { fetchImpl } : {}) });
  } catch {
    const unavailable = async () => { throw new InterviewError('KNOWLEDGE_UNAVAILABLE', '资料索引无法读取，原文件已保留；已有题库与训练仍可继续使用。'); };
    knowledge = { snapshot: unavailable, sync: unavailable, retrieve: unavailable, evidence: unavailable };
  }
  const writable = signal => { signal?.throwIfAborted(); if (readonly) throw new InterviewError('DOMAIN_READONLY', '当前工作台为只读模式，无法同步资料或收录题目'); };
  const service = {
    ...interview,
    ...experiences,
    knowledgeSnapshot: options => knowledge.snapshot(options),
    syncSource: (options, signal) => { writable(signal); return knowledge.sync(options, signal); },
    retrieve: options => knowledge.retrieve(options),
    async sourceQuestion({ chunkId, track } = {}, signal) {
      writable(signal); requireInput(TRACKS.includes(track), '请选择有效岗位方向');
      const evidence = await knowledge.evidence({ chunkIds: [chunkId] });
      const material = evidence[0];
      requireInput(material?.question, '这段资料没有可直接收录的完整问答，请加入出题资料交给 Agent 生成');
      const q = authoredQuestion({ ...material.question, topic: material.question.topic || 'GitHub 原题', tracks: [track] }, evidence, 'extracted');
      writable(signal); await interview.addQuestions({ questions: [q] }, signal);
      return { questionId: q.id };
    },
    async saveGeneratedQuestions({ questions } = {}, signal) {
      writable(signal); requireInput(Array.isArray(questions) && questions.length >= 1 && questions.length <= 10, '一次可保存 1–10 道生成题');
      const validated = [];
      for (const input of questions) {
        requireInput(input && typeof input === 'object' && !Array.isArray(input), '题目格式无效');
        requireInput(Array.isArray(input.citationIds) && input.citationIds.length >= 1 && input.citationIds.length <= 12, '每道生成题须引用 1–12 个已同步资料片段');
        requireInput(new Set(input.citationIds).size === input.citationIds.length, '资料引用不能重复');
        const evidence = await knowledge.evidence({ chunkIds: input.citationIds });
        validated.push(authoredQuestion(input, evidence, 'generated'));
      }
      writable(signal);
      return interview.addQuestions({ questions: validated }, signal);
    },
  };
  return Object.freeze({ ...service, ...createAiOperations({ service, knowledge, model, readonly }) });
}
