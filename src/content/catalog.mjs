import { readFile } from 'node:fs/promises';

export const DEFAULT_IMPORTED_PATH = new URL('../../content/imported-catalog.json', import.meta.url);

/** Imported repositories are opt-in local content and are not part of the package. */
export async function loadCatalog({ includeImported = false, importedPath = DEFAULT_IMPORTED_PATH } = {}) {
  const seed = JSON.parse(await readFile(new URL('../../content/seed.json', import.meta.url), 'utf8'));
  if (!includeImported) return seed;
  const imported = JSON.parse(await readFile(importedPath, 'utf8'));
  if (imported.schemaVersion !== 1 || !Array.isArray(imported.questions) || !Array.isArray(imported.sources)) throw new Error('导入题库格式无效，请重新执行本地内容导入');
  return { schemaVersion: 1, sources: [...seed.sources, ...imported.sources], questions: [...seed.questions, ...imported.questions], resources: imported.resources ?? [] };
}
