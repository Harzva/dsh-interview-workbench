import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadCatalog } from '../src/content/catalog.mjs';
import { createInterviewService } from '../src/domain/interview-service.mjs';

test('synthetic questions are discoverable in both tracks', async () => {
  const catalog = await loadCatalog();
  assert.deepEqual(catalog.questions.map(({ id }) => id), [
    'demo-algorithm-prefix',
    'demo-agent-retry',
  ]);
  const service = await createInterviewService({ catalog });
  for (const track of ['ai-algorithm', 'agent-engineer']) {
    const { catalog: visible } = await service.snapshot({ track });
    assert.equal(visible.trackTotal, 1);
    assert.equal(visible.questions[0].source.id, 'synthetic-release-demo');
    assert.equal(Object.hasOwn(visible.questions[0], 'answer'), false);
  }
});

test('simulated interview persists answers and reveals references after submission', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'dsh-synthetic-interview-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const catalog = await loadCatalog();
  const storagePath = join(directory, 'practice.json');
  const service = await createInterviewService({ catalog, storagePath });
  const practice = await service.start({ track: 'agent-engineer', mode: 'mock' });
  const question = practice.questions[0];
  assert.equal(question.id, 'demo-agent-retry');
  assert.equal(Object.hasOwn(question, 'answer'), false);
  const sampleAnswer = '使用稳定的幂等键查询并重试。';
  const answered = await service.answer({
    practiceId: practice.id,
    questionId: question.id,
    answer: sampleAnswer,
  });
  const review = {
    practiceId: practice.id,
    questionId: question.id,
    attemptId: answered.attempts[0].id,
    score: 3,
    notes: '还可以说明并发防重。',
  };
  await assert.rejects(() => service.review(review), { code: 'DOMAIN_MOCK_ACTIVE' });
  const finished = await service.finish({ practiceId: practice.id });
  assert.equal(finished.status, 'finished');
  assert.equal(finished.questions[0].answer, catalog.questions[1].answer);
  await service.review(review);
  const reopening = await createInterviewService({ catalog, storagePath });
  const restored = await reopening.practice({ id: practice.id });
  assert.equal(restored.attempts[0].answer, sampleAnswer);
  assert.equal(restored.attempts[0].reviews[0].score, 3);
  assert.equal((await reopening.export({ practiceId: practice.id })).includes(sampleAnswer), false);
});
