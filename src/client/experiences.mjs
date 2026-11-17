import * as React from 'react';
import { InterviewContent } from './content.mjs';
import { EXPERIENCE_STYLES } from './experience-styles.mjs';
import { readDraft, writeDraft } from './drafts.mjs';
import { EXPERIENCE_ROUNDS, EXPERIENCE_GAPS } from '../content/interview-playbooks.mjs';

const h = React.createElement;
const { useEffect, useRef, useState } = React;
const kindLabels = { personal: '亲历面试', practice: '模拟练习', source: '资料提炼' };
const statusLabels = { planned: '待改进', practicing: '复练中', verified: '已复练验证' };
const blank = track => ({ track, kind: 'practice', round: 'second', status: 'planned', category: '项目证据', date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), title: '', company: '', role: '', questions: '', actualAnswer: '', gap: '', nextAction: '', evidence: '', verification: '' });
const fields = ['title', 'company', 'role', 'questions', 'actualAnswer', 'gap', 'nextAction', 'evidence', 'verification'];
const editable = value => JSON.stringify(Object.fromEntries([...fields, 'date', 'track', 'kind', 'round', 'status', 'category'].map(key => [key, value?.[key] ?? ''])));
function restore(track, storage) {
  try {
    const saved = JSON.parse(readDraft('answer', `experience:${track}`, 'null', storage));
    if (saved?.track === track && fields.every(key => typeof saved[key] === 'string') && EXPERIENCE_ROUNDS.some(r => r.id === saved.round) && Object.hasOwn(kindLabels, saved.kind) && Object.hasOwn(statusLabels, saved.status)) return saved;
  } catch {}
  return blank(track);
}
function Button({ primary = false, children, ...props }) { return h('button', { type: 'button', className: 'diw-button diw-button-' + (primary ? 'primary' : 'secondary'), ...props }, children); }

export function InterviewExperiencePanel({ api, track, busy = false, readonly = false, writesBlocked = false, connectionAvailable = true, recoveryStorage, runOperation, onStartPractice }) {
  const [pane, setPane] = useState('methods');
  const [round, setRound] = useState('second');
  const [data, setData] = useState(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [recordRound, setRecordRound] = useState('');
  const [resourceCategory, setResourceCategory] = useState('interview');
  const [resource, setResource] = useState(null);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [draft, setDraft] = useState(() => restore(track, recoveryStorage));
  const [cacheFailed, setCacheFailed] = useState(false);
  const mounted = useRef(true);
  const resourceRequest = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; resourceRequest.current++; }; }, []);
  useEffect(() => { setDraft(restore(track, recoveryStorage)); setNotice(''); setResource(null); resourceRequest.current++; }, [track, recoveryStorage]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    Promise.resolve().then(() => api.experienceSnapshot({ track })).then(value => { if (!cancelled) setData(value); })
      .catch(cause => { if (!cancelled) setError(cause.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [api, track, revision, connectionAvailable]);
  const current = data?.track === track ? data : null;
  const records = current?.records ?? [];
  const guide = current?.playbooks.find(p => p.id === round);
  const disabled = busy || readonly || writesBlocked || !connectionAvailable || loading || !current || Boolean(error);
  const old = records.find(r => r.id === draft.id);
  const dirty = draft.id ? editable(draft) !== editable(old) : fields.some(key => draft[key]?.trim());
  function update(patch) {
    const value = { ...draft, ...patch };
    setDraft(value); setNotice(''); setCacheFailed(!writeDraft('answer', `experience:${track}`, JSON.stringify(value), recoveryStorage));
  }
  function choose(value) {
    if (dirty) { setPane('records'); setNotice('请先保存当前经验草稿，再切换记录；草稿已保留。'); return; }
    setDraft(value); setPane('records'); setNotice(''); setCacheFailed(!writeDraft('answer', `experience:${track}`, JSON.stringify(value), recoveryStorage));
  }
  async function save() {
    const saved = await runOperation(() => api.saveExperience(draft));
    if (saved && mounted.current) {
      setDraft(saved); setCacheFailed(!writeDraft('answer', `experience:${track}`, JSON.stringify(saved), recoveryStorage));
      setNotice(saved.status === 'verified' ? '经验与复练结果已归档。' : '经验已归档。下一次复练后补充结果，再标记已复练验证。'); setRevision(v => v + 1);
    }
  }
  async function openResource(id) {
    const request = ++resourceRequest.current;
    setPane('resources'); setResourceLoading(true); setResource(null); setNotice('');
    try { const value = await api.experienceResource({ id }); if (mounted.current && request === resourceRequest.current) setResource(value); }
    catch (cause) { if (mounted.current && request === resourceRequest.current) setNotice(cause.message); }
    finally { if (mounted.current && request === resourceRequest.current) setResourceLoading(false); }
  }
  const input = (key, label, placeholder = '', multiline = false) => h('label', { className: 'diw-field', key }, h('span', null, label), h(multiline ? 'textarea' : 'input', { value: draft[key], placeholder, rows: 3, maxLength: multiline ? 10000 : 200, disabled, onChange: event => update({ [key]: event.target.value }) }));
  const select = (key, label, values) => h('label', { key }, h('span', null, label), h('select', { value: draft[key], disabled, onChange: event => update({ [key]: event.target.value }) }, values.map(([id, name]) => h('option', { value: id, key: id }, name))));
  const filtered = records.filter(r => (!recordRound || r.round === recordRound) && (!query.trim() || [r.title, r.company, r.role, r.questions, r.gap].join(' ').toLowerCase().includes(query.trim().toLowerCase())));
  return h('div', { className: 'diw-experiences', 'aria-busy': loading }, h('style', null, EXPERIENCE_STYLES),
    h('nav', { className: 'diw-experience-tabs', 'aria-label': '经验内容' }, [['methods', '方法与套路'], ['records', '我的经验'], ['resources', '资料原文']].map(([id, label]) => h(Button, { key: id, 'aria-pressed': pane === id, onClick: () => setPane(id) }, label))),
    error && h('div', { role: 'alert' }, error, h(Button, { onClick: () => setRevision(v => v + 1) }, '重新读取经验')),
    notice && h('p', { role: 'status' }, notice), loading && h('p', { role: 'status' }, '正在读取经验档案…'),
    current && pane === 'methods' && h(React.Fragment, null,
      h('div', { className: 'diw-experience-rounds', role: 'group', 'aria-label': '面试轮次方法' }, EXPERIENCE_ROUNDS.map(r => h(Button, { key: r.id, primary: round === r.id, 'aria-pressed': round === r.id, onClick: () => setRound(r.id) }, r.label))),
      guide && h('section', { 'aria-label': guide.title }, h('h3', null, guide.title), h('p', { className: 'diw-muted' }, '平台整理的准备框架；实际轮次和重点以岗位与当场提问为准。'),
        h('div', { className: 'diw-experience-guide' }, h('div', null, h('h4', null, '准备与回答顺序'), h('ol', null, guide.steps.map((step, i) => h('li', { key: i }, step)))), h('div', null, h('h4', null, '用这些追问检验深度'), h('ul', null, guide.followUps.map((step, i) => h('li', { key: i }, step))))),
        h('p', null, '完成标准：', guide.deliverable), h(Button, { primary: true, disabled, onClick: () => choose({ ...blank(track), round }) }, '按此规范新建经验')),
      h('section', null, h('h3', null, '从资料中提炼'), h('p', { className: 'diw-muted' }, '以下是对所附文章的归纳，不代表你的亲历记录。'), current.summaries.length ? h('div', { className: 'diw-experience-summaries' }, current.summaries.map(s => h('article', { className: 'diw-experience-summary', key: s.resourceId }, h('h4', null, s.title), h('p', null, s.summary), h('small', { className: 'diw-muted' }, s.sourceTitle, ' · ', s.publishedAt), h(Button, { onClick: () => openResource(s.resourceId) }, '核对来源原文')))) : h('p', null, '导入面经资料后，这里会显示有出处的提炼。')),
      current.patterns.length > 0 && h('section', null, h('h3', null, '算法题的识别与复盘套路'), h('p', { className: 'diw-muted' }, '数量来自本地资料的题型标签；类别可能交叉，不代表面试出现概率。'),
        h('div', { className: 'diw-experience-patterns' }, current.patterns.map(p => h('details', { className: 'diw-experience-pattern', key: p.id }, h('summary', null, `${p.title} · ${p.count} 条`), h('p', null, '识别信号：', p.cue), h('p', null, '推导顺序：', p.approach), h('p', null, '复盘重点：', p.pitfall), h('ul', null, p.examples.map(q => h('li', { key: q.id }, q.title, ' ', h(Button, { disabled: disabled || !onStartPractice, onClick: () => onStartPractice({ track, mode: 'coach', questionIds: [q.id], count: 1 }) }, '练习关联题'))))))))),
    current && pane === 'records' && h(React.Fragment, null,
      h('p', null, `已归档 ${current.stats.total} 条 · 待改进 / 复练中 ${current.stats.pending} 条 · 已复练验证 ${current.stats.verified} 条`),
      current.stats.recurringGaps.length > 0 && h('p', { className: 'diw-muted' }, '尚未闭环的卡点：', current.stats.recurringGaps.map(g => `${g.category} ${g.count} 条`).join('、')),
      h('form', { className: 'diw-experience-form', onSubmit: event => { event.preventDefault(); if (!disabled) void save(); }, 'aria-label': '规范化面试复盘' },
        h('div', { className: 'diw-section-heading' }, h('h3', null, draft.id ? '更新经验与复练结果' : '记录一条经验'), h(Button, { disabled, onClick: () => choose(blank(track)) }, '新建经验')),
        h('p', { className: 'diw-muted' }, '亲历面试只记录真实发生的问答；模拟练习和资料提炼分别标注。带 * 的内容用于形成完整复盘。'),
        h('fieldset', { className: 'diw-experience-group' }, h('legend', null, '基本信息'),
          input('title', '经验标题 *', '例如：二面被追问评估集如何构建'),
          h('div', { className: 'diw-experience-form-grid' }, select('kind', '记录类型', Object.entries(kindLabels)), select('round', '面试轮次', EXPERIENCE_ROUNDS.map(r => [r.id, r.label])), h('label', null, h('span', null, '面试 / 学习日期'), h('input', { type: 'date', value: draft.date, disabled, onChange: event => update({ date: event.target.value }) })), input('company', '公司（可选）'), input('role', '岗位（可选）'), select('category', '主要卡点', EXPERIENCE_GAPS.map(x => [x, x])))),
        h('fieldset', { className: 'diw-experience-group' }, h('legend', null, '面试还原'),
          input('questions', '问题与连续追问 *', '原问题是什么？面试官继续追问了哪两层？', true),
          input('actualAnswer', '当时的回答 / 资料中的做法 *', '保留实际表达，再写你当时拿出的依据。', true),
          input('gap', '卡点与原因 *', '知识缺口、缺少证据、推理跳步，还是表达不清？', true)),
        h('fieldset', { className: 'diw-experience-group' }, h('legend', null, '改进与复练'),
          input('nextAction', '下一步改进动作 *', '写一个可执行、可验收的动作，例如：补一组消融实验并说明指标变化。', true),
          input('evidence', '证据或资料出处（资料提炼必填）', '实验记录、已保存作答、文章标题与日期；不要填写账号密钥。', true),
          select('status', '闭环状态', Object.entries(statusLabels)), input('verification', '复练结果（标记已验证时必填）', '何时重新回答 / 重写？通过了什么检查？还剩什么问题？', true)),
        h('div', { className: 'diw-actions' }, h('button', { type: 'submit', className: 'diw-button diw-button-primary', disabled: disabled || !dirty }, busy ? '正在保存…' : '保存经验'), h('span', { className: 'diw-muted', role: 'status' }, cacheFailed ? '草稿暂存失败，请保存后再离开。' : dirty ? '草稿已暂存于当前标签页；保存后进入本地经验档案。' : draft.id ? '当前经验已保存。' : '填写实际问答后保存。'))),
      h('section', null, h('h3', null, '经验档案'), h('div', { className: 'diw-experience-filters' }, h('label', null, h('span', null, '搜索经验'), h('input', { value: query, placeholder: '公司、问题、卡点', onChange: e => setQuery(e.target.value) })), h('label', null, h('span', null, '按轮次筛选经验'), h('select', { value: recordRound, onChange: e => setRecordRound(e.target.value) }, h('option', { value: '' }, '全部轮次'), EXPERIENCE_ROUNDS.map(r => h('option', { key: r.id, value: r.id }, r.label))))),
        !filtered.length && h('p', { className: 'diw-muted' }, records.length ? '当前筛选没有记录。' : '尚无亲历记录。先完成一次练习或面试，再按上方规范归档。'),
        filtered.map(record => h('details', { className: 'diw-experience-record', key: record.id }, h('summary', null, record.title, h('span', { className: 'diw-badge', 'data-tone': record.status === 'verified' ? 'accent' : undefined }, statusLabels[record.status])), h('p', { className: 'diw-muted' }, `${kindLabels[record.kind]} · ${EXPERIENCE_ROUNDS.find(r => r.id === record.round)?.label} · ${record.date} · ${record.company || '公司未填'}`), h('dl', null, [['questions', '问题与追问'], ['actualAnswer', '原回答 / 做法'], ['gap', '卡点原因'], ['nextAction', '改进动作'], ['evidence', '证据 / 出处'], ['verification', '复练结果']].flatMap(([key, label]) => [h('dt', { key: key + '-label' }, label), h('dd', { key }, record[key] || '尚未记录')])), h('div', null, h(Button, { disabled, onClick: () => choose(record) }, '更新这条经验')))))),
    current && pane === 'resources' && h(React.Fragment, null,
      h('p', { className: 'diw-muted' }, '原始资料保留作者观点和发布日期；公司安排、录用判断及参考代码需另行核对。缺少题面的文章在这里作为资料保存。'),
      h('label', { className: 'diw-field' }, h('span', null, '资料类别'), h('select', { value: resourceCategory, onChange: e => { setResourceCategory(e.target.value); resourceRequest.current++; setResource(null); setResourceLoading(false); setNotice(''); } }, h('option', { value: 'interview' }, '面经与求职经验'), h('option', { value: 'reference' }, '其他资料 / 仅题解'))),
      h('label', { className: 'diw-field' }, h('span', null, '选择原文'), h('select', { value: resource?.category === resourceCategory ? resource.id : '', disabled: resourceLoading, onChange: e => { if (e.target.value) void openResource(e.target.value); } }, h('option', { value: '' }, '选择一篇资料查看'), current.resources.filter(r => r.category === resourceCategory).map(r => h('option', { key: r.id, value: r.id }, `${r.source.publishedAt?.slice(0, 10) || ''} · ${r.title}`)))),
      resourceLoading && h('p', { role: 'status' }, '正在读取原文…'),
      resource && h('article', { className: 'diw-experience-resource' }, h('h3', null, resource.title), h('p', { className: 'diw-muted' }, resource.source.label, ' · ', resource.source.publishedAt), h('p', { className: 'diw-muted' }, resource.source.path),
        h(Button, { disabled, onClick: () => choose({ ...blank(track), kind: 'source', title: resource.title.slice(0, 180), evidence: `${resource.source.label}\n${resource.source.path}\n${resource.source.publishedAt}` }) }, '记录我的提炼'), h(InterviewContent, { value: resource.body }), resource.truncated && h('p', null, '原文超过显示长度，剩余内容请查看原始 HTML。'))));
}
