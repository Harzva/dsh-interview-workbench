import { z } from 'zod';

export const METHODS = Object.freeze(['snapshot', 'question', 'start', 'practice', 'rename', 'answer', 'review', 'finish', 'export', 'knowledgeSnapshot', 'syncSource', 'retrieve', 'sourceQuestion', 'saveGeneratedQuestions', 'learningSnapshot', 'experienceSnapshot', 'experienceResource', 'saveExperience', 'aiStatus', 'generatePractice', 'reviewAnswer', 'aiJob', 'cancelAiJob']);
const requestSchema = z.record(z.string(), z.json());
const resultSchema = z.json();
// DSH 0.2 resolves codecs lazily on both sides of the Remote connection.
// Keep schema for the legacy gateway while exposing the new factory contract.
const requestCodec = Object.freeze({ mode: 'strict', typeSymbol: 'dsh-interview-workbench#Request', schema: requestSchema, create: () => requestSchema });
const resultCodec = Object.freeze({ mode: 'strict', typeSymbol: 'dsh-interview-workbench#JsonValue', schema: resultSchema, create: () => resultSchema });
export const REMOTE_DESCRIPTORS = Object.freeze(METHODS.map(method => Object.freeze({
  id: `dsh-interview-workbench#interviewWorkbench/${method}`,
  service: 'interviewWorkbench', namespace: 'interviewWorkbench', method, implementation: method,
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([{ name: 'request', wire: 'request', source: 'json', codec: requestCodec }]),
  cancellation: Object.freeze({ parameter: 'signal' }), result: resultCodec,
})));
export const TYPERT = Object.freeze({
  package: 'dsh-interview-workbench', face: 'host', schemas: Object.freeze([]),
  model: Object.freeze({ services: [], events: [], objects: [] }), invocations: REMOTE_DESCRIPTORS,
});
export const TYPERT_REMOTE = Object.freeze({ package: 'dsh-interview-workbench', descriptors: REMOTE_DESCRIPTORS });
export default TYPERT;
