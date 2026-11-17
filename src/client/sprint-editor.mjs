/** Pure text edits keep cursor/selection behavior testable without a browser. */
export function editPython(code, start, end, key, shift = false) {
  const lineStart = start === 0 ? 0 : code.lastIndexOf('\n', start - 1) + 1
  const before = code.slice(lineStart, start)
  const replace = (from, to, value, selectionStart, selectionEnd = selectionStart) => ({ code: code.slice(0, from) + value + code.slice(to), start: selectionStart, end: selectionEnd })
  if (key === 'Enter') {
    const indent = before.match(/^[ \t]*/)[0].replace(/\t/g, '    ')
    const insert = '\n' + indent + (before.trimEnd().endsWith(':') ? '    ' : '')
    return replace(start, end, insert, start + insert.length)
  }
  if (key === 'Backspace' && start === end && /^ +$/.test(before)) {
    const count = ((before.length - 1) % 4) + 1
    return replace(start - count, end, '', start - count)
  }
  if (key !== 'Tab') return null
  if (!shift && start === end) {
    const insert = ' '.repeat(4 - before.length % 4)
    return replace(start, end, insert, start + insert.length)
  }
  const lastIncluded = end > start && code[end - 1] === '\n' ? end - 1 : end
  const endOfLine = code.indexOf('\n', lastIncluded)
  const blockEnd = endOfLine === -1 ? code.length : endOfLine
  const lines = code.slice(lineStart, blockEnd).split('\n')
  let firstDelta = 0, totalDelta = 0
  const changed = lines.map((line, index) => {
    const count = shift ? (line.startsWith('\t') ? 1 : Math.min(4, line.match(/^ */)[0].length)) : 0
    const delta = shift ? -count : 4
    if (index === 0) firstDelta = delta
    totalDelta += delta
    return shift ? line.slice(count) : '    ' + line
  }).join('\n')
  return replace(lineStart, blockEnd, changed, Math.max(lineStart, start + firstDelta), Math.max(lineStart, end + totalDelta))
}
export function editorPosition(code, offset) {
  const before = code.slice(0, offset)
  return { line: before.split('\n').length, column: offset - before.lastIndexOf('\n'), lines: code.split('\n').length }
}
export function completionReason({ recall, passed, notes, phase, locked, completed }) {
  if (completed) return '已记录复盘，可以进入下一个小步骤。'
  if (phase) return '等待运行结束后记录复盘。'
  if (locked) return '先结束自测，再记录复盘。'
  if (!recall && !passed) return '先通过“检查本课训练用例”，再完成本步骤。'
  if (!notes.trim()) return '在复盘框写下思路或卡点，就可以完成本步骤。'
  return '已满足条件，可以完成本步骤。'
}
