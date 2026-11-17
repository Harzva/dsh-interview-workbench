import { SPRINT_DAYS } from '../content/sprint-course.mjs'

export const SPRINT_STORAGE_KEY = 'dsh-interview-workbench:sprint:v1'
const BACKUP_KEY = `${SPRINT_STORAGE_KEY}:backup`
export const SPRINT_LIMITS = { code: 100000, notes: 20000, stdin: 20000, file: 10000000 }
const steps = new Map(SPRINT_DAYS.flatMap(day => day.steps.map(step => [`${day.id}:${step.id}`, step])))
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const text = (value, limit, fallback = '') => typeof value === 'string' ? value.slice(0, limit) : fallback

export function sprintEntry(entries, id, starter = '') {
  const item = object(entries) && Object.hasOwn(entries, id) && object(entries[id]) ? entries[id] : {}
  const code = text(item.code, SPRINT_LIMITS.code, starter)
  const notes = text(item.notes, SPRINT_LIMITS.notes)
  const checkedCode = typeof item.checkedCode === 'string' && item.checkedCode.length <= SPRINT_LIMITS.code ? item.checkedCode : null
  const completed = item.completed === true && Boolean(notes.trim()) && (steps.get(id)?.kind === 'recall' || checkedCode === code)
  return {
    code, notes, stdin: text(item.stdin, SPRINT_LIMITS.stdin), checkedCode, completed,
    deadline: Number.isFinite(item.deadline) && item.deadline >= 0 && item.deadline <= 8640000000000000 ? item.deadline : null,
    pausedSeconds: Number.isFinite(item.pausedSeconds) && item.pausedSeconds >= 0 && item.pausedSeconds <= 3600 ? Math.ceil(item.pausedSeconds) : null,
    revealed: item.revealed === true,
    updatedAt: Number.isFinite(item.updatedAt) && item.updatedAt >= 0 ? item.updatedAt : 0,
  }
}

export function normalizeSprint(entries) {
  if (!object(entries)) throw new Error('备份中缺少有效的课程记录。')
  const next = {}
  for (const [key, step] of steps) {
    if (Object.hasOwn(entries, key) && object(entries[key])) next[key] = sprintEntry(entries, key, step.starter)
  }
  const cursor = entries.__cursor
  if (object(cursor) && Number.isInteger(cursor.dayIndex) && cursor.dayIndex >= 0 && cursor.dayIndex < SPRINT_DAYS.length && Number.isInteger(cursor.stepIndex) && cursor.stepIndex >= 0 && cursor.stepIndex < SPRINT_DAYS[cursor.dayIndex].steps.length) {
    next.__cursor = { dayIndex: cursor.dayIndex, stepIndex: cursor.stepIndex }
  }
  return next
}

export function parseSprintBackup(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > SPRINT_LIMITS.file) throw new Error('备份文件过大，最多支持 10 MB。')
  let data
  try { data = JSON.parse(raw.replace(/^\uFEFF/, '')) } catch { throw new Error('文件不是有效的 JSON 备份。') }
  if (!object(data) || data.version !== 1) throw new Error('不支持此备份版本，请选择本工作台导出的 v1 备份。')
  return { entries: normalizeSprint(data.entries), savedAt: typeof data.savedAt === 'string' ? data.savedAt : null }
}

export function readSprintSnapshot(storage) {
  try {
    const target = storage ?? globalThis.localStorage
    const raw = target?.getItem(SPRINT_STORAGE_KEY)
    if (!raw) return { entries: {}, status: 'empty', revision: raw ?? null }
    try { return { ...parseSprintBackup(raw), status: 'saved', revision: raw } } catch {
      const backup = target?.getItem(BACKUP_KEY)
      if (backup) {
        try { return { ...parseSprintBackup(backup), status: 'recovered', revision: raw } } catch { /* report unreadable below */ }
      }
      return { entries: {}, status: 'damaged', revision: raw }
    }
  } catch { return { entries: {}, status: 'unavailable', revision: null } }
}
export function readSprint(storage) { return readSprintSnapshot(storage).entries }

export function saveSprint(entries, { storage, expectedRevision } = {}) {
  try {
    const target = storage ?? globalThis.localStorage
    const previous = target.getItem(SPRINT_STORAGE_KEY)
    if (expectedRevision !== undefined && (previous ?? null) !== expectedRevision) return { ok: false, reason: 'conflict' }
    const raw = JSON.stringify({ version: 1, savedAt: new Date().toISOString(), entries: normalizeSprint(entries) })
    if (new TextEncoder().encode(raw).length > SPRINT_LIMITS.file) return { ok: false, reason: 'quota' }
    if (previous) {
      try { parseSprintBackup(previous); target.setItem(BACKUP_KEY, previous) } catch { /* a damaged record must not replace a healthy recovery copy */ }
    }
    target.setItem(SPRINT_STORAGE_KEY, raw)
    return { ok: true, revision: raw }
  } catch { return { ok: false, reason: 'unavailable' } }
}
export function writeSprint(entries, storage) { return saveSprint(entries, { storage }).ok }

export function mergeSprintBackup(current, imported) {
  // Restore is explicit. Imported lessons replace matching lessons only; all
  // unrelated local work and the current navigation position remain intact.
  const next = { ...normalizeSprint(current), ...normalizeSprint(imported) }
  if (current.__cursor) next.__cursor = current.__cursor
  return next
}
export function sprintBackupSummary(current, imported) {
  const keys = Object.keys(normalizeSprint(imported)).filter(key => steps.has(key))
  return { lessons: keys.length, conflicts: keys.filter(key => Object.hasOwn(current, key)).length }
}
