import * as React from 'react';
import { Marked } from 'marked';
import { InterviewMath, useLocalMathStyles } from './math.mjs';

const h = React.createElement;

export function safeLink(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}

function escapedAt(source, index) {
  let preceding = 0;
  while (index > 0 && source[--index] === '\\') preceding++;
  return preceding % 2 === 1;
}

function mathToken(source, block = false) {
  const opening = block ? source.match(/^ {0,3}(\$\$|\\\[)/) : source.match(/^(\$\$|\$|\\\(|\\\[)/);
  if (!opening) return;
  const delimiter = opening[1];
  const closing = delimiter === '\\(' ? '\\)' : delimiter === '\\[' ? '\\]' : delimiter;
  const beginning = opening[0].length;
  if (delimiter === '$' && (!source[beginning] || /\s/.test(source[beginning]))) return;
  for (let end = source.indexOf(closing, beginning); end >= 0; end = source.indexOf(closing, end + closing.length)) {
    if (escapedAt(source, end)) continue;
    // Do not jump across another dollar expression when the first closing mark
    // is invalid (for example "$20 and $30; actual $x$").
    if (delimiter === '$' && (source[end + 1] === '$' || /[\s]/.test(source[end - 1]) || /\d/.test(source[end + 1] ?? ''))) return;
    const formula = source.slice(beginning, end);
    if (!formula.trim() || (delimiter === '$' && formula.includes('\n'))) return;
    let length = end + closing.length;
    if (block) {
      const tail = source.slice(length).match(/^[ \t]*(?:\n|$)/);
      if (!tail) continue;
      length += tail[0].length;
    }
    return { type: block ? 'interviewMathBlock' : 'interviewMath', raw: source.slice(0, length), text: formula.trim(), display: delimiter === '$$' || delimiter === '\\[' };
  }
}

// Lex locally, then render the token tree as React. Marked's HTML renderer is never used.
const markdown = new Marked({ gfm: true, breaks: false, extensions: [
  {
    name: 'interviewMathBlock', level: 'block',
    start(source) { return source.match(/(?:^|\n) {0,3}(?:\$\$|\\\[)/)?.index; },
    tokenizer(source) { return mathToken(source, true); },
  },
  {
    name: 'interviewMath', level: 'inline',
    start(source) { return source.match(/\$|\\[([]/)?.index; },
    tokenizer(source) { return mathToken(source); },
  },
] });

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®' };
function textValue(text = '') {
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|copy|reg);/gi, (raw, entity) => {
    if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? raw;
    const code = entity[1].toLowerCase() === 'x' ? Number.parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
  });
}

function tokensToReact(tokens = []) {
  return tokens.map((token, index) => {
    const props = { key: index };
    const children = () => token.tokens ? tokensToReact(token.tokens) : textValue(token.text);
    switch (token.type) {
      case 'space': return null;
      case 'interviewMath':
      case 'interviewMathBlock': return h(InterviewMath, { ...props, source: token.text, display: token.display });
      case 'heading': return h(`h${Math.min(token.depth + 2, 6)}`, props, children());
      case 'paragraph': return h('p', props, children());
      case 'text': return h(React.Fragment, props, children());
      case 'escape': return h(React.Fragment, props, token.text);
      case 'strong': return h('strong', props, children());
      case 'em': return h('em', props, children());
      case 'del': return h('del', props, children());
      case 'br': return h('br', props);
      case 'hr': return h('hr', props);
      case 'codespan': return h('code', props, token.text);
      case 'code': return h('figure', { ...props, className: 'diw-code' },
        token.lang && h('figcaption', null, token.lang), h('pre', null, h('code', null, token.text)));
      case 'blockquote': return h('blockquote', props, children());
      case 'list': return h(token.ordered ? 'ol' : 'ul', { ...props, ...(token.ordered && token.start !== 1 ? { start: token.start } : {}) }, token.items.map((item, itemIndex) =>
        h('li', { key: itemIndex }, item.task && h('input', { type: 'checkbox', checked: item.checked, disabled: true, 'aria-label': item.checked ? '已完成' : '未完成' }), tokensToReact(item.tokens))));
      case 'link': {
        const href = safeLink(textValue(token.href));
        return href ? h('a', { ...props, href, target: '_blank', rel: 'noreferrer noopener', title: token.title || undefined }, children()) : h(React.Fragment, props, children());
      }
      case 'image': return h('span', { ...props, className: 'diw-image-alt' }, token.text ? `图片：${textValue(token.text)}` : '图片（未加载）');
      // Raw HTML remains literal text; no remote images, scripts, attributes or embeds.
      case 'html': return h(token.block ? 'pre' : 'span', { ...props, className: 'diw-raw-markup' }, token.text);
      case 'table': return h('div', { ...props, className: 'diw-table-scroll', tabIndex: 0, role: 'group', 'aria-label': '表格，可左右滚动' }, h('table', null,
        h('thead', null, h('tr', null, token.header.map((cell, cellIndex) => h('th', { key: cellIndex, scope: 'col', style: { textAlign: token.align[cellIndex] || undefined } }, tokensToReact(cell.tokens))))),
        h('tbody', null, token.rows.map((row, rowIndex) => h('tr', { key: rowIndex }, row.map((cell, cellIndex) => h('td', { key: cellIndex, style: { textAlign: token.align[cellIndex] || undefined } }, tokensToReact(cell.tokens))))))));
      default: return h(React.Fragment, props, token.raw ?? token.text ?? '');
    }
  });
}

/** Safe Markdown plus local math: source HTML is never injected or executed. */
export function InterviewContent({ value = '', className = '' }) {
  useLocalMathStyles();
  const children = React.useMemo(() => {
    const source = String(value).replace(/\r\n?/g, '\n');
    try { return tokensToReact(markdown.lexer(source)); }
    catch { return h('pre', { className: 'diw-content-fallback' }, source); }
  }, [value]);
  return h('div', { className: `diw-content ${className}`.trim() }, children);
}
