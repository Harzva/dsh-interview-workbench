import * as React from 'react'
import { InterviewContent, safeLink } from './content.mjs'
import { readDraft, writeDraft, removeDraft, readCursor, writeCursor } from './drafts.mjs'
import { readSelection, writeSelection } from './selection.mjs'
import { InterviewKnowledgePanel } from './knowledge.mjs'
import { InterviewLearningPanel } from './learning.mjs'
import { InterviewExperiencePanel } from './experiences.mjs'
import { SprintPanel } from './sprint.mjs'
import { AiRunCard } from './ai-run.mjs'

const h = React.createElement
const { useState, useEffect, useRef, useCallback } = React
const TRACKS = [{ id: 'ai-algorithm', title: 'AI 算法工程师', short: 'AI 算法', caption: 'ML · LLM · 实验', icon: 'algorithm' }, { id: 'agent-engineer', title: 'Agent 工程师', short: 'Agent 工程', caption: 'RAG · 工具 · 评估', icon: 'agent' }]
const SCORE_LABELS = ['尚未掌握', '需要提示', '基本正确', '独立清晰', '深入完整']
const PAGE_SIZE = 20
const VIEW_LABELS = { overview: '训练总览', sprint: '7 天速成', new: '新训练', bank: '岗位题库', practice: '当前训练', history: '训练记录', learning: '学习记忆', experiences: '面试经验', sources: '资料与出题' }
const LEARNING_LABELS = { unanswered: '未作答', unreviewed: '待点评', 'needs-review': '待加强', reviewed: '已评 3–4 分' }
const trackTitle = value => TRACKS.find(track => track.id === value)?.short ?? value
const modeTitle = value => value === 'mock' ? '模拟面试' : '教练练习'
const practiceTitle = practice => practice?.title || practice?.previewTitle || practice?.questions?.[0]?.title || `${trackTitle(practice?.track)} · ${modeTitle(practice?.mode)}`
const dateLabel = value => value ? new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'
const latestAttempt = (practice, questionId) => practice?.attempts?.filter(attempt => attempt.questionId === questionId).at(-1)
const isCompleted = practice => ['finished', 'completed'].includes(practice?.status) || Boolean(practice?.finishedAt)
const errorMessage = error => error instanceof Error ? error.message : String(error)
const sourceLabel = source => source?.label || source?.title || source?.articleTitle || source?.repo || source?.id || '未知来源'
const sourceMetadata = question => {
  const source = question?.source ?? {}
  const tags = Array.isArray(question?.tags) ? question.tags.filter(tag => typeof tag === 'string' && tag.trim() && !['塔子哥', '塔子哥学算法', '算法机考'].includes(tag)) : []
  const articleTitle = typeof source.articleTitle === 'string' ? source.articleTitle.trim() : ''
  const tagCompany = tags.find(tag => articleTitle && articleTitle.includes(tag) && !/^\d{4}(?:-\d{2}-\d{2})?$/.test(tag) && tag.length >= 2) || ''
  return {
    articleTitle,
    publishedAt: typeof source.publishedAt === 'string' ? source.publishedAt.trim() : '',
    company: typeof source.company === 'string' && source.company.trim() ? source.company.trim() : typeof source.companyName === 'string' && source.companyName.trim() ? source.companyName.trim() : typeof source.organization === 'string' && source.organization.trim() ? source.organization.trim() : typeof question?.company === 'string' && question.company.trim() ? question.company.trim() : tagCompany,
    tags,
  }
}

function Icon({ name, size = 18 }) {
  const paths = {
    book: ['M4 4h6c1.5 0 2 1 2 2v15c0-1.5-1-2-2-2H4z', 'M20 4h-6c-1.5 0-2 1-2 2v15c0-1.5 1-2 2-2h6z'],
    agent: ['M7 7h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z', 'M12 3v4M8 12h.01M16 12h.01M8 16h8'],
    algorithm: ['M8 3 3 8l5 5M16 11l5 5-5 5M14 3 10 21'],
    history: ['M3 11a9 9 0 1 1 2 7', 'M3 4v7h7M12 7v5l3 2'],
    play: ['M8 4v16l12-8z'],
    arrow: ['M5 12h14M14 7l5 5-5 5'],
    close: ['M6 6l12 12M18 6 6 18'],
    search: ['M20 20l-5-5', 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0'],
    link: ['M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2', 'M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2'],
    check: ['M5 12l4 4L19 6'],
    copy: ['M9 8h11v13H9z', 'M15 8V3H4v13h5'],
    refresh: ['M20 7a9 9 0 0 0-15-2L2 8', 'M2 2v6h6', 'M4 17a9 9 0 0 0 15 2l3-3', 'M22 22v-6h-6'],
    moon: ['M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10'],
    sun: ['M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5', 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
    spark: ['M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z'],
    lock: ['M7 11V7a5 5 0 0 1 10 0v4', 'M5 11h14v10H5zM12 15v2'],
    download: ['M12 3v12M7 10l5 5 5-5M4 16v5h16v-5'],
    dashboard: ['M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'],
    plus: ['M12 5v14M5 12h14'],
    shuffle: ['M3 6h3c5 0 7 12 12 12h3M17 14l4 4-4 4M3 18h3c2 0 4-3 6-6s4-6 6-6h3M17 2l4 4-4 4'],
  }
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, (paths[name] ?? paths.book).map((d, index) => h('path', { key: index, d })))
}

function Button({ children, icon, tone = 'secondary', className = '', ...props }) {
  return h('button', { type: 'button', ...props, className: `diw-button diw-button-${tone} ${className}`.trim() }, icon && h(Icon, { name: icon, size: 16 }), children)
}

function Badge({ children, tone = '' }) { return h('span', { className: 'diw-badge', 'data-tone': tone }, children) }
function Empty({ title, children, icon = 'book' }) { return h('div', { className: 'diw-empty' }, h('span', { className: 'diw-empty-icon' }, h(Icon, { name: icon, size: 26 })), h('strong', null, title), children && h('p', null, children)) }
function SummaryStrip({ items, label }) {
  return h('dl', { className: 'diw-summary-strip', 'aria-label': label }, items.map(item => h('div', { key: item.label }, h('dt', null, item.label), h('dd', null, item.value ?? '—'))))
}

export function InterviewSidebarAction({ wide = true, onOpen }) {
  return h('button', { type: 'button', className: 'diw-sidebar-entry', 'data-wide': wide, 'aria-label': '打开面试训练工作台', title: '面试训练工作台', onClick: onOpen }, h('span', { className: 'diw-sidebar-mark' }, h(Icon, { name: 'algorithm' })), wide && h('span', null, h('strong', null, '面试工作台'), h('small', null, 'INTERVIEW LAB')))
}

export class InterviewWorkbenchErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return h('div', { className: `diw-overlay diw-fallback${this.props.embedded ? ' diw-native' : ''}`, role: 'alert' }, h('div', { className: 'diw-card' }, h('h2', null, '面试工作台暂时无法显示'), h('p', null, errorMessage(this.state.error)), h('div', { className: 'diw-actions' }, h(Button, { onClick: () => this.setState({ error: null }) }, '重试'), this.props.onClose && h(Button, { onClick: this.props.onClose }, '关闭工作台'))))
  }
}

function QuestionMeta({ question }) {
  return h('div', { className: 'diw-meta' }, h(Badge, null, question.topic), question.difficulty && h('span', null, ({ easy: '基础', medium: '进阶', hard: '深入', unspecified: '未标注' })[question.difficulty] ?? '未标注'), question.origin && h(Badge, { tone: question.origin === 'generated' ? 'accent' : '' }, question.origin === 'generated' ? 'Agent 生成' : 'GitHub 原题'))
}

function SourceNote({ question }) {
  if (!question?.source) return null
  const source = question.source
  const metadata = sourceMetadata(question)
  const facts = [metadata.articleTitle && `文章：${metadata.articleTitle}`, metadata.publishedAt && `日期：${metadata.publishedAt}`, metadata.company && `公司：${metadata.company}`, !metadata.company && metadata.tags.length > 0 && `标签：${metadata.tags.slice(0, 4).join('、')}`].filter(Boolean)
  const warnings = Array.isArray(question.contentWarnings) ? question.contentWarnings.filter(item => typeof item === 'string' && item.trim()) : []
  return h('div', { className: 'diw-source-note' }, h('div', { className: 'diw-meta' }, h('span', { className: 'diw-kicker' }, '题目来源'), question.origin && h(Badge, { tone: question.origin === 'generated' ? 'accent' : '' }, question.origin === 'generated' ? 'Agent 生成' : 'GitHub 原题')), h('strong', null, sourceLabel(source)), source.path && h('small', null, source.path), facts.length > 0 && h('p', { className: 'diw-muted' }, facts.join(' · ')), warnings.length > 0 && h('p', { className: 'diw-muted' }, `资料提示：${warnings.join('；')}`), h('div', { className: 'diw-meta' }, source.commit && h('code', { title: source.commit }, source.commit.slice(0, 8)), source.license && h('span', null, source.license), safeLink(source.url) && h('a', { href: safeLink(source.url), target: '_blank', rel: 'noreferrer noopener' }, '查看原文 ↗')), question.origin === 'generated' ? h('small', null, 'Agent 根据引用资料生成 · 参考答案待核对 · 非公司真题') : question.reviewStatus && h('small', null, ({ 'source-unverified': '外部资料 · 参考答案待核验', 'original-training': '原创训练题 · 非公司真题', 'needs-review': '外部资料 · 待核验', reviewed: '已审校' })[question.reviewStatus] ?? '参考资料 · 请结合依据判断'), question.citations?.length > 0 && h('details', { className: 'diw-knowledge-citations' }, h('summary', null, `引用资料（${question.citations.length}）`), h('ul', null, question.citations.map(citation => h('li', { key: citation.id }, safeLink(citation.url) ? h('a', { href: safeLink(citation.url), target: '_blank', rel: 'noreferrer noopener' }, citation.title || citation.path, ' ↗') : h('span', null, citation.title || citation.path), h('small', null, `${citation.repo} · ${citation.commit.slice(0, 8)} · ${citation.license}`))))))
}

function AnswerReference({ question, locked = false }) {
  if (locked) return h('div', { className: 'diw-lock-card' }, h(Icon, { name: 'lock', size: 24 }), h('h3', null, '先思考，再看答案'), h('p', null, '本轮模拟面试结束后，统一开放参考答案与点评。'))
  return h(React.Fragment, null, h('section', { className: 'diw-reference' }, h('div', { className: 'diw-section-heading' }, h('h3', null, '参考答案'), h(Badge, null, '学习材料')), question?.answer ? h(InterviewContent, { value: question.answer }) : h('p', { className: 'diw-muted' }, '此题暂未提供参考答案。可以请面试教练根据你的推导和证据点评。')), question?.followUps?.length > 0 && h('section', { className: 'diw-reference' }, h('h3', null, '继续追问'), h('ol', { className: 'diw-followups' }, question.followUps.map((item, index) => h('li', { key: index }, item)))))
}

function ReviewForm({ attempt, disabled, onSave, recoveryStorage }) {
  const previous = attempt?.reviews?.filter(review => review.reviewer === 'self').at(-1)
  const cacheKey = `${attempt?.id}:${previous?.id ?? 'new'}`
  const [score, setScore] = useState(previous?.score ?? 2)
  const [notes, setNotes] = useState(previous?.notes ?? '')
  const [cacheFailed, setCacheFailed] = useState(false)
  useEffect(() => {
    const cached = readDraft('review', cacheKey, { score: previous?.score ?? 2, notes: previous?.notes ?? '' }, recoveryStorage)
    setScore(cached.score); setNotes(cached.notes); setCacheFailed(false)
  }, [cacheKey])
  function updateReview(nextScore, nextNotes) {
    setScore(nextScore); setNotes(nextNotes)
    setCacheFailed(!writeDraft('review', cacheKey, { score: nextScore, notes: nextNotes }, recoveryStorage))
  }
  if (!attempt) return h('p', { className: 'diw-muted' }, '保存作答后，可以对照参考答案记录自评。')
  return h('section', { className: 'diw-review-form' }, h('div', { className: 'diw-section-heading' }, h('h3', null, '我的自评'), h(Badge, null, '0–4 分')), h('p', { className: 'diw-muted' }, '按本次实际表现评分，写下一个下次要改进的点。'), h('div', { className: 'diw-score-options', role: 'group', 'aria-label': '自评分数' }, SCORE_LABELS.map((label, value) => h('button', { type: 'button', key: value, 'aria-label': `${value} 分：${label}`, 'aria-pressed': score === value, title: label, disabled, onClick: () => updateReview(value, notes) }, h('strong', null, value), h('span', null, label)))), h('div', { className: 'diw-score-caption' }, `本次自评：${score} 分 · ${SCORE_LABELS[score]}`), h('label', { className: 'diw-field' }, h('span', null, '复盘笔记（必填）'), h('textarea', { value: notes, onChange: event => updateReview(score, event.target.value), placeholder: '哪里卡住了？下一次如何回答得更好？', rows: 3, maxLength: 20000, disabled })), h(Button, { icon: 'check', disabled: disabled || !notes.trim() || (score === previous?.score && notes === previous?.notes), onClick: async () => { if (await onSave({ attemptId: attempt.id, questionId: attempt.questionId, score, notes, reviewer: 'self' })) removeDraft('review', cacheKey, recoveryStorage) } }, '保存自评'), h('p', { className: 'diw-editor-help', role: 'status' }, cacheFailed ? '浏览器草稿暂存不可用，请点击保存自评后再离开。' : score === previous?.score && notes === previous?.notes ? '自评已保存到训练记录。' : '笔记会暂存在当前浏览器标签页；点击保存自评后归档到训练记录。'), attempt.reviews?.length > 0 && h('div', { className: 'diw-reviews' }, attempt.reviews.map(review => h('div', { key: review.id, className: 'diw-review-record', 'data-reviewer': review.reviewer }, h('div', { className: 'diw-section-heading' }, h(Badge, { tone: review.reviewer === 'agent' ? 'accent' : '' }, review.reviewer === 'agent' ? 'AI 点评' : '自评'), h('strong', null, `${review.score} / 4`)), review.notes && h(InterviewContent, { value: review.notes }), h('small', null, dateLabel(review.createdAt))))))
}

export function interviewPrompt(practice, question, { canContinueInDsh = true } = {}) {
  if (!canContinueInDsh) {
    const response = latestAttempt(practice, question?.id)?.answer
    const instruction = practice?.mode === 'mock' && !isCompleted(practice)
      ? '这是一轮尚未结束的模拟面试。请一轮只问一道题，结合我的作答继续追问；我明确结束前，不展示参考答案、评分或复盘结论。'
      : '请根据下面的题目和我的实际作答，一轮只问一个问题，再给出有依据的点评。指出知识缺口、表达问题和工程权衡；不要虚构我做过的项目或实验。'
    return `请作为${trackTitle(practice?.track ?? question?.tracks?.[0] ?? 'ai-algorithm')}面试教练，继续这次训练。\n${instruction}\n\n以下材料来自独立面试工作台预览。请直接根据所附文字继续对话。\n\n题目：${question?.title ?? '请先向我提出一个相关的面试问题'}\n${question?.prompt ?? ''}\n\n我的作答：\n${response ?? '（尚未作答，请先提问并等待我的回答。）'}`
  }
  if (practice) return `请作为${trackTitle(practice.track)}面试教练协助我。先用 interview_practice 读取练习 ID：${practice.id}。${practice.mode === 'mock' && !isCompleted(practice) ? '这是尚未结束的模拟面试：一轮只问一道题，不提前展示参考答案或评分；我明确结束后再复盘。' : '请根据已记录的作答逐题追问，并给出有证据的改进建议。点评时调用 interview_review，引用准确的 questionId 和 attemptId，点评会标记为 AI 点评。'}${question ? `\n当前题目 ID：${question.id}。` : ''}\n把缺失知识、表达不清和工程权衡分别指出，不要虚构我做过的项目或实验。`
  return `请作为${trackTitle(question?.tracks?.[0] ?? 'ai-algorithm')}面试教练，围绕题目 ID ${question?.id ?? '（在工作台选择题目）'} 帮我训练。先用 interview_question 读取题目，再一轮只问一个问题，等我作答后追问。不要一开始直接展示参考答案。需要持久记录时使用 interview_start 创建练习，并用 interview_answer 和 interview_review 记录作答与 AI 点评。`
}

export function InterviewWorkbench({ api, onClose, initialTrack = 'ai-algorithm', storageLabel = '', canContinueInDsh = true, embedded = false, recoveryStorage, sessionTitle = '', onStagePrompt, entryRequest, onPracticeState, onBusyChange, onReadonlyChange, onViewChange, draftScope = 'session', connectionAvailable = true, stageDisabledReason = '' }) {
  const [track, setTrack] = useState(initialTrack)
  const [view, setView] = useState('overview')
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [progressFilter, setProgressFilter] = useState('all')
  const [quickScope, setQuickScope] = useState('unanswered')
  const [selectedQuestions, setSelectedQuestions] = useState(() => readSelection(initialTrack, recoveryStorage))
  const [selectionCacheFailed, setSelectionCacheFailed] = useState(false)
  const [allTopics, setAllTopics] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('all')
  const [answerPreview, setAnswerPreview] = useState(false)
  const [offset, setOffset] = useState(0)
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booting, setBooting] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [revision, setRevision] = useState(0)
  const [busy, setBusy] = useState(false)
  const [questionId, setQuestionId] = useState(null)
  const [question, setQuestion] = useState(null)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [questionError, setQuestionError] = useState('')
  const [questionRetryRevision, setQuestionRetryRevision] = useState(0)
  const [practice, setPractice] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [drafts, setDrafts] = useState({})
  const [theme, setTheme] = useState('auto')
  const [count, setCount] = useState(5)
  const [trainingMode, setTrainingMode] = useState('coach')
  const [trainingName, setTrainingName] = useState('')
  const [practicePane, setPracticePane] = useState('answer')
  const [finishRequested, setFinishRequested] = useState(false)
  const [draftCacheFailed, setDraftCacheFailed] = useState(false)
  const [launcherExpanded, setLauncherExpanded] = useState(false)
  const [reading, setReading] = useState(false)
  const [focusReading, setFocusReading] = useState(false)
  const [selectionVersion, setSelectionVersion] = useState(0)
  const [promptText, setPromptText] = useState('')
  const appliedEntryRequest = useRef(null)
  const [exportText, setExportText] = useState('')
  const shellRef = useRef(null)
  const inspectorRef = useRef(null)
  const mainRef = useRef(null)
  const revealRequested = useRef(false)
  const returnToListRequested = useRef(false)
  const selectedRowRef = useRef(null)
  const readerTitleRef = useRef(null)
  const readerToolbarRef = useRef(null)
  const trainingTitleRef = useRef(null)
  const questionAdvanceRequested = useRef(false)
  const finishConfirmRef = useRef(null)
  const paneChangeRequested = useRef(false)
  const alive = useRef(true)
  const lock = useRef(false)
  const closeRef = useRef(onClose)
  const readonly = snapshot?.readonly === true
  const writeDisabled = busy || readonly || !snapshot || loading || !connectionAvailable
  const persistenceLabel = storageLabel || (readonly ? '只读浏览 · 练习记录不可修改' : snapshot?.persistence?.mode === 'file' ? '作答保存在本地私有目录' : snapshot?.persistence?.mode === 'memory' ? '临时练习 · 服务关闭后不保留' : '正在连接训练服务')
  const activeMock = practice?.mode === 'mock' && !isCompleted(practice)
  const currentQuestion = practice?.questions?.[questionIndex]
  const attempt = latestAttempt(practice, currentQuestion?.id)
  const draftKey = currentQuestion ? `${practice.id}:${currentQuestion.id}` : ''
  const draft = drafts[draftKey] ?? readDraft('answer', draftKey, attempt?.answer ?? '', recoveryStorage)
  const selectedTrack = TRACKS.find(item => item.id === track) ?? TRACKS[0]
  const questions = snapshot?.catalog?.questions ?? []
  const topics = snapshot?.catalog?.topics ?? []
  const sources = snapshot?.catalog?.sources ?? []
  const learningCounts = snapshot?.catalog?.counts ?? { all: topics.reduce((sum, item) => sum + item.count, 0), unanswered: 0, needsReview: 0, reviewed: 0 }
  const selectedIds = new Set(selectedQuestions.map(item => item.id))

  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => { onPracticeState?.(practice) }, [practice, onPracticeState])
  useEffect(() => { onBusyChange?.(busy) }, [busy, onBusyChange])
  useEffect(() => { onReadonlyChange?.(readonly) }, [readonly, onReadonlyChange])
  useEffect(() => { onViewChange?.(view) }, [view, onViewChange])
  useEffect(() => {
    if (!entryRequest || booting || busy || appliedEntryRequest.current === entryRequest.id) return
    appliedEntryRequest.current = entryRequest.id
    if (entryRequest.refresh) void refreshTraining()
    else if (entryRequest.practiceId) void openPractice(entryRequest.practiceId)
    else void navigateView(entryRequest.view ?? 'overview')
  }, [entryRequest, booting, busy])
  useEffect(() => {
    if (embedded) return
    const returnFocus = document.activeElement
    shellRef.current?.focus()
    function keyDown(event) {
      if (event.key === 'Escape') { event.preventDefault(); void closeRef.current?.(); return }
      if (event.key !== 'Tab') return
      const elements = [...(shellRef.current?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]') ?? [])].filter(element => element.getClientRects().length)
      if (!elements.length) { event.preventDefault(); return }
      const first = elements[0]; const last = elements.at(-1)
      if (event.shiftKey && (document.activeElement === first || document.activeElement === shellRef.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === shellRef.current)) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keyDown)
    return () => { document.removeEventListener('keydown', keyDown); if (returnFocus?.isConnected) returnFocus.focus?.() }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(() => api.snapshot({ limit: 1 })).then(async value => {
      const cursor = readCursor(recoveryStorage)
      const pending = value.practices.find(item => item.id === cursor?.practiceId)
      if (pending) {
        const restored = await api.practice({ id: pending.id })
        if (cancelled) return
        setPractice(restored); setTrack(restored.track); setSelectedQuestions(readSelection(restored.track, recoveryStorage)); setView('practice')
        const unanswered = restored.questions.findIndex(item => !latestAttempt(restored, item.id))
        const remembered = restored.questions.findIndex(item => item.id === cursor?.questionId)
        setQuestionIndex(remembered >= 0 ? remembered : unanswered < 0 ? 0 : unanswered)
        setPracticePane(isCompleted(restored) ? cursor?.pane ?? 'review' : restored.mode !== 'mock' ? cursor?.pane ?? 'answer' : 'answer')
      }
      if (!cancelled) setBooting(false)
    }).catch(cause => { if (!cancelled) { setError(errorMessage(cause)); setBooting(false) } })
    return () => { cancelled = true }
  }, [api])

  useEffect(() => {
    if (booting) return
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      Promise.resolve().then(() => api.snapshot({ track, query, ...(topic ? { topic } : {}), ...(sourceId ? { sourceId } : {}), ...(difficulty ? { difficulty } : {}), progress: progressFilter, offset, limit: PAGE_SIZE })).then(value => {
        if (cancelled) return
        setSnapshot(value); setLoading(false); setError('')
        setQuestionId(previous => value.catalog.questions.some(item => item.id === previous) ? previous : value.catalog.questions[0]?.id ?? null)
      }).catch(cause => { if (!cancelled) { setError(errorMessage(cause)); setLoading(false) } })
    }, query ? 180 : 0)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [api, track, query, topic, sourceId, difficulty, progressFilter, offset, revision, booting])

  useEffect(() => {
    if (!questionId || (activeMock && !readonly) || view !== 'bank') { setQuestion(null); setQuestionError(''); return }
    let cancelled = false
    setQuestionLoading(true); setQuestion(null); setQuestionError('')
    Promise.resolve().then(() => api.question({ id: questionId })).then(value => { if (!cancelled) { setQuestion(value); setQuestionLoading(false) } }).catch(cause => { if (!cancelled) { setQuestionError(errorMessage(cause)); setQuestionLoading(false) } })
    return () => { cancelled = true }
  }, [api, questionId, activeMock, readonly, view, questionRetryRevision])

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
    if (mainRef.current?.parentElement) mainRef.current.parentElement.scrollTop = 0
  }, [view, track])

  useEffect(() => {
    if (inspectorRef.current) inspectorRef.current.scrollTop = 0
    if (revealRequested.current && question?.id !== questionId) readerToolbarRef.current?.focus({ preventScroll: true })
    if (question?.id === questionId && revealRequested.current) {
      revealRequested.current = false
      readerTitleRef.current?.focus({ preventScroll: true })
      if (reading || focusReading) inspectorRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
  }, [question?.id, questionId, currentQuestion?.id, reading, focusReading, selectionVersion, questionRetryRevision])

  useEffect(() => {
    if (reading || focusReading || !returnToListRequested.current) return
    returnToListRequested.current = false
    const row = selectedRowRef.current?.isConnected ? selectedRowRef.current : mainRef.current?.querySelector('.diw-question-row[aria-pressed="true"]')
    row?.focus({ preventScroll: true })
    row?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [reading, focusReading, selectionVersion])

  useEffect(() => {
    if (!questionAdvanceRequested.current || !currentQuestion) return
    questionAdvanceRequested.current = false
    if (mainRef.current) mainRef.current.scrollTop = 0
    if (mainRef.current?.parentElement) mainRef.current.parentElement.scrollTop = 0
    trainingTitleRef.current?.focus({ preventScroll: true })
  }, [currentQuestion?.id, view, practice?.status])

  useEffect(() => {
    if (view === 'practice' && currentQuestion) writeCursor({ practiceId: practice.id, questionId: currentQuestion.id, pane: practicePane }, recoveryStorage)
  }, [view, practice?.id, currentQuestion?.id, practicePane])

  useEffect(() => {
    if (finishRequested) { finishConfirmRef.current?.focus({ preventScroll: true }); finishConfirmRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }) }
  }, [finishRequested])
  useEffect(() => {
    if (!paneChangeRequested.current) return
    paneChangeRequested.current = false
    mainRef.current?.querySelector('.diw-practice-tabs')?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [practicePane])

  const run = useCallback(async (work, successMessage = '') => {
    if (lock.current) return undefined
    lock.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const result = await work()
      if (alive.current && successMessage) setNotice(successMessage)
      return result
    } catch (cause) { if (alive.current) setError(errorMessage(cause)); return undefined }
    finally { lock.current = false; if (alive.current) setBusy(false) }
  }, [])

  function resetReading() { setReading(false); setFocusReading(false); revealRequested.current = false; returnToListRequested.current = false }
  function pickQuestion(item, element) {
    selectedRowRef.current = element
    revealRequested.current = true
    setQuestionId(item.id)
    setReading(embedded || window.matchMedia('(max-width:1100px)').matches)
    setSelectionVersion(value => value + 1)
    if (item.id === questionId && questionError && !questionLoading) setQuestionRetryRevision(value => value + 1)
  }
  function retryQuestion() { revealRequested.current = true; setQuestionRetryRevision(value => value + 1) }
  function refreshVisible() { setRevision(value => value + 1); if (view === 'bank' && questionId) retryQuestion() }
  async function refreshTraining() {
    await run(async () => {
      if (practice) { const value = await api.practice({ id: practice.id }); if (alive.current) setPractice(value) }
      if (alive.current) refreshVisible()
    })
  }
  function focusQuestion() { revealRequested.current = true; setFocusReading(true); setSelectionVersion(value => value + 1) }
  function returnToList() { revealRequested.current = false; returnToListRequested.current = true; setReading(false); setFocusReading(false); setSelectionVersion(value => value + 1) }
  async function navigateView(value) { if (value !== 'practice' && activeMock && !readonly) return; await run(async () => { if (practice && !isCompleted(practice) && !readonly) await saveCurrent(); if (alive.current) { resetReading(); if (value === 'practice' && practice && practice.track !== track) { setTrack(practice.track); setLoading(true); setSnapshot(null); setSelectedQuestions(readSelection(practice.track, recoveryStorage)); setTopic(''); setSourceId(''); setDifficulty(''); setProgressFilter('all'); setQuery(''); setOffset(0) } setView(value === 'new' && draftScope !== 'workspace' ? 'overview' : value); setPromptText(''); setExportText('') } }) }
  async function selectTrack(value) { await run(async () => { if (practice && !isCompleted(practice) && !readonly) await saveCurrent(); if (alive.current) { resetReading(); setTrack(value); setLoading(true); setSnapshot(null); setTopic(''); setSourceId(''); setDifficulty(''); setProgressFilter('all'); setQuery(''); setOffset(0); setSelectedQuestions(readSelection(value, recoveryStorage)); setSelectionCacheFailed(false); setView(['sources', 'learning', 'experiences'].includes(view) ? view : view === 'new' && draftScope === 'workspace' ? 'new' : 'overview'); setPromptText(''); setExportText('') } }) }
  function showPractice(value) { if (!alive.current) return; resetReading(); questionAdvanceRequested.current = true; setPractice(value); if (track !== value.track) { setTrack(value.track); setLoading(true); setSnapshot(null); setSelectedQuestions(readSelection(value.track, recoveryStorage)); setTopic(''); setSourceId(''); setQuery(''); setDifficulty(''); setProgressFilter('all'); setOffset(0) } setQuestionIndex(0); setPracticePane(isCompleted(value) ? 'review' : 'answer'); setAnswerPreview(false); setFinishRequested(false); setView('practice'); setPromptText(''); setExportText('') }
  function updateSelection(value) { setSelectedQuestions(value); setSelectionCacheFailed(!writeSelection(track, value, recoveryStorage)) }
  function toggleSelection(item) {
    if (selectedIds.has(item.id)) updateSelection(selectedQuestions.filter(value => value.id !== item.id))
    else if (selectedQuestions.length < 30) updateSelection([...selectedQuestions, { id: item.id, title: item.title }])
    else setNotice('一轮最多 30 题，请先移除部分题目。')
  }
  function browseQuestions({ topic: nextTopic = '', progress = 'all' } = {}) {
    resetReading(); setTopic(nextTopic); setSourceId(''); setProgressFilter(progress); setDifficulty(''); setQuery(''); setOffset(0); setView('bank')
  }
  async function beginPractice(options) {
    return run(async () => {
      if (practice && !isCompleted(practice)) await saveCurrent()
      const value = await api.start({ track, ...options })
      showPractice(value); setRevision(current => current + 1)
      return value
    })
  }
  async function openPractice(id, targetQuestion) {
    await run(async () => {
      if (practice && !isCompleted(practice) && !readonly) await saveCurrent()
      const value = await api.practice({ id })
      showPractice(value)
      const index = targetQuestion ? value.questions.findIndex(item => item.id === targetQuestion) : value.questions.findIndex(item => !latestAttempt(value, item.id))
      setQuestionIndex(Math.max(0, index))
      if (targetQuestion && (value.mode !== 'mock' || isCompleted(value))) setPracticePane('review')
    })
  }
  async function start(mode, oneQuestion = false) {
    const selection = oneQuestion && question ? { questionIds: [question.id] } : { count, query, ...(topic ? { topic } : {}), ...(sourceId ? { sourceId } : {}), ...(difficulty ? { difficulty } : {}), progress: progressFilter, selection: 'shuffle' }
    await beginPractice({ mode, ...selection })
  }
  async function saveCurrent() {
    if (readonly || !currentQuestion || !draft.trim() || draft === attempt?.answer) return practice
    const value = await api.answer({ practiceId: practice.id, questionId: currentQuestion.id, answer: draft })
    removeDraft('answer', draftKey, recoveryStorage)
    if (alive.current) { setPractice(value); setRevision(current => current + 1) }
    return value
  }
  closeRef.current = () => {
    if (lock.current) return
    if (currentQuestion && !isCompleted(practice) && !readonly && draft.trim() && draft !== attempt?.answer) void run(async () => { await saveCurrent(); onClose?.() })
    else onClose?.()
  }
  async function moveQuestion(index) {
    await run(async () => { if (!isCompleted(practice)) await saveCurrent(); if (alive.current) { questionAdvanceRequested.current = true; setQuestionIndex(index); setAnswerPreview(false); setFinishRequested(false); if (!isCompleted(practice)) setPracticePane('answer') } })
  }
  async function finishPractice() {
    await run(async () => { await saveCurrent(); const value = await api.finish({ practiceId: practice.id }); if (alive.current) { setPractice(value); setPracticePane('review'); setFinishRequested(false); questionAdvanceRequested.current = true; setRevision(current => current + 1) } }, '本轮已结束，可以对照答案逐题复盘。')
  }
  async function changePracticePane(value) {
    await run(async () => {
      if (value === 'review' && practice && !isCompleted(practice)) await saveCurrent()
      if (alive.current) { paneChangeRequested.current = true; setPracticePane(value); setFinishRequested(false) }
    })
  }
  function updateAnswer(value) {
    setDrafts(previous => ({ ...previous, [draftKey]: value }))
    setDraftCacheFailed(!writeDraft('answer', draftKey, value, recoveryStorage))
  }
  async function copyPrompt() {
    await run(async () => {
      setPromptText('')
      let promptPractice = view === 'practice' ? practice : null
      if (promptPractice && !isCompleted(promptPractice) && !readonly) promptPractice = await saveCurrent()
      const promptQuestion = view === 'practice' ? promptPractice?.questions?.find(item => item.id === currentQuestion?.id) ?? currentQuestion : question
      const value = interviewPrompt(promptPractice, promptQuestion, { canContinueInDsh })
      if (!alive.current) return
      if (onStagePrompt) {
        await onStagePrompt(value)
        if (alive.current) setNotice('已加入当前会话下方的草稿，原有文字已保留。检查后发送，即可由当前 Agent 继续训练。')
        return
      }
      setPromptText(value)
      if (!navigator.clipboard?.writeText) { setNotice('训练指令已展开，可以手动复制。'); return }
      await navigator.clipboard.writeText(value); if (alive.current) setNotice(canContinueInDsh ? '已复制训练指令。回到 DSH 对话，选择面试教练并粘贴。' : '已复制题目与当前作答，可以粘贴到对话继续训练。')
    })
  }
  async function exportPractice() {
    await run(async () => {
      const value = await api.export({ practiceId: practice.id })
      const markdown = typeof value === 'string' ? value : value.markdown
      if (typeof markdown !== 'string') throw new Error('导出结果格式不正确')
      if (alive.current) setExportText(markdown)
      const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `interview-${practice.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`; anchor.click(); URL.revokeObjectURL(url)
    }, '已导出脱敏复盘摘要。')
  }

  const rail = h('nav', { className: 'diw-rail', 'aria-label': '面试工作台导航' },
    h('div', { className: 'diw-rail-label' }, '你的目标岗位'),
    h('div', { className: 'diw-role-switch' }, TRACKS.map(item => h('button', { key: item.id, type: 'button', className: 'diw-track', 'aria-pressed': track === item.id, disabled: (activeMock && !readonly) || busy, onClick: () => selectTrack(item.id) }, h('span', { className: 'diw-track-icon' }, h(Icon, { name: item.icon })), h('span', null, h('strong', null, item.short), h('small', null, item.caption)), track === item.id && h('i', { className: 'diw-selected-dot' })))),
    h('div', { className: 'diw-rail-rule' }), h('div', { className: 'diw-rail-label' }, '训练空间'),
    h('div', { className: 'diw-nav-links' }, [{ id: 'overview', icon: 'dashboard' }, { id: 'sprint', icon: 'play' }, { id: 'bank', icon: 'book' }, { id: 'practice', icon: 'play' }, { id: 'history', icon: 'history' }, { id: 'learning', icon: 'spark' }, { id: 'experiences', icon: 'history' }, { id: 'sources', icon: 'link' }].map(item => h('button', { key: item.id, type: 'button', className: 'diw-nav-item', 'aria-current': view === item.id ? 'page' : undefined, disabled: busy || (activeMock && !readonly && item.id !== 'practice'), onClick: () => navigateView(item.id) }, h(Icon, { name: item.icon }), h('span', null, h('strong', null, VIEW_LABELS[item.id])), item.id === 'practice' && practice && !isCompleted(practice) && h('span', { className: 'diw-live-dot' })))),
    h('div', { className: 'diw-rail-footer' }, h('strong', null, '训练记录'), h('small', null, persistenceLabel)))

  function newTrainingView() {
    const available = quickScope === 'unanswered' ? learningCounts.unanswered : quickScope === 'needs-review' ? learningCounts.needsReview : learningCounts.all
    const blocked = writeDisabled || activeMock
    const selectedCount = Math.min(count, available)
    return h('div', { className: 'diw-new-training' },
      h('header', { className: 'diw-new-intro' }, h('h2', null, '新训练'), h('p', null, '选择岗位、模式与题量；作答和复盘会保存在这轮训练里。')),
      h('div', { className: 'diw-new-layout' },
        h('form', { className: 'diw-new-form', 'aria-label': '新训练设置', onSubmit: async event => {
          event.preventDefault()
          if (blocked || !available) return
          const title = trainingName.trim()
          const value = await beginPractice({ track, mode: trainingMode, count, progress: quickScope, selection: 'shuffle', ...(title ? { title } : {}) })
          if (value && alive.current) setTrainingName('')
        } },
          h('fieldset', { className: 'diw-new-fieldset', disabled: blocked }, h('legend', null, '目标岗位'),
            h('div', { className: 'diw-new-options' }, TRACKS.map(item => h('button', { type: 'button', key: item.id, className: 'diw-new-option', 'aria-pressed': track === item.id, onClick: () => { if (track !== item.id) void selectTrack(item.id) } },
              h(Icon, { name: item.icon, size: 20 }), h('strong', null, item.title), h('small', null, item.caption))))),
          h('label', { className: 'diw-new-field' }, h('span', null, '训练名称', h('small', null, '可选')),
            h('input', { 'aria-label': '训练名称', value: trainingName, maxLength: 80, placeholder: '例如：大模型基础 · 第一轮', disabled: blocked, onChange: event => setTrainingName(event.target.value) }),
            h('small', null, '留空时使用第一道题的标题，之后可以改名。')),
          h('fieldset', { className: 'diw-new-fieldset', disabled: blocked }, h('legend', null, '训练模式'),
            h('div', { className: 'diw-new-options' }, [{ id: 'coach', title: '教练练习', detail: '逐题作答，随时对照参考与自评' }, { id: 'mock', title: '模拟面试', detail: '独立完成，结束后统一复盘' }].map(mode => h('button', { type: 'button', key: mode.id, className: 'diw-new-option', 'aria-pressed': trainingMode === mode.id, onClick: () => setTrainingMode(mode.id) },
              h('strong', null, mode.title), h('small', null, mode.detail))))),
          h('div', { className: 'diw-new-row' },
            h('label', { className: 'diw-new-field' }, h('span', null, '题目范围'), h('select', { value: quickScope, disabled: blocked, onChange: event => setQuickScope(event.target.value) },
              h('option', { value: 'unanswered' }, '未作答题目'), h('option', { value: 'needs-review' }, '待复盘题目'), h('option', { value: 'all' }, '全部岗位题目'))),
            h('label', { className: 'diw-new-field' }, h('span', null, '本轮题量'), h('select', { value: count, disabled: blocked, onChange: event => setCount(Number(event.target.value)) }, [3, 5, 10].map(value => h('option', { key: value, value }, `${value} 题`))))),
          h('div', { className: 'diw-new-actions' }, h('small', { role: 'status' }, loading ? '正在读取岗位题目…' : activeMock ? '请先结束当前模拟面试，再开始新训练。' : available ? `从 ${available} 道题中随机抽取 ${selectedCount} 道` : '这个范围暂无题目，试试其他范围。'),
            h(Button, { type: 'submit', tone: 'primary', icon: 'play', disabled: blocked || !available }, busy ? '正在准备…' : '创建并开始'))),
        h('aside', { className: 'diw-new-summary', 'aria-label': '本轮训练概况' },
          h('h3', null, selectedTrack.title), h('p', null, trainingMode === 'mock' ? '这一轮先专注回答。结束后，再统一对照答案和记录复盘。' : '先写下自己的思路，再对照参考，留下一个下次要改进的点。'),
          h('dl', { className: 'diw-new-stats' }, [
            { label: '岗位题库', value: loading ? '—' : `${learningCounts.all} 题` },
            { label: '可选题目', value: loading ? '—' : `${available} 题` },
            { label: '本轮训练', value: loading ? '—' : `${selectedCount} 题` },
          ].map(item => h('div', { key: item.label }, h('dt', null, item.label), h('dd', null, item.value)))),
          quickScope === 'needs-review' && h('small', null, '待复盘包括已作答但未点评，以及最近评分低于 3 的题目。'),
          !loading && available > 0 && available < count && h('small', null, `当前范围只有 ${available} 道题，本轮会使用全部可选题目。`),
          h(Button, { disabled: busy, onClick: () => navigateView('overview') }, '返回训练总览'))))
  }

  function overviewView() {
    const sessionPractice = practice && !isCompleted(practice) && practice.track === track ? practice : null
    const pending = sessionPractice ?? snapshot?.practices?.find(item => !isCompleted(item))
    const sortedTopics = [...topics].sort((a, b) => b.count - a.count)
    const visibleTopics = allTopics ? sortedTopics : sortedTopics.slice(0, 6)
    const available = quickScope === 'unanswered' ? learningCounts.unanswered : quickScope === 'needs-review' ? learningCounts.needsReview : learningCounts.all
    return h('div', { className: 'diw-overview' },
      h('div', { className: 'diw-overview-topline' },
        h('div', { className: 'diw-overview-heading' }, h('span', { className: 'diw-kicker' }, selectedTrack.title)),
        h(Button, { icon: 'book', disabled: busy, onClick: () => browseQuestions() }, '浏览题库')),
      h('div', { className: 'diw-overview-grid' },
        h('section', { className: 'diw-next-session' },
          h('div', { className: 'diw-section-heading' }, h('span', { className: 'diw-kicker' }, pending ? embedded && draftScope !== 'workspace' ? sessionPractice ? '继续当前会话的训练' : '最近的共享训练' : '接着上次的思路' : '准备好下一轮'), h(Icon, { name: pending ? 'history' : 'spark', size: 24 })),
          h('h3', null, pending ? draftScope === 'workspace' ? practiceTitle(pending) : `继续${modeTitle(pending.mode)}` : '暂无进行中的训练'),
          h('p', null, pending ? `${trackTitle(pending.track)} · ${draftScope === 'workspace' ? `${modeTitle(pending.mode)} · ` : ''}${pending.questionCount} 道题 · ${dateLabel(pending.updatedAt)}` : '开始一轮练习后，作答与复盘会保存在训练记录里。'),
          embedded && pending && !sessionPractice && h('small', { className: 'diw-muted' }, draftScope === 'workspace' ? '来自训练记录，打开后可继续作答与复盘。' : '来自训练记录，打开后可在当前会话继续。'),
          pending && h(React.Fragment, null, h('progress', { max: pending.questionCount, value: pending.answeredCount, 'aria-label': '待继续训练的进度' }), h('small', null, `已作答 ${pending.answeredCount} / ${pending.questionCount} 题`)),
          h('div', { className: 'diw-actions' },
            pending && h(Button, { tone: 'primary', icon: 'arrow', disabled: busy, onClick: () => openPractice(pending.id) }, '继续这轮训练'),
            h(Button, { icon: learningCounts.needsReview ? 'refresh' : 'book', disabled: loading || busy, onClick: () => browseQuestions({ progress: learningCounts.needsReview ? 'needs-review' : 'all' }) }, learningCounts.needsReview ? '查看待复盘题目' : '挑选第一道题'))),
        h('section', { className: 'diw-quick-start', 'aria-label': '快速开始训练' },
          h('div', { className: 'diw-section-heading' }, h('h3', null, '开始一轮练习'), h(Badge, null, '随机组题')),
          h('div', { className: 'diw-mode-options', role: 'group', 'aria-label': '快速训练模式' }, [{ id: 'coach', title: '教练练习', detail: '随时对照与自评' }, { id: 'mock', title: '模拟面试', detail: '结束后开放参考' }].map(mode => h('button', { key: mode.id, type: 'button', 'aria-pressed': trainingMode === mode.id, disabled: busy, onClick: () => setTrainingMode(mode.id) }, h('strong', null, mode.title), h('small', null, mode.detail)))),
          h('div', { className: 'diw-launcher-options' },
            h('label', { className: 'diw-topic-filter' }, h('span', null, '练习范围'), h('select', { value: quickScope, disabled: busy, onChange: event => setQuickScope(event.target.value) }, h('option', { value: 'unanswered' }, '未作答题目'), h('option', { value: 'needs-review' }, '待复盘题目'), h('option', { value: 'all' }, '全部岗位题目'))),
            h('label', { className: 'diw-launcher-count' }, h('span', null, '本轮题量'), h('select', { value: count, disabled: busy, onChange: event => setCount(Number(event.target.value)) }, [3, 5, 10].map(value => h('option', { key: value, value }, `${value} 题`))))),
          h('div', { className: 'diw-launcher-submit' }, h('small', { className: 'diw-muted' }, available ? `从 ${available} 道题中抽取 ${Math.min(count, available)} 道` : '当前范围暂无题目，请切换范围。'), h(Button, { tone: 'primary', icon: 'shuffle', disabled: writeDisabled || loading || !available, onClick: () => beginPractice({ mode: trainingMode, count, progress: quickScope, selection: 'shuffle' }) }, '开始训练')))),
      h('section', { className: 'diw-sprint-entry' }, h('h3', null, '7 天 AI 机考速成'), h('p', null, '从 5 分钟曼哈顿距离开始，逐步练到 K-Median、GQA 和限时自测。'), h(Button, { disabled: busy || activeMock, onClick: () => navigateView('sprint') }, '进入 7 天速成')),
      h('div', { className: 'diw-overview-stats', 'aria-label': '当前岗位学习概况' }, [
        { label: '岗位题目', number: learningCounts.all, detail: `${topics.length} 个专题 · 按方向选题`, filter: 'all', tone: '' },
        { label: '待复盘', number: learningCounts.needsReview, detail: '已作答，尚未点评或最近评分低于 3', filter: 'needs-review', tone: 'warm' },
        { label: '未作答', number: learningCounts.unanswered, detail: `已为 ${learningCounts.all - learningCounts.unanswered} 道题保存作答`, filter: 'unanswered', tone: 'accent' },
      ].map(item => h('button', { key: item.label, type: 'button', className: 'diw-stat-card', 'data-tone': item.tone, disabled: loading || busy, onClick: () => browseQuestions({ progress: item.filter }) }, h('span', null, item.label), h('strong', null, snapshot ? item.number.toLocaleString() : '—'), h('small', null, item.detail)))),
      h('section', { className: 'diw-learning-overview-link' }, h('div', null, h('h3', null, '从复盘中找到下一步'), h('p', null, '汇集真实作答与点评笔记，查看专题缺口，并开始根据学习记录推荐的下一轮。')), h(Button, { icon: 'spark', disabled: busy, onClick: () => navigateView('learning') }, '查看学习记忆')),
      h('div', { className: 'diw-section-heading diw-section-space' }, h('div', null, h('h3', null, '按专题浏览题目'), h('p', { className: 'diw-muted' }, '专题进度按已保存作答计算；点评分数不等于掌握程度。')), topics.length > 6 && h(Button, { 'aria-expanded': allTopics, onClick: () => setAllTopics(value => !value) }, allTopics ? '收起专题' : `全部 ${topics.length} 个专题`)),
      h('div', { className: 'diw-topic-grid' }, visibleTopics.map((item, index) => h('button', { type: 'button', className: 'diw-topic-card', key: item.id, disabled: busy || loading, onClick: () => browseQuestions({ topic: item.id }) },
        h('div', { className: 'diw-topic-card-top' }, h(Icon, { name: index % 2 ? 'agent' : 'algorithm', size: 22 }), h('small', null, `${item.count} 道题`)), h('h3', null, item.title),
        h('progress', { max: item.count, value: item.answeredCount ?? 0, 'aria-label': `${item.title}已作答进度` }),
        h('div', { className: 'diw-topic-foot' }, h('span', null, `已作答 ${item.answeredCount ?? 0} / ${item.count}`), h('span', null, item.needsReviewCount ? `${item.needsReviewCount} 道待复盘` : '进入专题 →'))))),
      !loading && !topics.length && h(Empty, { title: '暂时没有可用题目' }, '请检查题库是否加载，或尝试刷新。'),
      h('div', { className: 'diw-overview-foot' }, h('p', { className: 'diw-muted' }, `${snapshot?.stats?.completedCount ?? 0} 轮训练已完成 · ${snapshot?.stats?.attemptCount ?? 0} 次作答已保存`), h(Button, { icon: 'history', disabled: busy, onClick: () => navigateView('history') }, '查看训练记录')))
  }

  function bankView() {
    const matches = snapshot?.catalog?.filtered ?? 0
    const searchLabel = query.trim()
    const activeFilters = [
      searchLabel && `关键词「${searchLabel.slice(0, 60)}${searchLabel.length > 60 ? '…' : ''}」`,
      topic && `专题：${topics.find(item => item.id === topic)?.title ?? topic}`,
      sourceId && `来源：${sourceLabel(sources.find(item => item.id === sourceId))}`,
      difficulty && `难度：${({ easy: '基础', medium: '进阶', hard: '深入', unspecified: '未标注' })[difficulty] ?? difficulty}`,
      progressFilter !== 'all' && `状态：${({ unanswered: '未作答', 'needs-review': '待复盘', reviewed: '已评 3–4 分' })[progressFilter] ?? progressFilter}`,
    ].filter(Boolean)
    return h(React.Fragment, null,
      h('div', { className: 'diw-bank-intro' },
        h('p', null, `${selectedTrack.title} · 按专题、来源、难度或学习状态筛选，也可以勾选题目组成训练。`)),
      h('section', { className: 'diw-launcher', 'data-expanded': launcherExpanded, 'aria-label': '开始一轮训练' },
        h(Button, { className: 'diw-launcher-toggle', icon: 'play', 'aria-expanded': launcherExpanded, 'aria-controls': 'diw-launcher-body', onClick: () => setLauncherExpanded(value => !value) }, launcherExpanded ? '收起训练设置' : '开始一轮训练'),
        h('div', { className: 'diw-launcher-body', id: 'diw-launcher-body' },
        h('div', { className: 'diw-launcher-options' },
          h('div', { className: 'diw-mode-options', role: 'group', 'aria-label': '训练模式' },
            [{ id: 'coach', title: '教练练习', detail: '逐题作答，可对照答案' }, { id: 'mock', title: '模拟面试', detail: '独立作答，结束后复盘' }].map(mode =>
              h('button', { key: mode.id, type: 'button', 'aria-pressed': trainingMode === mode.id, disabled: busy, onClick: () => setTrainingMode(mode.id) },
                h('strong', null, mode.title), h('small', null, mode.detail)))),
          h('label', { className: 'diw-launcher-count' }, h('span', null, '本轮题量'),
            h('select', { value: count, onChange: event => setCount(Number(event.target.value)), disabled: busy }, [3, 5, 10].map(value => h('option', { key: value, value }, `${value} 题`))))),
        h('div', { className: 'diw-launcher-submit' },
          h('p', { className: 'diw-muted' }, `从全部 ${matches} 道匹配题目中随机抽取 ${Math.min(count, matches)} 道。`),
          h(Button, { tone: 'primary', icon: 'play', disabled: writeDisabled || loading || !matches, onClick: () => start(trainingMode) }, busy ? '正在准备…' : `开始${modeTitle(trainingMode)}`)))),
      h('div', { className: 'diw-filter-tabs', role: 'group', 'aria-label': '学习状态筛选' }, [
        { id: 'all', label: '全部', count: learningCounts.all }, { id: 'unanswered', label: '未作答', count: learningCounts.unanswered }, { id: 'needs-review', label: '待复盘', count: learningCounts.needsReview }, { id: 'reviewed', label: '已评 3–4 分', count: learningCounts.reviewed },
      ].map(item => h('button', { type: 'button', key: item.id, 'aria-pressed': progressFilter === item.id, onClick: () => { setProgressFilter(item.id); setOffset(0) } }, item.label, h('span', null, item.count)))),
      progressFilter === 'needs-review' && h('p', { className: 'diw-muted' }, '这里包含待点评和最近评分低于 3 的题目。先看上次作答，也可以重新练习。'),
      h('div', { className: 'diw-section-heading diw-bank-heading' }, h('h3', null, '题目列表'),
        h('div', { className: 'diw-actions' }, h('span', { className: 'diw-muted', role: 'status', 'aria-live': 'polite', 'aria-atomic': true }, loading ? '正在更新题目…' : `${matches} 道匹配`),
          activeFilters.length > 0 && questions.length > 0 && h(Button, { disabled: loading, onClick: () => browseQuestions() }, '清除筛选'))),
      h('div', { className: 'diw-filters' },
        h('label', { className: 'diw-search' }, h('span', { className: 'diw-filter-label' }, '搜索题目'),
          h('span', { className: 'diw-search-control' }, h(Icon, { name: 'search', size: 18 }), h('input', { 'aria-label': '搜索题目', placeholder: '概念、问题或关键词', maxLength: 1000, value: query, onChange: event => { setQuery(event.target.value); setOffset(0) } }))),
        h('label', { className: 'diw-topic-filter' }, h('span', { className: 'diw-filter-label' }, '题目专题'),
          h('select', { value: topic, onChange: event => { setTopic(event.target.value); setOffset(0) } }, h('option', { value: '' }, '全部专题'), topics.map(item => h('option', { key: item.id, value: item.id }, `${item.title} · ${item.count}`)))),
        h('label', { className: 'diw-topic-filter' }, h('span', { className: 'diw-filter-label' }, '题目来源'),
          h('select', { value: sourceId, onChange: event => { setSourceId(event.target.value); setOffset(0) } }, h('option', { value: '' }, '全部来源'), sources.filter(item => item.trackQuestionCount > 0).map(item => h('option', { key: item.id, value: item.id }, `${sourceLabel(item)} · ${item.trackQuestionCount} 题`)))),
        h('label', { className: 'diw-difficulty-filter' }, h('span', { className: 'diw-filter-label' }, '题目难度'), h('select', { value: difficulty, onChange: event => { setDifficulty(event.target.value); setOffset(0) } }, h('option', { value: '' }, '全部难度'), h('option', { value: 'easy' }, '基础'), h('option', { value: 'medium' }, '进阶'), h('option', { value: 'hard' }, '深入'), h('option', { value: 'unspecified' }, '未标注')))),
      h('div', { className: 'diw-bank-toolbar' }, h('small', { className: 'diw-muted' }, `自选题单 ${selectedQuestions.length} / 30 · 可跨页选择`), h('div', { className: 'diw-actions' }, h(Button, { icon: 'plus', disabled: loading || !questions.length || selectedQuestions.length >= 30, onClick: () => updateSelection([...selectedQuestions, ...questions.filter(item => !selectedIds.has(item.id)).map(({ id, title }) => ({ id, title }))].slice(0, 30)) }, '本页加入题单'), selectedQuestions.length > 0 && h(Button, { tone: 'primary', icon: 'play', disabled: writeDisabled, onClick: () => beginPractice({ mode: trainingMode, questionIds: selectedQuestions.map(item => item.id) }) }, `练习已选 ${selectedQuestions.length} 题`))),
      h('div', { className: 'diw-question-list', role: questions.length ? 'list' : undefined, 'aria-busy': loading },
        questions.map((item, index) => {
          const metadata = sourceMetadata(item)
          const summary = [metadata.publishedAt && `日期：${metadata.publishedAt}`, metadata.company && `公司：${metadata.company}`, !metadata.company && metadata.tags.length > 0 && `标签：${metadata.tags.slice(0, 2).join('、')}`].filter(Boolean).join(' · ')
          return h('div', { key: item.id, className: 'diw-question-item', role: 'listitem', 'data-selected': questionId === item.id },
          h('label', { className: 'diw-pick', title: '加入自选题单' }, h('input', { type: 'checkbox', checked: selectedIds.has(item.id), 'aria-label': `加入题单：${item.title}`, disabled: loading || busy || (!selectedIds.has(item.id) && selectedQuestions.length >= 30), onChange: () => toggleSelection(item) })),
          h('button', { type: 'button', className: 'diw-question-row', disabled: loading || busy, 'aria-pressed': questionId === item.id, onClick: event => pickQuestion(item, event.currentTarget) },
          h('span', { className: 'diw-question-index' }, String(offset + index + 1).padStart(2, '0')),
          h('span', { className: 'diw-question-copy' }, h('strong', null, item.title),
            h('span', { className: 'diw-question-tags' }, h('span', null, item.topic), item.difficulty && h('span', null, ({ easy: '基础', medium: '进阶', hard: '深入', unspecified: '未标注' })[item.difficulty] ?? '未标注'), h('span', { className: 'diw-learning-state', 'data-status': item.learning?.status ?? 'unanswered' }, LEARNING_LABELS[item.learning?.status ?? 'unanswered']), summary && h('span', { className: 'diw-question-summary' }, summary))),
          h(Icon, { name: 'arrow', size: 18 })))
        }),
        !loading && !questions.length && h('div', { className: 'diw-empty-results' },
          h(Empty, { title: '没有匹配的题目', icon: 'search' }, activeFilters.length
            ? `当前条件：${activeFilters.join(' · ')}。清除筛选可查看当前岗位的全部题目，已选题单和学习记录会保留。`
            : '当前岗位暂无可用题目，请尝试刷新或切换岗位。'),
          (query || topic || sourceId || difficulty || progressFilter !== 'all') && h(Button, { onClick: () => browseQuestions() }, '清除筛选'))),
      h('nav', { className: 'diw-pagination', 'aria-label': '题目分页' }, h('small', null, questions.length ? `第 ${offset + 1}–${offset + questions.length} 道，共 ${matches} 道` : '0 道题目'),
        h('div', { className: 'diw-actions' }, h(Button, { disabled: !offset || loading, onClick: () => setOffset(Math.max(0, offset - PAGE_SIZE)) }, '上一页'), h(Button, { disabled: loading || offset + questions.length >= matches, onClick: () => setOffset(offset + PAGE_SIZE) }, '下一页'))),
      selectedQuestions.length > 0 && h('section', { className: 'diw-selection-tray', 'aria-label': '自选题单' },
        h('div', { className: 'diw-section-heading' }, h('h3', null, `自选题单 · ${selectedQuestions.length} 题`), h(Button, { disabled: busy, onClick: () => updateSelection([]) }, '清空题单')),
        h('p', { className: 'diw-muted' }, selectionCacheFailed ? '题单暂存不可用，刷新后需重新选择。' : '按勾选顺序练习；当前标签页刷新后仍可找回。'),
        h('details', null, h('summary', null, '查看与调整题单'), h('ol', { className: 'diw-picked-list' }, selectedQuestions.map(item => h('li', { key: item.id }, h('span', null, item.title), h(Button, { 'aria-label': `移除：${item.title}`, onClick: () => toggleSelection(item) }, '移除'))))),
        h('div', { className: 'diw-actions' }, h(Button, { tone: 'primary', icon: 'play', disabled: writeDisabled, onClick: () => beginPractice({ mode: 'coach', questionIds: selectedQuestions.map(item => item.id) }) }, '练习自选题单'), h(Button, { disabled: writeDisabled, onClick: () => beginPractice({ mode: 'mock', questionIds: selectedQuestions.map(item => item.id) }) }, '用题单模拟面试'))))
  }

  function practiceView() {
    if (!practice) return h('div', { className: 'diw-empty-results' },
      h(Empty, { title: '开始你的第一轮训练', icon: 'play' }, '选择岗位与模式，逐题保存作答。已有练习可以从训练记录继续。'),
      h(Button, { tone: 'primary', onClick: () => navigateView('bank') }, '前往岗位题库'))
    const finished = isCompleted(practice)
    const total = practice.questionCount ?? practice.questions.length
    const answered = practice.answeredCount ?? 0
    const reviewed = practice.reviewedCount ?? 0
    const hasNext = questionIndex < practice.questions.length - 1
    const dirty = Boolean(draft.trim()) && draft !== attempt?.answer
    const retryQuestions = practice.questions.filter(item => { const saved = latestAttempt(practice, item.id); return !saved || !saved.reviews?.length || saved.reviews.at(-1).score < 3 })
    const savedText = busy ? '正在保存…' : finished ? '本轮已结束，作答已归档' : !draft.trim() && !attempt ? '尚未作答' : draft === attempt?.answer ? '作答已保存到训练记录' : draftCacheFailed ? '草稿暂存不可用，请先保存作答' : `${draft.length.toLocaleString()} 字 · 草稿已暂存，刷新可恢复`
    const savedAnswer = () => h('section', { className: 'diw-saved-answer' },
      h('div', { className: 'diw-section-heading' }, h('h4', null, '我的作答'), attempt && h('small', null, dateLabel(attempt.createdAt))),
      attempt ? h(InterviewContent, { value: attempt.answer }) : h('p', { className: 'diw-muted' }, '这道题没有保存作答。'))
    return h('div', { className: 'diw-practice-body', 'data-practice-pane': practicePane },
      h('div', { className: 'diw-practice-heading' },
        h('div', null, draftScope !== 'workspace' && h('h2', null, finished ? '本轮训练复盘' : modeTitle(practice.mode)), h('p', { className: 'diw-muted' }, `${trackTitle(practice.track)} · ${draftScope === 'workspace' ? `${modeTitle(practice.mode)} · ` : ''}${dateLabel(practice.createdAt)}`)),
        h(Badge, { tone: finished ? 'accent' : 'warm' }, finished ? '已结束' : '进行中')),
      h('p', { className: 'diw-mode-rule' }, finished ? '对照自己的作答与参考要点，记录下一次需要改进的地方。' : practice.mode === 'mock' ? '模拟面试：先独立作答，结束后统一开放答案与点评。' : '先独立思考；需要提示时，切到「参考与自评」。'),
      finished && h(SummaryStrip, { label: '本轮训练结果', items: [
        { label: '已作答', value: `${answered} / ${total}` }, { label: '待点评', value: Math.max(0, answered - reviewed) }, { label: '未作答', value: Math.max(0, total - answered) },
      ] }),
      finished && h('section', { className: 'diw-retry-card' },
        h('div', null, h('h3', null, retryQuestions.length ? `${retryQuestions.length} 道题可以复练` : '本轮题目已完成点评'), h('p', { className: 'diw-muted' }, retryQuestions.length ? '未作答、待点评或评分低于 3 的题目，可以组成一轮新的练习。' : '保留本轮作答与点评，再次训练时可以比较自己的表达。')),
        h(Button, { icon: 'refresh', disabled: writeDisabled, onClick: () => beginPractice({ track: practice.track, mode: 'coach', questionIds: (retryQuestions.length ? retryQuestions : practice.questions).map(item => item.id) }) }, retryQuestions.length ? `复练这 ${retryQuestions.length} 道题` : '再练本轮题目')),
      h('div', { className: 'diw-progress-card' },
        h('div', { className: 'diw-section-heading' }, h('strong', null, `第 ${questionIndex + 1} / ${total} 题`), h('span', { className: 'diw-muted' }, `已作答 ${answered} 题${finished ? ` · 已点评 ${reviewed} 题` : ''}`)),
        h('progress', { value: answered, max: total || 1, 'aria-label': '本轮作答进度' }),
        h('div', { className: 'diw-question-steps', role: 'group', 'aria-label': '本轮题目' }, practice.questions.map((item, index) =>
          h('button', { key: item.id, type: 'button', disabled: busy, 'aria-label': `第 ${index + 1} 题：${item.title}${latestAttempt(practice, item.id) ? '，已作答' : ''}`, 'aria-pressed': index === questionIndex, 'data-answered': Boolean(latestAttempt(practice, item.id)), onClick: () => moveQuestion(index) }, index + 1)))),
      currentQuestion && h('article', { className: 'diw-training-question' },
        h(QuestionMeta, { question: currentQuestion }), h('h3', { tabIndex: -1, ref: trainingTitleRef }, currentQuestion.title), h(InterviewContent, { value: currentQuestion.prompt }),
        h('div', { className: 'diw-practice-tabs', role: 'group', 'aria-label': '作答与参考切换' },
          h(Button, { 'aria-pressed': practicePane === 'answer', 'aria-controls': 'diw-answer-pane', onClick: () => changePracticePane('answer') }, finished ? '我的作答' : '题目与作答'),
          h(Button, { 'aria-pressed': practicePane === 'review', 'aria-controls': 'diw-review-pane', disabled: activeMock, icon: activeMock ? 'lock' : 'book', onClick: () => changePracticePane('review') }, activeMock ? '参考答案 · 结束后开放' : '参考与自评')),
        h('section', { className: 'diw-answer-pane', id: 'diw-answer-pane', hidden: practicePane !== 'answer', 'aria-label': '题目与作答' },
          finished ? savedAnswer() : h('div', { className: 'diw-answer-editor' },
            h('div', { className: 'diw-editor-toolbar' }, h('strong', null, '我的作答'), h('div', { className: 'diw-actions', role: 'group', 'aria-label': '编辑与预览' }, h(Button, { 'aria-pressed': !answerPreview, onClick: () => setAnswerPreview(false) }, '编辑'), h(Button, { 'aria-pressed': answerPreview, onClick: () => setAnswerPreview(true) }, '预览排版'))),
            answerPreview ? h('div', { className: 'diw-writing-preview', 'aria-label': '作答排版预览' }, draft.trim() ? h(InterviewContent, { value: draft }) : h('p', { className: 'diw-muted' }, '先在编辑区写下思路，再预览公式、表格和 Markdown。')) :
            h('label', { className: 'diw-field' }, h('span', { className: 'diw-sr-only' }, '我的作答'), h('textarea', { value: draft, onChange: event => updateAnswer(event.target.value), onKeyDown: event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); if (!writeDisabled) void run(saveCurrent, '作答已保存。') } }, placeholder: '先写结论，再展开思路。可以补充推导、伪代码、实验方法与关键权衡。', rows: 10, maxLength: 100000, disabled: busy || readonly || !snapshot || loading, 'aria-describedby': 'diw-answer-save-help' })),
            !draft.trim() && !answerPreview && h('details', { className: 'diw-answer-outline' }, h('summary', null, '不知道从哪里开始？使用作答提纲'), h('p', { className: 'diw-muted' }, '只插入结构，内容由你填写。'), h('div', { className: 'diw-actions' }, h(Button, { disabled: writeDisabled, onClick: () => updateAnswer('## 结论\n\n\n## 原理与推导\n\n\n## 例子与边界\n\n\n## 工程权衡\n\n') }, '技术推导提纲'), h(Button, { disabled: writeDisabled, onClick: () => updateAnswer('## 背景与目标\n\n\n## 我的方案与选择依据\n\n\n## 结果与验证证据\n\n\n## 复盘与改进\n\n') }, '项目表达提纲'))),
            h('p', { id: 'diw-answer-save-help', className: 'diw-editor-help' }, draftCacheFailed ? '浏览器暂存失败，请保存作答后再刷新。' : embedded ? draftScope === 'workspace' ? '草稿在面试工作区暂存，切换 DSH 对话不会丢失；点击保存作答或切题后归档。' : '草稿按当前会话暂存，切换对话后可恢复；点击保存作答或切题后归档到训练记录。' : '草稿在当前标签页暂存；点击保存、切题或关闭工作台后，会归档到训练记录。'))),
        onStagePrompt && practicePane === 'answer' && aiHelp(),
        !activeMock && h('section', { className: 'diw-practice-review', id: 'diw-review-pane', hidden: practicePane !== 'review', 'aria-label': '参考与自评' },
          finished && savedAnswer(),
          h(AnswerReference, { question: currentQuestion }),
          h(AiRunCard, { key: `${practice.id}:${currentQuestion.id}:${attempt?.id ?? 'empty'}`, api, kind: 'review', scope: `${practice.id}:${currentQuestion.id}:${attempt?.id ?? 'empty'}`, recoveryStorage,
            request: { practiceId: practice.id, questionId: currentQuestion.id, attemptId: attempt?.id }, disabled: writeDisabled || !attempt || dirty,
            disabledReason: !attempt ? '先保存自己的作答，再获取点评。' : dirty ? '作答已修改，请先保存后再点评。' : '', connectionAvailable,
            onCompleted: async result => { const updated = await api.practice({ id: result.practiceId }); if (alive.current) { setPractice(current => current?.id === updated.id ? updated : current); setRevision(current => current + 1) } }, onOpenPractice: openPractice }),
          h(ReviewForm, { attempt, recoveryStorage, disabled: writeDisabled, onSave: value => run(async () => { const updated = await api.review({ practiceId: practice.id, ...value }); if (alive.current) { setPractice(updated); setRevision(current => current + 1) } return updated }, '自评已保存。') }),

          h(SourceNote, { question: currentQuestion }), aiHelp())),
      h('div', { className: 'diw-practice-actions' },
        h('div', { className: 'diw-save-state', 'data-saved': !dirty, role: 'status' }, h(Icon, { name: !dirty && attempt ? 'check' : 'book', size: 18 }), h('span', null, savedText)),
        h('div', { className: 'diw-actions' },
          h(Button, { disabled: busy || questionIndex === 0, onClick: () => moveQuestion(questionIndex - 1) }, '上一题'),
          !finished && practicePane === 'review' && h(Button, { onClick: () => changePracticePane('answer') }, '返回作答'),
          !finished && h(Button, { tone: dirty ? 'primary' : 'secondary', icon: 'check', disabled: writeDisabled || !dirty, onClick: () => run(saveCurrent, '作答已保存。') }, '保存作答'),
          hasNext && h(Button, { tone: !finished && dirty && !readonly ? 'secondary' : 'primary', icon: 'arrow', disabled: busy, onClick: () => moveQuestion(questionIndex + 1) }, !finished && dirty && !readonly ? '保存并下一题' : !finished && !attempt ? '跳过此题' : '下一题')),
        finished ? h(Button, { icon: 'download', disabled: busy, onClick: exportPractice }, '导出复盘摘要') : h(Button, { tone: 'secondary', className: 'diw-finish-action', disabled: writeDisabled, onClick: () => setFinishRequested(true), 'aria-expanded': finishRequested }, '结束并复盘')),
      finishRequested && h('section', { className: 'diw-finish-confirm', ref: finishConfirmRef, tabIndex: -1, role: 'region', 'aria-label': '确认结束本轮' },
        h('h3', null, '结束本轮训练？'), h('p', null, `共 ${total} 题，${Math.max(0, total - answered - (dirty && !attempt ? 1 : 0))} 题尚未作答。结束后将保存当前作答，并进入复盘。`),
        h('div', { className: 'diw-actions' }, h(Button, { onClick: () => setFinishRequested(false) }, '继续作答'), h(Button, { tone: 'primary', disabled: writeDisabled, onClick: finishPractice }, '确认结束本轮'))),
      exportText && h('details', { className: 'diw-prompt-panel' }, h('summary', null, '查看导出的复盘摘要'), h(InterviewContent, { value: exportText })))
  }

  function historyView() {
    const history = snapshot?.practices ?? []
    const visibleHistory = history.filter(item => historyFilter === 'all' || (historyFilter === 'finished' ? isCompleted(item) : !isCompleted(item)))
    return h(React.Fragment, null,
      h('div', { className: 'diw-page-heading' }, h('p', null, `${trackTitle(track)}方向的训练记录。继续未完成的练习，或回看已保存的作答与点评。`)),
      h(SummaryStrip, { label: '当前岗位训练统计', items: [
        { label: '训练轮次', value: snapshot?.stats?.practiceCount }, { label: '已完成', value: snapshot?.stats?.completedCount },
        { label: '已保存作答', value: snapshot?.stats?.attemptCount }, { label: '待复盘题目', value: snapshot?.stats?.needsReview?.length },
      ] }),
      h('div', { className: 'diw-filter-tabs diw-history-tabs', role: 'group', 'aria-label': '训练记录筛选' }, [{ id: 'all', label: '全部训练', count: history.length }, { id: 'active', label: '待继续', count: history.filter(item => !isCompleted(item)).length }, { id: 'finished', label: '已完成', count: history.filter(isCompleted).length }].map(item => h('button', { key: item.id, type: 'button', 'aria-pressed': historyFilter === item.id, onClick: () => setHistoryFilter(item.id) }, item.label, h('span', null, item.count)))),
      h('div', { className: 'diw-history-list' }, visibleHistory.map(item =>
        h('button', { type: 'button', key: item.id, className: 'diw-history-card', disabled: busy, onClick: () => openPractice(item.id) },
          h('div', { className: 'diw-section-heading' },
            h('div', { className: 'diw-meta' }, h(Badge, { tone: isCompleted(item) ? 'accent' : 'warm' }, isCompleted(item) ? '已完成' : '待继续'), h('span', null, modeTitle(item.mode))), h('small', null, dateLabel(item.createdAt))),
          h('h3', null, item.title || item.previewTitle || `${trackTitle(item.track)} · ${item.questionCount} 题`),
          (item.title || item.previewTitle) && h('small', { className: 'diw-muted' }, `${trackTitle(item.track)} · ${item.questionCount} 题`),
          h('div', { className: 'diw-section-heading' }, h('p', null, `已作答 ${item.answeredCount} 题 · 已点评 ${item.reviewedCount} 题`),
            h('span', { className: 'diw-history-open' }, isCompleted(item) ? '查看复盘' : '继续训练', h(Icon, { name: 'arrow', size: 18 }))))),
        !visibleHistory.length && h(Empty, { title: history.length ? '这个分类还没有训练记录' : '还没有训练记录', icon: 'history' }, '在岗位题库开始一轮练习，作答与复盘会保存在这里。')))
  }

  function learningView() {
    return h(InterviewLearningPanel, { api, track, revision, busy, readonly, writesBlocked: writeDisabled, connectionAvailable, onStartPractice: options => beginPractice(options), onOpenPractice: openPractice, onBrowseTopic: (topic, progress) => browseQuestions({ topic, progress }) })
  }

  function experiencesView() {
    return h(InterviewExperiencePanel, { api, track, busy, readonly, writesBlocked: writeDisabled, recoveryStorage, connectionAvailable, runOperation: run, onStartPractice: options => beginPractice(options) })
  }

  function sourcesView() {
    return h(InterviewKnowledgePanel, { api, track, busy, readonly, writesBlocked: writeDisabled, connectionAvailable, stageDisabledReason, canStage: Boolean(onStagePrompt), recoveryStorage, catalogSources: snapshot?.catalog?.sources ?? [], runOperation: run, onOpenPractice: openPractice, onGenerated: () => setRevision(current => current + 1),
      onSourceQuestion: chunkId => run(async () => {
        if (practice && !isCompleted(practice)) await saveCurrent()
        const imported = await api.sourceQuestion({ chunkId, track })
        const value = await api.start({ track, mode: 'coach', questionIds: [imported.questionId], count: 1 })
        if (alive.current) { showPractice(value); setRevision(current => current + 1) }
        return value
      }),
      onPreparePrompt: value => run(async () => {
        if (practice && !isCompleted(practice) && !readonly) await saveCurrent()
        if (!alive.current) return
        if (onStagePrompt) { await onStagePrompt(value); return { staged: true } }
        if (navigator.clipboard?.writeText) {
          try { await navigator.clipboard.writeText(value); return { copied: true } } catch { /* The expanded prompt remains available for manual copying. */ }
        }
        return { copied: false }
      }),
    })
  }

  function inspector() {
    if (view === 'bank') return h(React.Fragment, null,
      h('div', { className: 'diw-reader-toolbar', ref: readerToolbarRef, tabIndex: -1 },
        reading || focusReading
          ? h(Button, { onClick: returnToList }, '返回题库')
          : h(Button, { icon: 'book', disabled: !question || questionLoading, onClick: focusQuestion }, '聚焦阅读'),
        h(Button, { icon: 'plus', 'aria-pressed': selectedIds.has(questionId), disabled: loading || busy || !question || questionLoading, onClick: () => toggleSelection(question) }, selectedIds.has(questionId) ? '已加入题单' : '加入题单'),
        h(Button, { tone: 'primary', icon: 'play', disabled: writeDisabled || !question || questionLoading, onClick: () => start('coach', true) }, '练习这道题')),
      questionLoading ? h(Empty, { title: '正在读取题目…' }) : questionError ? h('div', { className: 'diw-reader-error', role: 'alert' }, h('h3', null, '题目读取失败'), h('p', null, questionError), h(Button, { onClick: retryQuestion }, '重试读取题目')) : question ? h('article', { className: 'diw-reading-document' },
        h(QuestionMeta, { question }), h('h3', { className: 'diw-reader-title', tabIndex: -1, ref: readerTitleRef }, question.title), h(InterviewContent, { value: question.prompt }),
        question.learning?.lastPracticeId && h('section', { className: 'diw-continue-card' }, h('div', null, h('strong', null, LEARNING_LABELS[question.learning.status]), h('p', { className: 'diw-muted' }, `${question.learning.attemptCount} 次作答${question.learning.score !== null ? ` · 最近${question.learning.reviewer === 'agent' ? ' AI 点评' : '自评'} ${question.learning.score} / 4` : ' · 等待点评'}`)), h(Button, { icon: 'history', disabled: busy, onClick: () => openPractice(question.learning.lastPracticeId, question.id) }, '查看上次作答')),
        h('details', { className: 'diw-answer-details', key: question.id }, h('summary', null, '参考答案与追问'), h(AnswerReference, { question })),
        h(SourceNote, { question }), aiHelp()) : h(Empty, { title: '选择一道题目' }, error ? '题目读取失败，可以重试或返回题库选择其他题目。' : '题干、参考答案与来源将在这里展开。'))
    return h(React.Fragment, null,
      h('div', { className: 'diw-inspector-heading' }, h('h2', null, '练习建议')),
      h('ol', { className: 'diw-learning-loop' }, [
        { title: '独立作答', text: '先写结论，把假设、推导和选择依据讲清楚。' },
        { title: '对照与追问', text: '检查边界条件，思考替代方案与工程权衡。' },
        { title: '记录复盘', text: '留下一个具体的改进点，在下一轮验证。' },
      ].map((item, index) => h('li', { key: item.title }, h('span', null, index + 1), h('div', null, h('h3', null, item.title), h('p', null, item.text))))),
      h('div', { className: 'diw-note-card' }, h(Icon, { name: 'spark', size: 22 }), h('h3', null, '分别记录自评与 AI 点评'), h('p', null, '评分用于帮助复盘。能否解释依据、应对追问并做出合理判断，更能反映本次练习的收获。')))
  }

  function aiHelp() { return h('section', { className: 'diw-ai-help' }, h('div', { className: 'diw-section-heading' }, h('h3', null, '让 AI 陪你深挖'), h(Icon, { name: 'spark' })), h('p', null, onStagePrompt ? '将题目与已保存的作答衔接到当前会话，由当前 Agent 继续追问与点评。会先保存作答，再加入下方草稿。' : canContinueInDsh ? '复制训练指令，回到 DSH 对话并选择对应的面试教练。教练可读取这轮训练、追问和记录点评。' : '当前是独立预览；复制题目与作答到对话继续训练。复制前会先保存当前作答。'), h(Button, { icon: onStagePrompt ? 'arrow' : 'copy', disabled: busy || Boolean(stageDisabledReason), title: stageDisabledReason || undefined, onClick: copyPrompt }, onStagePrompt ? '放入当前对话' : canContinueInDsh ? '复制训练指令' : '复制题目与作答'), stageDisabledReason && h('p', { className: 'diw-muted' }, stageDisabledReason), promptText && h('details', { className: 'diw-prompt-panel', open: true }, h('summary', null, '训练指令'), h('textarea', { 'aria-label': '可复制的训练指令', readOnly: true, value: promptText, rows: 7, onFocus: event => event.target.select() }))) }

  return h('div', { className: `diw-overlay${embedded ? ' diw-native' : ''}`, 'data-theme': embedded ? 'host' : theme }, !embedded && h('div', { className: 'diw-backdrop', 'aria-hidden': true }), h('section', { className: 'diw-shell', role: embedded ? 'region' : 'dialog', 'aria-modal': embedded ? undefined : true, 'aria-label': '面试训练工作台', tabIndex: -1, ref: shellRef },
    h('header', { className: 'diw-header' }, h('div', { className: 'diw-brand' }, h('span', { className: 'diw-brand-mark' }, h(Icon, { name: 'algorithm', size: 25 })), h('div', null, h('div', { className: 'diw-brand-title' }, embedded ? '面试训练' : '面试训练工作台'), h('p', { className: embedded ? 'diw-session-context' : undefined }, embedded ? `当前会话 · ${sessionTitle || '新会话'}` : `${selectedTrack.short} · ${VIEW_LABELS[view]}`))), h('div', { className: 'diw-header-actions' }, !embedded && h(Badge, { tone: 'accent' }, canContinueInDsh ? 'DSH 面试训练' : '独立预览'), h('button', { type: 'button', className: 'diw-icon-button', title: '刷新训练数据', 'aria-label': '刷新训练数据', disabled: loading || busy, onClick: refreshTraining }, h(Icon, { name: 'refresh', size: 17 })), !embedded && h('button', { type: 'button', className: 'diw-icon-button', title: `切换外观（当前${theme === 'auto' ? '跟随系统' : theme === 'dark' ? '深色' : '浅色'}）`, 'aria-label': '切换深浅外观', onClick: () => setTheme(current => current === 'dark' ? 'light' : 'dark') }, h(Icon, { name: theme === 'dark' ? 'sun' : 'moon', size: 17 })), onClose && h('button', { type: 'button', className: 'diw-icon-button', title: embedded ? '收起训练面板' : '关闭工作台 · Esc', 'aria-label': '关闭工作台', disabled: busy, onClick: () => closeRef.current?.() }, h(Icon, { name: 'close', size: 19 })))),
    error && (connectionAvailable || draftScope !== 'workspace') && h('div', { className: 'diw-alert', role: 'alert' }, h('span', null, error), h(Button, { onClick: refreshVisible, disabled: busy }, '重试')),
    h('div', { className: 'diw-notice', role: 'status', 'aria-live': 'polite', hidden: !notice }, notice),
    readonly && h('div', { className: 'diw-notice', role: 'status' }, '当前为只读模式，可以浏览题库与已有复盘。'),
    h('div', { className: 'diw-layout', 'data-view': view, 'data-reading': reading, 'data-focus': focusReading }, view === 'new' && draftScope === 'workspace' ? null : rail, h('main', { className: 'diw-main', ref: mainRef, hidden: view === 'bank' && (reading || focusReading), 'aria-label': VIEW_LABELS[view] }, draftScope !== 'workspace' && ['overview', 'sprint', 'bank', 'history', 'experiences'].includes(view) && h('h2', { className: 'diw-sr-only' }, VIEW_LABELS[view]), view === 'new' && draftScope === 'workspace' ? newTrainingView() : view === 'sprint' ? h(SprintPanel, { readonly, onStagePrompt, stageDisabledReason }) : view === 'overview' ? overviewView() : view === 'bank' ? bankView() : view === 'practice' ? practiceView() : view === 'history' ? historyView() : view === 'learning' ? learningView() : view === 'experiences' ? experiencesView() : sourcesView()), view === 'bank' && h('aside', { className: 'diw-inspector', ref: inspectorRef, 'aria-label': '题目与复盘详情' }, inspector()))))
}
