const DAY = 86_400_000;
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' });
const latest = values => values.reduce((result, value) => !result || value.createdAt >= result.createdAt ? value : result, null);
const visibleReviews = (practice, attempt) => practice.mode === 'mock' && practice.status !== 'finished' ? [] : attempt.reviews;
const dateKey = value => Number.isFinite(new Date(value).getTime()) ? dateFormat.format(new Date(value)) : null;
const round = number => Math.round(number * 100) / 100;
const reviewerName = value => value === 'agent' ? 'Agent 点评' : '自评';

/** Derive a read-only projection of saved evidence; never infer proficiency or persist a second memory store. */
export function buildLearningMemory({ questions, practices, progress, track, now = new Date() }) {
  const selected = questions.filter(question => question.tracks.includes(track));
  const practicesById = new Map(practices.map(practice => [practice.id, practice]));
  const rows = selected.map(question => {
    const learning = progress.get(question.id);
    const practice = practicesById.get(learning?.lastPracticeId);
    const attempt = practice ? latest(practice.attempts.filter(item => item.questionId === question.id)) : null;
    const review = attempt ? latest(visibleReviews(practice, attempt)) : null;
    return { question, learning, practice, attempt, review };
  });
  const topicsById = new Map();
  for (const { question, attempt, review } of rows) {
    const topic = topicsById.get(question.topic) ?? { id: question.topic, title: question.topic, questionCount: 0,
      answeredCount: 0, reviewedCount: 0, needsReviewCount: 0, averageScore: null, lastReviewedAt: null, status: 'unseen', scoreTotal: 0 };
    topic.questionCount++;
    if (attempt) topic.answeredCount++;
    if (review) {
      topic.reviewedCount++; topic.scoreTotal += review.score;
      if (!topic.lastReviewedAt || review.createdAt > topic.lastReviewedAt) topic.lastReviewedAt = review.createdAt;
    }
    if (attempt && (!review || review.score < 3)) topic.needsReviewCount++;
    topicsById.set(topic.id, topic);
  }
  const topics = [...topicsById.values()].map(({ scoreTotal, ...topic }) => ({ ...topic,
    averageScore: topic.reviewedCount ? round(scoreTotal / topic.reviewedCount) : null,
    status: topic.needsReviewCount ? 'needs-review' : topic.answeredCount ? 'reviewed' : 'unseen',
  })).sort((a, b) => Number(b.status === 'needs-review') - Number(a.status === 'needs-review')
    || b.needsReviewCount - a.needsReviewCount || a.title.localeCompare(b.title, 'zh-CN'));

  const priority = row => row.review && row.review.score < 3 ? 0 : row.attempt && !row.review ? 1 : !row.attempt ? 2 : 3;
  const ordered = [...rows].sort((a, b) => priority(a) - priority(b)
    || (priority(a) === 0 ? a.review.score - b.review.score : 0)
    || (a.review?.createdAt ?? a.attempt?.createdAt ?? '').localeCompare(b.review?.createdAt ?? b.attempt?.createdAt ?? ''));
  const queueRows = ordered.filter(row => priority(row) < 3);
  const reviewQueue = queueRows.slice(0, 30).map(({ question, attempt, review, practice }) => ({
    questionId: question.id, title: question.title, topic: question.topic,
    reason: review ? `${reviewerName(review.reviewer)}记录为 ${review.score}/4，建议结合原点评复盘` : attempt ? '最新作答还没有点评' : '尚无保存的作答',
    score: review?.score ?? null, reviewer: review?.reviewer ?? null, lastPracticeId: practice?.id ?? null,
  }));
  const recentEvidence = rows.filter(row => row.review).sort((a, b) => b.review.createdAt.localeCompare(a.review.createdAt)).slice(0, 8)
    .map(({ question, practice, attempt, review }) => ({ questionId: question.id, title: question.title, topic: question.topic,
      practiceId: practice.id, attemptId: attempt.id, reviewId: review.id, score: review.score, reviewer: review.reviewer,
      notes: review.notes.slice(0, 2000), reviewedAt: review.createdAt }));

  const today = dateKey(now);
  const midnight = new Date(`${today}T00:00:00.000Z`).getTime();
  const activity = Array.from({ length: 14 }, (_, index) => ({ date: new Date(midnight - (13 - index) * DAY).toISOString().slice(0, 10), attemptCount: 0, reviewCount: 0 }));
  const activityByDay = new Map(activity.map(day => [day.date, day]));
  const scopedPractices = practices.filter(practice => practice.track === track);
  const practicedDays = new Set();
  for (const practice of scopedPractices) for (const attempt of practice.attempts) {
    const day = dateKey(attempt.createdAt);
    if (day) practicedDays.add(day);
    if (activityByDay.has(day)) activityByDay.get(day).attemptCount++;
    for (const review of visibleReviews(practice, attempt)) {
      const reviewedDay = dateKey(review.createdAt);
      if (activityByDay.has(reviewedDay)) activityByDay.get(reviewedDay).reviewCount++;
    }
  }
  const nextRows = (queueRows.length ? queueRows : ordered).slice(0, 5);
  const counts = { low: nextRows.filter(row => priority(row) === 0).length, pending: nextRows.filter(row => priority(row) === 1).length,
    unseen: nextRows.filter(row => priority(row) === 2).length };
  const reasons = [counts.low && `${counts.low} 道最近评分低于 3 分`, counts.pending && `${counts.pending} 道最新作答待点评`, counts.unseen && `${counts.unseen} 道尚未练习`].filter(Boolean);
  return {
    track,
    summary: { answeredCount: rows.filter(row => row.attempt).length, reviewedCount: rows.filter(row => row.review).length,
      needsReviewCount: rows.filter(row => row.attempt && (!row.review || row.review.score < 3)).length,
      practiceCount: scopedPractices.length, completedCount: scopedPractices.filter(practice => practice.status === 'finished').length, practicedDays: practicedDays.size },
    topics, reviewQueue, recentEvidence, activity,
    nextPractice: { track, questionIds: nextRows.map(row => row.question.id), count: nextRows.length,
      title: nextRows.length ? `复盘再练 · ${nextRows[0].question.topic}`.slice(0, 80) : '暂无可练题目',
      reason: reasons.length ? `按保存的记录优先安排：${reasons.join('，')}。` : nextRows.length ? '当前题目均有点评，按最近点评时间从早到晚复练。' : '当前岗位题库为空，可先从资料中收录题目。' },
    notice: '仅依据保存的作答和点评；每题采用最新作答及其最新可见点评，3 分以上表示已点评，不代表已掌握。相同题目跨岗位共享证据；训练活动按当前岗位、上海时间统计。未结束的模拟面试不展示点评；待练队列最多展示 30 题。',
  };
}
