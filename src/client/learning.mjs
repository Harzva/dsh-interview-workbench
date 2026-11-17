import * as React from 'react'
import { InterviewContent } from './content.mjs'

const h = React.createElement
const { useEffect, useState } = React
const trackLabel = track => track === 'agent-engineer' ? 'Agent 工程师' : 'AI 算法工程师'
const dateLabel = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '时间未记录'
const reviewerLabel = value => value === 'agent' ? 'AI 点评' : '自评'
const scoreLabel = value => Number.isFinite(value) ? value + ' / 4' : '待点评'
const statusLabel = value => ({ unseen: '尚未练习', 'needs-review': '有待复盘', reviewed: '已有点评' })[value] || '尚无记录'
const errorMessage = cause => cause instanceof Error ? cause.message : String(cause)

function Button({ children, primary = false, ...props }) {
  return h('button', { type: 'button', ...props, className: 'diw-button diw-button-' + (primary ? 'primary' : 'secondary') }, children)
}
function Empty({ title, children }) {
  return h('div', { className: 'diw-learning-empty' }, h('strong', null, title), h('p', null, children))
}
function SectionHeading({ title, children, total, expanded, onToggle }) {
  return h('div', { className: 'diw-section-heading' }, h('div', null, h('h3', null, title), h('p', { className: 'diw-muted' }, children)), total > 6 && h(Button, { 'aria-expanded': expanded, onClick: onToggle }, expanded ? '收起' : '查看全部 ' + total + ' 项'))
}

/** Display saved evidence; never estimate mastery or invent a model score. */
export function InterviewLearningPanel({ api, track, revision = 0, busy = false, readonly = false, writesBlocked = false, connectionAvailable = true, onStartPractice, onOpenPractice, onBrowseTopic }) {
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryRevision, setRetryRevision] = useState(0)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [showAllQueue, setShowAllQueue] = useState(false)
  const [showAllEvidence, setShowAllEvidence] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    Promise.resolve().then(() => {
      if (!api.learningSnapshot) throw new Error('学习记忆服务尚未就绪，请刷新工作区后重试。')
      return api.learningSnapshot({ track })
    }).then(value => { if (!cancelled) setSnapshot(value) })
      .catch(cause => { if (!cancelled) setError(errorMessage(cause)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [api, track, revision, retryRevision, connectionAvailable])
  useEffect(() => { setShowAllTopics(false); setShowAllQueue(false); setShowAllEvidence(false) }, [track])

  const data = snapshot?.track === track ? snapshot : null
  const summary = data?.summary
  const next = data?.nextPractice
  const topics = data?.topics ?? []
  const queue = data?.reviewQueue ?? []
  const evidence = data?.recentEvidence ?? []
  const activity = (data?.activity ?? []).slice(-14)
  const maxActivity = Math.max(1, ...activity.map(item => item.attemptCount + item.reviewCount))
  const questionIds = next?.questionIds ?? []
  const actionDisabled = busy || loading || !connectionAvailable
  const startDisabled = actionDisabled || readonly || writesBlocked || Boolean(error) || !questionIds.length
  const observed = Boolean(summary?.answeredCount)

  return h('div', { className: 'diw-learning', 'aria-busy': loading },
    h('header', { className: 'diw-page-heading' }, h('span', { className: 'diw-kicker' }, trackLabel(track)), h('h2', null, '学习记忆'), h('p', { className: 'diw-muted' }, '回看真实作答和复盘笔记，让下一轮练习有依据。')),
    error && h('div', { className: 'diw-learning-alert', role: 'alert' }, h('strong', null, '学习记忆暂时读取失败'), h('p', null, error), data && h('small', null, '下方保留上次读取的记录，重新连接后再更新。'), h(Button, { disabled: busy || loading, onClick: () => setRetryRevision(value => value + 1) }, '重试读取学习记忆')),
    loading && h('p', { className: 'diw-muted', role: 'status' }, data ? '正在更新已保存的学习记录…' : '正在读取作答与复盘记录…'),
    data && h(React.Fragment, null,
      h('dl', { className: 'diw-learning-stats', 'aria-label': '当前方向的学习记录' }, [
        { label: '已作答题目', value: summary.answeredCount, detail: '按题目去重' },
        { label: '有点评的题目', value: summary.reviewedCount, detail: '来自自评或 AI 点评' },
        { label: '待复盘题目', value: summary.needsReviewCount, detail: '未点评或最近评分低于 3' },
        { label: '有练习记录的天数', value: summary.practicedDays, detail: '已完成 ' + summary.completedCount + ' / ' + summary.practiceCount + ' 轮训练' },
      ].map(item => h('div', { key: item.label }, h('dt', null, item.label), h('dd', null, item.value), h('small', null, item.detail)))),
      h('section', { className: 'diw-learning-next', 'aria-label': '根据学习记录推荐的下一轮' },
        h('div', null, h('span', { className: 'diw-kicker' }, observed ? '带着复盘进入下一轮' : '从第一份作答记录开始'), h('h3', null, next?.title || '开始积累学习记录'), h('p', null, next?.reason || (observed ? '复盘已有作答，再继续练习。' : '先保存一次作答，再写下自评和改进点。')), h('small', { className: 'diw-muted' }, '依据题目作答和点评记录选题；评分不等于掌握程度。')),
        h('div', { className: 'diw-learning-next-action' }, h(Button, { primary: true, disabled: startDisabled, onClick: () => onStartPractice({ track, mode: 'coach', questionIds: [...questionIds], count: questionIds.length, ...(next?.title ? { title: next.title } : {}) }) }, questionIds.length ? '开始推荐的 ' + questionIds.length + ' 题' : '暂无可练题目'), readonly && h('small', { className: 'diw-muted' }, '当前为只读模式，可以查看已有学习记录。'))),
      !observed && h(Empty, { title: '还没有这个方向的作答记录' }, '先完成一题并保存作答。记录自评或 AI 点评后，这里会呈现专题缺口、复盘证据和后续练习建议。'),
      h('section', { className: 'diw-learning-section', 'aria-label': '专题练习与缺口' },
        h(SectionHeading, { title: '专题练习与缺口', total: topics.length, expanded: showAllTopics, onToggle: () => setShowAllTopics(value => !value) }, '未练习表示缺少作答证据；有点评也不代表已经掌握。'),
        topics.length ? h('div', { className: 'diw-learning-topics' }, (showAllTopics ? topics : topics.slice(0, 6)).map(item => h('article', { key: item.id, className: 'diw-learning-topic', 'data-status': item.status },
          h('div', { className: 'diw-section-heading' }, h('h4', null, item.title), h('span', { className: 'diw-badge' }, statusLabel(item.status))),
          h('p', null, '已作答 ' + item.answeredCount + ' / ' + item.questionCount + ' 题 · 有点评 ' + item.reviewedCount + ' 题'),
          h('progress', { max: Math.max(1, item.questionCount), value: item.answeredCount, 'aria-label': item.title + '作答覆盖：' + item.answeredCount + ' / ' + item.questionCount }),
          h('div', { className: 'diw-learning-topic-footer' }, h('small', { className: 'diw-muted' }, item.needsReviewCount ? item.needsReviewCount + ' 题待复盘' : Number.isFinite(item.averageScore) ? '记录评分均值 ' + item.averageScore.toFixed(1) + ' / 4' : '还没有评分依据'), h(Button, { disabled: actionDisabled, onClick: () => onBrowseTopic(item.id, item.needsReviewCount ? 'needs-review' : 'all') }, item.needsReviewCount ? '查看待复盘' : '进入专题'))))) : h(Empty, { title: '当前方向还没有题目' }, '可以到资料与出题中检索仓库材料，再收录或生成训练题。')),
      h('section', { className: 'diw-learning-section', 'aria-label': '学习记忆优先练习队列' },
        h(SectionHeading, { title: '优先练习队列', total: queue.length, expanded: showAllQueue, onToggle: () => setShowAllQueue(value => !value) }, '先复盘评分偏低或尚未点评的作答，再练习没有记录的新题。'),
        queue.length ? h('ol', { className: 'diw-learning-queue' }, (showAllQueue ? queue : queue.slice(0, 6)).map(item => h('li', { key: item.questionId }, h('div', null, h('strong', null, item.title), h('p', null, item.reason), h('small', { className: 'diw-muted' }, item.topic + ' · ' + (Number.isFinite(item.score) ? reviewerLabel(item.reviewer) + ' ' + scoreLabel(item.score) : item.lastPracticeId ? '尚未点评' : '尚未练习'))), item.lastPracticeId ? h(Button, { disabled: actionDisabled, onClick: () => onOpenPractice(item.lastPracticeId, item.questionId), 'aria-label': '查看作答：' + item.title }, '查看作答') : h(Button, { disabled: actionDisabled || readonly || writesBlocked || Boolean(error), onClick: () => onStartPractice({ track, mode: 'coach', questionIds: [item.questionId], count: 1, title: item.title.slice(0, 80) }), 'aria-label': '练习这题：' + item.title }, '练习这题')))) : h(Empty, { title: observed ? '当前没有优先待练题目' : '当前没有可练题目' }, observed ? '可以继续练习新题，或回看下方已保存的复盘证据。' : '先到资料与出题中收录题目，再开始积累练习记录。')),
      h('section', { className: 'diw-learning-section', 'aria-label': '最近的复盘证据' },
        h(SectionHeading, { title: '最近的复盘证据', total: evidence.length, expanded: showAllEvidence, onToggle: () => setShowAllEvidence(value => !value) }, '以下摘录来自已保存的笔记；打开对应作答可查看完整记录，并区分自评与 AI 点评。'),
        evidence.length ? h('div', { className: 'diw-learning-evidence' }, (showAllEvidence ? evidence : evidence.slice(0, 6)).map(item => h('article', { className: 'diw-learning-note', key: item.reviewId || item.practiceId + ':' + item.attemptId + ':' + item.reviewedAt },
          h('div', { className: 'diw-section-heading' }, h('div', null, h('span', { className: 'diw-kicker' }, item.topic), h('h4', null, item.title)), h('span', { className: 'diw-badge', 'data-tone': item.reviewer === 'agent' ? 'accent' : '' }, reviewerLabel(item.reviewer) + ' · ' + scoreLabel(item.score))),
          item.notes?.trim() ? h('div', { className: 'diw-learning-note-text' }, h(InterviewContent, { value: item.notes })) : h('p', { className: 'diw-muted' }, '这次点评只记录了分数，尚未写下复盘笔记。'),
          h('div', { className: 'diw-learning-note-footer' }, h('small', { className: 'diw-muted' }, dateLabel(item.reviewedAt)), h(Button, { disabled: actionDisabled || !item.practiceId, onClick: () => onOpenPractice(item.practiceId, item.questionId), 'aria-label': '查看复盘对应作答：' + item.title }, '查看作答'))))) : h(Empty, { title: '还没有复盘笔记' }, '保存作答后，可以记录自评，或让 DSH Agent 点评；只有已保存的记录才会出现在这里。')),
      activity.length > 0 && h('section', { className: 'diw-learning-section', 'aria-label': '近期练习活动' }, h('div', null, h('h3', null, '近期练习活动'), h('p', { className: 'diw-muted' }, '每栏代表一天保存的作答与点评次数。')), h('ol', { className: 'diw-learning-activity' }, activity.map(item => h('li', { key: item.date, title: item.date + '：' + item.attemptCount + ' 次作答，' + item.reviewCount + ' 次点评', 'aria-label': item.date + '：' + item.attemptCount + ' 次作答，' + item.reviewCount + ' 次点评' }, h('span', { className: 'diw-learning-activity-count' }, item.attemptCount + item.reviewCount), h('div', { className: 'diw-learning-activity-bar', 'aria-hidden': true }, h('span', { style: { height: Math.max(0, (item.attemptCount + item.reviewCount) / maxActivity * 100) + '%' } })), h('small', null, item.date.slice(5).replace('-', '/')))))),
      data.notice && h('p', { className: 'diw-learning-notice' }, data.notice)))
}
