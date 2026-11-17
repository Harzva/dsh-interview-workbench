/** Only question identifiers and titles; never candidate answers. Tab-scoped. */
const key = track => `dsh-interview-workbench:selection:v1:${track}`
function normalize(value) {
  if (!Array.isArray(value) || value.length > 30) return []
  const seen = new Set()
  return value.filter(item => item && typeof item.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,199}$/.test(item.id)
    && typeof item.title === 'string' && item.title.length > 0 && item.title.length <= 2000
    && !seen.has(item.id) && seen.add(item.id)).map(({ id, title }) => ({ id, title }))
}
export function readSelection(track, storage) {
  try { return normalize(JSON.parse((storage ?? globalThis.sessionStorage)?.getItem(key(track)) ?? '[]')) }
  catch { return [] }
}
export function writeSelection(track, value, storage) {
  try { const target = storage ?? globalThis.sessionStorage; if (!target) return false; target.setItem(key(track), JSON.stringify(normalize(value))); return true }
  catch { return false }
}
