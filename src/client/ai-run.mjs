import * as React from 'react'

const h = React.createElement
const terminal = status => ['succeeded', 'failed', 'cancelled'].includes(status)
const PHASES = { queued: '等待执行', 'loading-context': '核对资料与训练记录', generating: '模型正在出题', reviewing: '模型正在点评', validating: '检查结果与引用', saving: '保存结果', starting: '创建训练', cancelling: '正在取消', completed: '已完成', failed: '未完成', cancelled: '已取消' }
const storageFor = value => value === undefined ? globalThis.sessionStorage : value
function readCursor(storage, key) { try { const value = JSON.parse(storageFor(storage)?.getItem(key) || 'null'); return value && typeof value === 'object' && typeof value.requestId === 'string' ? value : null } catch { return null } }
const errorText = cause => cause instanceof Error ? cause.message : String(cause)
const NATIVE_MODEL_VALUE = ''

export function normaliseModelChoice(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || typeof value.provider !== 'string' || typeof value.model !== 'string'
    || !value.provider.trim() || !value.model.trim()) return null
  return { provider: value.provider.trim(), model: value.model.trim() }
}

export function modelChoiceKey(value) {
  const choice = normaliseModelChoice(value)
  return choice ? `${choice.provider}\u0000${choice.model}` : NATIVE_MODEL_VALUE
}

export function modelChoiceOptionLabel(value) {
  const choice = normaliseModelChoice(value)
  const label = typeof value?.label === 'string' ? value.label.trim() : ''
  return choice ? `${label || choice.model} · ${choice.provider}` : ''
}

export function normaliseModelChoices(value) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  return value.filter(item => {
    const choice = normaliseModelChoice(item)
    const label = typeof item?.label === 'string' ? item.label.trim() : ''
    const key = modelChoiceKey(choice)
    if (!choice || !label || seen.has(key)) return false
    seen.add(key)
    return true
  }).map(item => ({ ...normaliseModelChoice(item), label: item.label.trim() }))
}

export function aiRequestForModel(request, modelChoice) {
  const base = request && typeof request === 'object' && !Array.isArray(request) ? { ...request } : {}
  delete base.modelChoice
  const choice = normaliseModelChoice(modelChoice)
  return choice ? { ...base, modelChoice: choice } : base
}

export function aiRequestSignature(request, modelChoice) {
  return JSON.stringify(aiRequestForModel(request, modelChoice))
}

export function modelRecoveryHint(value) {
  const code = value?.code
  const message = typeof value?.message === 'string' ? value.message : ''
  if (['QUOTA', 'RATE_LIMIT'].includes(code) || /额度|配额|限流|quota|rate\s*limit/i.test(message)) {
    return '请补充该提供方额度，或切换到已配置模型后手动重试。'
  }
  if (['MISSING_CREDENTIAL', 'INVALID_CREDENTIAL', 'AUTH', 'NO_ADAPTER'].includes(code) || /鉴权|认证|凭据|credential|auth/i.test(message)) {
    return '请在 DSH 模型设置中检查该提供方凭据，或切换到已配置模型后手动重试。'
  }
  return ''
}

/** Only job identity is recovered. Reopening or polling never starts a new model request. */
export function AiRunCard({ api, kind, scope, request, recoveryStorage, disabled = false, disabledReason = '', connectionAvailable = true, onBeforeStart, onCompleted, onOpenPractice }) {
  const key = `dsh-interview-workbench:ai-job:v1:${kind}:${scope}`
  const [cursor, setCursor] = React.useState(() => readCursor(recoveryStorage, key))
  const [job, setJob] = React.useState(null)
  const [model, setModel] = React.useState(null)
  const [modelChoices, setModelChoices] = React.useState([])
  const [selectedChoice, setSelectedChoice] = React.useState(() => normaliseModelChoice(readCursor(recoveryStorage, key)?.modelChoice))
  const [error, setError] = React.useState('')
  const [errorCode, setErrorCode] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [statusPending, setStatusPending] = React.useState(true)
  const [refresh, setRefresh] = React.useState(0)
  const [cacheFailed, setCacheFailed] = React.useState(false)
  const [expired, setExpired] = React.useState(false)
  const alive = React.useRef(true)
  const lock = React.useRef(false)
  const statusRequest = React.useRef(0)
  const notified = React.useRef(new Set())
  const completeRef = React.useRef(onCompleted); completeRef.current = onCompleted
  React.useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  React.useEffect(() => {
    let stopped = false
    const sequence = ++statusRequest.current
    const statusRequestBody = selectedChoice ? { modelChoice: selectedChoice } : {}
    setStatusPending(true)
    Promise.resolve().then(() => api.aiStatus?.(statusRequestBody) ?? { available: false, message: '当前服务没有直接模型入口，可继续使用 DSH 对话。' }).then(value => {
      if (stopped || sequence !== statusRequest.current) return
      const next = value && typeof value === 'object' ? value : { available: false, message: '当前服务没有直接模型入口，可继续使用 DSH 对话。' }
      setModel(next)
      if (Array.isArray(next.modelChoices)) setModelChoices(normaliseModelChoices(next.modelChoices))
      setStatusPending(false)
    }).catch(cause => {
      if (stopped || sequence !== statusRequest.current) return
      setModel({ available: false, verified: false, code: cause?.code, message: errorText(cause) })
      setStatusPending(false)
    })
    return () => { stopped = true }
  }, [api, connectionAvailable, refresh, selectedChoice?.provider, selectedChoice?.model])
  function remember(value) {
    if (!alive.current && value && readCursor(recoveryStorage, key)?.requestId !== value.requestId) return
    if (alive.current) setCursor(value)
    try { const storage = storageFor(recoveryStorage); if (!storage) throw new Error('Storage unavailable'); value ? storage.setItem(key, JSON.stringify(value)) : storage.removeItem(key); if (alive.current) setCacheFailed(false) } catch { if (alive.current) setCacheFailed(true) }
  }
  React.useEffect(() => {
    if (!cursor?.requestId || !connectionAvailable) return
    let stopped = false; let timer
    async function poll() {
      try {
        const value = await api.aiJob(cursor.id ? { id: cursor.id } : { requestId: cursor.requestId })
        if (stopped) return
        setJob(value); setError(''); setErrorCode(''); setExpired(false)
        if (!cursor.id) remember({ ...cursor, id: value.id })
        if (value.status === 'succeeded' && !notified.current.has(value.id)) {
          await completeRef.current?.(value.result)
          if (stopped) return
          notified.current.add(value.id)
        }
        if (!terminal(value.status)) timer = setTimeout(poll, 1500)
      } catch (cause) { if (!stopped) { const text = errorText(cause); setError(text); setErrorCode(cause?.code || ''); setExpired(cause?.code === 'AI_JOB_EXPIRED' || /任务状态已过期或服务已重启|未找到这次提交的状态或服务已重启/.test(text)) } }
    }
    void poll()
    return () => { stopped = true; clearTimeout(timer) }
  }, [api, cursor?.id, cursor?.requestId, connectionAvailable, refresh])
  const running = Boolean(cursor?.requestId && !expired && (!job || !terminal(job.status)))
  const choices = React.useMemo(() => {
    const available = normaliseModelChoices(modelChoices)
    if (selectedChoice && !available.some(choice => modelChoiceKey(choice) === modelChoiceKey(selectedChoice))) {
      return [{ ...selectedChoice, label: `${selectedChoice.provider} · ${selectedChoice.model}` }, ...available]
    }
    return available
  }, [modelChoices, selectedChoice?.provider, selectedChoice?.model])
  const selectedKey = modelChoiceKey(selectedChoice)
  function chooseModel(event) {
    const value = event.currentTarget.value
    const next = value === NATIVE_MODEL_VALUE ? null : choices.find(choice => modelChoiceKey(choice) === value)
    if (value !== NATIVE_MODEL_VALUE && !next) return
    setSelectedChoice(next ? normaliseModelChoice(next) : null)
    setError(''); setErrorCode('')
  }
  async function start() {
    if (lock.current || disabled || !connectionAvailable || statusPending || !model?.available || running) return
    lock.current = true; setPending(true); setError('')
    setErrorCode('')
    let submittedIdentity
    try {
      await onBeforeStart?.()
      if (!alive.current) return
      const dispatchRequest = aiRequestForModel(request, selectedChoice)
      const signature = aiRequestSignature(request, selectedChoice)
      const identity = cursor && !cursor.id && cursor.signature === signature
        ? { requestId: cursor.requestId, signature, ...(selectedChoice ? { modelChoice: selectedChoice } : {}) }
        : { requestId: globalThis.crypto.randomUUID(), signature, ...(selectedChoice ? { modelChoice: selectedChoice } : {}) }
      submittedIdentity = identity
      // Write identity before dispatch, but start polling only once the submission settles.
      try { storageFor(recoveryStorage)?.setItem(key, JSON.stringify(identity)) } catch { setCacheFailed(true) }
      const value = await api[kind === 'generate' ? 'generatePractice' : 'reviewAnswer']({ ...dispatchRequest, requestId: identity.requestId })
      remember({ ...identity, id: value.id }); if (alive.current) setJob(value)
    } catch (cause) { if (submittedIdentity) remember(submittedIdentity); if (alive.current) { setError(errorText(cause)); setErrorCode(cause?.code || '') } }
    finally { lock.current = false; if (alive.current) setPending(false) }
  }
  async function cancel() {
    if (lock.current || !cursor?.id) return
    lock.current = true; setPending(true)
    try { const value = await api.cancelAiJob({ id: cursor.id }); if (alive.current) { setJob(value); setRefresh(value => value + 1) } }
    catch (cause) { if (alive.current) { setError(errorText(cause)); setErrorCode(cause?.code || '') } }
    finally { lock.current = false; if (alive.current) setPending(false) }
  }
  const button = (label, props = {}) => h('button', { type: 'button', className: 'diw-button diw-button-secondary', ...props }, label)
  const isReview = kind === 'review'
  const statusMessage = statusPending ? '正在读取所选 AI 模型状态…' : model ? model.message : '正在读取 AI 模型状态…'
  const failureHint = modelRecoveryHint(job?.error || (error ? { code: errorCode, message: error } : model))
  return h('section', { className: 'diw-ai-run', 'aria-label': isReview ? 'AI 点评' : 'AI 出题' },
    h('div', { className: 'diw-section-heading' },
      h('h3', null, isReview ? '根据这次作答获取 AI 点评' : 'AI 出题并开练'),
      h('label', { className: 'diw-ai-model-picker' }, h('span', null, 'AI模型'), h('select', {
        value: selectedKey, disabled: pending || running || !connectionAvailable, onChange: chooseModel, 'aria-label': 'AI模型', 'aria-busy': statusPending,
      }, h('option', { value: NATIVE_MODEL_VALUE }, 'DSH 默认模型'), choices.map(choice => h('option', { key: modelChoiceKey(choice), value: modelChoiceKey(choice) }, modelChoiceOptionLabel(choice))))),
    ),
    h('p', { className: 'diw-muted' }, isReview ? '点击后，将这次已保存的作答和参考材料交给所选模型。点评会单独标记为 AI 点评，并进入学习记忆。' : '点击后，将选中的来源片段交给所选模型。结果通过格式与来源检查后收录题库，并建立一轮训练。'),
    h('p', { className: 'diw-ai-model-status' }, statusMessage),
    failureHint && h('small', { className: 'diw-ai-model-help' }, failureHint),
    disabledReason && h('p', { className: 'diw-muted' }, disabledReason),
    job && h('div', { className: 'diw-ai-job', role: 'status', 'data-status': job.status }, h('strong', null, PHASES[job.phase] || job.phase), h('p', null, job.error?.message || job.message),
      job.result?.questionIds?.length > 0 && h('small', null, `已保存 ${job.result.questionIds.length} 道题${job.result.practiceId ? '，训练已建立。' : '，可在岗位题库中查看。'}`),
      job.result?.score !== undefined && h('small', null, `AI 点评 ${job.result.score} / 4 · 仅对应这次作答`)),
    error && h('p', { className: 'diw-knowledge-alert', role: 'alert' }, error),
    h('div', { className: 'diw-actions' },
      !cursor && button(pending ? '正在提交…' : isReview ? 'AI 点评这次作答' : 'AI 出题并开练', { className: 'diw-button diw-button-primary', onClick: start, disabled: pending || statusPending || disabled || !connectionAvailable || !model?.available }),
      running && cursor?.id && button(job?.phase === 'cancelling' ? '正在取消…' : '取消本次调用', { onClick: cancel, disabled: pending || !connectionAvailable || job?.phase === 'cancelling' }),
      job?.result?.practiceId && onOpenPractice && button(isReview ? '查看点评' : '打开生成的训练', { onClick: () => onOpenPractice(job.result.practiceId, job.result.questionId), disabled: pending || !connectionAvailable }),
      button('刷新模型与任务状态', { disabled: pending || !connectionAvailable, onClick: () => setRefresh(value => value + 1) }),
      cursor && (terminal(job?.status) || expired) && button(expired ? '清除失效的任务位置' : '清除本次结果，重新请求', { disabled: pending, onClick: () => { remember(null); setJob(null); setError(''); setErrorCode(''); setExpired(false) } })),
    running && h('small', { className: 'diw-muted' }, '可以切换页面；返回后继续查看任务状态。页面刷新不会重复发起模型调用。'),
    cacheFailed && h('small', { className: 'diw-muted' }, '浏览器未能暂存任务位置；已保存的训练仍可从训练记录打开。'))
}

export const AI_RUN_STYLES = `
.diw-ai-run{border:1px solid var(--diw-line,#e4e6e9);border-radius:14px;padding:20px;background:var(--diw-panel,#fff);display:grid;gap:12px;min-width:0}
.diw-ai-run h3,.diw-ai-run p{margin:0}.diw-ai-run .diw-section-heading{flex-wrap:wrap;gap:8px}.diw-ai-run small{overflow-wrap:anywhere}.diw-ai-model-status{font-size:12px;color:var(--diw-muted,#686d75)}
.diw-ai-model-picker{display:flex;align-items:center;gap:8px;min-width:220px;max-width:100%;color:var(--diw-secondary,var(--diw-muted,#686d75));font-size:13px;font-weight:600}
.diw-ai-model-picker > span{flex:none}.diw-ai-model-picker select{min-width:0;max-width:100%;min-height:var(--diw-target,40px);padding:7px 9px;border:1px solid var(--diw-control,#ccd0d5);border-radius:var(--diw-radius-control,8px);color:var(--diw-ink,#1d2329);background:var(--diw-panel,#fff);font:inherit;font-weight:400}.diw-ai-model-picker select:focus-visible{outline:3px solid var(--diw-accent,#6b7cff);outline-offset:2px}
.diw-ai-model-help{color:var(--diw-muted,#686d75);font-size:12px;line-height:1.55}
.diw-ai-job{padding:14px;border-radius:10px;background:var(--diw-soft,#f4f5f6);display:grid;gap:7px}.diw-ai-job[data-status=failed]{border-left:3px solid #d47929}.diw-ai-job[data-status=succeeded]{border-left:3px solid #467b5f}.diw-ai-run .diw-actions{flex-wrap:wrap}.diw-ai-run .diw-actions button{white-space:normal}
@media(max-width:600px){.diw-ai-run{padding:14px}.diw-ai-run .diw-actions{display:grid;grid-template-columns:1fr}.diw-ai-run .diw-section-heading{align-items:flex-start}.diw-ai-model-picker{width:100%;min-width:0}.diw-ai-model-picker select{flex:1}}
`
