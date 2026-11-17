export const CONNECTION_LOST_MESSAGE = '面试服务连接已中断。草稿已保留；重新连接后先检查训练记录，再重试未完成的操作。';

const NETWORK_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ENETUNREACH', 'EHOSTUNREACH', 'ERR_NETWORK', 'ERR_CONNECTION_REFUSED', 'ERR_CONNECTION_RESET']);
const NETWORK_MESSAGE = /\b(?:failed\s+to\s+fetch|fetch\s+failed|NetworkError\b|net::ERR_(?:CONNECTION_REFUSED|CONNECTION_RESET|INTERNET_DISCONNECTED|NETWORK_CHANGED|NAME_NOT_RESOLVED))\b/i;

/** Inspect only explicit transport signals, including an Error's bounded cause chain. */
export function isTransportFailure(error) {
  const chain = []; const seen = new Set();
  for (let value = error; value != null && chain.length < 8 && !seen.has(value); value = typeof value === 'object' ? value.cause : undefined) {
    seen.add(value); chain.push(value);
  }
  // Cancellation must never look like a lost connection, even if an adapter wraps it.
  if (chain.some(value => value?.name === 'AbortError' || value?.code === 'ABORT_ERR')) return false;
  if (chain.some(value => typeof value?.code === 'string' && value.code.startsWith('DOMAIN_'))) return false;
  // A server response (including a failure) is evidence that the transport connected.
  if (chain.some(value => Number.isInteger(value?.status) && value.status >= 100 && value.status <= 599)) return false;
  return chain.some(value => value?.name === 'NetworkError'
    || NETWORK_CODES.has(value?.code)
    || NETWORK_MESSAGE.test(typeof value === 'string' ? value : typeof value?.message === 'string' ? value.message : ''));
}

/** One dispatch only: a failed response does not establish whether a write committed. */
export function createConnectionAwareCall(call, onConnectionChange = () => {}) {
  const report = status => {
    // A status observer must not turn an already committed operation into a failure.
    try { onConnectionChange(status); } catch {}
  };
  return async function (...args) {
    let result;
    try { result = await call.apply(this, args); }
    catch (cause) {
      if (!isTransportFailure(cause)) throw cause;
      report('offline');
      const error = new Error(CONNECTION_LOST_MESSAGE, { cause });
      error.name = 'InterviewConnectionError'; error.code = 'INTERVIEW_CONNECTION_OFFLINE';
      throw error;
    }
    report('online');
    return result;
  };
}
