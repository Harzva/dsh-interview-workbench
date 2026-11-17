import * as React from 'react';
import katex from 'katex';

const h = React.createElement;
const LOCAL_STYLES = typeof __DIW_LOCAL_KATEX_CSS__ === 'string' ? __DIW_LOCAL_KATEX_CSS__ : '';
let styleElement;
let styleUsers = 0;

export function useLocalMathStyles() {
  React.useInsertionEffect(() => {
    if (!LOCAL_STYLES || typeof document === 'undefined') return;
    if (!styleElement?.isConnected) {
      styleElement = document.createElement('style');
      styleElement.dataset.interviewMath = 'local';
      styleElement.textContent = LOCAL_STYLES;
      document.head.appendChild(styleElement);
    }
    styleUsers++;
    return () => {
      styleUsers--;
      if (styleUsers === 0) { styleElement?.remove(); styleElement = undefined; }
    };
  }, []);
}

/** Only this trusted generator may produce HTML; source Markdown never does. */
export function renderMath(source, displayMode = false) {
  if (source.length > 12_000) return undefined;
  try {
    return katex.renderToString(source, {
      displayMode, output: 'htmlAndMathml', throwOnError: true,
      trust: false, strict: 'ignore', maxSize: 10, maxExpand: 500,
      // KaTeX can mutate macro dictionaries. Never share one across questions.
      macros: {},
    });
  } catch { return undefined; }
}

export function InterviewMath({ source, display = false }) {
  const markup = React.useMemo(() => renderMath(source, display), [source, display]);
  if (!markup) return h('code', { className: 'diw-math-error', title: '公式暂无法排版，保留原文' }, source);
  return h('span', {
    className: display ? 'diw-math-block' : 'diw-math-inline',
    ...(display ? { tabIndex: 0, role: 'group', 'aria-label': '数学公式，可左右滚动' } : {}),
    dangerouslySetInnerHTML: { __html: markup },
  });
}
