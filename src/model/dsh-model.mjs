const REQUEST_TIMEOUT_MS = 180_000;
const MAX_OUTPUT_TOKENS = 16_384;
const MAX_INPUT_CHARS = 240_000;
const MAX_OUTPUT_CHARS = 300_000;
const MODEL_LIST_TIMEOUT_MS = 5_000;
const MAX_MODEL_PROVIDERS = 64;
const MAX_MODELS_PER_PROVIDER = 256;
const MAX_MODEL_CHOICES = 512;

const MESSAGES = {
  MODEL_UNAVAILABLE: 'DSH 默认模型尚不可用，请先在 DSH 模型设置中选择已配置的提供方。',
  MODEL_PROTOCOL_UNAVAILABLE: '当前 DSH 缺少面试模型协议依赖，请重新加载工作台插件。',
  MISSING_CREDENTIAL: 'DSH 模型尚未配置凭据，请在 DSH 模型设置中完成配置后重试。',
  INVALID_CREDENTIAL: 'DSH 模型凭据无效，请在 DSH 模型设置中检查后重试。',
  AUTH: 'DSH 模型鉴权失败，请在 DSH 模型设置中检查配置。',
  RATE_LIMIT: '模型请求受到限流，请稍后手动重试。',
  QUOTA: '模型账户的额度不足，请检查提供方账户。',
  CONTEXT_WINDOW_EXCEEDED: '选中的资料超过模型上下文限制，请减少资料后重试。',
  UNKNOWN_MODEL: 'DSH 默认模型无法被当前提供方识别，请重新选择模型。',
  NO_ADAPTER: 'DSH 默认模型的提供方已断开，请在模型设置中检查。',
  TIMEOUT: '模型请求超时，未保存本次结果；可保留资料并重试。',
  ABORTED: '已取消模型请求，未保存本次结果。',
  MAX_TOKENS: '模型输出超过长度限制，未保存不完整结果；请减少题量后重试。',
  MODEL_INPUT_INVALID: '模型输入为空或超过长度限制。',
  MODEL_OUTPUT_INVALID: '模型没有返回完整的文本结果，未保存本次结果。',
  MODEL_FAILED: '模型请求失败，未保存本次结果；请检查 DSH 模型连接后重试。',
};

function failure(code) {
  const known = Object.hasOwn(MESSAGES, code) ? code : 'MODEL_FAILED';
  const error = new Error(MESSAGES[known]);
  error.name = known === 'ABORTED' ? 'AbortError' : 'InterviewModelError';
  error.code = known;
  return error;
}

function textIdentifier(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 512
    && value === value.trim() && !/[\u0000-\u001f\u007f-\u009f]/u.test(value);
}

function modelChoice(value) {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some(key => !['provider', 'model'].includes(key))
    || !textIdentifier(value.provider) || !textIdentifier(value.model)) throw failure('MODEL_INPUT_INVALID');
  return { provider: value.provider, model: value.model };
}

function aborted(signal) {
  if (signal?.aborted) throw failure(signal.reason?.code === 'TIMEOUT' ? 'TIMEOUT' : 'ABORTED');
}

/** Bound even an adapter that fails to settle promptly after cancellation. */
function abortable(promise, signal) {
  return new Promise((resolve, reject) => {
    const cancel = () => reject(failure(signal.reason?.code === 'TIMEOUT' ? 'TIMEOUT' : 'ABORTED'));
    signal.addEventListener('abort', cancel, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener('abort', cancel));
    if (signal.aborted) cancel();
  });
}

/**
 * Load the public LLM protocol across the 0.1 and 0.2 package contracts.
 *
 * DSH 0.1 exported `deepFreeze` from `@deepseek-ai/dsh-llm`; DSH 0.2 keeps
 * the helper in `@deepseek-ai/dsh-util-values`. Keep both imports lazy so a
 * missing optional model stack cannot prevent the interview catalog from
 * loading. The import seams are intentionally injectable for package-level
 * compatibility tests.
 */
export async function loadDshModelProtocol({
  importProtocol = () => import('@deepseek-ai/dsh-llm'),
  importValues = () => import('@deepseek-ai/dsh-util-values'),
} = {}) {
  const protocol = await importProtocol();
  if (typeof protocol?.deepFreeze === 'function') return protocol;
  const values = await importValues();
  return typeof values?.deepFreeze === 'function'
    ? { ...protocol, deepFreeze: values.deepFreeze }
    : protocol;
}

/**
 * Optional Host adapter for DSH 0.1.1-rc.2 and 0.2.0-rc.2. Uses the public default-model
 * selection and LLM stream services; never reads credential values, settings,
 * session history, or a Client's private model-selection state.
 *
 * The protocol import remains lazy so a missing optional model dependency
 * cannot prevent the interview catalog or existing practices from loading.
 * loadProtocol and timeoutMs are injection seams for deterministic tests.
 */
export function createDshModelAdapter(ctx, {
  loadProtocol = loadDshModelProtocol,
  timeoutMs = REQUEST_TIMEOUT_MS,
} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > REQUEST_TIMEOUT_MS) throw new TypeError('Invalid model request timeout');
  let lastOutcome;

  function providerDirectory(llm) {
    if (typeof llm?.listProviders !== 'function') return [];
    const providers = llm.listProviders();
    if (!Array.isArray(providers)) return [];
    return providers.filter(item => textIdentifier(item?.id)).map(item => ({
      id: item.id,
      name: textIdentifier(item.name) ? item.name : item.id,
    })).slice(0, MAX_MODEL_PROVIDERS);
  }

  function route(requested) {
    try {
      const llm = ctx.get('llm');
      const selection = requested ?? ctx.get('agentDefaultModel')?.currentSelection();
      if (!selection || !textIdentifier(selection.provider) || !textIdentifier(selection.model)) return {};
      const selected = {
        provider: selection.provider, model: selection.model,
        ...requested === undefined && textIdentifier(selection.reasoningEffort) ? { reasoningEffort: selection.reasoningEffort } : {},
      };
      const providers = providerDirectory(llm);
      const mounted = providers.some(item => item.id === selected.provider);
      const available = typeof llm?.stream === 'function' && mounted;
      return { llm, selected, requested, mounted, available, providers };
    } catch { return {}; }
  }

  function basicStatus(current, source = 'dsh-default') {
    const selection = current.selected;
    const sameOutcome = selection && lastOutcome?.route === JSON.stringify(selection) ? lastOutcome : undefined;
    return {
      available: current.available === true,
      ...(selection ?? {}),
      source,
      verified: sameOutcome?.ok === true,
      providers: current.providers ?? [],
      message: !current.available ? MESSAGES.MODEL_UNAVAILABLE
        : sameOutcome?.ok ? '使用 DSH 默认模型；此配置已在当前工作台完成模型调用。'
          : sameOutcome?.message ?? '使用 DSH 默认模型；提供方已挂载，尚未验证模型连接或凭据。',
    };
  }

  async function listedModels(llm, provider) {
    if (typeof llm?.listModels !== 'function') return { ok: false, models: [] };
    let timer;
    try {
      const pending = Promise.resolve().then(() => llm.listModels(provider));
      const timeout = new Promise(resolve => { timer = setTimeout(() => resolve(undefined), MODEL_LIST_TIMEOUT_MS); });
      const value = await Promise.race([pending, timeout]);
      if (!Array.isArray(value)) return { ok: false, models: [] };
      return { ok: true, models: value.filter(item => textIdentifier(item?.id)).slice(0, MAX_MODELS_PER_PROVIDER) };
    } catch {
      return { ok: false, models: [] };
    } finally {
      clearTimeout(timer);
    }
  }

  async function modelChoices() {
    let llm;
    try { llm = ctx.get('llm'); } catch { return []; }
    let providers;
    try { providers = providerDirectory(llm); } catch { return []; }
    if (typeof llm?.listModels !== 'function') return [];
    const groups = await Promise.all(providers.map(async provider => {
      const listed = await listedModels(llm, provider.id);
      if (!listed.ok) return [];
      return listed.models.map(item => ({
        provider: provider.id,
        model: item.id,
        label: textIdentifier(item.name) ? item.name : item.id,
      }));
    }));
    const seen = new Set();
    return groups.flat().filter(item => {
      const key = `${item.provider}\u0000${item.model}`;
      if (seen.has(key) || seen.size >= MAX_MODEL_CHOICES) return false;
      seen.add(key);
      return true;
    });
  }

  async function statusFor(value) {
    let requested;
    try { requested = modelChoice(value); } catch (error) {
      return { available: false, verified: false, source: 'dsh-choice', message: error.message, code: error.code };
    }
    const current = route(requested);
    const statusValue = basicStatus(current, 'dsh-choice');
    if (!requested) return statusValue;
    if (!current.mounted) return { ...statusValue, available: false, verified: false, code: 'NO_ADAPTER', message: MESSAGES.NO_ADAPTER };
    const listed = await listedModels(current.llm, requested.provider);
    if (!listed.ok || !listed.models.some(item => item.id === requested.model)) {
      return { ...statusValue, available: false, verified: false, code: 'UNKNOWN_MODEL', message: MESSAGES.UNKNOWN_MODEL };
    }
    return { ...statusValue, available: current.available === true, code: undefined,
      message: statusValue.verified ? '使用已选择的 DSH 模型；此配置已在当前工作台完成模型调用。' : '使用已选择的 DSH 模型；提供方已挂载，尚未验证模型连接或凭据。' };
  }

  function status(options) {
    if (options && typeof options === 'object' && Object.hasOwn(options, 'modelChoice')) return statusFor(options.modelChoice);
    return basicStatus(route());
  }

  async function complete({ system, prompt, signal, sessionId, modelChoice: requestedChoice } = {}) {
    aborted(signal);
    if (typeof system !== 'string' || !system.trim() || typeof prompt !== 'string' || !prompt.trim()
      || system.length + prompt.length > MAX_INPUT_CHARS) throw failure('MODEL_INPUT_INVALID');
    const requested = modelChoice(requestedChoice);
    const current = route(requested);
    const { llm, selected, available, mounted } = current;
    if (!available) throw failure(requested ? (mounted ? 'UNKNOWN_MODEL' : 'NO_ADAPTER') : 'MODEL_UNAVAILABLE');
    const routeKey = JSON.stringify(selected);
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(failure('TIMEOUT')), timeoutMs);
    const callSignal = signal ? AbortSignal.any([signal, deadline.signal]) : deadline.signal;
    let iterator;
    let completed = false;
    try {
      if (requested) {
        const listed = await listedModels(llm, requested.provider);
        if (!listed.ok || !listed.models.some(item => item.id === requested.model)) throw failure('UNKNOWN_MODEL');
      }
      let protocol;
      try { protocol = await abortable(loadProtocol(), callSignal); }
      catch (error) {
        aborted(callSignal);
        throw failure('MODEL_PROTOCOL_UNAVAILABLE');
      }
      const { BlockAssembler, createUserMessage, deepFreeze } = protocol;
      if (![BlockAssembler, createUserMessage, deepFreeze].every(value => typeof value === 'function')) throw failure('MODEL_PROTOCOL_UNAVAILABLE');
      aborted(callSignal);
      const options = deepFreeze({
        ...selected, system,
        messages: [createUserMessage({ content: [{ type: 'text', text: prompt }], source: { kind: 'plugin:dsh-interview-workbench' } })],
        maxTokens: MAX_OUTPUT_TOKENS,
        signal: callSignal,
        ...(textIdentifier(sessionId) ? { sessionId } : {}),
      });
      // No tools, tool loop, or undocumented responseFormat/purpose is passed.
      iterator = llm.stream(options)[Symbol.asyncIterator]();
      const assembler = new BlockAssembler();
      let terminal;
      let outputChars = 0;
      for (;;) {
        aborted(callSignal);
        const chunk = await abortable(iterator.next(), callSignal);
        aborted(callSignal);
        if (chunk.done) { completed = true; break; }
        if (terminal) throw failure('MODEL_OUTPUT_INVALID');
        const value = chunk.value;
        if (!value || typeof value !== 'object') throw failure('MODEL_OUTPUT_INVALID');
        if (value.type === 'tool-call-delta' || (value.type === 'block-start' && value.blockType === 'tool-call')
          || (value.type === 'block-end' && value.block?.type === 'tool-call')) throw failure('MODEL_OUTPUT_INVALID');
        if (value.type === 'text-delta' || value.type === 'reasoning-delta') outputChars += typeof value.text === 'string' ? value.text.length : MAX_OUTPUT_CHARS + 1;
        if (value.type === 'block-end' && ['text', 'reasoning'].includes(value.block?.type)) outputChars += typeof value.block.text === 'string' ? value.block.text.length : MAX_OUTPUT_CHARS + 1;
        if (outputChars > MAX_OUTPUT_CHARS) throw failure('MAX_TOKENS');
        assembler.push(value);
        if (value.type === 'finish') terminal = value.reason;
      }
      if (!terminal) throw failure('MODEL_OUTPUT_INVALID');
      if (terminal.kind === 'error') throw failure(terminal.failure?.code);
      if (terminal.kind === 'aborted') throw failure('ABORTED');
      if (terminal.kind === 'max-tokens') throw failure('MAX_TOKENS');
      if (terminal.kind !== 'stop') throw failure('MODEL_OUTPUT_INVALID');
      const blocks = assembler.blocks();
      if (blocks.some(block => !['text', 'reasoning'].includes(block.type))) throw failure('MODEL_OUTPUT_INVALID');
      const text = blocks.filter(block => block.type === 'text').map(block => block.text).join('\n').trim();
      if (!text) throw failure('MODEL_OUTPUT_INVALID');
      aborted(callSignal);
      lastOutcome = { route: routeKey, ok: true };
      return { text, provider: selected.provider, model: selected.model };
    } catch (error) {
      const safe = callSignal.aborted ? failure(callSignal.reason?.code === 'TIMEOUT' ? 'TIMEOUT' : 'ABORTED')
        : failure(error?.code);
      lastOutcome = { route: routeKey, ok: false, message: safe.message };
      throw safe;
    } finally {
      clearTimeout(timer);
      // Closing a canceled misbehaving iterator must not stall unload or a new
      // request. Its late cleanup rejection is observed without storing output.
      if (!completed && iterator?.return) {
        if (!deadline.signal.aborted) deadline.abort(failure('ABORTED'));
        try { Promise.resolve(iterator.return()).catch(() => {}); } catch {}
      }
    }
  }

  return Object.freeze({ status, statusFor, modelChoices, complete });
}
