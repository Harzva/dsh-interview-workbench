import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);

/** Bundle the pinned KaTeX styles and fonts: no CDN, host CSS or public asset URL. */
export async function clientBuildDefines() {
  const directory = dirname(require.resolve('katex/package.json'));
  let css = await readFile(resolve(directory, 'dist/katex.min.css'), 'utf8');
  // The pinned stylesheet has flat rules only. Fail explicitly if an upgrade changes that.
  if ((css.match(/@[^{}]+\{/g) ?? []).some(rule => rule !== '@font-face{')) {
    throw new Error('KaTeX stylesheet changed: audit local CSS scoping before upgrading');
  }
  const fonts = [...new Set([...css.matchAll(/url\((fonts\/[^)]+\.woff2)\)/g)].map(match => match[1]))];
  const embedded = new Map(await Promise.all(fonts.map(async path => [path, (await readFile(resolve(directory, 'dist', path))).toString('base64')])));
  css = css.replace(/src:url\((fonts\/[^)]+\.woff2)\) format\("woff2"\)[^}]+/g,
    (_, path) => `src:url(data:font/woff2;base64,${embedded.get(path)}) format("woff2")`);
  css = css.replace(/(^|})([^{}]+)\{/g, (_, boundary, selector) => {
    if (selector.trim() === '@font-face') return `${boundary}${selector}{`;
    return `${boundary}${selector.split(',').map(item => item.trim() === 'body' ? '.diw-content' : `.diw-content ${item.trim()}`).join(',')}{`;
  });
  css = css.replace(/KaTeX_/g, 'DIW_KaTeX_');
  const license = await readFile(resolve(directory, 'LICENSE'), 'utf8');
  return { __DIW_LOCAL_KATEX_CSS__: JSON.stringify(`/*! KaTeX local renderer\n${license}\n*/\n${css}`) };
}
