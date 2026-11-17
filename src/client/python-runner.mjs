/** A fresh browser Worker per run. No host execution or workbench API is exposed. */
export const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/'
export function pythonWorkerSource() {
  return `
self.onmessage = async ({data}) => {
  try {
    self.postMessage({phase:'loading'});
    importScripts('${PYODIDE_URL}pyodide.js');
    const py = await loadPyodide({indexURL:'${PYODIDE_URL}'});
    let output = '', lastSent = 0, truncated = false;
    const append = text => {
      const next = output + text + '\\n'; truncated ||= next.length > 20000; output = next.slice(-20000);
      if (Date.now() - lastSent >= 150) { lastSent = Date.now(); self.postMessage({output, truncated}); }
    };
    py.setStdout({batched:append}); py.setStderr({batched:append});
    const input = data.stdin.replace(/\\r\\n/g, '\\n');
    const lines = input ? input.split('\\n') : [];
    if (input.endsWith('\\n')) lines.pop();
    let index = 0;
    py.setStdin({stdin:()=>index < lines.length ? lines[index++] : null});
    self.postMessage({phase:'running'});
    try {
      py.globals.set('__name__', data.tests ? 'sprint_test' : '__main__');
      await py.runPythonAsync(data.code);
      if(data.tests) await py.runPythonAsync(data.tests);
      self.postMessage({done:true,ok:true,output,truncated});
    } catch(error) { self.postMessage({done:true,ok:false,output,truncated,error:String(error)}); }
  } catch(error) { self.postMessage({done:true,ok:false,error:'Python 环境加载失败：'+String(error)}); }
};`
}
export function runPython({ code, tests = '', stdin = '', onPhase = () => {}, loadingTimeout = 90000, executionTimeout = 10000 }) {
  let worker, url, timer, settle, ended = false, output = '', truncated = false, running = false
  const promise = new Promise(resolve => { settle = resolve })
  const finish = result => {
    if (ended) return
    ended = true; clearTimeout(timer)
    try { worker?.terminate() } catch { /* still settle */ }
    if (url) { try { URL.revokeObjectURL(url) } catch { /* still settle */ } }
    const resultOutput = typeof result.output === 'string' ? result.output.slice(-20000) : output
    settle({ ...result, output: (truncated || result.truncated ? '[输出过长，仅保留最后 20,000 字符]\n' : '') + resultOutput })
  }
  const deadline = (ms, message) => { clearTimeout(timer); timer = setTimeout(() => finish({ ok: false, error: message }), ms) }
  try {
    url = URL.createObjectURL(new Blob([pythonWorkerSource()], { type: 'text/javascript' }))
    worker = new Worker(url)
    worker.onmessage = ({ data }) => {
      if (ended || !data || typeof data !== 'object') return
      if (typeof data.output === 'string') output = data.output.slice(-20000)
      if (data.truncated === true) truncated = true
      if (data.done === true) finish({ ok: data.ok === true, output, truncated, ...(typeof data.error === 'string' ? { error: data.error.slice(-20000) } : {}) })
      else if (data.phase === 'loading' || data.phase === 'running') {
        try { onPhase(data.phase) } catch { /* an observer must not strand a worker */ }
        if (data.phase === 'running' && !running) { running = true; deadline(executionTimeout, '运行超时，请检查循环是否能结束。') }
      }
    }
    worker.onerror = () => finish({ ok: false, error: '浏览器未能启动 Python Worker。可下载 .py 文件或使用备用在线运行器。' })
    worker.onmessageerror = () => finish({ ok: false, error: 'Python 结果无法读取，请重试。草稿已保留。' })
    deadline(loadingTimeout, 'Python 环境下载超时，请检查网络后重试，或使用备用在线运行器。')
    worker.postMessage({ code: String(code), tests: String(tests), stdin: String(stdin) })
  } catch (error) { finish({ ok: false, error: String(error) }) }
  return { promise, cancel: () => finish({ ok: false, error: '已停止运行。' }) }
}
