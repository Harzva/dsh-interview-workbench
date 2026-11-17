import * as React from 'react'
import { SPRINT_DAYS } from '../content/sprint-course.mjs'
import { InterviewContent } from './content.mjs'
import { readSprintSnapshot, saveSprint, sprintEntry, parseSprintBackup, mergeSprintBackup, sprintBackupSummary, SPRINT_STORAGE_KEY, SPRINT_LIMITS } from './sprint-storage.mjs'
import { editPython, editorPosition, completionReason } from './sprint-editor.mjs'
import { SPRINT_STYLES } from './sprint-styles.mjs'
export { SPRINT_STYLES } from './sprint-styles.mjs'
import { runPython } from './python-runner.mjs'

const h = React.createElement
const button = (text, props = {}) => h('button', { type: 'button', className: 'diw-button diw-button-secondary', ...props }, text)
const DAY_LABELS = ['Python', '聚类单轮', '聚类整题', '注意力', 'GQA', '复习', '自测']
const clockLabel = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const STEP_EXAMPLES = {
  'day1-manhattan': [
    ['manhattan([2, 8], [4, 5])', '5'],
    ['manhattan([1, -2, 3], [4, 2, 3])', '7'],
  ],
}

export function sprintCodeChanged(patch, currentCode) {
  return Object.hasOwn(patch, 'code') && patch.code !== currentCode
}

export function SprintPanel({ readonly = false, onStagePrompt, stageDisabledReason = '' }) {
  const [initial] = React.useState(readSprintSnapshot)
  const [entries, setEntries] = React.useState(initial.entries)
  const entriesRef = React.useRef(entries)
  const revision = React.useRef(initial.revision)
  const [dayIndex, setDayIndex] = React.useState(initial.entries.__cursor?.dayIndex ?? 0)
  const [stepIndex, setStepIndex] = React.useState(initial.entries.__cursor?.stepIndex ?? 0)
  const [hints, setHints] = React.useState(0)
  const [output, setOutput] = React.useState('')
  const [feedback, setFeedback] = React.useState(null)
  const [notice, setNotice] = React.useState('')
  const [phase, setPhase] = React.useState('')
  const [saveStatus, setSaveStatus] = React.useState(initial.status)
  const [now, setNow] = React.useState(Date.now())
  const [selection, setSelection] = React.useState(0)
  const [tabEscape, setTabEscape] = React.useState(false)
  const [pending, setPending] = React.useState(null)
  const [undoReset, setUndoReset] = React.useState(null)
  const [focusMode, setFocusMode] = React.useState(false)
  const running = React.useRef(null)
  const runId = React.useRef(0)
  const mounted = React.useRef(true)
  const editor = React.useRef(null)
  const fileInput = React.useRef(null)
  const lessonHeading = React.useRef(null)
  const confirmation = React.useRef(null)
  const day = SPRINT_DAYS[dayIndex], step = day.steps[stepIndex]
  const key = `${day.id}:${step.id}`
  const entry = sprintEntry(entries, key, step.starter)
  const recall = step.kind === 'recall'
  const timed = dayIndex === 6
  const remaining = entry.deadline !== null ? Math.max(0, Math.ceil((entry.deadline - now) / 1000)) : entry.pausedSeconds
  const ticking = entry.deadline !== null && remaining > 0
  const locked = timed && ticking
  const passed = entry.checkedCode !== null && entry.checkedCode === entry.code
  const examples = step.examples || STEP_EXAMPLES[step.id]?.map(([input, expected]) => ({ input, expected }))
  const position = editorPosition(entry.code, selection)
  const duration = step.minutes ?? (timed ? stepIndex === 0 ? 10 : 25 : 25)
  const totalSteps = SPRINT_DAYS.reduce((sum, item) => sum + item.steps.length, 0)
  const completedSteps = Object.values(entries).filter(item => item.completed).length

  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; runId.current++; running.current?.cancel() } }, [])
  React.useEffect(() => {
    if (!ticking) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [ticking, key])
  React.useEffect(() => {
    const listener = event => {
      if (event.key === SPRINT_STORAGE_KEY && event.newValue !== revision.current) setSaveStatus('conflict')
    }
    globalThis.addEventListener('storage', listener)
    return () => globalThis.removeEventListener('storage', listener)
  }, [])

  React.useEffect(() => {
    if (pending) { confirmation.current?.focus({ preventScroll: true }); confirmation.current?.scrollIntoView({ block: 'nearest' }) }
  }, [pending])

  function persist(next) {
    if (readonly) return
    entriesRef.current = next; setEntries(next)
    const result = saveSprint(next, { expectedRevision: revision.current })
    if (result.ok) revision.current = result.revision
    setSaveStatus(result.ok ? 'saved' : result.reason)
  }
  function update(patch) {
    const current = entriesRef.current
    const currentEntry = sprintEntry(current, key, step.starter)
    if (sprintCodeChanged(patch, currentEntry.code)) { setOutput(''); setFeedback(null) }
    persist({ ...current, [key]: { ...currentEntry, ...patch, updatedAt: Date.now() } })
  }
  function move(nextDay, nextStep = 0) {
    runId.current++; running.current?.cancel(); running.current = null
    setPhase(''); setOutput(''); setFeedback(null); setNotice(''); setHints(0); setPending(null); setUndoReset(null); setSelection(0); setTabEscape(false)
    setDayIndex(nextDay); setStepIndex(nextStep); setNow(Date.now())
    if (!readonly) persist({ ...entriesRef.current, __cursor: { dayIndex: nextDay, stepIndex: nextStep } })
    requestAnimationFrame(() => { lessonHeading.current?.focus({ preventScroll: true }); lessonHeading.current?.scrollIntoView({ block: 'nearest' }) })
  }
  function moveRelative(delta) {
    let d = dayIndex, s = stepIndex + delta
    if (s < 0) { d--; s = SPRINT_DAYS[d]?.steps.length - 1 }
    if (s >= SPRINT_DAYS[d]?.steps.length) { d++; s = 0 }
    if (d >= 0 && d < SPRINT_DAYS.length) move(d, s)
  }
  async function execute(check) {
    if (running.current || readonly || recall) return
    const code = entry.code, id = ++runId.current
    setOutput(''); setFeedback(null); setNotice(''); setPhase('loading')
    if (check) update({ checkedCode: null, completed: false })
    const task = runPython({ code, stdin: entry.stdin, tests: check ? step.tests : '', onPhase: value => { if (mounted.current && runId.current === id) setPhase(value) } })
    running.current = task
    const result = await task.promise
    if (!mounted.current || running.current !== task || runId.current !== id) return
    running.current = null; setPhase('')
    const text = (result.output || '').trimEnd()
    if (result.ok) {
      setOutput(text || (check ? '训练用例已通过，没有额外标准输出。' : '程序没有打印输出。试着用 print(...) 输出函数返回值。'))
      setFeedback(check
        ? { tone: 'success', text: '本课训练检查通过。写下思路或卡点，再记录复盘。' }
        : { tone: 'neutral', text: '运行完成。点击“检查本课训练用例”后才会更新通过状态。' })
      if (check) update({ checkedCode: code })
    } else if (result.error === '已停止运行。') {
      setOutput(text || '本次运行已取消。')
      setFeedback({ tone: 'neutral', text: '已停止，可以继续编辑代码。' })
    } else {
      const errorText = result.error || '运行失败。'
      setOutput([text, errorText].filter(Boolean).join('\n'))
      const shortError = errorText.includes('IndentationError') || errorText.includes('TabError')
        ? '缩进不一致：检查报错行及上一行，统一使用 4 个空格。'
        : errorText.includes('SyntaxError') ? '语法错误：检查冒号、括号、引号是否完整。'
          : errorText.includes('NameError') ? '名称未定义：检查变量拼写，确认先赋值再使用。'
            : errorText.includes('TypeError') ? '类型不匹配：检查传入的数据类型和函数参数。'
              : errorText.includes('EOFError') ? '输入已读完：展开 Standard Input，填入程序需要的所有行。'
                : errorText.includes('AssertionError') ? '用例未通过：对照期望值和实际值，先修正第一个不一致处。'
                  : errorText.includes('IndexError') ? '下标越界：检查列表长度，range 的终点不包含在循环内。'
                    : '查看下方报错，修正后重试。'
      setFeedback({ tone: 'error', text: `${check ? '本课训练检查未通过。' : ''}${shortError}` })
    }
  }
  function downloadText(text, name, type) {
    try {
      const url = URL.createObjectURL(new Blob([text], { type }))
      const a = document.createElement('a'); a.href = url; a.download = name; a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice(`已生成 ${name}，请在浏览器下载中保存。`)
    } catch { setNotice('无法创建下载文件，请复制代码和复盘到本地文件。') }
  }
  function download() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadText(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries: entriesRef.current }, null, 2), `interview-7-days-${stamp}.json`, 'application/json')
  }
  async function importFile(event) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    try {
      if (file.size > SPRINT_LIMITS.file) throw new Error('文件过大，请选择小于 10 MB 的课程备份。')
      const { entries: imported } = parseSprintBackup(await file.text())
      const summary = sprintBackupSummary(entriesRef.current, imported)
      if (!summary.lessons) throw new Error('此文件没有可恢复的课程记录。')
      if (mounted.current) setPending({ type: 'import', imported, ...summary })
    } catch (error) { if (mounted.current) setNotice(error.message) }
  }
  function applyPending() {
    if (pending.type === 'import') {
      persist(mergeSprintBackup(entriesRef.current, pending.imported))
      setOutput(''); setFeedback(null); setNotice('已恢复备份中的课程记录。'); setNow(Date.now())
    } else if (pending.type === 'reload') {
      const snapshot = readSprintSnapshot()
      if (snapshot.status === 'damaged' || snapshot.status === 'unavailable') { setNotice('已保存记录仍无法读取，本页草稿已保留。'); setPending(null); return }
      revision.current = snapshot.revision; entriesRef.current = snapshot.entries; setEntries(snapshot.entries); setSaveStatus(snapshot.status)
      setOutput(''); setFeedback(null); setNotice('已载入浏览器保存的最新记录。'); setNow(Date.now())
    } else {
      setUndoReset(entry)
      update({ code: step.starter, checkedCode: null, completed: false })
      setSelection(0)
      requestAnimationFrame(() => { editor.current?.focus(); editor.current?.setSelectionRange(0, 0) })
      setOutput(''); setFeedback(null); setNotice('已恢复本课初始代码。可以撤销；复盘与输入保留。')
    }
    setPending(null)
  }
  function keydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault(); execute(event.shiftKey); return
    }
    if (event.key === 'Escape') { setTabEscape(true); return }
    if (event.key === 'Tab' && tabEscape) { setTabEscape(false); return }
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey || readonly || phase) return
    const el = event.currentTarget
    const edit = editPython(entry.code, el.selectionStart, el.selectionEnd, event.key, event.shiftKey)
    if (!edit) return
    event.preventDefault()
    if (edit.code.length > SPRINT_LIMITS.code) { setNotice('代码达到 100,000 字符上限，请精简后继续。'); return }
    update({ code: edit.code, completed: false })
    setSelection(edit.start)
    requestAnimationFrame(() => { if (editor.current === el) el.setSelectionRange(edit.start, edit.end) })
  }
  function stagePrompt() {
    return recall
      ? `请作为我的面试教练，一次只教一个小步骤，不要直接给完整答案。\n当前课程：${day.title} / ${step.title}\n概念问题：\n${step.task}\n我的复盘回答：\n${entry.notes || '我还没有写复盘回答，请先引导我回答第一个问题。'}`
      : `请作为我的 Python 机考教练，一次只教一个小步骤，不要直接给完整答案。\n当前课程：${day.title} / ${step.title}\n训练规格：\n${step.task}${step.sampleInput ? `\n样例输入：\n${step.sampleInput}\n预期输出：\n${step.examples[0].expected}` : ''}\n我的代码：\n\`\`\`python\n${entry.code}\n\`\`\`\n我的卡点：${entry.notes || '请先检查代码，指出第一个需要修正的位置。'}`
  }
  const completed = SPRINT_DAYS.filter(item => item.steps.every(s => sprintEntry(entries, `${item.id}:${s.id}`).completed)).length
  const saveFailed = ['conflict', 'unavailable', 'quota', 'damaged'].includes(saveStatus)
  const saveLabel = { saved: '已自动保存在此浏览器', empty: '开始编辑后自动保存', recovered: '已从上一次备份恢复', conflict: '另一窗口更新了记录，本页修改尚未保存', unavailable: '浏览器保存不可用，请导出备份', quota: '存储空间不足，请导出备份', damaged: '保存记录损坏，请尝试导入备份' }[saveStatus]
  const reason = completionReason({ recall, passed, notes: entry.notes, phase, locked, completed: entry.completed })

  return h('div', { className: 'diw-sprint', 'data-focus': focusMode || undefined }, h('style', null, SPRINT_STYLES),
    h('header', { className: 'diw-sprint-header' },
      h('p', { className: 'diw-sprint-save-status', role: saveFailed ? 'alert' : 'status' }, readonly ? '只读预览，修改不会保存。' : saveLabel),
      h('div', { className: 'diw-sprint-progress', 'aria-label': '课程进度' }, h('strong', null, `${completed} / 7`), h('span', null, `天已复盘 · ${completedSteps} / ${totalSteps} 步`))),
    h('details', { className: 'diw-sprint-meta' }, h('summary', null, '课程说明与备份恢复'), h('div', { className: 'diw-sprint-meta-body' },
      h('p', { className: 'diw-sprint-source' }, '本课程为自编训练。原始材料中 Encoder、Bi-K-means 的部分公式和权重缺失；本课程的 K-Median / GQA 规格与用例独立编写。'),
      h('p', null, '代码和复盘保存在当前浏览器；更换地址或浏览器前请导出备份，清理网站数据会删除记录。Python 首次加载需要网络，练习代码在浏览器中执行。'),
      h('div', { className: 'diw-sprint-backup-actions diw-sprint-actions' }, button('导出代码与复盘', { onClick: download }), button('导入备份', { disabled: readonly || Boolean(phase), onClick: () => fileInput.current?.click() }),
        h('input', { ref: fileInput, type: 'file', accept: '.json,application/json', hidden: true, tabIndex: -1, 'aria-label': '选择课程 JSON 备份', onChange: importFile })))),
    saveFailed && h('div', { className: 'diw-sprint-save-alert' }, h('p', null, '本页草稿仍在，建议先导出。'), button('导出当前草稿', { onClick: download }), saveStatus === 'conflict' && button('载入已保存的最新记录', { disabled: Boolean(phase), onClick: () => setPending({ type: 'reload' }) })),
    pending && h('section', { ref: confirmation, tabIndex: -1, className: 'diw-sprint-import-preview', role: 'region', 'aria-label': '确认数据操作' },
      h('p', null, pending.type === 'import' ? `将恢复 ${pending.lessons} 个步骤，其中 ${pending.conflicts} 个会替换本地同课记录。其余课程保留。` : pending.type === 'reload' ? '载入最新记录会替换本页未保存的修改。建议先导出本页草稿。' : '将本课代码恢复为初始模板；保留标准输入和复盘。恢复后可以撤销。'),
      h('div', { className: 'diw-sprint-actions' }, button('取消', { onClick: () => setPending(null) }), button('确认恢复', { disabled: readonly || Boolean(phase), onClick: applyPending }))),
    notice && h('p', { className: 'diw-sprint-notice', role: 'status' }, notice),
    h('nav', { className: 'diw-sprint-days', 'aria-label': '七天课程' }, SPRINT_DAYS.map((item, index) => {
      const count = item.steps.filter(s => sprintEntry(entries, `${item.id}:${s.id}`).completed).length
      return button(h(React.Fragment, null, h('strong', null, `D${index + 1}`), h('span', null, DAY_LABELS[index]), h('small', null, count === item.steps.length ? '已复盘' : count ? `${count}/${item.steps.length} 步完成` : '待练习')), { key: item.id, className: 'diw-sprint-day', 'data-complete': count === item.steps.length || undefined, 'aria-label': `第 ${index + 1} 天：${item.title}，${count}/${item.steps.length} 步完成`, 'aria-current': index === dayIndex ? 'step' : undefined, onClick: () => move(index) })
    })),
    h('section', { className: 'diw-sprint-course-heading' }, h('h3', { ref: lessonHeading, tabIndex: -1 }, day.title), h('p', null, day.goal)),
    h('div', { className: 'diw-sprint-stepnav', role: 'group', 'aria-label': '今天的小步骤' }, day.steps.map((item, index) => button(`${index + 1}. ${item.title}${sprintEntry(entries, `${day.id}:${item.id}`).completed ? ' ✓' : ''}`, { key: item.id, className: 'diw-sprint-step', 'aria-pressed': index === stepIndex, onClick: () => move(dayIndex, index) }))),
    h('div', { className: 'diw-sprint-timer', 'data-locked': locked || undefined },
      button(focusMode ? '显示课程导航' : '专注当前课', { 'aria-pressed': focusMode, onClick: () => setFocusMode(value => !value) }),
      button(ticking ? '计时中' : entry.pausedSeconds !== null ? '继续计时' : remaining === 0 ? '重新计时' : `开始 ${duration} 分钟练习`, { disabled: readonly || Boolean(phase) || ticking, onClick: () => { const current = Date.now(); setNow(current); update({ deadline: current + (entry.pausedSeconds ?? duration * 60) * 1000, pausedSeconds: null }) } }),
      h('output', { 'aria-label': '剩余练习时间', role: 'timer', 'aria-live': 'off' }, remaining === null ? `${duration}:00` : clockLabel(remaining)),
      !timed && ticking && button('暂停计时', { disabled: readonly, onClick: () => update({ pausedSeconds: remaining, deadline: null }) }),
      entry.pausedSeconds !== null && h('span', null, '已暂停'),
      remaining === 0 && h('span', { role: 'status' }, '时间到，记录实际卡点后复盘。'),
      locked && h('span', { className: 'diw-sprint-lock-note' }, '自测计时中：提示、参考与教练草稿暂时关闭。'),
      locked && button('结束自测并复盘', { disabled: readonly, onClick: () => { const current = Date.now(); setNow(current); update({ deadline: current }) } })),
    h('div', { className: 'diw-sprint-grid' },
      h('section', { className: 'diw-sprint-lesson', 'aria-label': '讲解与题目' },
        h('h3', null, step.title), !(timed && recall) && h(InterviewContent, { value: step.lesson }), h(InterviewContent, { value: step.task }),
        examples?.length > 0 && h('div', { className: 'diw-sprint-examples', 'aria-label': '题面样例' }, h('strong', null, '输入与预期结果'), examples.map(({ input, expected }, i) => h('div', { className: 'diw-sprint-example', 'data-long': input.length + expected.length > 75 || input.includes('\n') || expected.includes('\n') || undefined, key: i }, h('code', null, input), h('output', null, `→ ${expected}`)))),
        h('details', { className: 'diw-sprint-acceptance', key: key + ':acceptance' }, h('summary', null, '查看完成标准'), h('ul', null, step.acceptance.map(item => h('li', { key: item }, item)))),
        !locked && h(React.Fragment, null,
          button(hints === step.hints.length ? `已展开全部 ${hints} 条提示` : hints ? `再给一个提示（${hints}/${step.hints.length}）` : '卡住了，给一个提示', { disabled: hints >= step.hints.length, onClick: () => setHints(value => value + 1) }),
          h('div', { 'aria-live': 'polite' }, step.hints.slice(0, hints).map((text, index) => h(InterviewContent, { key: index, value: text }))),
          h('details', { key: key + ':solution', onToggle: event => { if (event.currentTarget.open && !entry.revealed && !readonly) update({ revealed: true }) } }, h('summary', null, '写过之后再看参考答案'), h(InterviewContent, { value: step.reference || ('```python\n' + step.solution + '\n```') })))),
      recall
        ? h('section', { className: 'diw-sprint-recall', 'aria-label': '概念自测' }, h('h3', null, '先口述，再记录'), h('p', null, '把你的回答写进下方复盘框；计时结束后再对照参考。概念题由你复核，不自动评分。'))
        : h('section', { className: 'diw-sprint-practice', 'aria-label': 'Python 练习区', 'aria-busy': Boolean(phase) },
          h('h3', null, '动手写代码'),
          h('div', { className: 'diw-sprint-editor-toolbar' }, button('下载 .py', { onClick: () => downloadText(entry.code, `${step.id}.py`, 'text/x-python;charset=utf-8') }), button('恢复初始代码', { disabled: readonly || Boolean(phase), onClick: () => setPending({ type: 'reset' }) }), undoReset && button('撤销恢复', { disabled: Boolean(phase), onClick: () => { update({ code: undoReset.code, checkedCode: undoReset.checkedCode, completed: undoReset.completed }); setUndoReset(null); setNotice('已撤销，恢复到重置前的代码。') } })),
          h('label', null, h('span', null, '你的 Python 代码'), h('textarea', { ref: editor, className: 'diw-sprint-editor', spellCheck: false, autoCapitalize: 'off', autoCorrect: 'off', 'aria-describedby': 'diw-sprint-editor-help', value: entry.code, maxLength: SPRINT_LIMITS.code, readOnly: readonly || Boolean(phase), onChange: event => { update({ code: event.target.value, completed: false }); setSelection(event.target.selectionStart) }, onSelect: event => setSelection(event.currentTarget.selectionStart), onKeyDown: keydown })),
          h('div', { className: 'diw-sprint-editor-meta' }, h('span', null, `第 ${position.line} 行，第 ${position.column} 列 · 共 ${position.lines} 行`), h('span', null, `${entry.code.length.toLocaleString()} / 100,000 字符`)),
          h('details', { className: 'diw-sprint-shortcuts' }, h('summary', null, '编辑快捷键'), h('p', { id: 'diw-sprint-editor-help' }, 'Tab 缩进 · Shift+Tab 取消缩进 · 回车自动缩进 · Esc 后按 Tab 离开编辑器 · Ctrl/⌘+Enter 运行 · Ctrl/⌘+Shift+Enter 检查')),
          h('details', { key: key + ':stdin', open: step.supportsStdin || undefined }, h('summary', null, 'Standard Input · 标准输入'), h('label', null, h('span', null, 'input() 使用，函数检查无需填写'), h('textarea', { rows: 3, value: entry.stdin, maxLength: SPRINT_LIMITS.stdin, spellCheck: false, readOnly: readonly || Boolean(phase), onChange: event => update({ stdin: event.target.value }) })), step.sampleInput && button('填入题目样例输入', { disabled: readonly || Boolean(phase), onClick: () => update({ stdin: step.sampleInput }) })),
          h('div', { className: 'diw-sprint-actions' }, button('Run · 运行', { onClick: () => execute(false), disabled: readonly || Boolean(phase) }), button('检查本课训练用例', { className: 'diw-button diw-button-primary diw-sprint-primary', onClick: () => execute(true), disabled: readonly || Boolean(phase) }), phase && button('停止', { onClick: () => running.current?.cancel() })),
          h('p', { className: 'diw-sprint-status', role: 'status' }, phase === 'loading' ? '正在加载 Python，首次需要网络下载，可随时停止…' : phase === 'running' ? '运行中，最长 10 秒…' : 'Python 3 · Run 执行代码；“检查本课”更新通过状态。'),
          feedback && h('p', { className: 'diw-sprint-feedback', 'data-tone': feedback.tone, role: 'status' }, feedback.text),
          output && button('清空运行结果', { disabled: Boolean(phase), onClick: () => { setOutput(''); setFeedback(null) } }),
          h('pre', { className: 'diw-sprint-output', 'data-empty': output ? undefined : 'true', tabIndex: 0, 'aria-label': '运行结果' }, output || '尚未运行。先运行样例，再检查本课训练用例。'),
          h('details', { key: key + ':tests' }, h('summary', null, '查看本课训练检查（不是原题隐藏测试）'), h(InterviewContent, { value: '```python\n' + step.tests + '\n```' })),
          h('a', { href: 'https://www.onlinegdb.com/online_python_compiler', target: '_blank', rel: 'noopener noreferrer', 'aria-label': '备用 Python 在线运行器，在新标签页打开' }, '备用 Python 在线运行器 ↗'))),
    h('section', { className: 'diw-sprint-recap' },
      h('h3', null, '5 分钟纠错与复盘'),
      h('label', null, h('span', null, '哪里卡住了？如何修正？明天闭卷要复写什么？'), h('textarea', { rows: 4, value: entry.notes, placeholder: recall ? '先写自己的回答，再对照参考补充遗漏。' : '例如：return 写进了循环；移到循环外后，两组样例通过。', maxLength: SPRINT_LIMITS.notes, readOnly: readonly, onChange: event => update({ notes: event.target.value, ...(!event.target.value.trim() ? { completed: false } : {}) }) })),
      h('span', { className: 'diw-sprint-field-count', 'data-near-limit': entry.notes.length > 18000 || undefined }, `${entry.notes.length.toLocaleString()} / 20,000 字符`),
      h('p', null, recall ? '概念自测由你记录口述与对照结果，不自动评分。' : passed ? '当前代码通过本课检查。' : '当前代码尚未通过本课检查。', entry.revealed ? ' 本次打开过参考答案，建议再闭卷复写。' : ' 本次尚未打开参考答案。'),
      h('p', { id: 'diw-sprint-completion-reason', className: 'diw-sprint-completion-reason' }, reason),
      button(entry.completed ? '已完成本步骤并记录复盘' : '完成本步骤并记录复盘', { className: 'diw-button diw-button-primary diw-sprint-primary', 'aria-describedby': 'diw-sprint-completion-reason', disabled: readonly || entry.completed || (!recall && !passed) || !entry.notes.trim() || Boolean(phase) || locked, onClick: () => update({ completed: true }) }),
      onStagePrompt && button(recall ? '把概念回答放入当前对话' : '把代码与卡点放入当前对话', { className: 'diw-sprint-coach', disabled: Boolean(stageDisabledReason) || Boolean(phase) || locked, title: locked ? '结束自测后再向教练求助' : stageDisabledReason, onClick: async () => { try { await onStagePrompt(stagePrompt()); if (mounted.current) setNotice('已放入当前对话草稿，检查后发送。') } catch (error) { if (mounted.current) setNotice(String(error.message)) } } }),
      onStagePrompt && stageDisabledReason && h('p', { className: 'diw-muted' }, stageDisabledReason)),
    h('nav', { className: 'diw-sprint-footer-nav', 'aria-label': '相邻课程' }, button('上一个小步骤', { disabled: dayIndex === 0 && stepIndex === 0, onClick: () => moveRelative(-1) }),
      button(dayIndex === 6 && stepIndex === day.steps.length - 1 ? '回到第 1 天复练' : stepIndex + 1 < day.steps.length ? '下一个小步骤' : '进入下一天', { onClick: () => dayIndex === 6 && stepIndex === day.steps.length - 1 ? move(0) : moveRelative(1) })))
}
