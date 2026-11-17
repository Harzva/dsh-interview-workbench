import * as React from 'react';
import { createPortal } from 'react-dom';
import { InterviewWorkbench, InterviewWorkbenchErrorBoundary } from './components.mjs';
import { createScopedStorage } from './session-bridge.mjs';
import { attachWorkspaceSurface } from './workspace-surface.mjs';

const h = React.createElement;
const EMPTY_SURFACE = Object.freeze({ navigation: null, library: null, center: null, wide: true, available: false, status: 'pending' });
const noopSubscribe = () => () => {};
const emptySnapshot = () => EMPTY_SURFACE;
const trackTitle = track => track === 'agent-engineer' ? 'Agent 工程' : 'AI 算法';
const modeTitle = mode => mode === 'mock' ? '模拟面试' : '教练练习';
const finished = record => record?.status === 'finished';
const dateTitle = value => new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const recordTitle = record => record?.title || record?.previewTitle || record?.questions?.[0]?.title || `${trackTitle(record?.track)} · ${modeTitle(record?.mode)}`;
const VIEW_TITLES = { overview: '训练总览', sprint: '7 天速成', new: '新训练', bank: '岗位题库', practice: '当前训练', history: '训练记录', learning: '学习记忆', experiences: '面试经验', sources: '资料与出题' };
function activityGroup(record) {
  const date = new Date(record.updatedAt || record.createdAt);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  return date >= today ? '今天' : date >= yesterday ? '昨天' : '更早';
}

export function WorkspaceIcon({ name = 'book', size = 17 }) {
  return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
    h('path', { d: name === 'plus' ? 'M12 5v14M5 12h14' : name === 'back' ? 'M19 12H5m7-7-7 7 7 7' : name === 'refresh' ? 'M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m12 9a9 9 0 0 1-15 2' : 'M4 4h6c1.5 0 2 1 2 2v15c0-1.5-1-2-2-2H4zM20 4h-6c-1.5 0-2 1-2 2v15c0-1.5 1-2 2-2h6z' }));
}

/** Global library and training presentation; DSH owns the real conversation selection. */
export function WorkspaceNavigation({ api, controller, useSessions, useWorkspaces, onChooseSession, onStagePrompt, native = false }) {
  const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const sessions = useSessions(value => value);
  const archived = useWorkspaces(value => value.archivedSessionIds);
  const sessionId = sessions.current;
  const targetSession = sessions.byId[sessionId];
  const availableSessions = sessions.ids.map(id => sessions.byId[id]).filter(item => item && item.origin !== 'subagent' && !(archived ?? []).includes(item.id));
  const [surface, setSurface] = React.useState(null);
  const targets = React.useSyncExternalStore(surface?.subscribe ?? noopSubscribe, surface?.getSnapshot ?? emptySnapshot, emptySnapshot);
  const [activated, setActivated] = React.useState(false);
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [readonly, setReadonly] = React.useState(false);
  const [persistence, setPersistence] = React.useState('');
  const [error, setError] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [refresh, setRefresh] = React.useState(0);
  const [selectedPractice, setSelectedPractice] = React.useState(null);
  const [currentView, setCurrentView] = React.useState('overview');
  const [busy, setBusy] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [renameTitle, setRenameTitle] = React.useState('');
  const [renameBusy, setRenameBusy] = React.useState(false);
  const [actionError, setActionError] = React.useState('');
  const [entryRequest, setEntryRequest] = React.useState(null);
  const [mobileListOpen, setMobileListOpen] = React.useState(false);
  const sequence = React.useRef(0);
  const anchor = React.useRef(null);
  const mobileList = React.useRef(null);
  const listTrigger = React.useRef(null);
  const renameInput = React.useRef(null);
  const alive = React.useRef(true);
  const renameLock = React.useRef(false);
  // A global work area has its own stable cursor. Changing the target DSH
  // conversation must not remount the training editor or exchange its drafts.
  const recoveryStorage = React.useMemo(() => createScopedStorage('workspace:global:v1'), []);
  const mockLocked = selectedPractice?.mode === 'mock' && !finished(selectedPractice) && !readonly;
  const interactionBusy = busy || renameBusy;
  const offline = state.connection === 'offline';
  const emptyTargetReason = !targetSession ? '先返回 DSH 建立会话，再选择要继续训练的对话。' : '';
  // A native DSH 0.2 main panel is mounted only after layout.selectPanel()
  // chooses it. The legacy overlay still follows controller.active.
  const visible = native || state.active;

  React.useEffect(() => {
    alive.current = true;
    if (native) {
      controller.setAvailable?.(true);
      return () => { alive.current = false; };
    }
    const attached = attachWorkspaceSurface({
      anchor: anchor.current,
      onExit: () => controller.close(),
      onChange: value => controller.setAvailable(value.available),
    });
    setSurface(attached);
    return () => { alive.current = false; attached.dispose(); };
  }, [controller, native]);
  React.useEffect(() => {
    if (visible) {
      if (activated) setEntryRequest({ refresh: true, id: ++sequence.current });
      setActivated(true);
    }
    if (!native) surface?.setActive(state.active);
    if (!visible) setMobileListOpen(false);
  }, [native, surface, state.active, visible]);
  React.useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setLoading(true);
    api.snapshot({ limit: 1 }).then(value => {
      if (!cancelled) { setRecords(value.practices); setReadonly(value.readonly === true); setPersistence(value.readonly ? '只读浏览' : value.persistence?.mode === 'file' ? '本地保存' : '临时保存'); setError(''); setLoading(false); }
    }).catch(cause => { if (!cancelled) { setError(cause.message ?? String(cause)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [api, state.revision, refresh, visible]);
  React.useEffect(() => { if (mobileListOpen) mobileList.current?.focus(); }, [mobileListOpen]);
  React.useEffect(() => { if (renaming) { renameInput.current?.focus(); renameInput.current?.select(); } }, [renaming]);
  React.useEffect(() => { setRenaming(false); setActionError(''); }, [selectedPractice?.id, currentView]);

  function request(value) {
    if (interactionBusy) return;
    setRenaming(false); setActionError('');
    setEntryRequest({ ...value, id: ++sequence.current });
    setMobileListOpen(false);
  }
  async function saveTitle(event) {
    event.preventDefault();
    if (!selectedPractice || readonly || offline || interactionBusy || renameLock.current) return;
    renameLock.current = true; setRenameBusy(true); setActionError('');
    try {
      const value = await api.rename({ practiceId: selectedPractice.id, title: renameTitle });
      if (!alive.current) return;
      setSelectedPractice(value); setRenaming(false);
      setEntryRequest({ refresh: true, id: ++sequence.current });
      setRefresh(current => current + 1);
    } catch (cause) { if (alive.current) setActionError(cause.message ?? String(cause)); }
    finally { renameLock.current = false; if (alive.current) setRenameBusy(false); }
  }
  function toggleList(open) {
    setMobileListOpen(open);
    if (!open) listTrigger.current?.focus();
  }
  const visibleRecords = records.filter(record => (filter === 'all' || (filter === 'finished') === finished(record))
    && `${recordTitle(record)} ${record.previewTitle || ''} ${trackTitle(record.track)} ${modeTitle(record.mode)} ${dateTitle(record.createdAt)}`.toLowerCase().includes(search.toLowerCase().trim()));
  const groups = ['今天', '昨天', '更早'].map(label => ({ label, items: visibleRecords.filter(record => activityGroup(record) === label) })).filter(group => group.items.length);
  const counts = { all: records.length, active: records.filter(record => !finished(record)).length, finished: records.filter(finished).length };

  function library(mobile = false) {
    return h('section', { className: 'diw-workspace-library', 'aria-label': mobile ? '面试训练记录选择' : '面试工作区训练记录' },
      h('header', { className: 'diw-workspace-library-heading' }, h('div', null, h('strong', null, '训练空间')),
        mobile && h('button', { type: 'button', onClick: () => toggleList(false) }, '关闭列表')),
      h('button', { type: 'button', className: 'diw-workspace-new', disabled: interactionBusy || mockLocked || readonly || offline || loading, title: offline ? '连接恢复后可新建训练' : readonly ? '当前工作区为只读模式' : mockLocked ? '结束当前模拟面试后可开始新训练' : '选择岗位与练习模式', onClick: () => request({ view: 'new' }) }, h(WorkspaceIcon, { name: 'plus' }), '新训练'),
      h('label', { className: 'diw-workspace-search' }, h('span', null, '搜索训练记录'), h('input', { type: 'search', placeholder: '搜索名称、题目或岗位', value: search, onChange: event => setSearch(event.target.value) })),
      h('div', { className: 'diw-workspace-filters', role: 'group', 'aria-label': '训练记录状态' }, [{ id: 'all', label: '全部' }, { id: 'active', label: '进行中' }, { id: 'finished', label: '已完成' }].map(item => h('button', { key: item.id, type: 'button', 'aria-pressed': filter === item.id, onClick: () => setFilter(item.id) }, item.label, h('span', null, counts[item.id])))),
      h('div', { className: 'diw-workspace-records', 'aria-busy': loading },
        error && !offline && h('div', { className: 'diw-workspace-list-error', role: 'alert' }, error, h('button', { type: 'button', onClick: () => setRefresh(value => value + 1) }, '重试')),
        !records.length && loading ? h('p', { className: 'diw-workspace-list-empty diw-workspace-record-loading' }, '正在读取训练记录…') : groups.map(group => h('div', { key: group.label, className: 'diw-workspace-record-group' },
          h('h3', { className: 'diw-workspace-group-label' }, group.label), group.items.map(record => h('button', {
            key: record.id, type: 'button', className: 'diw-workspace-record', 'aria-current': currentView === 'practice' && selectedPractice?.id === record.id ? 'page' : undefined,
            title: recordTitle(record), disabled: interactionBusy || (mockLocked && selectedPractice.id !== record.id), onClick: () => request({ practiceId: record.id }),
          }, h('strong', null, recordTitle(record)), h('span', { className: 'diw-workspace-record-meta' }, `${trackTitle(record.track)} · ${modeTitle(record.mode)}`),
          h('span', { className: 'diw-workspace-record-status', 'data-status': record.status }, finished(record) ? '已完成' : '进行中', h('span', null, `已作答 ${record.answeredCount} / ${record.questionCount}`)),
          h('progress', { value: record.answeredCount, max: Math.max(1, record.questionCount), 'aria-label': `${recordTitle(record)}作答进度` }),
          h('small', { title: '最近活动时间' }, dateTitle(record.updatedAt || record.createdAt)))))),
        !loading && !error && !visibleRecords.length && h('p', { className: 'diw-workspace-list-empty' }, records.length ? '没有匹配的训练记录。' : '从新训练开始，作答与复盘会显示在这里。')),
      h('footer', { className: 'diw-workspace-library-footer' }, `${records.length} 轮训练${persistence ? ` · ${persistence}` : ''}`));
  }

  const center = h('section', { className: 'diw-workspace-center', 'data-view': currentView, 'aria-label': '独立面试工作区' },
    h('header', { className: 'diw-workspace-toolbar' }, h('div', null,
      h('button', { type: 'button', className: 'diw-workspace-home', disabled: interactionBusy || mockLocked, onClick: () => request({ view: 'overview' }) }, '面试工作区'),
      renaming ? h('form', { className: 'diw-workspace-rename', 'aria-label': '重命名训练', onSubmit: saveTitle },
        h('input', { ref: renameInput, 'aria-label': '训练名称', value: renameTitle, maxLength: 80, placeholder: selectedPractice?.previewTitle || selectedPractice?.questions?.[0]?.title || '留空使用题目名称', disabled: renameBusy, onChange: event => setRenameTitle(event.target.value), onKeyDown: event => { if (event.key === 'Escape' && !renameBusy) setRenaming(false); } }),
        h('button', { type: 'submit', disabled: interactionBusy }, renameBusy ? '保存中…' : '保存名称'), h('button', { type: 'button', disabled: renameBusy, onClick: () => setRenaming(false) }, '取消'), h('small', null, '留空可恢复题目名称'))
        : h('h1', null, currentView === 'practice' && selectedPractice ? recordTitle(selectedPractice) : VIEW_TITLES[currentView] || '面试工作区')),
      h('div', { className: 'diw-workspace-toolbar-actions' },
        currentView === 'practice' && selectedPractice && !renaming && h('button', { type: 'button', disabled: readonly || offline || interactionBusy, onClick: () => { setRenameTitle(selectedPractice.title || ''); setRenaming(true); setActionError(''); } }, '重命名'),
        h('button', { type: 'button', ref: listTrigger, 'data-workspace-list-toggle': '', 'aria-expanded': mobileListOpen, onClick: () => toggleList(!mobileListOpen) }, '训练列表'),
        h('button', { type: 'button', title: '刷新训练数据', 'aria-label': '刷新工作区训练数据', disabled: loading || interactionBusy, onClick: () => { setRefresh(value => value + 1); request({ refresh: true }); } }, h(WorkspaceIcon, { name: 'refresh' })),
        h('button', { type: 'button', onClick: controller.close }, h(WorkspaceIcon, { name: 'back' }), '返回 DSH'))),
    actionError && !offline && h('div', { className: 'diw-workspace-list-error', role: 'alert' }, actionError),
    offline && h('div', { className: 'diw-workspace-connection', role: 'alert' }, h('div', null,
      h('strong', null, '面试服务连接已中断'), h('p', null, '已有草稿仍在。恢复后先检查训练记录，确认上次操作是否完成。')),
      h('button', { type: 'button', disabled: loading || interactionBusy, onClick: () => { setRefresh(value => value + 1); request({ refresh: true }); } }, loading ? '正在连接…' : '重新连接')),
    h('details', { className: 'diw-workspace-context' },
      h('summary', null, '与面试教练继续讨论'),
      h('label', null, h('span', null, '继续训练的对话'), h('select', { 'aria-label': '继续训练的 DSH 对话', value: sessionId ?? '', onChange: event => { try { onChooseSession(event.target.value); setError(''); } catch (cause) { setError(cause.message ?? String(cause)); } } },
        !availableSessions.some(item => item.id === sessionId) && h('option', { value: sessionId ?? '', disabled: true }, targetSession?.displayTitle ?? '尚未选择 DSH 对话'),
        availableSessions.map(item => h('option', { key: item.id, value: item.id }, `${item.displayTitle}${item.blank ? ' · 尚未发送' : ''}`)))),
      h('small', null, emptyTargetReason || '在题目中点击“放入当前对话”，检查草稿后发送。')),
    mobileListOpen && h('div', { className: 'diw-workspace-mobile-library', ref: mobileList, tabIndex: -1, role: 'region', 'aria-label': '选择训练记录', onKeyDown: event => { if (event.key === 'Escape') { event.stopPropagation(); toggleList(false); } } }, library(true)),
    h('div', { className: 'diw-workspace-content' }, activated && h(InterviewWorkbenchErrorBoundary, { embedded: true, onClose: controller.close }, h(InterviewWorkbench, {
      api, embedded: true, recoveryStorage, sessionTitle: targetSession?.displayTitle ?? '', connectionAvailable: !offline,
      entryRequest, onPracticeState: setSelectedPractice, onBusyChange: setBusy, onReadonlyChange: setReadonly, onViewChange: setCurrentView, draftScope: 'workspace',
      onStagePrompt: text => onStagePrompt(sessionId, text), stageDisabledReason: emptyTargetReason,
    }))));

  if (native) {
    return h('div', { className: 'diw-workspace-native', 'data-diw-workspace-native': 'true', 'aria-label': '面试训练工作区' }, library(), center);
  }
  return h(React.Fragment, null, h('span', { hidden: true, ref: anchor, 'data-diw-workspace-anchor': '' }),
    targets.available && h(React.Fragment, null,
      createPortal(h('button', { type: 'button', className: 'diw-workspace-entry', title: state.active ? '返回 DSH' : '打开独立面试工作区', 'aria-label': '面试工作区', 'aria-pressed': state.active, onClick: state.active ? controller.close : controller.open }, h(WorkspaceIcon), h('span', null, '面试')), targets.navigation),
      createPortal(library(), targets.library), createPortal(center, targets.center)),
    targets.status === 'unavailable' && state.active && h('div', { className: 'diw-workspace-fallback', role: 'status' }, '当前布局无法打开独立工作区，请使用会话内的“面试训练”。', h('button', { type: 'button', onClick: controller.close }, '关闭')));
}
