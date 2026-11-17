/** Browser draft/cursor storage isolated by the addressed DSH session. */
export function createScopedStorage(scope, storage) {
  const prefix = scope ? `dsh-interview-workbench:session:${encodeURIComponent(scope)}:` : ''
  const target = () => {
    const resolved = storage === undefined ? globalThis.sessionStorage : storage
    if (!resolved) throw new Error('当前浏览器无法保存面试草稿。')
    return resolved
  }
  return {
    getItem(key) { return target().getItem(`${prefix}${key}`) },
    setItem(key, value) { return target().setItem(`${prefix}${key}`, value) },
    removeItem(key) { return target().removeItem(`${prefix}${key}`) },
  }
}

/** Return a synchronous, session-addressed draft action; it never submits. */
export function createPromptStager({ sessions, conversation, isAlive = () => true }) {
  return function stage(sessionId, text) {
    if (!isAlive()) throw new Error('面试工作台已关闭，请重新打开后重试。')
    if (!sessionId || sessions.list.getSnapshot().current !== sessionId) {
      throw new Error('当前会话已切换，请在目标会话中重新加入面试提示。')
    }
    if (typeof text !== 'string' || !text.trim()) throw new Error('没有可加入草稿的面试提示。')
    const scoped = sessions.scope(sessionId)
    if (!scoped) throw new Error('此会话已不可用，请重新打开后重试。')
    const input = conversation.input.for(scoped)
    // Resolve on each click; no asynchronous work can overwrite a newer draft.
    const before = input.state.getSnapshot()
    if (before.phase !== 'plain') {
      throw new Error('输入框正在处理命令或发送内容，请完成后再加入面试提示。')
    }
    if (before.draft.endsWith(text)) return { ok: true, sessionId, appended: false, duplicate: true }
    const appended = before.draft.length > 0
    input.setDraft(appended ? `${before.draft}\n\n${text}` : text)
    return { ok: true, sessionId, appended, duplicate: false }
  }
}
