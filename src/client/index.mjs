import * as React from 'react';
import { TYPERT_REMOTE, METHODS } from '../remote.mjs';
import { InterviewWorkbench, InterviewWorkbenchErrorBoundary } from './components.mjs';
import { INTERVIEW_STYLES } from './styles.mjs';
import { createScopedStorage, createPromptStager } from './session-bridge.mjs';
import { WorkspaceIcon, WorkspaceNavigation } from './workspace.mjs';
import { WORKSPACE_STYLES } from './workspace-styles.mjs';
import { createConnectionAwareCall } from './connection.mjs';
import { KNOWLEDGE_STYLES } from './knowledge-styles.mjs';
import { LEARNING_STYLES } from './learning-styles.mjs';
import { AI_RUN_STYLES } from './ai-run.mjs';

export const inject = ['slots', 'remote', 'sessions', 'conversation'];
const WORKSPACE_PANEL_ID = 'dsh-interview-workspace';
export function apply(ctx) {
  let alive = true;
  const listeners = new Set();
  const opened = new Set();
  const activeViews = new Set();
  const abort = new AbortController();
  const disposers = [];
  const completedJobs = new Set();
  // DSH 0.2 exposes the independent center-panel contract through the
  // layout service.  Keep this lookup optional so the 0.1 surface fallback
  // remains available when the service is absent.
  const layout = ctx.get?.('layout');
  const nativeLayout = layout && typeof layout.selectPanel === 'function' ? layout : null;
  const emit = () => { if (alive) for (const listener of listeners) listener(); };
  const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
  let workspaceState = { active: false, available: Boolean(nativeLayout), revision: 0, connection: 'online' };
  const updateWorkspace = patch => {
    if (!alive || Object.entries(patch).every(([key, value]) => workspaceState[key] === value)) return;
    workspaceState = { ...workspaceState, ...patch }; emit();
  };
  const syncNativePanel = () => {
    if (!nativeLayout) return;
    const activePanelId = nativeLayout.panelInfo?.getSnapshot?.().activePanelId;
    updateWorkspace({ active: activePanelId === WORKSPACE_PANEL_ID, available: true });
  };
  const workspace = {
    subscribe, getSnapshot: () => workspaceState,
    open: () => {
      if (nativeLayout) nativeLayout.selectPanel(WORKSPACE_PANEL_ID);
      updateWorkspace({ active: true, available: nativeLayout ? true : workspaceState.available });
    },
    close: () => {
      if (nativeLayout) nativeLayout.selectPanel(null);
      updateWorkspace({ active: false });
    },
    setAvailable: available => updateWorkspace({ available }),
  };
  if (nativeLayout) {
    syncNativePanel();
    const unsubscribe = nativeLayout.panelInfo?.subscribe?.(syncNativePanel);
    if (typeof unsubscribe === 'function') disposers.push(unsubscribe);
  }
  const setOpen = (sessionId, value) => { if (!alive) return; value ? opened.add(sessionId) : opened.delete(sessionId); emit(); };
  const stage = createPromptStager({ sessions: ctx.sessions, conversation: ctx.conversation, isAlive: () => alive });
  const ready = Promise.resolve(ctx.remote.$mount(TYPERT_REMOTE)).then(dispose => {
    if (!alive) dispose?.();
    else if (typeof dispose === 'function') disposers.push(dispose);
  });
  ready.catch(() => {});
  const invoke = createConnectionAwareCall(async (method, request = {}) => {
    await ready;
    abort.signal.throwIfAborted();
    const remote = ctx.get('remote.interviewWorkbench');
    if (typeof remote?.[method] !== 'function') throw new Error('面试服务尚未连接，请稍后重试。');
    const wireRequest = Object.fromEntries(Object.entries(request).filter(([, value]) => value !== undefined));
    const result = await remote[method](wireRequest, abort.signal);
    if (result && typeof result === 'object' && Object.hasOwn(result, 'ok')) {
      if (!result.ok) throw new Error(result.error?.message ?? '面试服务请求失败');
    }
    const value = result && typeof result === 'object' && Object.hasOwn(result, 'ok') ? result.value : result;
    if (['start', 'answer', 'review', 'finish', 'rename', 'sourceQuestion', 'saveGeneratedQuestions'].includes(method)) updateWorkspace({ revision: workspaceState.revision + 1 });
    if (['aiJob', 'cancelAiJob'].includes(method) && value?.status === 'succeeded' && !completedJobs.has(value.id)) {
      completedJobs.add(value.id); if (completedJobs.size > 100) completedJobs.delete(completedJobs.values().next().value);
      updateWorkspace({ revision: workspaceState.revision + 1 });
    }
    return value;
  }, connection => updateWorkspace({ connection }));
  const api = Object.fromEntries(METHODS.map(method => [method, request => invoke(method, request)]));
  function SessionWorkbench({ sessionId, useSessions, dock = false }) {
    const connection = React.useSyncExternalStore(subscribe, () => workspaceState.connection, () => 'online');
    const title = useSessions(state => state.byId[sessionId]?.displayTitle ?? '新会话');
    const storage = React.useMemo(() => createScopedStorage(sessionId), [sessionId]);
    const onClose = dock ? () => setOpen(sessionId, false) : undefined;
    return React.createElement(InterviewWorkbenchErrorBoundary, { key: sessionId, embedded: true, onClose },
      React.createElement(InterviewWorkbench, {
        key: sessionId, api, embedded: true, recoveryStorage: storage, sessionTitle: title, onClose, connectionAvailable: connection !== 'offline',
        onStagePrompt: text => { const result = stage(sessionId, text); if (dock) setOpen(sessionId, false); return result; },
      }));
  }
  function NativeView(props) {
    React.useLayoutEffect(() => {
      activeViews.add(props.sessionId); opened.delete(props.sessionId); emit();
      return () => { activeViews.delete(props.sessionId); emit(); };
    }, [props.sessionId]);
    return React.createElement(SessionWorkbench, props);
  }
  function Launcher({ sessionId }) {
    const inView = React.useSyncExternalStore(subscribe, () => activeViews.has(sessionId), () => false);
    const expanded = React.useSyncExternalStore(subscribe, () => opened.has(sessionId), () => false);
    return React.createElement('button', {
      type: 'button', className: 'diw-conversation-launcher', 'aria-label': '面试训练', 'aria-expanded': expanded,
      'aria-pressed': inView || expanded, disabled: inView,
      title: inView ? '正在上方的面试训练标签中练习' : '在当前会话中打开面试训练',
      onClick: () => workspaceState.available ? workspace.open() : setOpen(sessionId, !expanded),
    }, React.createElement('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true },
      React.createElement('path', { d: 'M4 4h6c1.5 0 2 1 2 2v15c0-1.5-1-2-2-2H4zM20 4h-6c-1.5 0-2 1-2 2v15c0-1.5 1-2 2-2h6z' })), '面试训练');
  }
  function Dock(props) {
    const visible = React.useSyncExternalStore(subscribe, () => opened.has(props.sessionId) && !activeViews.has(props.sessionId), () => false);
    return visible ? React.createElement('div', { className: 'diw-native-dock', 'aria-label': '当前会话的面试训练面板' },
      React.createElement(SessionWorkbench, { ...props, dock: true })) : null;
  }
  if (nativeLayout) {
    // `main` is a keyed root slot in DSH 0.2. The sidebar owns the actual
    // button and selects the same key, so the workbench gets a full center
    // panel instead of trying to move host-owned DOM nodes.
    const disposeMain = ctx.slots.inject('main', () => ctx.slots.register({
      name: 'main', key: WORKSPACE_PANEL_ID,
    }, props => React.createElement(WorkspaceNavigation, {
      api, controller: workspace, native: true, layout: nativeLayout,
      useSessions: props.useSessions, useWorkspaces: props.useWorkspaces,
      usePanelInfo: props.usePanelInfo,
      onChooseSession: id => { if (!alive) throw new Error('工作区已关闭'); ctx.sessions.open(id); },
      onStagePrompt: (id, text) => { const result = stage(id, text); workspace.close(); return result; },
    })));
    if (typeof disposeMain === 'function') disposers.push(disposeMain);
    const disposePanelIcon = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist', id: WORKSPACE_PANEL_ID, order: 15, label: '面试训练',
    }, ({ size }) => React.createElement(WorkspaceIcon, { size })));
    if (typeof disposePanelIcon === 'function') disposers.push(disposePanelIcon);
  }
  // Inner session Slots remain usable when the version-scoped global layout is unavailable.
  // In 0.2 the native main panel owns the full workbench; mounting the old
  // DOM surface alongside it would produce a duplicate fallback/toast.
  const sessionEntries = [
    ['conversation.view', 'dsh-interview-workbench', NativeView],
    ['conversation.input.left', 'dsh-interview-workbench-launcher', Launcher],
    ['conversation.input.dock', 'dsh-interview-workbench-dock', Dock],
  ];
  if (!nativeLayout) sessionEntries.unshift(['shell.overlay', WORKSPACE_PANEL_ID, props => React.createElement(WorkspaceNavigation, {
    api, controller: workspace, useSessions: props.useSessions, useWorkspaces: props.useWorkspaces,
    onChooseSession: id => { if (!alive) throw new Error('工作区已关闭'); ctx.sessions.open(id); },
    onStagePrompt: (id, text) => { const result = stage(id, text); workspace.close(); return result; },
  })]);
  for (const [name, id, component] of sessionEntries) {
    const dispose = ctx.slots.inject(name, () => ctx.slots.register({ name, id, order: 15, label: '面试训练' }, component));
    if (typeof dispose === 'function') disposers.push(dispose);
  }
  ctx.effect(() => {
    const style = document.createElement('style');
    style.dataset.interviewWorkbench = 'styles';
    style.textContent = INTERVIEW_STYLES + WORKSPACE_STYLES + KNOWLEDGE_STYLES + LEARNING_STYLES + AI_RUN_STYLES;
    document.head.appendChild(style);
    return () => style.remove();
  }, 'interview-workbench: owned styles');
  ctx.effect(() => () => {
    alive = false; abort.abort(); listeners.clear(); opened.clear(); activeViews.clear();
    for (const dispose of disposers.splice(0).reverse()) dispose();
  }, 'interview-workbench: client cleanup');
}
export default { inject, apply };
