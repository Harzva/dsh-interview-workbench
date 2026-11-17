import Schema from '@deepseek-ai/schemastery';
import * as TypertProtocol from '@deepseek-ai/dsh-typert-protocol';
import { createWorkbenchService } from './domain/workbench-service.mjs';
import { loadCatalog } from './content/catalog.mjs';
import { createInterviewTools } from './tools.mjs';
import { METHODS } from './remote.mjs';
import { createDshModelAdapter } from './model/dsh-model.mjs';

const { Remote, bindTypertRemote } = TypertProtocol;

// The 0.2 Gateway only preserves errors carrying the protocol's structural
// RemoteError marker.  Keep this list explicit: a random provider/filesystem
// error must still become gateway/internal rather than exposing an arbitrary
// error code and message to the client.
const CONTROLLED_REMOTE_ERROR_CODES = new Set([
  'DOMAIN_INVALID_INPUT', 'DOMAIN_NOT_FOUND', 'DOMAIN_FINISHED', 'DOMAIN_MOCK_ACTIVE',
  'DOMAIN_READONLY', 'DOMAIN_STORAGE_READ', 'DOMAIN_STORAGE_CORRUPT', 'DOMAIN_STORAGE_WRITE',
  'KNOWLEDGE_INVALID_INPUT', 'KNOWLEDGE_CANCELLED', 'KNOWLEDGE_STORAGE_READ',
  'KNOWLEDGE_STORAGE_CORRUPT', 'KNOWLEDGE_STORAGE_WRITE', 'KNOWLEDGE_NETWORK',
  'KNOWLEDGE_RATE_LIMIT', 'KNOWLEDGE_NOT_FOUND', 'KNOWLEDGE_HTTP', 'KNOWLEDGE_LIMIT',
  'KNOWLEDGE_RESPONSE', 'KNOWLEDGE_READONLY', 'KNOWLEDGE_EVIDENCE_MISSING', 'KNOWLEDGE_UNAVAILABLE',
  'EXPERIENCE_UNAVAILABLE',
  'AI_OUTPUT_INVALID', 'AI_CONTEXT_LIMIT', 'AI_DISPOSED', 'AI_JOB_EXPIRED', 'AI_REQUEST_LIMIT',
  'AI_BUSY', 'AI_FAILED',
  'MODEL_UNAVAILABLE', 'MODEL_PROTOCOL_UNAVAILABLE', 'MISSING_CREDENTIAL', 'INVALID_CREDENTIAL',
  'AUTH', 'RATE_LIMIT', 'QUOTA', 'CONTEXT_WINDOW_EXCEEDED', 'UNKNOWN_MODEL', 'NO_ADAPTER',
  'TIMEOUT', 'MAX_TOKENS', 'MODEL_INPUT_INVALID', 'MODEL_OUTPUT_INVALID', 'MODEL_FAILED',
]);

// Runtime 0.2 exports these helpers.  Namespace import keeps the source
// testable against the repository's older development peer while the 0.2
// runtime always takes the official constructor and discriminator.
const RemoteError = typeof TypertProtocol.RemoteError === 'function'
  ? TypertProtocol.RemoteError
  : class CompatibleRemoteError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.code = code;
      this.details = details;
      this.name = 'RemoteError';
      this.isDSHRemoteError = true;
    }
  };
const remoteErrorOf = typeof TypertProtocol.remoteErrorOf === 'function'
  ? TypertProtocol.remoteErrorOf
  : value => value && typeof value === 'object' && value.isDSHRemoteError === true && typeof value.code === 'string'
    ? value
    : undefined;

/**
 * Translate only this plugin's documented, user-safe domain failures at the
 * Host boundary.  Structural detection intentionally avoids instanceof so a
 * symlinked or separately bundled domain module remains compatible.
 */
export function toRemoteError(error) {
  const existing = remoteErrorOf(error);
  if (existing) return existing;
  if (!error || typeof error !== 'object' || !Object.hasOwn(error, 'code') || !CONTROLLED_REMOTE_ERROR_CODES.has(error.code)) return error;
  const message = typeof error.message === 'string' ? error.message : String(error.code);
  return new RemoteError(error.code, message, {});
}

export const name = 'dsh-interview-workbench';
export const inject = ['tools'];
export const Config = Schema.object({
  storagePath: Schema.string().default('').description('Private local practice JSON file. Empty means memory-only mode.'),
  includeImported: Schema.boolean().default(false).description('Include explicitly imported local question data.'),
  importedPath: Schema.string().default('').description('Optional local imported catalog file.'),
  readonly: Schema.boolean().default(false).description('Reject practice writes from both UI and model tools.'),
});

/**
 * The 0.2 gateway discovers source-mode remotes from class prototype markers.
 * Keep the business service private while exposing a real Cordis Service whose
 * public methods remain callable by the local UI and by the RPC gateway.
 */
class InterviewWorkbenchRemote {
  constructor(ctx, guarded) {
    this.guarded = guarded;
    this.typertRemote = bindTypertRemote(this, 'interviewWorkbench', { namespace: 'interviewWorkbench' });
  }

  async invokeRemote(method, request, signal) {
    try {
      signal?.throwIfAborted?.();
      return await this.guarded[method](method === 'review' ? { ...request, reviewer: 'self' } : request, signal);
    } catch (error) {
      throw toRemoteError(error);
    }
  }

  snapshot(request, signal) { return this.invokeRemote('snapshot', request, signal); }
  question(request, signal) { return this.invokeRemote('question', request, signal); }
  start(request, signal) { return this.invokeRemote('start', request, signal); }
  practice(request, signal) { return this.invokeRemote('practice', request, signal); }
  rename(request, signal) { return this.invokeRemote('rename', request, signal); }
  answer(request, signal) { return this.invokeRemote('answer', request, signal); }
  review(request, signal) { return this.invokeRemote('review', request, signal); }
  finish(request, signal) { return this.invokeRemote('finish', request, signal); }
  export(request, signal) { return this.invokeRemote('export', request, signal); }
  knowledgeSnapshot(request, signal) { return this.invokeRemote('knowledgeSnapshot', request, signal); }
  syncSource(request, signal) { return this.invokeRemote('syncSource', request, signal); }
  retrieve(request, signal) { return this.invokeRemote('retrieve', request, signal); }
  sourceQuestion(request, signal) { return this.invokeRemote('sourceQuestion', request, signal); }
  saveGeneratedQuestions(request, signal) { return this.invokeRemote('saveGeneratedQuestions', request, signal); }
  learningSnapshot(request, signal) { return this.invokeRemote('learningSnapshot', request, signal); }
  experienceSnapshot(request, signal) { return this.invokeRemote('experienceSnapshot', request, signal); }
  experienceResource(request, signal) { return this.invokeRemote('experienceResource', request, signal); }
  saveExperience(request, signal) { return this.invokeRemote('saveExperience', request, signal); }
  aiStatus(request, signal) { return this.invokeRemote('aiStatus', request, signal); }
  generatePractice(request, signal) { return this.invokeRemote('generatePractice', request, signal); }
  reviewAnswer(request, signal) { return this.invokeRemote('reviewAnswer', request, signal); }
  aiJob(request, signal) { return this.invokeRemote('aiJob', request, signal); }
  cancelAiJob(request, signal) { return this.invokeRemote('cancelAiJob', request, signal); }
}

// This source module is intentionally plain ESM, so apply the standard
// decorator contract once at module load instead of requiring a transpiler.
// The same public Remote API is implemented by the 0.1 and 0.2 protocols;
// only the marker storage changed between those releases.
const remoteMarkerInitializers = [];
for (const method of METHODS) {
  Remote(method)(InterviewWorkbenchRemote.prototype[method], {
    kind: 'method', name: method, static: false, private: false,
    addInitializer(initializer) { remoteMarkerInitializers.push(initializer); },
  });
}
const remoteMarkerOwner = Object.create(InterviewWorkbenchRemote.prototype);
for (const initializer of remoteMarkerInitializers) initializer.call(remoteMarkerOwner);

export async function apply(ctx, config = {}) {
  let service;
  try {
    const catalog = await loadCatalog({ includeImported: config.includeImported === true, ...(config.importedPath ? { importedPath: config.importedPath } : {}) });
    service = await createWorkbenchService({ catalog, storagePath: config.storagePath || undefined, readonly: config.readonly === true, model: createDshModelAdapter(ctx) });
  } catch (error) {
    // Bad optional content or private storage must not prevent the DSH host from starting.
    const message = error?.code === 'DOMAIN_STORAGE_CORRUPT'
      ? '练习存储损坏或版本不兼容，原文件已保留。请恢复备份后重新加载插件。'
      : '面试工作台初始化失败。请检查本地题库与练习存储配置后重新加载插件。';
    service = Object.fromEntries(METHODS.map(method => [method, async () => { throw new Error(message); }]));
  }
  const abort = new AbortController();
  const disposed = [];
  const pending = new Set();
  const guarded = Object.fromEntries(METHODS.map(method => [method, (request = {}, signal) => {
    abort.signal.throwIfAborted();
    signal?.throwIfAborted();
    const running = Promise.resolve().then(() => {
      abort.signal.throwIfAborted();
      signal?.throwIfAborted();
      return service[method](request, signal ? AbortSignal.any([abort.signal, signal]) : abort.signal);
    })
      .finally(() => pending.delete(running));
    pending.add(running);
    return running;
  }]));
  const remote = new InterviewWorkbenchRemote(ctx, guarded);
  try {
    const stop = ctx.provide('interviewWorkbench', remote);
    if (typeof stop === 'function') disposed.push(stop);
    for (const definition of createInterviewTools(guarded)) {
      const unregister = ctx.tools.register(definition);
      if (typeof unregister === 'function') disposed.push(unregister);
    }
  } catch (error) {
    abort.abort();
    await service.dispose?.();
    for (const stop of disposed.reverse()) stop();
    throw error;
  }
  ctx.effect(() => async () => {
    abort.abort();
    for (const stop of disposed.splice(0).reverse()) stop();
    await Promise.allSettled([...pending]);
    await service.dispose?.();
  }, 'interview-workbench: dispose service and tools');
}

export default { name, inject, Config, apply };
