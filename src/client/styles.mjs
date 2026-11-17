/** Scoped workbench styles; semantic light/dark tokens follow the curated MASTER. */
export const INTERVIEW_STYLES = `
.diw-overlay {
  --diw-bg:#F4F6F5; --diw-panel:#FFFFFF; --diw-rail:#F9FAF9; --diw-raised:#FFFFFF;
  --diw-ink:#182C30; --diw-secondary:#526469; --diw-muted:#5D6E72;
  --diw-line:#D8E1DE; --diw-control:#849994; --diw-accent:#0F766E; --diw-on-accent:#FFFFFF;
  --diw-soft:#E5F3ED; --diw-soft-ink:#115E59; --diw-warm:#875D16; --diw-warm-bg:#FFF4DD;
  --diw-danger:#B42318; --diw-danger-bg:#FFF1EF; --diw-code-bg:#182C30; --diw-code-ink:#E5EFEC;
  --diw-radius-control:8px; --diw-radius-card:10px; --diw-radius-shell:12px;
  --diw-gap:16px; --diw-gutter:24px; --diw-target:40px;
  position:fixed; inset:0; z-index:990; display:grid; place-items:center; padding:16px;
  min-width:0; pointer-events:auto; color:var(--diw-ink); color-scheme:light;
  font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;
  font-size:16px; line-height:1.5; text-rendering:optimizeLegibility; -webkit-text-size-adjust:100%;
}
.diw-overlay *, .diw-overlay *::before, .diw-overlay *::after { box-sizing:border-box; }
.diw-overlay [hidden] { display:none!important; }
.diw-overlay :is(button,input,select,textarea) { font:inherit; }
.diw-overlay button { cursor:pointer; }
.diw-overlay button:disabled { opacity:.48; cursor:not-allowed; }
.diw-overlay :is(button,input,select,textarea,summary,a,[tabindex]):focus-visible { outline:3px solid var(--diw-accent); outline-offset:3px; }
.diw-overlay :is(button,input,select,textarea,summary,a,[tabindex]) { scroll-margin-block:20px; }
.diw-overlay a { color:var(--diw-accent); text-decoration:underline; text-underline-offset:3px; overflow-wrap:anywhere; }
.diw-overlay svg { flex:none; max-width:100%; }
.diw-overlay :is(h1,h2,h3,h4,h5,h6,p) { margin:0; }
.diw-overlay :is(h1,h2,h3,h4,h5,h6) { font-weight:650; text-wrap:balance; }
.diw-overlay :is(input,select,textarea) { max-width:100%; }
.diw-overlay small { font-size:12px; }
.diw-overlay ::selection { color:var(--diw-soft-ink); background:var(--diw-soft); }
.diw-overlay .diw-backdrop { position:absolute; inset:0; background:rgb(9 23 28 / 54%); }
.diw-overlay .diw-shell { position:relative; display:flex; flex-direction:column; width:min(1600px,100%); height:min(1020px,100%); min-width:0; min-height:0; overflow:hidden; border:1px solid var(--diw-line); border-radius:var(--diw-radius-shell); background:var(--diw-bg); box-shadow:0 20px 70px rgb(7 24 29 / 25%); }
.diw-overlay .diw-shell:focus { outline:none; }
.diw-overlay .diw-header { display:flex; align-items:center; justify-content:space-between; flex:none; gap:20px; min-height:80px; padding:16px 24px; border-bottom:1px solid var(--diw-line); background:var(--diw-panel); }
.diw-overlay .diw-brand { display:flex; align-items:center; gap:12px; min-width:0; }
.diw-overlay .diw-brand > div { min-width:0; }
.diw-overlay .diw-brand-mark { display:grid; place-items:center; flex:none; width:42px; height:42px; border-radius:8px; color:var(--diw-on-accent); background:var(--diw-accent); }
.diw-overlay .diw-brand-title { display:flex; align-items:center; flex-wrap:wrap; gap:12px; font-size:20px; font-weight:700; line-height:1.4; }
.diw-overlay .diw-brand p { margin-top:3px; color:var(--diw-muted); font-size:13px; line-height:1.5; }
.diw-overlay :is(.diw-actions,.diw-header-actions) { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
.diw-overlay .diw-header-actions { flex:none; flex-wrap:nowrap; }
.diw-overlay .diw-icon-button { display:grid; place-items:center; width:var(--diw-target); height:var(--diw-target); padding:0; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); background:var(--diw-panel); color:var(--diw-secondary); }
.diw-overlay .diw-icon-button:hover:not(:disabled) { background:var(--diw-soft); color:var(--diw-soft-ink); border-color:var(--diw-accent); }
.diw-overlay .diw-badge { display:inline-flex; align-items:center; max-width:100%; min-height:26px; padding:3px 8px; border:1px solid var(--diw-line); border-radius:6px; background:var(--diw-rail); color:var(--diw-secondary); font-size:12px; font-weight:600; line-height:1.4; overflow-wrap:anywhere; }
.diw-overlay .diw-badge[data-tone=accent] { color:var(--diw-soft-ink); background:var(--diw-soft); border-color:var(--diw-line); }
.diw-overlay .diw-badge[data-tone=warm] { color:var(--diw-warm); background:var(--diw-warm-bg); }
.diw-overlay .diw-header-actions > .diw-badge { margin-right:8px; font-size:12px; }
/* Desktop owns one bounded grid row; each visible column owns its scrolling. */
.diw-overlay .diw-layout { display:grid; grid-template-columns:196px minmax(0,1fr); grid-template-rows:minmax(0,1fr); flex:1; min-width:0; min-height:0; overflow:hidden; }
.diw-overlay .diw-layout[data-view=bank] { grid-template-columns:196px minmax(340px,1fr) minmax(410px,1.05fr); }
.diw-overlay .diw-layout:not([data-view=bank]) .diw-inspector { display:none; }
.diw-overlay .diw-rail { display:flex; flex-direction:column; gap:8px; min-width:0; min-height:0; padding:20px 12px; border-right:1px solid var(--diw-line); background:var(--diw-rail); overflow:auto; overscroll-behavior:contain; }
.diw-overlay :is(.diw-role-switch,.diw-nav-links) { display:grid; gap:8px; min-width:0; }
.diw-overlay .diw-rail-label { margin:0 8px 4px; color:var(--diw-muted); font-size:12px; font-weight:600; }
.diw-overlay .diw-track { position:relative; display:flex; align-items:center; width:100%; min-height:64px; gap:8px; padding:10px 8px; border:1px solid transparent; border-radius:var(--diw-radius-control); background:transparent; color:var(--diw-ink); text-align:left; }
.diw-overlay .diw-track > span:not(.diw-track-icon) { min-width:0; }
.diw-overlay .diw-track:hover:not(:disabled) { border-color:var(--diw-line); background:var(--diw-panel); }
.diw-overlay .diw-track[aria-pressed=true] { border-color:var(--diw-accent); background:var(--diw-panel); }
.diw-overlay .diw-track-icon { display:grid; place-items:center; flex:none; width:32px; height:32px; border-radius:8px; background:var(--diw-soft); color:var(--diw-soft-ink); }
.diw-overlay .diw-track strong { display:block; font-size:14px; line-height:1.5; font-weight:650; }
.diw-overlay .diw-track small { display:block; margin-top:2px; color:var(--diw-muted); font-size:12px; line-height:1.45; }
.diw-overlay :is(.diw-selected-dot,.diw-live-dot) { width:6px; height:6px; flex:none; margin-left:auto; border-radius:50%; background:var(--diw-accent); }
.diw-overlay .diw-rail-rule { height:1px; flex:none; margin:12px 8px; background:var(--diw-line); }
.diw-overlay .diw-nav-item { position:relative; display:flex; align-items:center; min-height:56px; width:100%; gap:10px; padding:10px 12px; border:1px solid transparent; border-radius:var(--diw-radius-control); background:transparent; color:var(--diw-secondary); text-align:left; }
.diw-overlay .diw-nav-item > span { min-width:0; }
.diw-overlay .diw-nav-item strong { display:block; font-size:14px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-nav-item small { display:block; margin-top:1px; font-size:12px; line-height:1.4; }
.diw-overlay .diw-nav-item:hover:not(:disabled) { color:var(--diw-ink); background:var(--diw-panel); }
.diw-overlay .diw-nav-item[aria-current=page] { color:var(--diw-soft-ink); background:var(--diw-soft); border-color:var(--diw-line); box-shadow:inset 3px 0 var(--diw-accent); }
.diw-overlay .diw-rail-footer { margin-top:auto; padding:24px 8px 0; }
.diw-overlay .diw-rail-footer small { display:block; padding-top:12px; border-top:1px solid var(--diw-line); color:var(--diw-muted); font-size:12px; line-height:1.65; overflow-wrap:anywhere; }
.diw-overlay :is(.diw-main,.diw-inspector) { display:block; min-width:0; min-height:0; height:auto; overflow:auto; scrollbar-gutter:stable; scroll-padding-block:24px; overscroll-behavior:contain; }
.diw-overlay :is(.diw-main,.diw-inspector) > * { flex-shrink:0; }
.diw-overlay .diw-main { padding:24px; background:var(--diw-bg); }
.diw-overlay .diw-inspector { padding:24px; border-left:1px solid var(--diw-line); background:var(--diw-panel); }
.diw-overlay .diw-kicker { display:block; color:var(--diw-muted); font-size:12px; font-weight:600; line-height:1.5; letter-spacing:.015em; }
.diw-overlay .diw-muted { color:var(--diw-muted); font-size:14px; line-height:1.65; }
.diw-overlay .diw-button { display:inline-flex; justify-content:center; align-items:center; gap:8px; min-height:var(--diw-target); min-width:var(--diw-target); max-width:100%; padding:8px 14px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); color:var(--diw-ink); background:var(--diw-panel); font-size:14px; font-weight:600; line-height:1.5; text-decoration:none; overflow-wrap:anywhere; }
.diw-overlay .diw-button:hover:not(:disabled) { color:var(--diw-soft-ink); background:var(--diw-soft); border-color:var(--diw-accent); }
.diw-overlay .diw-button-primary { color:var(--diw-on-accent); background:var(--diw-accent); border-color:var(--diw-accent); }
.diw-overlay .diw-button-primary:hover:not(:disabled) { color:var(--diw-on-accent); background:var(--diw-accent); border-color:var(--diw-accent); box-shadow:inset 0 0 0 100px rgb(0 0 0 / 8%); }
.diw-overlay .diw-button-light { color:var(--diw-accent); border-color:var(--diw-control); background:var(--diw-panel); }
.diw-overlay .diw-bank-intro { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:16px; }
.diw-overlay .diw-bank-intro > div { min-width:0; }
.diw-overlay .diw-bank-intro p { max-width:72ch; color:var(--diw-secondary); font-size:14px; line-height:1.7; }
.diw-overlay .diw-launcher { display:grid; gap:12px; padding:16px; margin:0 0 12px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-launcher-options { display:flex; align-items:flex-end; flex-wrap:nowrap; gap:12px; min-width:0; }
.diw-overlay .diw-mode-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); flex:1 1 0; gap:8px; min-width:0; }
.diw-overlay .diw-mode-options button { display:flex; flex-direction:column; align-items:flex-start; gap:3px; min-width:0; min-height:64px; padding:8px 10px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); color:var(--diw-ink); background:var(--diw-panel); text-align:left; }
.diw-overlay .diw-mode-options button[aria-pressed=true] { background:var(--diw-soft); border-color:var(--diw-accent); box-shadow:inset 0 0 0 1px var(--diw-accent); }
.diw-overlay .diw-mode-options strong { font-size:14px; font-weight:650; line-height:1.5; }
.diw-overlay .diw-mode-options small { color:var(--diw-secondary); font-size:12px; line-height:1.5; }
.diw-overlay .diw-launcher-count { display:grid; gap:6px; flex:0 0 80px; min-width:0; color:var(--diw-secondary); font-size:12px; }
.diw-overlay .diw-launcher-count select { width:100%; min-width:0; min-height:var(--diw-target); padding:8px 10px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); color:var(--diw-ink); background:var(--diw-panel); font-size:14px; }
.diw-overlay .diw-launcher-submit { display:flex; align-items:center; justify-content:space-between; gap:12px; min-width:0; }
.diw-overlay .diw-launcher-submit > p { flex:1; min-width:0; font-size:12px; line-height:1.6; }
.diw-overlay .diw-launcher-submit > .diw-button { flex:none; }
.diw-overlay .diw-launcher-body { display:grid; gap:12px; min-width:0; }
.diw-overlay .diw-launcher-toggle { display:none; }
.diw-overlay .diw-summary-strip { display:flex; flex-wrap:wrap; gap:12px 24px; padding:12px 0 20px; margin:0; border-bottom:1px solid var(--diw-line); }
.diw-overlay .diw-summary-strip > div { display:flex; align-items:baseline; gap:8px; }
.diw-overlay .diw-summary-strip dt { color:var(--diw-muted); font-size:12px; line-height:1.5; }
.diw-overlay .diw-summary-strip dd { margin:0; color:var(--diw-ink); font-size:18px; font-weight:650; line-height:1.3; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-section-heading { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px 12px; min-width:0; }
.diw-overlay .diw-section-heading > div { min-width:0; }
.diw-overlay .diw-section-heading h3 { font-size:18px; line-height:1.45; }
.diw-overlay .diw-bank-heading { margin:24px 0 16px; }
.diw-overlay .diw-bank-heading h3 { margin-top:4px; font-size:20px; }
.diw-overlay .diw-bank-heading > span { font-size:13px; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-filters { display:flex; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:16px; min-width:0; }
.diw-overlay .diw-search { display:grid; gap:6px; flex:1 1 170px; min-width:0; color:var(--diw-secondary); }
.diw-overlay .diw-filter-label { display:block; color:var(--diw-secondary); font-size:13px; line-height:1.5; }
.diw-overlay .diw-search-control { display:flex; align-items:center; gap:8px; min-width:0; min-height:var(--diw-target); padding:0 12px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); background:var(--diw-panel); color:var(--diw-muted); }
.diw-overlay .diw-search-control:focus-within { outline:3px solid var(--diw-accent); outline-offset:3px; }
.diw-overlay .diw-search input { width:100%; min-width:0; min-height:var(--diw-target); padding:8px 0; border:0; outline:none; background:transparent; color:var(--diw-ink); font-size:16px; }
.diw-overlay .diw-search input:focus-visible { outline:none; }
.diw-overlay :is(.diw-search input,.diw-field textarea,.diw-prompt-panel textarea)::placeholder { color:var(--diw-muted); opacity:1; }
.diw-overlay :is(.diw-topic-filter,.diw-difficulty-filter) { display:grid; gap:6px; flex:1 1 140px; min-width:0; color:var(--diw-secondary); font-size:13px; }
.diw-overlay .diw-difficulty-filter { flex:0 1 112px; }
.diw-overlay :is(.diw-topic-filter,.diw-difficulty-filter) select { width:100%; min-width:0; min-height:var(--diw-target); padding:8px 10px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); color:var(--diw-ink); background:var(--diw-panel); font-size:14px; text-overflow:ellipsis; }
.diw-overlay .diw-question-list { display:grid; gap:6px; min-width:0; }
.diw-overlay .diw-question-list[aria-busy=true] { min-height:220px; }
.diw-overlay .diw-question-row { display:grid; align-items:center; grid-template-columns:28px minmax(0,1fr) 18px; gap:10px; width:100%; min-width:0; min-height:64px; padding:10px 12px; border:1px solid var(--diw-line); border-radius:10px; color:var(--diw-ink); background:var(--diw-panel); text-align:left; }
.diw-overlay .diw-question-row:hover:not(:disabled) { border-color:var(--diw-control); background:var(--diw-rail); }
.diw-overlay .diw-question-row[aria-pressed=true] { border-color:var(--diw-accent); background:var(--diw-soft); box-shadow:inset 3px 0 var(--diw-accent); }
.diw-overlay .diw-question-index { color:var(--diw-muted); font-size:12px; font-weight:500; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-question-row[aria-pressed=true] :is(.diw-question-index,svg) { color:var(--diw-soft-ink); }
.diw-overlay .diw-question-copy { min-width:0; }
.diw-overlay .diw-question-copy > strong { display:block; font-size:15px; font-weight:600; line-height:1.5; overflow-wrap:anywhere; }
.diw-overlay .diw-question-tags { display:flex; align-items:baseline; flex-wrap:wrap; gap:4px 10px; margin-top:3px; color:var(--diw-muted); font-size:12px; line-height:1.5; }
.diw-overlay .diw-question-tags > span { min-width:0; overflow-wrap:anywhere; }
.diw-overlay .diw-question-summary { flex:1 1 100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.diw-overlay .diw-pagination { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-top:20px; }
.diw-overlay .diw-pagination small { color:var(--diw-muted); font-size:12px; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-pagination .diw-button { padding-inline:12px; }
/* Learning overview uses recorded progress and direct routes back into practice. */
.diw-overlay .diw-overview { display:flow-root; width:100%; max-width:1120px; min-width:0; margin-inline:auto; }
.diw-overlay .diw-overview-topline { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:24px; }
.diw-overlay .diw-overview-heading { flex:1 1 320px; min-width:0; }
.diw-overlay .diw-overview-topline > .diw-button { margin-top:6px; }
.diw-overlay .diw-sprint-entry { display:flex; align-items:center; flex-wrap:wrap; gap:4px 16px; padding:12px 16px; margin-bottom:24px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-sprint-entry h3 { flex:none; font-size:14px; line-height:1.5; }
.diw-overlay .diw-sprint-entry p { flex:1 1 260px; min-width:0; color:var(--diw-muted); font-size:13px; line-height:1.6; }
.diw-overlay .diw-sprint-entry .diw-button { flex:none; }
.diw-overlay .diw-overview-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-bottom:24px; }
.diw-overlay .diw-stat-card { display:flex; flex-direction:column; align-items:flex-start; gap:6px; min-width:0; padding:18px 20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); color:var(--diw-ink); background:var(--diw-panel); text-align:left; }
.diw-overlay .diw-stat-card > span { color:var(--diw-secondary); font-size:14px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-stat-card > strong { font-size:32px; font-weight:650; line-height:1.3; letter-spacing:-.025em; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-stat-card > small { color:var(--diw-muted); font-size:12px; line-height:1.65; overflow-wrap:anywhere; }
.diw-overlay .diw-stat-card[data-tone=accent] > strong { color:var(--diw-accent); }
.diw-overlay .diw-stat-card[data-tone=warm] > strong { color:var(--diw-warm); }
.diw-overlay .diw-stat-card:hover:not(:disabled) { border-color:var(--diw-accent); background:var(--diw-rail); }
.diw-overlay .diw-overview-grid { margin-bottom:24px; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.08fr); gap:20px; align-items:stretch; }
.diw-overlay .diw-next-session { display:flex; flex-direction:column; align-items:flex-start; gap:12px; min-width:0; padding:24px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-soft); }
.diw-overlay .diw-next-session > div { width:100%; min-width:0; }
.diw-overlay .diw-next-session .diw-kicker { color:var(--diw-soft-ink); }
.diw-overlay .diw-next-session h3 { margin:4px 0 8px; font-size:21px; line-height:1.45; }
.diw-overlay .diw-next-session p { color:var(--diw-secondary); font-size:14px; line-height:1.75; overflow-wrap:anywhere; }
.diw-overlay .diw-next-session > .diw-actions { margin-top:auto; padding-top:4px; }
.diw-overlay :is(.diw-next-session,.diw-topic-card,.diw-continue-card) progress { display:block; width:100%; height:6px; margin:4px 0; border:0; border-radius:99px; overflow:hidden; background:var(--diw-line); color:var(--diw-accent); accent-color:var(--diw-accent); }
.diw-overlay :is(.diw-next-session,.diw-topic-card,.diw-continue-card) progress::-webkit-progress-bar { border-radius:99px; background:var(--diw-line); }
.diw-overlay :is(.diw-next-session,.diw-topic-card,.diw-continue-card) progress::-webkit-progress-value { border-radius:99px; background:var(--diw-accent); }
.diw-overlay :is(.diw-next-session,.diw-topic-card,.diw-continue-card) progress::-moz-progress-bar { border-radius:99px; background:var(--diw-accent); }
.diw-overlay .diw-quick-start { display:grid; align-content:start; gap:16px; min-width:0; padding:24px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-quick-start .diw-launcher-submit { margin-top:4px; }
.diw-overlay .diw-quick-start .diw-launcher-submit > small { flex:1; min-width:0; font-size:12px; line-height:1.65; }
.diw-overlay .diw-section-space { margin-top:32px; }
.diw-overlay .diw-overview .diw-section-heading { margin-bottom:16px; }
.diw-overlay .diw-overview .diw-section-heading h3 { font-size:20px; }
.diw-overlay .diw-overview .diw-section-heading p { margin-top:4px; color:var(--diw-muted); font-size:13px; line-height:1.65; }
.diw-overlay .diw-overview :is(.diw-next-session,.diw-quick-start) .diw-section-heading { margin-bottom:0; }
.diw-overlay .diw-topic-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
.diw-overlay .diw-topic-card { display:flex; flex-direction:column; gap:12px; width:100%; min-width:0; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); color:var(--diw-ink); background:var(--diw-panel); text-align:left; }
.diw-overlay .diw-topic-card:hover:not(:disabled) { border-color:var(--diw-accent); background:var(--diw-rail); }
.diw-overlay .diw-topic-card-top { display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%; min-width:0; }
.diw-overlay .diw-topic-card-top > svg { padding:7px; width:36px; height:36px; border-radius:10px; color:var(--diw-soft-ink); background:var(--diw-soft); }
.diw-overlay .diw-topic-card-top small { color:var(--diw-muted); font-size:12px; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-topic-card h3 { font-size:17px; line-height:1.5; text-wrap:wrap; overflow-wrap:anywhere; }
.diw-overlay .diw-topic-foot { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:4px 8px; width:100%; color:var(--diw-secondary); font-size:12px; line-height:1.5; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-overview-foot { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-top:20px; }
.diw-overlay .diw-overview-foot p { max-width:72ch; color:var(--diw-muted); font-size:12px; line-height:1.75; }
.diw-overlay .diw-continue-card { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; min-width:0; padding:20px; margin-bottom:24px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-continue-card > div:first-child { flex:1 1 260px; min-width:0; }
.diw-overlay .diw-continue-card h3 { margin:4px 0 6px; font-size:18px; line-height:1.5; }
.diw-overlay .diw-continue-card p { color:var(--diw-secondary); font-size:14px; line-height:1.7; }
/* Bank selection stays in document flow; checkbox and reader action are siblings. */
.diw-overlay .diw-bank-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin:20px 0 16px; }
.diw-overlay .diw-bank-toolbar > div { min-width:0; }
.diw-overlay .diw-filter-tabs { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; margin:0 0 16px; }
.diw-overlay .diw-filter-tabs button { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:var(--diw-target); min-width:0; max-width:100%; padding:8px 11px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-control); color:var(--diw-secondary); background:var(--diw-panel); font-size:13px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-filter-tabs button > span { font-size:12px; font-weight:500; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-filter-tabs button:hover:not(:disabled) { border-color:var(--diw-control); color:var(--diw-ink); }
.diw-overlay .diw-filter-tabs button[aria-pressed=true] { border-color:var(--diw-accent); color:var(--diw-soft-ink); background:var(--diw-soft); box-shadow:inset 0 0 0 1px var(--diw-accent); }
.diw-overlay .diw-question-item { display:grid; grid-template-columns:32px minmax(0,1fr); align-items:center; gap:4px; min-width:0; }
.diw-overlay .diw-pick { display:grid; place-items:center; width:32px; min-height:44px; margin:0; cursor:pointer; }
.diw-overlay .diw-pick input, .diw-overlay input.diw-pick { width:18px; height:18px; min-height:18px; margin:0; justify-self:center; accent-color:var(--diw-accent); cursor:pointer; }
.diw-overlay .diw-question-item .diw-question-row { grid-template-columns:24px minmax(0,1fr) 16px; gap:8px; min-height:0; padding:9px 12px; }
.diw-overlay .diw-learning-state { display:inline-flex; align-items:center; gap:5px; color:var(--diw-muted); font-size:12px; line-height:1.5; }
.diw-overlay .diw-learning-state::before { content:''; flex:none; width:5px; height:5px; border-radius:50%; background:currentColor; }
.diw-overlay .diw-learning-state[data-status=unreviewed], .diw-overlay .diw-learning-state[data-status=needs-review] { color:var(--diw-warm); }
.diw-overlay .diw-learning-state[data-status=reviewed] { color:var(--diw-soft-ink); }
.diw-overlay .diw-selection-tray { position:static; display:grid; gap:14px; min-width:0; margin-top:24px; padding:20px; border:1px solid var(--diw-accent); border-radius:var(--diw-radius-card); color:var(--diw-ink); background:var(--diw-soft); }
.diw-overlay .diw-selection-tray h3 { font-size:17px; line-height:1.5; }
.diw-overlay .diw-selection-tray :is(p,small) { color:var(--diw-secondary); font-size:13px; line-height:1.65; }
.diw-overlay .diw-selection-tray details { min-width:0; }
.diw-overlay .diw-selection-tray summary { min-height:var(--diw-target); padding-block:8px; color:var(--diw-soft-ink); font-size:14px; font-weight:600; cursor:pointer; }
.diw-overlay .diw-picked-list { display:grid; gap:0; max-height:300px; margin:8px 0 0; padding:0; overflow:auto; overscroll-behavior:contain; list-style:none; }
.diw-overlay .diw-picked-list li { display:flex; align-items:center; justify-content:space-between; gap:8px; min-width:0; padding:8px 0; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-picked-list li > span { min-width:0; color:var(--diw-ink); font-size:14px; line-height:1.65; overflow-wrap:anywhere; }
.diw-overlay .diw-picked-list li > button { flex:none; }
.diw-overlay .diw-history-tabs { margin:20px 0 0; }
.diw-overlay .diw-layout:is([data-view=history],[data-view=sources]) .diw-main > * { width:100%; max-width:1040px; margin-inline:auto; }
.diw-overlay .diw-reader-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin:0 0 24px; padding-bottom:16px; border-bottom:1px solid var(--diw-line); }
.diw-overlay .diw-reader-toolbar .diw-button { flex:0 1 auto; }
.diw-overlay .diw-inspector-heading { padding-bottom:16px; margin-bottom:24px; border-bottom:1px solid var(--diw-line); }
.diw-overlay .diw-inspector-heading h2 { margin-top:6px; font-size:20px; line-height:1.4; }
.diw-overlay .diw-meta { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; color:var(--diw-muted); font-size:12px; line-height:1.5; }
.diw-overlay .diw-meta code { font-size:12px; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.diw-overlay .diw-reader-title { margin:16px 0 20px; font-size:24px; font-weight:650; line-height:1.5; letter-spacing:-.015em; overflow-wrap:anywhere; }
.diw-overlay .diw-reading-document { display:flow-root; min-width:0; width:100%; max-width:72ch; margin-inline:auto; }
.diw-overlay .diw-content { display:flow-root; min-width:0; height:auto; max-width:72ch; color:var(--diw-ink); font-size:16px; line-height:1.75; overflow-wrap:anywhere; }
.diw-overlay .diw-content p { margin-bottom:1em; white-space:pre-wrap; }
.diw-overlay .diw-content > :first-child { margin-top:0; }
.diw-overlay .diw-content > :last-child { margin-bottom:0; }
.diw-overlay .diw-content :is(h3,h4,h5,h6) { margin:1.4em 0 .7em; font-size:18px; line-height:1.5; }
.diw-overlay .diw-content :is(ul,ol) { padding-left:1.5em; margin:0 0 1em; }
.diw-overlay .diw-content li { padding-left:3px; margin:.35em 0; }
.diw-overlay .diw-content blockquote { margin:0 0 1em; padding:12px 16px; border-left:3px solid var(--diw-accent); background:var(--diw-soft); color:var(--diw-soft-ink); }
.diw-overlay .diw-content :not(pre) > code { padding:2px 5px; border-radius:4px; background:var(--diw-rail); color:var(--diw-soft-ink); font:14px/1.65 ui-monospace,SFMono-Regular,Consolas,monospace; overflow-wrap:anywhere; }
.diw-overlay .diw-code { max-width:100%; margin:20px 0; overflow:hidden; border:1px solid var(--diw-line); border-radius:var(--diw-radius-control); background:var(--diw-code-bg); color:var(--diw-code-ink); }
.diw-overlay .diw-code figcaption { padding:8px 14px; border-bottom:1px solid rgb(255 255 255 / 18%); font-size:12px; line-height:1.5; }
.diw-overlay .diw-code pre { max-width:100%; padding:16px; margin:0; overflow:auto; font:14px/1.75 ui-monospace,SFMono-Regular,Consolas,monospace; tab-size:4; }
.diw-overlay .diw-code code { font:inherit; white-space:pre; }
/* Math owns horizontal overflow; KaTeX's measured boxes must not inherit the UI reset. */
.diw-overlay .diw-math-block { display:block; min-width:0; max-width:100%; margin:16px 0; padding-block:6px; overflow-x:auto; overflow-y:hidden; overscroll-behavior-x:contain; }
.diw-overlay .diw-math-inline { display:inline-block; max-width:100%; padding-block:3px; overflow-x:auto; overflow-y:hidden; vertical-align:middle; overscroll-behavior-x:contain; }
.diw-overlay .diw-content .katex,
.diw-overlay .diw-content .katex *,
.diw-overlay .diw-content .katex *::before,
.diw-overlay .diw-content .katex *::after { box-sizing:content-box; overflow-wrap:normal; word-break:normal; }
.diw-overlay .diw-content .katex { white-space:normal; }
.diw-overlay .diw-content .katex svg { max-width:none; }
.diw-overlay .diw-content .katex-display { margin:0; text-align:left; }
.diw-overlay .diw-content .katex-display > .katex { text-align:left; white-space:nowrap; }
.diw-overlay .diw-content .diw-math-error { display:inline-block; max-width:100%; padding:6px 8px; color:var(--diw-secondary); background:var(--diw-rail); font:14px/1.75 ui-monospace,SFMono-Regular,Consolas,monospace; white-space:pre-wrap; overflow-wrap:anywhere; vertical-align:middle; }
.diw-overlay .diw-table-scroll { min-width:0; max-width:100%; margin:20px 0; overflow-x:auto; overscroll-behavior-x:contain; border:1px solid var(--diw-line); border-radius:var(--diw-radius-control); }
.diw-overlay .diw-table-scroll table { width:100%; border-collapse:collapse; font-size:14px; line-height:1.7; }
.diw-overlay .diw-table-scroll :is(th,td) { min-width:140px; padding:12px 14px; border-right:1px solid var(--diw-line); border-bottom:1px solid var(--diw-line); text-align:left; vertical-align:top; }
.diw-overlay .diw-table-scroll th { color:var(--diw-ink); background:var(--diw-rail); font-weight:650; }
.diw-overlay .diw-table-scroll tr > :last-child { border-right:0; }
.diw-overlay .diw-table-scroll tbody tr:last-child > td { border-bottom:0; }
.diw-overlay .diw-content :is(.diw-raw-markup,.diw-content-fallback) { max-width:100%; white-space:pre-wrap; overflow-wrap:anywhere; }
.diw-overlay .diw-image-alt { color:var(--diw-muted); font-size:14px; }
.diw-overlay .diw-answer-details { margin-top:24px; border-top:1px solid var(--diw-line); border-bottom:1px solid var(--diw-line); }
.diw-overlay .diw-answer-details > summary { min-height:48px; padding:14px 0; color:var(--diw-accent); font-size:14px; font-weight:650; line-height:1.5; cursor:pointer; }
.diw-overlay .diw-reference { display:flow-root; min-width:0; height:auto; margin:8px 0 28px; }
.diw-overlay .diw-reference > :is(h3,.diw-section-heading) { margin-bottom:16px; }
.diw-overlay .diw-reference h3 { font-size:18px; line-height:1.5; }
.diw-overlay .diw-followups { margin:0; max-width:76ch; padding-left:22px; color:var(--diw-secondary); font-size:16px; line-height:1.75; }
.diw-overlay .diw-followups li { margin-bottom:12px; }
.diw-overlay .diw-source-note { display:grid; gap:8px; padding:20px 0; margin-top:24px; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-source-note > strong { font-size:14px; font-weight:600; overflow-wrap:anywhere; }
.diw-overlay .diw-source-note small { color:var(--diw-muted); font-size:12px; line-height:1.6; overflow-wrap:anywhere; }
.diw-overlay .diw-source-note code { font-size:12px; }
.diw-overlay .diw-ai-help { padding:20px; margin-top:24px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-soft); }
.diw-overlay .diw-ai-help .diw-section-heading { color:var(--diw-soft-ink); }
.diw-overlay .diw-ai-help h3 { font-size:16px; }
.diw-overlay .diw-ai-help p { margin:12px 0 16px; color:var(--diw-secondary); font-size:14px; line-height:1.75; }
.diw-overlay .diw-ai-help .diw-button { background:var(--diw-panel); }
.diw-overlay .diw-prompt-panel { min-width:0; margin-top:20px; padding-top:16px; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-prompt-panel summary { min-height:40px; padding:8px 0; margin-bottom:8px; color:var(--diw-accent); font-size:14px; line-height:1.5; cursor:pointer; }
.diw-overlay .diw-prompt-panel textarea { display:block; width:100%; min-width:0; padding:12px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); color:var(--diw-ink); background:var(--diw-panel); font-size:16px; line-height:1.75; resize:vertical; }
.diw-overlay .diw-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; min-height:220px; padding:32px 24px; border:1px dashed var(--diw-control); border-radius:var(--diw-radius-card); color:var(--diw-ink); background:var(--diw-panel); text-align:center; }
.diw-overlay .diw-empty-icon { display:grid; place-items:center; width:48px; height:48px; margin-bottom:4px; border-radius:8px; background:var(--diw-soft); color:var(--diw-soft-ink); }
.diw-overlay .diw-empty strong { font-size:18px; line-height:1.5; font-weight:600; }
.diw-overlay .diw-empty p { max-width:42ch; color:var(--diw-muted); font-size:14px; line-height:1.75; }
.diw-overlay .diw-empty-results { display:grid; justify-items:center; gap:16px; }
.diw-overlay .diw-empty-results .diw-empty { width:100%; }
.diw-overlay .diw-page-heading { padding:0 0 24px; }
.diw-overlay .diw-page-heading h2 { margin-top:6px; font-size:28px; line-height:1.4; letter-spacing:-.02em; }
.diw-overlay .diw-page-heading p { margin-top:8px; color:var(--diw-secondary); font-size:14px; line-height:1.75; }
.diw-overlay .diw-history-list { display:grid; gap:12px; margin-top:20px; }
.diw-overlay .diw-history-card { display:block; width:100%; min-width:0; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); color:var(--diw-ink); background:var(--diw-panel); text-align:left; }
.diw-overlay .diw-history-card:hover:not(:disabled) { border-color:var(--diw-accent); background:var(--diw-soft); }
.diw-overlay .diw-history-card small { color:var(--diw-muted); font-size:12px; line-height:1.5; }
.diw-overlay .diw-history-card h3 { margin:16px 0 12px; font-size:18px; line-height:1.5; }
.diw-overlay .diw-history-card p { color:var(--diw-secondary); font-size:14px; line-height:1.6; }
.diw-overlay .diw-history-open { display:inline-flex; align-items:center; gap:8px; color:var(--diw-accent); font-size:14px; font-weight:600; }
.diw-overlay .diw-learning-loop { display:grid; gap:24px; margin:0; padding:0; list-style:none; }
.diw-overlay .diw-learning-loop li { display:flex; gap:12px; min-width:0; }
.diw-overlay .diw-learning-loop li > span { display:grid; place-items:center; flex:none; width:32px; height:32px; border-radius:8px; background:var(--diw-soft); color:var(--diw-soft-ink); font-size:12px; font-weight:600; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-learning-loop li > div { min-width:0; }
.diw-overlay .diw-learning-loop h3 { margin:2px 0 8px; font-size:16px; line-height:1.5; }
.diw-overlay .diw-learning-loop p { color:var(--diw-secondary); font-size:14px; line-height:1.75; }
.diw-overlay .diw-note-card { padding:20px; margin-top:28px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-bg); }
.diw-overlay .diw-note-card > svg { color:var(--diw-accent); margin-bottom:12px; }
.diw-overlay .diw-note-card h3 { margin-bottom:12px; font-size:16px; line-height:1.5; }
.diw-overlay .diw-note-card p { color:var(--diw-secondary); font-size:14px; line-height:1.75; }
.diw-overlay .diw-sources { display:grid; gap:16px; }
.diw-overlay .diw-source-card { display:flex; gap:16px; min-width:0; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-source-card > div { min-width:0; }
.diw-overlay .diw-source-icon { display:grid; place-items:center; flex:none; width:40px; height:40px; border-radius:10px; background:var(--diw-soft); color:var(--diw-soft-ink); }
.diw-overlay .diw-source-card h3 { font-size:18px; line-height:1.5; overflow-wrap:anywhere; }
.diw-overlay .diw-source-card p { margin:8px 0; color:var(--diw-secondary); font-size:14px; line-height:1.75; overflow-wrap:anywhere; }
.diw-overlay .diw-source-card .diw-meta { margin-top:16px; }
.diw-overlay .diw-practice-heading { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:8px 12px; margin-bottom:12px; }
.diw-overlay .diw-practice-heading > div { min-width:0; }
.diw-overlay .diw-practice-heading h2 { margin:0 0 4px; font-size:24px; line-height:1.3; letter-spacing:-.02em; }
.diw-overlay .diw-practice-heading > .diw-badge { margin-top:4px; }
.diw-overlay .diw-mode-rule { margin:0 0 16px; color:var(--diw-secondary); font-size:14px; line-height:1.65; }
.diw-overlay .diw-progress-card { position:relative; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px 20px; min-width:0; padding:12px 16px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-progress-card .diw-section-heading { flex:1 1 190px; justify-content:flex-start; }
.diw-overlay .diw-progress-card .diw-section-heading strong { font-size:16px; line-height:1.5; font-weight:600; }
.diw-overlay .diw-progress-card .diw-muted { font-size:12px; }
.diw-overlay .diw-progress-card progress { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.diw-overlay .diw-question-steps { display:flex; flex-wrap:wrap; gap:8px; }
.diw-overlay .diw-progress-card .diw-question-steps { flex:0 1 auto; min-width:0; max-width:100%; }
.diw-overlay .diw-question-steps button { display:grid; place-items:center; width:var(--diw-target); height:var(--diw-target); padding:0; border:1px solid var(--diw-control); border-radius:8px; color:var(--diw-secondary); background:var(--diw-panel); font-size:14px; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-question-steps button[data-answered=true] { background:var(--diw-soft); color:var(--diw-soft-ink); }
.diw-overlay .diw-question-steps button[aria-pressed=true] { border-color:var(--diw-accent); background:var(--diw-accent); color:var(--diw-on-accent); font-weight:700; }
.diw-overlay .diw-training-question { display:flow-root; min-width:0; height:auto; padding-top:16px; }
.diw-overlay .diw-training-question > h3 { margin:10px 0 12px; font-size:24px; line-height:1.5; letter-spacing:-.015em; text-wrap:balance; overflow-wrap:break-word; }
.diw-overlay .diw-training-question > .diw-content { font-size:16px; line-height:1.75; }
.diw-overlay .diw-answer-editor { display:flow-root; min-width:0; height:auto; padding:20px; margin-top:28px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-field { display:grid; gap:10px; min-width:0; color:var(--diw-ink); font-size:14px; font-weight:600; }
.diw-overlay .diw-field textarea { display:block; width:100%; min-width:0; padding:14px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); background:var(--diw-panel); color:var(--diw-ink); font-size:16px; font-weight:400; line-height:1.75; resize:vertical; }
.diw-overlay .diw-answer-editor .diw-field textarea { min-height:280px; }
.diw-overlay .diw-editor-help { margin-top:10px; color:var(--diw-muted); font-size:13px; line-height:1.6; }
.diw-overlay .diw-editor-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:14px; }
.diw-overlay .diw-editor-toolbar > div:first-child { min-width:0; }
.diw-overlay .diw-editor-toolbar :is(strong,label) { display:block; color:var(--diw-ink); font-size:14px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-editor-toolbar :is(small,p) { display:block; margin-top:3px; color:var(--diw-muted); font-size:12px; line-height:1.6; }
.diw-overlay .diw-editor-toolbar .diw-button[aria-pressed=true] { color:var(--diw-soft-ink); background:var(--diw-soft); border-color:var(--diw-accent); }
.diw-overlay .diw-writing-preview { min-width:0; min-height:280px; padding:16px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-control); background:var(--diw-rail); }
.diw-overlay .diw-writing-preview .diw-content { max-width:100%; }
.diw-overlay .diw-answer-outline { min-width:0; margin-bottom:16px; padding:0 14px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-control); background:var(--diw-rail); }
.diw-overlay .diw-answer-outline summary { min-height:var(--diw-target); padding:10px 0; color:var(--diw-secondary); font-size:13px; line-height:1.6; cursor:pointer; }
.diw-overlay .diw-answer-outline > p { margin:0 0 12px; color:var(--diw-muted); font-size:13px; line-height:1.7; }
.diw-overlay .diw-answer-outline > .diw-button, .diw-overlay .diw-answer-outline > .diw-actions { margin:0 0 14px; }
.diw-overlay .diw-retry-card { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; min-width:0; margin-top:24px; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-soft); }
.diw-overlay .diw-retry-card > div:first-child { flex:1 1 280px; min-width:0; }
.diw-overlay .diw-retry-card h3 { color:var(--diw-soft-ink); font-size:18px; line-height:1.5; }
.diw-overlay .diw-retry-card p { margin-top:6px; color:var(--diw-secondary); font-size:14px; line-height:1.7; }
/* Practice is one document column. Its action bar occupies its measured flow height. */
.diw-overlay .diw-layout[data-view=practice] { grid-template-columns:196px minmax(0,1fr); }
.diw-overlay .diw-layout[data-view=practice] .diw-main { grid-column:2; padding-bottom:32px; scroll-padding-bottom:24px; }
.diw-overlay .diw-layout[data-view=practice] .diw-inspector { display:none; }
.diw-overlay .diw-practice-body { display:flow-root; width:100%; max-width:850px; min-width:0; height:auto; margin-inline:auto; }
.diw-overlay .diw-practice-body > * { flex-shrink:0; }
.diw-overlay .diw-practice-tabs { display:flex; align-items:stretch; flex-wrap:wrap; gap:8px; padding:6px; margin:16px 0; border:1px solid var(--diw-line); border-radius:10px; background:var(--diw-rail); }
.diw-overlay .diw-practice-tabs button { display:flex; align-items:center; justify-content:center; flex:1 1 180px; min-width:0; min-height:44px; padding:10px 16px; border:1px solid transparent; border-radius:8px; background:transparent; color:var(--diw-secondary); font-size:14px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-practice-tabs button:hover:not(:disabled) { color:var(--diw-soft-ink); background:var(--diw-soft); }
.diw-overlay .diw-practice-tabs button[aria-pressed=true] { border-color:var(--diw-accent); background:var(--diw-panel); color:var(--diw-accent); box-shadow:inset 0 -2px var(--diw-accent); }
.diw-overlay .diw-answer-pane { display:flow-root; min-width:0; height:auto; }
.diw-overlay .diw-answer-pane > :first-child { margin-top:0; }
.diw-overlay .diw-practice-review { display:flow-root; min-width:0; height:auto; padding:24px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-practice-review > :first-child { margin-top:0; }
.diw-overlay .diw-practice-review > :last-child { margin-bottom:0; }
.diw-overlay .diw-practice-actions { position:static; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; min-width:0; padding:16px; margin:24px 0 0; border:1px solid var(--diw-control); border-radius:var(--diw-radius-card); background:var(--diw-raised); }
.diw-overlay .diw-practice-actions .diw-actions { flex-wrap:wrap; gap:8px; }
.diw-overlay .diw-finish-confirm { display:flow-root; min-width:0; height:auto; margin:16px 0 0; padding:20px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-finish-confirm h3 { font-size:18px; line-height:1.5; }
.diw-overlay .diw-finish-confirm p { margin:10px 0 16px; color:var(--diw-secondary); font-size:14px; line-height:1.75; overflow-wrap:anywhere; }
.diw-overlay .diw-finish-confirm .diw-actions { justify-content:flex-end; }
.diw-overlay .diw-save-state { display:flex; align-items:center; gap:8px; width:100%; color:var(--diw-muted); font-size:12px; line-height:1.5; }
.diw-overlay .diw-saved-answer { display:flow-root; min-width:0; height:auto; padding:20px; margin-top:28px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-saved-answer .diw-section-heading { margin-bottom:16px; }
.diw-overlay .diw-saved-answer h4 { font-size:18px; }
.diw-overlay .diw-saved-answer small { color:var(--diw-muted); font-size:12px; }
.diw-overlay .diw-lock-card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; padding:28px 24px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-soft); color:var(--diw-soft-ink); text-align:center; }
.diw-overlay .diw-lock-card h3 { font-size:18px; line-height:1.5; }
.diw-overlay .diw-lock-card p { max-width:36ch; color:var(--diw-secondary); font-size:14px; line-height:1.75; }
.diw-overlay .diw-review-form { margin-top:24px; padding-top:24px; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-review-form > .diw-muted { margin:12px 0 16px; font-size:14px; }
.diw-overlay .diw-score-options { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; }
.diw-overlay .diw-score-options button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; min-height:76px; min-width:0; padding:8px 4px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); background:var(--diw-panel); color:var(--diw-secondary); font-size:20px; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-score-options button strong { color:inherit; font-size:20px; line-height:1.3; font-weight:650; }
.diw-overlay .diw-score-options button span { font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
.diw-overlay .diw-score-options button[aria-pressed=true] { color:var(--diw-on-accent); background:var(--diw-accent); border-color:var(--diw-accent); }
.diw-overlay .diw-score-caption { padding:12px 0 20px; color:var(--diw-soft-ink); font-size:13px; line-height:1.5; }
.diw-overlay .diw-review-form > .diw-button { margin-top:16px; }
.diw-overlay .diw-reviews { display:grid; gap:12px; margin-top:24px; }
.diw-overlay .diw-review-record { min-width:0; padding:16px; border:1px solid var(--diw-line); border-radius:12px; background:var(--diw-bg); }
.diw-overlay .diw-review-record .diw-section-heading strong { font-size:18px; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-review-record > .diw-content { margin:12px 0; font-size:16px; }
.diw-overlay .diw-review-record > small { display:block; margin-top:8px; color:var(--diw-muted); font-size:12px; }
.diw-overlay :is(.diw-alert,.diw-notice) { position:relative; display:flex; align-items:center; justify-content:space-between; flex:none; gap:16px; min-width:0; padding:12px 24px; border-bottom:1px solid var(--diw-line); font-size:14px; line-height:1.6; overflow-wrap:anywhere; }
.diw-overlay .diw-alert { background:var(--diw-danger-bg); color:var(--diw-danger); }
.diw-overlay .diw-alert > span { min-width:0; }
.diw-overlay .diw-alert .diw-button { flex:none; }
.diw-overlay .diw-reader-error { display:grid; justify-items:start; gap:12px; padding:20px; margin:16px 0 24px; border:1px solid var(--diw-danger); border-radius:var(--diw-radius-card); color:var(--diw-danger); background:var(--diw-danger-bg); }
.diw-overlay .diw-reader-error h3 { font-size:18px; line-height:1.5; }
.diw-overlay .diw-reader-error p { min-width:0; color:var(--diw-danger); font-size:14px; line-height:1.65; overflow-wrap:anywhere; }
.diw-overlay .diw-notice { color:var(--diw-soft-ink); background:var(--diw-soft); }
.diw-overlay .diw-sr-only { position:absolute!important; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.diw-overlay.diw-fallback { background:rgb(9 23 28 / 54%); }
.diw-overlay .diw-card { position:relative; width:min(580px,100%); padding:28px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-card > p { margin:16px 0 24px; color:var(--diw-muted); overflow-wrap:anywhere; }
.diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) { grid-template-columns:196px minmax(0,1fr); }
.diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-main { display:none; }
.diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-inspector { grid-column:2; padding:24px clamp(24px,5vw,80px) 40px; }
.diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-inspector > * { max-width:72ch; margin-inline:auto; }
.diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-reader-title { font-size:28px; }
/* The additive sidebar control lives outside the workbench overlay. */
.diw-sidebar-entry { box-sizing:border-box; display:flex; align-items:center; gap:10px; width:100%; min-height:44px; padding:8px; border:1px solid transparent; border-radius:10px; color:var(--dsw-alias-label-primary,#182C30); background:transparent; cursor:pointer; font-family:inherit; line-height:1.5; text-align:left; }
.diw-sidebar-entry:hover { background:var(--dsw-alias-bg-layer-2,#E5F3ED); }
.diw-sidebar-entry:focus-visible { outline:3px solid #0F766E; outline-offset:3px; }
.diw-sidebar-entry[data-wide=false] { justify-content:center; }
.diw-sidebar-entry .diw-sidebar-mark { display:grid; place-items:center; flex:none; width:30px; height:30px; border-radius:8px; background:#0F766E; color:#FFFFFF; }
.diw-sidebar-entry :is(strong,small) { display:block; }
.diw-sidebar-entry strong { font-size:14px; font-weight:600; }
.diw-sidebar-entry small { margin-top:1px; font-size:12px; opacity:.75; }
.diw-overlay[data-theme=dark], .dark .diw-overlay[data-theme=auto], [data-theme=dark] .diw-overlay[data-theme=auto] {
  --diw-bg:#101A20; --diw-panel:#162329; --diw-rail:#122027; --diw-raised:#1C2C33;
  --diw-ink:#ECF3F2; --diw-secondary:#B1C2C4; --diw-muted:#A1B5B8;
  --diw-line:#33494E; --diw-control:#6A858B; --diw-accent:#65CCB5; --diw-on-accent:#102B29;
  --diw-soft:#173D38; --diw-soft-ink:#8CE0CC; --diw-warm:#E7BD70; --diw-warm-bg:#3D321D;
  --diw-danger:#FFADA6; --diw-danger-bg:#442522; --diw-code-bg:#0D171C; --diw-code-ink:#D5E7E3; color-scheme:dark;
}
@media(prefers-color-scheme:dark) {
  .diw-overlay[data-theme=auto] {
    --diw-bg:#101A20; --diw-panel:#162329; --diw-rail:#122027; --diw-raised:#1C2C33;
    --diw-ink:#ECF3F2; --diw-secondary:#B1C2C4; --diw-muted:#A1B5B8;
    --diw-line:#33494E; --diw-control:#6A858B; --diw-accent:#65CCB5; --diw-on-accent:#102B29;
    --diw-soft:#173D38; --diw-soft-ink:#8CE0CC; --diw-warm:#E7BD70; --diw-warm-bg:#3D321D;
    --diw-danger:#FFADA6; --diw-danger-bg:#442522; --diw-code-bg:#0D171C; --diw-code-ink:#D5E7E3; color-scheme:dark;
  }
}
/* Dark surfaces lighten the primary button on hover instead of darkening it. */
.diw-overlay[data-theme=dark] .diw-button-primary:hover:not(:disabled),
.dark .diw-overlay[data-theme=auto] .diw-button-primary:hover:not(:disabled),
[data-theme=dark] .diw-overlay[data-theme=auto] .diw-button-primary:hover:not(:disabled) { box-shadow:inset 0 0 0 100px rgb(255 255 255 / 14%); }
@media(prefers-color-scheme:dark) {
  .diw-overlay[data-theme=auto] .diw-button-primary:hover:not(:disabled) { box-shadow:inset 0 0 0 100px rgb(255 255 255 / 14%); }
}
@media(min-width:1600px) {
  .diw-overlay .diw-main { padding:28px; }
  .diw-overlay .diw-inspector { padding:28px 32px; }
}
@media(max-width:1250px) and (min-width:1101px) {
  .diw-overlay { padding:12px; }
  .diw-overlay .diw-layout[data-view=bank]:not([data-focus=true]):not([data-reading=true]) { grid-template-columns:196px minmax(330px,1fr) minmax(390px,1.02fr); }
  .diw-overlay .diw-main, .diw-overlay .diw-inspector { padding:20px; }
  .diw-overlay .diw-header-actions > .diw-badge { display:none; }
}
@media(max-width:1100px) {
  .diw-overlay { padding:12px; --diw-target:44px; }
  .diw-overlay .diw-header { min-height:76px; padding:16px 20px; }
  .diw-overlay .diw-header-actions > .diw-badge { display:none; }
  /* The layout becomes the sole document scroller. Natural-height rows must never
     share the viewport height: visible overflow in a compressed row paints over
     the next row (especially long reference answers and the answer editor). */
  .diw-overlay .diw-layout, .diw-overlay .diw-layout[data-view=bank] { grid-template-columns:196px minmax(0,1fr); grid-template-rows:none; grid-auto-rows:max-content; align-content:start; align-items:start; overflow:auto; scroll-padding-block:24px; }
  .diw-overlay .diw-rail { grid-column:1; grid-row:1 / 3; position:sticky; top:0; align-self:start; min-height:0; max-height:calc(100dvh - 104px); }
  .diw-overlay :is(.diw-main,.diw-inspector) { min-height:auto; height:auto; max-height:none; align-self:start; overflow:visible; scrollbar-gutter:auto; }
  .diw-overlay .diw-main { grid-column:2; grid-row:1; padding:24px; }
  .diw-overlay .diw-inspector { grid-column:2; grid-row:2; padding:24px; border-left:0; border-top:1px solid var(--diw-line); }
  .diw-overlay .diw-layout[data-view=bank] .diw-inspector { display:none; }
  .diw-overlay .diw-layout[data-view=bank][data-reading=true] .diw-main, .diw-overlay .diw-layout[data-view=bank][data-focus=true] .diw-main { display:none; }
  .diw-overlay .diw-layout[data-view=bank][data-reading=true] .diw-inspector, .diw-overlay .diw-layout[data-view=bank][data-focus=true] .diw-inspector { display:block; grid-row:1; border-top:0; padding:24px; }
  .diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) { grid-template-columns:196px minmax(0,1fr); }
  .diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-inspector { grid-row:1; padding:24px; }
  .diw-overlay .diw-layout:is([data-view=history],[data-view=sources]) .diw-inspector { display:none; }
  .diw-overlay .diw-practice-actions { margin-inline:0; }
  .diw-overlay .diw-layout[data-view=practice] { grid-template-columns:196px minmax(0,1fr); }
  .diw-overlay .diw-layout[data-view=practice] .diw-rail { grid-row:1; }
  .diw-overlay .diw-layout[data-view=practice] .diw-main { grid-column:2; grid-row:1; padding-bottom:32px; }
  .diw-overlay .diw-overview-grid { grid-template-columns:minmax(0,1fr); }
  .diw-overlay .diw-topic-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .diw-overlay .diw-overview-stats { gap:12px; }
  .diw-overlay .diw-stat-card { padding:16px; }
  .diw-overlay .diw-next-session { padding:20px; }
  .diw-overlay .diw-quick-start { padding:20px; }
}
@media(max-width:700px) {
  .diw-overlay { padding:0; --diw-gutter:16px; }
  .diw-overlay .diw-shell { width:100%; height:100%; max-height:100dvh; border:0; border-radius:0; }
  .diw-overlay .diw-header { min-height:68px; padding:12px 16px; gap:8px; }
  .diw-overlay .diw-brand { gap:0; }
  .diw-overlay .diw-brand-mark, .diw-overlay .diw-brand p { display:none; }
  .diw-overlay .diw-brand-title { font-size:18px; line-height:1.4; }
  .diw-overlay .diw-header-actions { gap:4px; }
  .diw-overlay .diw-layout, .diw-overlay .diw-layout[data-view=bank], .diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]), .diw-overlay .diw-layout[data-view=practice] { grid-template-columns:minmax(0,1fr); }
  .diw-overlay .diw-rail { display:grid; grid-template-columns:minmax(0,1fr); grid-column:1; grid-row:1; gap:8px; position:static; min-height:0; max-height:none; padding:12px 16px; overflow:visible; border-right:0; border-bottom:1px solid var(--diw-line); }
  .diw-overlay .diw-role-switch { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .diw-overlay .diw-nav-links { grid-template-columns:repeat(5,minmax(0,1fr)); gap:4px; }
  .diw-overlay .diw-track { min-height:62px; padding:8px; gap:8px; }
  .diw-overlay .diw-layout[data-view=practice] .diw-role-switch { display:none; }
  .diw-overlay .diw-track strong { font-size:14px; }
  .diw-overlay .diw-track small { font-size:12px; }
  .diw-overlay .diw-selected-dot { display:none; }
  .diw-overlay :is(.diw-rail-label,.diw-rail-rule,.diw-rail-footer) { display:none; }
  .diw-overlay .diw-nav-item { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; min-height:64px; padding:8px 2px; text-align:center; }
  .diw-overlay .diw-nav-item strong { font-size:12px; }
  .diw-overlay .diw-nav-item small, .diw-overlay .diw-live-dot { display:none; }
  .diw-overlay .diw-nav-item[aria-current=page] { box-shadow:inset 0 -3px var(--diw-accent); }
  .diw-overlay .diw-main { grid-column:1; grid-row:2; padding:24px 16px; }
  .diw-overlay .diw-inspector { grid-column:1; grid-row:3; padding:24px 16px; }
  .diw-overlay .diw-layout[data-view=practice] .diw-main { grid-column:1; grid-row:2; padding:24px 16px 32px; }
  .diw-overlay .diw-layout[data-view=bank][data-reading=true] .diw-inspector, .diw-overlay .diw-layout[data-view=bank][data-focus=true] .diw-inspector { grid-column:1; grid-row:2; padding:24px 16px; }
  .diw-overlay :is(.diw-page-heading,.diw-practice-heading) h2 { font-size:24px; }
  .diw-overlay .diw-launcher { padding:0; gap:0; }
  .diw-overlay .diw-launcher-toggle { display:flex; justify-content:space-between; width:100%; min-height:48px; padding:12px 16px; border:0; border-radius:var(--diw-radius-card); background:transparent; text-align:left; }
  .diw-overlay .diw-launcher-body { display:none; padding:0 12px 16px; }
  .diw-overlay .diw-launcher[data-expanded=true] .diw-launcher-body { display:grid; }
  .diw-overlay .diw-launcher[data-expanded=true] .diw-launcher-toggle { margin-bottom:12px; }
  .diw-overlay .diw-launcher-count { flex:0 0 72px; }
  .diw-overlay .diw-launcher-count select { min-width:0; width:100%; }
  .diw-overlay .diw-mode-options button { padding:10px; min-height:80px; }
  .diw-overlay .diw-summary-strip { gap:12px 20px; }
  .diw-overlay .diw-filters { gap:12px; }
  .diw-overlay .diw-filters > .diw-search { flex:1 1 100%; }
  .diw-overlay :is(.diw-topic-filter,.diw-difficulty-filter) { flex:1 1 0; }
  .diw-overlay .diw-question-row { grid-template-columns:24px minmax(0,1fr) 16px; gap:8px; padding:14px 12px; }
  .diw-overlay .diw-question-copy > strong { font-size:16px; }
  .diw-overlay .diw-question-tags { gap:4px 8px; }
  .diw-overlay .diw-reader-toolbar { margin-bottom:20px; }
  .diw-overlay .diw-reader-title, .diw-overlay .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-reader-title { font-size:24px; }
  .diw-overlay .diw-content, .diw-overlay .diw-followups { font-size:16px; }
  .diw-overlay .diw-ai-help { padding:16px; }
  .diw-overlay .diw-answer-editor, .diw-overlay .diw-saved-answer, .diw-overlay .diw-practice-review, .diw-overlay .diw-finish-confirm { padding:16px; }
  .diw-overlay .diw-progress-card { padding:12px 16px; }
  .diw-overlay .diw-practice-tabs { gap:6px; padding:4px; }
  .diw-overlay .diw-practice-tabs button { flex-basis:0; padding:10px 8px; }
  .diw-overlay .diw-training-question > h3 { font-size:22px; }
  .diw-overlay .diw-answer-editor .diw-field textarea { min-height:280px; }
  .diw-overlay .diw-practice-actions { padding:12px; padding-bottom:max(12px,env(safe-area-inset-bottom)); margin:24px 0 0; gap:12px; }
  .diw-overlay .diw-practice-actions > .diw-actions { flex:1 1 100%; }
  .diw-overlay .diw-practice-actions > .diw-actions .diw-button { flex:1; }
  .diw-overlay .diw-practice-actions > .diw-button { width:100%; }
  .diw-overlay .diw-score-options { gap:8px; }
  .diw-overlay .diw-score-options button { min-height:84px; }
  .diw-overlay .diw-score-options button span { max-width:4em; }
  .diw-overlay .diw-source-card { gap:12px; padding:16px; }
  .diw-overlay .diw-source-icon { width:32px; height:32px; }
  .diw-overlay :is(.diw-alert,.diw-notice) { padding:12px 16px; font-size:14px; }
  .diw-overlay .diw-overview-topline { gap:12px; margin-bottom:20px; }
  .diw-overlay .diw-overview-topline > .diw-button { margin-top:0; }
  .diw-overlay .diw-overview-stats { gap:8px; margin-bottom:20px; }
  .diw-overlay .diw-stat-card { gap:4px; padding:12px; }
  .diw-overlay .diw-stat-card > span { min-height:36px; font-size:12px; }
  .diw-overlay .diw-stat-card > strong { font-size:28px; }
  .diw-overlay .diw-stat-card > small { line-height:1.55; }
  .diw-overlay .diw-overview-grid { gap:16px; }
  .diw-overlay :is(.diw-next-session,.diw-quick-start,.diw-continue-card,.diw-retry-card) { padding:18px; }
  .diw-overlay .diw-next-session { gap:12px; }
  .diw-overlay .diw-next-session h3 { font-size:20px; }
  .diw-overlay .diw-quick-start .diw-mode-options button { min-height:72px; }
  .diw-overlay .diw-section-space { margin-top:28px; }
  .diw-overlay .diw-topic-grid { gap:12px; }
  .diw-overlay .diw-topic-card { gap:10px; padding:16px; }
  .diw-overlay .diw-topic-card h3 { font-size:16px; }
  .diw-overlay .diw-topic-card-top { gap:8px; }
  .diw-overlay .diw-topic-card-top > svg { width:30px; height:30px; padding:6px; }
  .diw-overlay .diw-overview-foot { align-items:flex-start; }
  .diw-overlay .diw-filter-tabs { gap:6px; }
  .diw-overlay .diw-filter-tabs button { padding:8px 10px; }
  .diw-overlay .diw-question-item { grid-template-columns:28px minmax(0,1fr); gap:2px; }
  .diw-overlay .diw-pick { width:28px; }
  .diw-overlay .diw-question-item .diw-question-row { grid-template-columns:20px minmax(0,1fr) 16px; padding:9px 10px; }
  .diw-overlay .diw-selection-tray { padding:16px; }
  .diw-overlay .diw-selection-tray > .diw-actions .diw-button { flex:1 1 100%; }
  .diw-overlay .diw-editor-toolbar { gap:10px; }
  .diw-overlay .diw-writing-preview { padding:14px; }
}
@media(max-width:420px) {
  .diw-overlay .diw-topic-grid { grid-template-columns:minmax(0,1fr); }
  .diw-overlay .diw-topic-card { gap:10px; }
  .diw-overlay .diw-topic-card-top > svg { width:32px; height:32px; }
  .diw-overlay .diw-stat-card { padding:12px 10px; }
  .diw-overlay .diw-overview .diw-section-heading > .diw-button { width:100%; }
}
@media(pointer:coarse) { .diw-overlay { --diw-target:44px; } }
@media(prefers-reduced-motion:no-preference) {
  .diw-overlay :is(.diw-button,.diw-icon-button,.diw-question-row,.diw-nav-item,.diw-track,.diw-mode-options button,.diw-score-options button,.diw-stat-card,.diw-topic-card,.diw-filter-tabs button) { transition:background-color 160ms ease,border-color 160ms ease,color 160ms ease,box-shadow 160ms ease; }
}
@media(prefers-reduced-motion:reduce) {
  .diw-overlay *, .diw-overlay *::before, .diw-overlay *::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; }
}
/* Embedded DSH surfaces use the host theme and normal document layout.
   Token names are from ui-theme/src/styles/design-platform.css (DSH rc.2).
   The independent preview intentionally keeps its existing shell and colors. */
.diw-overlay.diw-native, .diw-overlay.diw-native[data-theme] {
  --diw-bg:var(--dsw-alias-bg-base,#FFFFFF); --diw-panel:var(--dsw-alias-bg-layer-2,#FFFFFF);
  --diw-rail:var(--dsw-alias-bg-module-platform,#F5F6F7); --diw-raised:var(--dsw-alias-bg-layer-3,#FFFFFF);
  --diw-ink:var(--dsw-alias-label-primary,#202329); --diw-secondary:var(--dsw-alias-label-secondary,#59616E); --diw-muted:var(--dsw-alias-label-tertiary,#6A7380);
  --diw-line:var(--dsw-alias-border-l2,#E0E3E7); --diw-control:var(--dsw-alias-border-l4,#C5CAD2);
  --diw-accent:var(--dsw-alias-brand-primary,#202329); --diw-on-accent:var(--dsw-alias-label-primary-foreground,#FFFFFF);
  --diw-soft:var(--dsw-alias-interactive-bg-hover,#F0F2F5); --diw-soft-ink:var(--dsw-alias-label-primary,#202329);
  --diw-warm:var(--dsw-alias-state-warn-label,#936413); --diw-warm-bg:var(--dsw-alias-state-warn-tertiary,#FFF4DD);
  --diw-danger:var(--dsw-alias-state-error-primary,#B42318); --diw-danger-bg:var(--dsw-alias-interactive-bg-hover-danger,#FFF1EF);
  --diw-code-bg:var(--dsw-alias-markdown-code-block,#F5F6F7); --diw-code-ink:var(--dsw-alias-label-primary,#202329);
  --diw-radius-card:10px; --diw-radius-control:8px; --diw-target:36px;
  position:relative; inset:auto; z-index:auto; display:flex; flex:1 1 auto; width:100%; height:100%; min-width:0; min-height:0;
  padding:0; overflow:hidden; background:var(--diw-bg); color-scheme:inherit;
  font-family:var(--dsw-font-family,-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif); font-size:14px;
}
.diw-overlay.diw-native .diw-backdrop { display:none; }
.diw-overlay.diw-native .diw-shell { width:100%; height:100%; max-height:none; min-height:0; border:0; border-radius:0; box-shadow:none; background:var(--diw-bg); }
.diw-overlay.diw-native .diw-header { min-height:54px; padding:10px 20px; gap:12px; background:var(--diw-bg); }
.diw-overlay.diw-native .diw-brand { gap:10px; }
.diw-overlay.diw-native .diw-brand-mark { display:grid; width:28px; height:28px; border-radius:8px; background:var(--diw-soft); color:var(--diw-ink); }
.diw-overlay.diw-native .diw-brand-mark svg { width:18px; height:18px; }
.diw-overlay.diw-native .diw-brand-title { font-size:15px; line-height:1.5; letter-spacing:0; }
.diw-overlay.diw-native .diw-brand p { display:block; margin-top:1px; font-size:12px; }
.diw-overlay.diw-native .diw-session-context { color:var(--diw-muted); font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
.diw-overlay.diw-native .diw-header-actions { gap:4px; }
.diw-overlay.diw-native .diw-header-actions .diw-icon-button { width:32px; height:32px; border-color:transparent; background:transparent; }
.diw-overlay.diw-native .diw-layout { display:flex; flex-direction:column; flex:1 1 0; align-items:stretch; min-height:0; overflow:hidden; }
.diw-overlay.diw-native .diw-rail { position:static; display:flex; flex-direction:row; flex-wrap:wrap; align-items:center; flex:none; gap:8px 20px; max-height:none; padding:8px 20px; border:0; border-bottom:1px solid var(--diw-line); background:var(--diw-bg); overflow:visible; }
.diw-overlay.diw-native :is(.diw-rail-label,.diw-rail-rule,.diw-rail-footer) { display:none; }
.diw-overlay.diw-native .diw-role-switch { display:flex; flex:0 1 auto; gap:4px; padding:3px; border-radius:9px; background:var(--diw-rail); }
.diw-overlay.diw-native .diw-layout[data-view=practice] .diw-role-switch { display:flex; }
.diw-overlay.diw-native .diw-track { flex:1 1 auto; width:auto; min-height:32px; gap:6px; padding:5px 9px; border-radius:6px; white-space:nowrap; }
.diw-overlay.diw-native .diw-track[aria-pressed=true] { border-color:var(--diw-line); background:var(--diw-panel); }
.diw-overlay.diw-native .diw-track-icon { width:18px; height:18px; border-radius:0; background:transparent; }
.diw-overlay.diw-native .diw-track-icon svg { width:16px; height:16px; }
.diw-overlay.diw-native .diw-track strong { font-size:12px; font-weight:600; }
.diw-overlay.diw-native :is(.diw-track small,.diw-selected-dot) { display:none; }
.diw-overlay.diw-native .diw-nav-links { display:flex; flex:1 1 400px; gap:4px; overflow-x:auto; scrollbar-width:thin; }
.diw-overlay.diw-native .diw-nav-item { display:flex; flex-direction:row; justify-content:center; flex:1 0 auto; width:auto; min-height:36px; gap:6px; padding:6px 10px; border:0; border-radius:7px; white-space:nowrap; text-align:center; }
.diw-overlay.diw-native .diw-nav-item strong { font-size:12px; font-weight:500; }
.diw-overlay.diw-native .diw-nav-item > svg { width:16px; height:16px; }
.diw-overlay.diw-native .diw-nav-item[aria-current=page] { color:var(--diw-ink); background:var(--diw-soft); box-shadow:none; }
.diw-overlay.diw-native .diw-nav-item[aria-current=page] strong { font-weight:650; }
.diw-overlay.diw-native .diw-nav-item .diw-live-dot { display:block; margin-left:0; width:5px; height:5px; }
.diw-overlay.diw-native .diw-layout .diw-main, .diw-overlay.diw-native .diw-layout .diw-inspector {
  flex:1 1 0; align-self:stretch; width:100%; height:auto; min-height:0; max-height:none; padding:24px;
  border:0; overflow:auto; scrollbar-gutter:stable; scroll-padding-block:24px; background:var(--diw-bg);
}
.diw-overlay.diw-native .diw-main > * { max-width:1120px; margin-inline:auto; }
.diw-overlay.diw-native .diw-layout[data-view=bank] .diw-inspector { display:none; }
.diw-overlay.diw-native .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-main { display:none; }
.diw-overlay.diw-native .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-inspector { display:block; padding:24px 24px 40px; }
.diw-overlay.diw-native .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-inspector > * { max-width:78ch; margin-inline:auto; }
.diw-overlay.diw-native :is(.diw-page-heading,.diw-practice-heading) h2 { font-size:20px; letter-spacing:0; }
.diw-overlay.diw-native .diw-button { min-height:36px; font-size:13px; border-radius:8px; }
.diw-overlay.diw-native .diw-button-primary:hover:not(:disabled) { background:var(--dsw-alias-button-primary-hover,var(--diw-accent)); box-shadow:none; }
.diw-overlay.diw-native .diw-notice { font-size:13px; }
.diw-overlay.diw-native :is(.diw-alert,.diw-notice) { flex:none; }
/* Embedded bank view reads as one compact work column: intro, launcher, status
   filters, search filters and rows share the same 32/36px control rhythm. */
.diw-overlay.diw-native .diw-bank-intro { margin-bottom:12px; }
.diw-overlay.diw-native .diw-bank-intro p { font-size:13px; line-height:1.6; }
.diw-overlay.diw-native .diw-launcher { gap:10px; padding:12px; margin-bottom:10px; }
.diw-overlay.diw-native .diw-mode-options button { min-height:48px; padding:7px 10px; }
.diw-overlay.diw-native .diw-launcher-count select { min-height:32px; padding-block:5px; font-size:13px; }
.diw-overlay.diw-native .diw-filter-tabs { gap:6px; margin-bottom:12px; }
.diw-overlay.diw-native .diw-filter-tabs button { min-height:32px; padding:5px 10px; font-weight:500; }
.diw-overlay.diw-native .diw-bank-heading { margin-block:16px 10px; }
.diw-overlay.diw-native .diw-bank-heading h3 { margin-top:0; font-size:15px; }
.diw-overlay.diw-native .diw-filters { gap:10px; margin-bottom:12px; }
.diw-overlay.diw-native :is(.diw-search-control,.diw-topic-filter select,.diw-difficulty-filter select) { min-height:32px; }
.diw-overlay.diw-native .diw-search input { min-height:30px; font-size:13px; }
.diw-overlay.diw-native .diw-bank-toolbar { margin-block:12px 10px; }
.diw-overlay.diw-native .diw-question-row { padding-block:8px; }
.diw-overlay.diw-native .diw-question-item .diw-question-row { padding:7px 10px; }
.diw-overlay.diw-native .diw-question-copy > strong { font-size:14px; }
.diw-overlay.diw-native .diw-pick { min-height:36px; }
.diw-overlay.diw-native .diw-pagination { margin-top:12px; }
.diw-overlay.diw-native .diw-selection-tray { margin-top:16px; padding:16px; }
.diw-conversation-launcher { box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:28px; padding:4px 9px; border:1px solid transparent; border-radius:8px; background:transparent; color:var(--dsw-alias-label-secondary,#59616E); font:12px/1.5 var(--dsw-font-family,sans-serif); white-space:nowrap; cursor:pointer; }
.diw-conversation-launcher svg { flex:none; width:15px; height:15px; }
.diw-conversation-launcher:hover, .diw-conversation-launcher[aria-expanded=true] { color:var(--dsw-alias-label-primary,#202329); background:var(--dsw-alias-interactive-bg-hover,#F0F2F5); }
.diw-conversation-launcher:focus-visible { outline:2px solid var(--dsw-alias-brand-primary,#202329); outline-offset:2px; }
.diw-conversation-launcher:disabled { opacity:.45; cursor:not-allowed; }
.diw-native-dock { display:flex; flex-direction:column; width:100%; height:min(65vh,720px); max-height:min(65vh,720px); min-width:0; min-height:0; overflow:hidden; border:1px solid var(--dsw-alias-border-l2,#E0E3E7); border-radius:12px; background:var(--dsw-alias-bg-base,#FFFFFF); color:var(--dsw-alias-label-primary,#202329); }
.diw-native-dock > .diw-overlay.diw-native { flex:1 1 0; height:auto; min-height:0; }
.diw-native-dock-bar { display:flex; align-items:center; justify-content:space-between; flex:none; gap:12px; min-height:36px; padding:6px 12px; border-bottom:1px solid var(--dsw-alias-border-l2,#E0E3E7); font:12px/1.5 var(--dsw-font-family,sans-serif); }
.diw-native-dock-bar button { display:inline-flex; align-items:center; justify-content:center; flex:none; min-height:26px; padding:3px 8px; border:0; border-radius:6px; background:transparent; color:var(--dsw-alias-label-secondary,#59616E); font:inherit; cursor:pointer; }
.diw-native-dock-bar button:hover { background:var(--dsw-alias-interactive-bg-hover,#F0F2F5); color:var(--dsw-alias-label-primary,#202329); }
.diw-native-dock-bar button:focus-visible { outline:2px solid var(--dsw-alias-brand-primary,#202329); outline-offset:2px; }
.diw-native-session-hint { box-sizing:border-box; padding:12px 16px; color:var(--dsw-alias-label-secondary,#59616E); font:13px/1.7 var(--dsw-font-family,sans-serif); }
.diw-staged { box-sizing:border-box; display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; padding:10px 14px; border:1px solid var(--dsw-alias-border-l2,#E0E3E7); border-radius:10px; background:var(--dsw-alias-interactive-bg-hover,#F0F2F5); color:var(--dsw-alias-label-secondary,#59616E); font:13px/1.65 var(--dsw-font-family,sans-serif); overflow-wrap:anywhere; }
@media(max-width:700px) {
  .diw-overlay.diw-native .diw-header { padding:10px 14px; }
  .diw-overlay.diw-native .diw-brand-mark { display:none; }
  .diw-overlay.diw-native .diw-rail { gap:7px; padding:8px 12px; }
  .diw-overlay.diw-native .diw-role-switch { flex:1 1 100%; }
  .diw-overlay.diw-native .diw-track { justify-content:center; min-height:34px; }
  .diw-overlay.diw-native .diw-nav-links { flex-basis:100%; gap:2px; }
  .diw-overlay.diw-native .diw-nav-item { min-height:38px; padding:6px 8px; }
  .diw-overlay.diw-native .diw-layout .diw-main, .diw-overlay.diw-native .diw-layout[data-view=bank]:is([data-focus=true],[data-reading=true]) .diw-inspector { padding:20px 16px 28px; }
  .diw-native-dock-bar { padding-inline:10px; }
}
@media(max-width:700px),(pointer:coarse) {
  .diw-overlay.diw-native, .diw-overlay.diw-native[data-theme] { --diw-target:44px; }
  .diw-overlay.diw-native :is(.diw-button,.diw-track,.diw-nav-item,.diw-filter-tabs button,.diw-launcher-count select,.diw-search-control,.diw-topic-filter select,.diw-difficulty-filter select,.diw-pick) { min-height:44px; }
  .diw-overlay.diw-native .diw-search input { min-height:42px; font-size:16px; }
  .diw-overlay.diw-native :is(.diw-launcher-count,.diw-topic-filter,.diw-difficulty-filter) select { font-size:16px; }
  .diw-overlay.diw-native .diw-question-item { grid-template-columns:44px minmax(0,1fr); }
  .diw-overlay.diw-native .diw-pick { width:44px; }
  .diw-overlay.diw-native .diw-question-item .diw-question-row { min-height:44px; }
  .diw-conversation-launcher { min-height:36px; }
}
/* Width responds to the DSH middle column, including an open details pane. */
.diw-overlay.diw-native { container:diw-workbench / inline-size; }
.diw-overlay.diw-native .diw-rail { align-self:stretch; width:100%; max-width:100%; }
.diw-overlay.diw-native :is(.diw-role-switch,.diw-nav-links) { min-width:0; max-width:100%; }
.diw-overlay.diw-native .diw-track { min-width:0; }
.diw-native-dock { flex:0 0 auto; }
@container diw-workbench (max-width:850px) {
  .diw-overlay.diw-native .diw-overview-grid { grid-template-columns:minmax(0,1fr); }
  .diw-overlay.diw-native .diw-topic-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .diw-overlay.diw-native .diw-overview-stats { gap:10px; }
  .diw-overlay.diw-native .diw-stat-card { padding:14px; }
}
@container diw-workbench (max-width:520px) {
  .diw-overlay.diw-native .diw-topic-grid { grid-template-columns:minmax(0,1fr); }
  .diw-overlay.diw-native .diw-nav-links { flex-basis:100%; }
  .diw-overlay.diw-native .diw-role-switch { flex:1 1 100%; }
  .diw-overlay.diw-native .diw-layout .diw-main { padding:20px 16px 28px; }
}
`
