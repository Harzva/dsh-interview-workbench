/** Tab-scoped draft recovery. Storage is optional and never required for editing. */
const PREFIX = 'dsh-interview-workbench:recovery:v1:'
const CURSOR_KEY = `${PREFIX}cursor`
const MAX_KEY_LENGTH = 2048

function resolveStorage(storage) {
  return storage === undefined ? globalThis.sessionStorage : storage
}

function validId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_KEY_LENGTH && value.trim().length > 0
}

function exactRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return (prototype === Object.prototype || prototype === null)
    && Object.keys(value).length === keys.length
    && keys.every(key => Object.hasOwn(value, key))
}

function draftKey(kind, key) {
  if (!['answer', 'review'].includes(kind) || !validId(key)) return null
  // Each entry has its own key; user-controlled IDs never become object properties.
  return `${PREFIX}draft:${kind}:${encodeURIComponent(key)}`
}

function normalizeDraft(kind, value) {
  if (kind === 'answer' && typeof value === 'string' && value.length <= 100000) return value
  if (kind === 'review' && exactRecord(value, ['score', 'notes'])
    && Number.isInteger(value.score) && value.score >= 0 && value.score <= 4
    && typeof value.notes === 'string' && value.notes.length <= 20000) {
    return { score: value.score, notes: value.notes }
  }
  return undefined
}

function normalizeCursor(value) {
  if (!exactRecord(value, ['practiceId', 'questionId', 'pane'])
    || !validId(value.practiceId) || !validId(value.questionId)
    || typeof value.pane !== 'string' || !/^[a-z][a-z0-9_-]{0,31}$/.test(value.pane)) return undefined
  return { practiceId: value.practiceId, questionId: value.questionId, pane: value.pane }
}

function decode(raw) {
  if (typeof raw !== 'string' || raw.length > 700000) return undefined
  const envelope = JSON.parse(raw)
  return exactRecord(envelope, ['version', 'value']) && envelope.version === 1 ? envelope.value : undefined
}

/** kind: answer (string) or review ({ score: 0–4, notes: string }). */
export function readDraft(kind, key, fallback, storage) {
  try {
    const address = draftKey(kind, key)
    if (!address) return fallback
    const value = normalizeDraft(kind, decode(resolveStorage(storage)?.getItem(address)))
    return value === undefined ? fallback : value
  } catch { return fallback }
}

/** Empty drafts are retained too, so clearing a field survives a refresh. */
export function writeDraft(kind, key, value, storage) {
  try {
    const address = draftKey(kind, key)
    const normalized = normalizeDraft(kind, value)
    if (!address || normalized === undefined) return false
    const target = resolveStorage(storage)
    if (!target) return false
    target.setItem(address, JSON.stringify({ version: 1, value: normalized }))
    return true
  } catch { return false }
}

export function removeDraft(kind, key, storage) {
  try {
    const address = draftKey(kind, key)
    const target = resolveStorage(storage)
    if (!address || !target) return false
    target.removeItem(address)
    return true
  } catch { return false }
}

/** Returns null when no valid saved location is available. */
export function readCursor(storage) {
  try { return normalizeCursor(decode(resolveStorage(storage)?.getItem(CURSOR_KEY))) ?? null }
  catch { return null }
}

/** pane is a short lowercase identifier chosen by the workbench UI. */
export function writeCursor(value, storage) {
  try {
    const cursor = normalizeCursor(value)
    const target = resolveStorage(storage)
    if (!cursor || !target) return false
    target.setItem(CURSOR_KEY, JSON.stringify({ version: 1, value: cursor }))
    return true
  } catch { return false }
}
