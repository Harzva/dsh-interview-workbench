import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clientBuildDefines } from './client-build-support.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(root, 'lib'), { recursive: true });
await build({
  entryPoints: [resolve(root, 'src/client/index.mjs')], outfile: resolve(root, 'lib/client.js'),
  bundle: true, platform: 'browser', format: 'cjs', target: ['chrome120'], sourcemap: true,
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', '@deepseek-ai/cordis', '@deepseek-ai/dsh-client-connection', '@deepseek-ai/dsh-client-connection/client'],
  define: { 'process.env.NODE_ENV': '"production"', ...await clientBuildDefines() },
  banner: { js: 'window.__ModuleLoader__.load({ id: "dsh-interview-workbench", factory: (require) => { var module = { exports: {} }; var exports = module.exports;' },
  footer: { js: 'return module.exports; } });' }, logLevel: 'warning',
});
await writeFile(resolve(root, 'lib/index.js'), "export * from '../src/host.mjs';\nexport { default } from '../src/host.mjs';\n");
console.log('Built DSH Host and Client entries.');
