/** Global workspace chrome. Host semantic tokens keep it consistent with DSH themes. */
export const WORKSPACE_STYLES = `
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) {
  --diww-bg:var(--dsw-alias-bg-base,Canvas);
  --diww-panel:var(--dsw-alias-bg-layer-1,Canvas);
  --diww-ink:var(--dsw-alias-label-primary,CanvasText);
  --diww-secondary:var(--dsw-alias-label-secondary,GrayText);
  --diww-muted:var(--dsw-alias-label-tertiary,GrayText);
  --diww-line:var(--dsw-alias-border-l2,ButtonBorder);
  --diww-hover:var(--dsw-alias-interactive-bg-hover,ButtonFace);
  --diww-active:var(--dsw-alias-interactive-bg-active,ButtonFace);
  --diww-accent:var(--dsw-alias-brand-primary,CanvasText);
  --diww-focus:var(--dsw-alias-brand-primary-new-colorprimary-new-color,Highlight);
  --diww-foreground:var(--dsw-alias-label-primary-foreground,Canvas);
  box-sizing:border-box;
  color:var(--diww-ink);
  font:13px/1.5 var(--dsw-font-family,-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif);
  color-scheme:inherit;
}
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) *,
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) *::before,
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) *::after { box-sizing:border-box; }
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) :is(button,input,select) { font:inherit; }
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) button { cursor:pointer; }
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) button:disabled { opacity:.45; cursor:not-allowed; }
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) :is(button,input,select,a):focus-visible { outline:2px solid var(--diww-focus); outline-offset:3px; }
:is(.diw-workspace-entry,.diw-workspace-navigation,.diw-workspace-native,.diw-workspace-library,.diw-workspace-center,.diw-workspace-fallback) [hidden] { display:none!important; }
.diw-workspace-navigation { display:flex; align-items:stretch; min-width:0; min-height:36px; }
.diw-workspace-entry {
  display:inline-flex; align-items:center; justify-content:center; flex:1 1 auto; gap:6px;
  width:100%; min-width:0; min-height:36px; padding:7px 9px;
  border:1px solid var(--diww-line); border-radius:8px;
  color:var(--diww-secondary); background:transparent; white-space:nowrap;
  font-size:13px; font-weight:550; line-height:20px;
}
.diw-workspace-entry svg { display:block; flex:none; width:15px; height:15px; }
.diw-workspace-entry:focus-visible { outline:2px solid var(--diww-focus); outline-offset:3px; }
.diw-workspace-entry:disabled { opacity:.45; cursor:not-allowed; }
.diw-workspace-entry:hover { color:var(--diww-ink); background:var(--diww-hover); }
.diw-workspace-entry[aria-pressed=true] { color:var(--diww-ink); background:var(--diww-active); border-color:var(--dsw-alias-border-l4,ButtonBorder); }
[data-sidebar-collapsed=true] .diw-workspace-entry,
[data-diw-workspace-collapsed=true] .diw-workspace-entry { width:34px; min-width:34px; height:34px; min-height:34px; flex:none; padding:8px; border-color:transparent; border-radius:8px; }
[data-sidebar-collapsed=true] .diw-workspace-entry span,
[data-diw-workspace-collapsed=true] .diw-workspace-entry span { display:none; }
[data-sidebar-collapsed=true] :is(.diw-workspace-navigation,.diw-workspace-mount-navigation),
[data-diw-workspace-collapsed=true] :is(.diw-workspace-navigation,.diw-workspace-mount-navigation) { justify-content:center; }
.diw-workspace-library { display:flex; flex-direction:column; flex:1 1 0; gap:10px; width:100%; height:100%; min-width:0; min-height:0; padding:14px 0 8px; overflow:hidden; background:inherit; }
.diw-workspace-native { display:grid; container:diw-native / inline-size; grid-template-columns:minmax(208px,248px) minmax(0,1fr); width:100%; height:100%; min-width:0; min-height:0; overflow:hidden; background:var(--diww-bg); }
.diw-workspace-native > .diw-workspace-library { border-right:1px solid var(--diww-line); }
.diw-workspace-native > .diw-workspace-center { min-width:0; }
@container diw-native (max-width:820px) {
  .diw-workspace-native > .diw-workspace-library { display:none; }
  .diw-workspace-native > .diw-workspace-center { grid-column:1 / -1; }
  .diw-workspace-native .diw-workspace-toolbar [data-workspace-list-toggle] { display:inline-flex; }
}
.diw-workspace-library-heading { display:flex; align-items:center; justify-content:space-between; flex:none; gap:8px; min-width:0; padding:0 5px; }
.diw-workspace-library-heading :is(h2,h3,strong) { min-width:0; margin:0; color:var(--diww-secondary); font-size:13px; font-weight:550; line-height:1.5; }
.diw-workspace-library-heading :is(button,a), .diw-workspace-library-footer button {
  display:inline-flex; align-items:center; justify-content:center; gap:4px; flex:none;
  min-height:28px; padding:4px 6px; border:0; border-radius:6px;
  color:var(--diww-muted); background:transparent; font-size:12px; text-decoration:none;
}
.diw-workspace-library-heading :is(button,a):hover, .diw-workspace-library-footer button:hover { background:var(--diww-hover); color:var(--diww-ink); }
.diw-workspace-library-heading svg { display:block; width:14px; height:14px; }
.diw-workspace-new {
  display:flex; align-items:center; justify-content:center; flex:none; gap:7px; width:100%; min-height:36px;
  padding:8px 12px; border:1px solid var(--diww-line); border-radius:9px;
  color:var(--diww-ink); background:var(--diww-panel); font-size:13px; font-weight:550;
}
.diw-workspace-new:hover { background:var(--diww-hover); border-color:var(--dsw-alias-border-l4,ButtonBorder); }
.diw-workspace-new svg { width:15px; height:15px; flex:none; }
.diw-workspace-search { display:flex; align-items:center; flex:none; gap:6px; width:100%; min-width:0; min-height:34px; padding:0 10px; border:1px solid var(--diww-line); border-radius:8px; background:transparent; color:var(--diww-muted); }
.diw-workspace-search > span { position:absolute; width:1px; height:1px; padding:0; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.diw-workspace-search > :is(span,svg) { flex:none; font-size:12px; }
.diw-workspace-search svg { width:14px; height:14px; }
.diw-workspace-search input { width:100%; min-width:0; min-height:32px; padding:6px 0; border:0; outline:0; color:var(--diww-ink); background:transparent; font-size:12px; }
.diw-workspace-search input::placeholder { color:var(--diww-muted); opacity:1; }
.diw-workspace-search:focus-within { outline:2px solid var(--diww-focus); outline-offset:2px; }
.diw-workspace-search input:focus-visible { outline:0; }
.diw-workspace-filters { display:flex; align-items:center; flex:none; gap:3px; min-width:0; padding:3px; border:1px solid var(--dsw-alias-border-l1,ButtonBorder); border-radius:8px; background:var(--diww-hover); }
.diw-workspace-filters button { display:flex; align-items:center; justify-content:center; flex:1 1 0; gap:3px; min-width:0; min-height:28px; padding:5px 3px; border:0; border-radius:5px; background:transparent; color:var(--diww-muted); font-size:12px; white-space:nowrap; }
.diw-workspace-filters button:is([aria-pressed=true],[aria-selected=true]) { color:var(--diww-ink); background:var(--diww-panel); font-weight:550; box-shadow:0 1px 2px var(--dsw-alias-border-l1,transparent); }
.diw-workspace-filters button:hover:not([aria-pressed=true]):not([aria-selected=true]) { color:var(--diww-ink); }
.diw-workspace-filters button span { display:inline-block; min-width:10px; font-size:10px; color:var(--diww-muted); font-variant-numeric:tabular-nums; }
.diw-workspace-filters button:is([aria-pressed=true],[aria-selected=true]) span { color:var(--diww-secondary); }
.diw-workspace-records { display:flex; flex-direction:column; align-items:stretch; gap:4px; flex:1 1 0; min-width:0; min-height:0; padding:2px; overflow:auto; overscroll-behavior:contain; scrollbar-width:thin; scroll-padding-block:8px; }
.diw-workspace-record-group { display:flex; flex-direction:column; gap:4px; flex:none; min-width:0; }
.diw-workspace-group-label { margin:10px 8px 2px; color:var(--diww-muted); font-size:11px; font-weight:500; line-height:1.6; }
.diw-workspace-record-group:first-child .diw-workspace-group-label { margin-top:3px; }
.diw-workspace-record { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:4px 8px; flex:none; width:100%; min-width:0; min-height:72px; padding:8px 10px; border:1px solid transparent; border-radius:8px; background:transparent; color:var(--diww-ink); text-align:left; }
.diw-workspace-record:hover:not(:disabled) { background:var(--diww-hover); }
.diw-workspace-record:is([aria-current=true],[aria-current=page],[aria-pressed=true],[data-active=true]) { background:var(--diww-active); border-color:var(--dsw-alias-border-l1,ButtonBorder); box-shadow:inset 2px 0 var(--diww-accent); }
.diw-workspace-record strong { display:block; grid-column:1 / -1; min-width:0; overflow:hidden; color:var(--diww-ink); font-size:13px; font-weight:550; line-height:1.5; text-overflow:ellipsis; white-space:nowrap; }
.diw-workspace-record > div { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:4px 8px; min-width:0; }
.diw-workspace-record > div > strong { flex:1 1 100px; }
.diw-workspace-record :is(time,small), .diw-workspace-record > span { color:var(--diww-muted); font-size:11px; font-weight:400; line-height:1.5; font-variant-numeric:tabular-nums; }
.diw-workspace-record > span { display:flex; align-items:center; flex-wrap:wrap; justify-content:space-between; gap:4px 8px; }
.diw-workspace-record > .diw-workspace-record-meta { display:block; grid-row:2; grid-column:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.diw-workspace-record > :is(time,small) { grid-row:2; grid-column:2; max-width:92px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:right; font-size:10px; }
.diw-workspace-record > .diw-workspace-record-status { grid-row:3; grid-column:1 / -1; font-size:10px; }
.diw-workspace-record-status > span { white-space:nowrap; }
.diw-workspace-record > div > span { color:var(--diww-secondary); font-size:11px; line-height:1.5; }
.diw-workspace-record [data-status=active] { color:var(--dsw-alias-state-business-primary,var(--diww-secondary)); }
.diw-workspace-record [data-status=finished] { color:var(--diww-muted); }
.diw-workspace-record progress { display:block; grid-row:4; grid-column:1 / -1; width:100%; height:2px; margin-top:2px; overflow:hidden; border:0; border-radius:4px; background:var(--diww-line); accent-color:var(--diww-accent); }
.diw-workspace-record progress::-webkit-progress-bar { border-radius:4px; background:var(--diww-line); }
.diw-workspace-record progress::-webkit-progress-value { border-radius:4px; background:var(--diww-accent); }
.diw-workspace-record progress::-moz-progress-bar { border-radius:4px; background:var(--diww-accent); }
.diw-workspace-record:disabled { opacity:.55; }
.diw-workspace-record-loading { display:flex; align-items:center; gap:7px; flex:none; margin:0; padding:7px 9px; color:var(--diww-muted); font-size:11px; line-height:1.6; }
.diw-workspace-record-loading::before { content:''; display:block; width:5px; height:5px; flex:none; border-radius:50%; background:currentColor; opacity:.6; }
:is(.diw-workspace-list-empty,.diw-workspace-list-error) { display:flex; flex-direction:column; align-items:flex-start; flex:none; gap:9px; margin:0; padding:20px 9px; color:var(--diww-muted); font-size:12px; line-height:1.7; overflow-wrap:anywhere; }
:is(.diw-workspace-list-empty,.diw-workspace-list-error) p { margin:0; }
:is(.diw-workspace-list-empty,.diw-workspace-list-error) strong { color:var(--diww-secondary); font-weight:550; }
.diw-workspace-list-error { color:var(--dsw-alias-state-error-primary,var(--diww-ink)); }
.diw-workspace-list-error button { min-height:30px; padding:5px 10px; border:1px solid var(--diww-line); border-radius:7px; color:var(--diww-ink); background:var(--diww-panel); }
.diw-workspace-library-footer { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; flex:none; gap:6px; margin-top:auto; padding:9px 5px 0; border-top:1px solid var(--dsw-alias-border-l1,ButtonBorder); color:var(--diww-muted); font-size:11px; line-height:1.5; }
.diw-workspace-library-footer :is(p,small) { margin:0; font-size:inherit; }
.diw-workspace-center { position:relative; display:flex; flex-direction:column; flex:1 1 0; align-items:stretch; width:100%; height:100%; min-width:0; min-height:0; overflow:hidden; background:var(--diww-bg); container:diw-workspace / inline-size; }
.diw-workspace-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; flex:none; gap:8px 16px; min-height:62px; padding:11px 24px; border-bottom:1px solid var(--diww-line); background:var(--diww-bg); }
.diw-workspace-toolbar > div { min-width:0; }
.diw-workspace-toolbar > div:first-child { flex:1 1 220px; }
.diw-workspace-title { display:flex; align-items:center; gap:7px; min-width:0; }
.diw-workspace-toolbar h1 { min-width:0; margin:0; overflow:hidden; color:var(--diww-ink); font-size:16px; font-weight:600; line-height:1.5; letter-spacing:0; text-overflow:ellipsis; white-space:nowrap; }
.diw-workspace-title > h1 { flex:0 1 auto; }
.diw-workspace-toolbar :is(p,small) { display:block; margin:2px 0 0; color:var(--diww-muted); font-size:12px; line-height:1.5; }
.diw-workspace-toolbar-actions { display:flex; align-items:center; flex:0 0 auto; flex-wrap:wrap; gap:4px; }
.diw-workspace-toolbar button { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:32px; padding:6px 9px; border:1px solid transparent; border-radius:7px; color:var(--diww-secondary); background:transparent; font-size:12px; white-space:nowrap; }
.diw-workspace-toolbar button:hover:not(:disabled) { color:var(--diww-ink); background:var(--diww-hover); }
.diw-workspace-toolbar button svg { width:15px; height:15px; flex:none; }
.diw-workspace-toolbar .diw-workspace-title > button { flex:none; min-width:26px; min-height:26px; padding:4px 5px; color:var(--diww-muted); font-size:11px; }
.diw-workspace-toolbar > div:first-child > .diw-workspace-home { display:flex; justify-content:flex-start; min-height:17px; margin:0 0 3px; padding:0; border:0; border-radius:3px; color:var(--diww-muted); background:transparent; font-size:11px; font-weight:400; line-height:1.5; }
.diw-workspace-toolbar > div:first-child > .diw-workspace-home:hover:not(:disabled) { color:var(--diww-ink); text-decoration:underline; text-underline-offset:3px; }
.diw-workspace-toolbar .diw-workspace-home[aria-pressed=true] { color:var(--diww-ink); background:var(--diww-hover); }
.diw-workspace-rename { display:flex; align-items:center; flex-wrap:wrap; gap:5px; width:100%; max-width:500px; min-width:0; margin:0; }
.diw-workspace-rename input { flex:1 1 160px; width:100%; min-width:0; min-height:32px; padding:5px 9px; border:1px solid var(--diww-line); border-radius:7px; background:var(--diww-panel); color:var(--diww-ink); font-size:13px; line-height:1.5; }
.diw-workspace-rename input:read-only { background:var(--diww-hover); color:var(--diww-secondary); }
.diw-workspace-rename button { flex:none; }
.diw-workspace-rename button[type=submit] { border-color:var(--diww-line); background:var(--diww-hover); color:var(--diww-ink); }
.diw-workspace-rename > small { flex:1 1 100%; margin:0; font-size:11px; }
.diw-workspace-rename [role=alert] { flex:1 1 100%; margin:0; color:var(--dsw-alias-state-error-primary,var(--diww-secondary)); font-size:11px; }
.diw-workspace-connection { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; flex:none; gap:8px 16px; min-width:0; padding:9px 24px; border-bottom:1px solid var(--diww-line); border-left:3px solid var(--dsw-alias-state-warn-label,var(--diww-secondary)); background:var(--dsw-alias-state-warn-tertiary,var(--diww-hover)); color:var(--dsw-alias-state-warn-label,var(--diww-secondary)); }
.diw-workspace-connection > div { display:flex; align-items:baseline; flex-wrap:wrap; flex:1 1 360px; gap:3px 10px; min-width:0; }
.diw-workspace-connection strong { margin:0; font-size:12px; font-weight:600; line-height:1.7; }
.diw-workspace-connection p { min-width:0; margin:0; color:var(--diww-secondary); font-size:11px; line-height:1.7; overflow-wrap:anywhere; }
.diw-workspace-connection button { display:inline-flex; align-items:center; justify-content:center; flex:none; min-height:30px; padding:4px 10px; border:1px solid var(--diww-line); border-radius:7px; background:var(--diww-panel); color:var(--diww-ink); font-size:12px; line-height:1.6; white-space:nowrap; }
.diw-workspace-connection button:hover:not(:disabled) { border-color:var(--dsw-alias-border-l4,var(--diww-line)); background:var(--diww-hover); }
.diw-workspace-toolbar [data-workspace-list-toggle] { display:none; }
[data-sidebar-collapsed=true] .diw-workspace-toolbar [data-workspace-list-toggle],
[data-diw-workspace-collapsed=true] .diw-workspace-toolbar [data-workspace-list-toggle] { display:inline-flex; }
.diw-workspace-context { display:block; flex:none; min-width:0; padding:5px 24px; border-bottom:1px solid var(--dsw-alias-border-l1,ButtonBorder); color:var(--diww-muted); background:var(--diww-bg); font-size:12px; }
.diw-workspace-context summary { display:list-item; width:fit-content; min-height:40px; padding-block:10px; cursor:pointer; color:var(--diww-secondary); }
.diw-workspace-context summary:focus-visible { outline:2px solid var(--diww-ink); outline-offset:2px; }
.diw-workspace-context label { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; margin-top:8px; }
.diw-workspace-context select { width:auto; max-width:min(300px,100%); min-width:0; min-height:28px; padding:3px 25px 3px 8px; border:1px solid var(--diww-line); border-radius:6px; background:var(--diww-bg); color:var(--diww-secondary); font-size:12px; }
.diw-workspace-context :is(p,small) { min-width:0; margin:4px 0 0; font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
.diw-workspace-context [role=status] { color:var(--diww-secondary); }
.diw-workspace-content { display:flex; flex-direction:column; flex:1 1 0; width:100%; min-width:0; min-height:0; overflow:hidden; }
.diw-workspace-content > .diw-native { flex:1 1 0; width:100%; height:100%; min-height:0; }
.diw-workspace-content .diw-overlay.diw-native .diw-header { display:none; }
.diw-workspace-content .diw-overlay.diw-native .diw-rail { gap:8px 16px; padding:10px 24px; }
.diw-workspace-content .diw-overlay.diw-native .diw-nav-links { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); flex:1 1 100%; overflow-x:visible; }
@container diw-workspace (min-width:1040px) {
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-links { grid-template-columns:repeat(8,minmax(0,1fr)); }
}
.diw-workspace-content .diw-overlay.diw-native .diw-nav-item { flex:1 1 auto; min-height:40px; padding:5px 8px; }
.diw-workspace-content .diw-overlay.diw-native .diw-nav-item small { display:none; }
/* The new-training view is a short setup flow, with its preview beside the form. */
.diw-overlay .diw-new-training { width:100%; max-width:980px; min-width:0; margin-inline:auto; padding:6px 0 12px; color:var(--diw-ink); }
.diw-overlay .diw-new-intro { display:block; min-width:0; margin-bottom:22px; }
.diw-overlay .diw-new-intro h2 { margin:0 0 6px; font-size:24px; font-weight:650; line-height:1.4; letter-spacing:-.015em; }
.diw-overlay .diw-new-intro p { max-width:64ch; margin:0; color:var(--diw-secondary); font-size:13px; line-height:1.75; }
.diw-overlay .diw-new-layout { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(220px,1fr); align-items:start; gap:22px; min-width:0; }
.diw-overlay .diw-new-form { display:flex; flex-direction:column; gap:21px; min-width:0; margin:0; padding:22px; border:1px solid var(--diw-line); border-radius:12px; background:var(--diw-panel); }
.diw-overlay .diw-new-fieldset { display:block; min-inline-size:0; width:100%; margin:0; padding:0; border:0; }
.diw-overlay .diw-new-fieldset legend { max-width:100%; margin-bottom:9px; padding:0; color:var(--diw-ink); font-size:12px; font-weight:600; line-height:1.6; }
.diw-overlay .diw-new-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; min-width:0; }
.diw-overlay .diw-new-option { position:relative; display:flex; flex-direction:column; align-items:flex-start; justify-content:flex-start; gap:4px; width:100%; min-width:0; min-height:74px; padding:12px; border:1px solid var(--diw-line); border-radius:9px; background:var(--diw-panel); color:var(--diw-ink); text-align:left; }
.diw-overlay .diw-new-option:hover:not(:disabled) { border-color:var(--diw-control); background:var(--diw-soft); }
.diw-overlay .diw-new-option[aria-pressed=true] { border-color:var(--diw-accent); background:var(--diw-soft); box-shadow:inset 0 0 0 .5px var(--diw-accent); }
.diw-overlay .diw-new-option > svg { width:18px; height:18px; margin-bottom:4px; color:var(--diw-secondary); }
.diw-overlay .diw-new-option strong { display:block; max-width:100%; color:var(--diw-ink); font-size:13px; font-weight:600; line-height:1.5; overflow-wrap:anywhere; }
.diw-overlay .diw-new-option small { display:block; max-width:100%; color:var(--diw-secondary); font-size:11px; line-height:1.65; overflow-wrap:anywhere; }
.diw-overlay .diw-new-field { display:flex; flex-direction:column; gap:7px; min-width:0; color:var(--diw-secondary); font-size:12px; line-height:1.6; }
.diw-overlay .diw-new-field > span { color:var(--diw-ink); font-size:12px; font-weight:600; }
.diw-overlay .diw-new-field > span > small { margin-left:7px; color:var(--diw-muted); font-size:11px; font-weight:400; }
.diw-overlay .diw-new-field :is(input,select) { display:block; width:100%; min-width:0; min-height:38px; margin:0; padding:8px 10px; border:1px solid var(--diw-control); border-radius:8px; background:var(--diw-panel); color:var(--diw-ink); font-size:13px; line-height:1.5; }
.diw-overlay .diw-new-field input::placeholder { color:var(--diw-muted); opacity:1; }
.diw-overlay .diw-new-field :is(input,select):disabled { color:var(--diw-muted); background:var(--diw-soft); cursor:not-allowed; opacity:.65; }
.diw-overlay .diw-new-field input:read-only { color:var(--diw-secondary); background:var(--diw-soft); }
.diw-overlay .diw-new-field small { color:var(--diw-muted); font-size:11px; line-height:1.6; }
.diw-overlay .diw-new-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(110px,.65fr); align-items:start; gap:12px; min-width:0; }
.diw-overlay .diw-new-actions { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; min-width:0; padding-top:17px; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-new-actions > small { flex:1 1 170px; min-width:0; color:var(--diw-muted); font-size:11px; line-height:1.65; }
.diw-overlay .diw-new-actions > button { display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; gap:6px; min-height:38px; max-width:100%; padding:8px 15px; border:1px solid var(--diw-accent); border-radius:8px; background:var(--diw-accent); color:var(--diw-on-accent); font-size:13px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-new-actions > button:hover:not(:disabled) { background:var(--dsw-alias-button-primary-hover,var(--diw-accent)); }
.diw-overlay .diw-new-summary { min-width:0; padding:21px 20px; border:1px solid var(--diw-line); border-radius:12px; background:var(--diw-rail); }
.diw-overlay .diw-new-summary h3 { margin:0 0 8px; font-size:14px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-new-summary > p { margin:0 0 18px; color:var(--diw-secondary); font-size:12px; line-height:1.8; }
.diw-overlay .diw-new-summary > small { display:block; margin-top:16px; color:var(--diw-muted); font-size:11px; line-height:1.7; }
.diw-overlay .diw-new-summary > button { width:100%; min-height:34px; margin-top:20px; padding:6px 10px; border-color:var(--diw-line); border-radius:8px; background:transparent; color:var(--diw-secondary); font-size:12px; font-weight:500; }
.diw-overlay .diw-new-stats { display:grid; gap:12px; min-width:0; margin:0; padding-top:16px; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-new-stats > div { display:flex; align-items:baseline; justify-content:space-between; gap:12px; min-width:0; }
.diw-overlay .diw-new-stats dt { min-width:0; color:var(--diw-muted); font-size:11px; line-height:1.6; }
.diw-overlay .diw-new-stats dd { min-width:0; margin:0; color:var(--diw-ink); font-size:13px; font-weight:600; line-height:1.5; text-align:right; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.diw-overlay .diw-new-training :is([role=alert],[role=status]):not(small) { margin:0; padding:10px 12px; border:1px solid var(--diw-line); border-radius:8px; color:var(--diw-secondary); background:var(--diw-soft); font-size:12px; line-height:1.7; overflow-wrap:anywhere; }
.diw-overlay .diw-new-training [role=alert] { color:var(--diw-danger); }
.diw-overlay .diw-new-form[aria-busy=true] { cursor:progress; }
.diw-workspace-content .diw-overlay.diw-native .diw-layout[data-view=new] { display:flex; flex-direction:column; }
.diw-workspace-mobile-library { position:absolute; inset:0 auto 0 0; z-index:5; display:flex; flex-direction:column; width:min(320px,calc(100% - 28px)); min-width:0; min-height:0; padding:0 14px 12px; border-right:1px solid var(--diww-line); background:var(--diww-panel); box-shadow:12px 0 32px var(--dsw-alias-bg-mask-2,transparent); }
.diw-workspace-mobile-library > .diw-workspace-library { background:transparent; }
.diw-workspace-mobile-library .diw-workspace-library-heading { min-height:32px; }
.diw-workspace-mobile-library .diw-workspace-library-heading button { min-height:32px; }
.diw-workspace-fallback { position:fixed; right:18px; bottom:18px; z-index:1000; display:flex; align-items:center; flex-wrap:wrap; gap:8px; max-width:min(440px,calc(100vw - 36px)); padding:12px 14px; border:1px solid var(--diww-line); border-radius:10px; background:var(--diww-panel); box-shadow:0 6px 24px var(--dsw-alias-bg-mask-2,transparent); font-size:12px; line-height:1.7; overflow-wrap:anywhere; }
.diw-workspace-fallback button { min-height:28px; padding:4px 7px; border:0; border-radius:6px; background:var(--diww-hover); color:var(--diww-ink); }
@container diw-workspace (max-width:700px) {
  .diw-workspace-toolbar { gap:8px 12px; min-height:62px; padding:11px 16px; }
  .diw-workspace-toolbar h1 { font-size:16px; }
  .diw-workspace-toolbar-actions { gap:3px; }
  .diw-workspace-toolbar button { padding:6px 7px; }
  .diw-workspace-toolbar [data-workspace-list-toggle] { display:inline-flex; }
  .diw-workspace-connection { gap:7px 12px; padding:9px 16px; }
  .diw-workspace-connection > div { flex-basis:280px; }
  .diw-workspace-context { padding:5px 16px; }
  .diw-workspace-context select { flex:1 1 150px; max-width:100%; }
  .diw-workspace-content .diw-overlay.diw-native .diw-rail { gap:7px; padding:8px 12px; }
  .diw-workspace-content .diw-overlay.diw-native .diw-role-switch { flex:1 1 100%; }
  .diw-workspace-content .diw-overlay.diw-native .diw-track { justify-content:center; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-links { flex:1 1 100%; gap:3px; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-item { padding:6px; }
  .diw-overlay .diw-new-training { padding-top:0; }
  .diw-overlay .diw-new-intro { margin-bottom:17px; }
  .diw-overlay .diw-new-intro h2 { font-size:22px; }
  .diw-overlay .diw-new-layout { grid-template-columns:minmax(0,1fr); gap:16px; }
  .diw-overlay .diw-new-form { gap:18px; padding:18px; }
  .diw-overlay .diw-new-summary { padding:16px 18px; }
  .diw-overlay .diw-new-summary > p { margin-bottom:12px; }
  .diw-overlay .diw-new-stats { gap:9px; padding-top:12px; }
}
@container diw-workspace (max-width:440px) {
  .diw-workspace-toolbar { align-items:flex-start; padding:10px 12px; }
  .diw-workspace-toolbar > div:first-child { flex:1 1 100%; }
  .diw-workspace-toolbar-actions { flex:1 1 100%; justify-content:flex-start; }
  .diw-workspace-toolbar :is(p,small) { font-size:11px; }
  .diw-workspace-connection { padding-inline:12px; }
  .diw-workspace-connection > div { flex-basis:100%; }
  .diw-workspace-context { padding-inline:12px; }
  .diw-workspace-context label { gap:6px; font-size:11px; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-links { display:flex; flex-wrap:nowrap; width:100%; overflow-x:auto; scrollbar-width:thin; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-item { flex:0 0 auto; justify-content:center; min-width:0; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-item { min-height:44px; gap:4px; padding:6px 10px; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-item > svg { width:14px; height:14px; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-item strong { font-size:12px; }
  .diw-workspace-rename { gap:4px; }
  .diw-workspace-rename input { flex-basis:130px; }
  .diw-overlay .diw-new-form { padding:15px; }
  .diw-overlay .diw-new-intro h2 { font-size:21px; }
  .diw-overlay .diw-new-intro p { font-size:12px; }
  .diw-overlay .diw-new-options { gap:7px; }
  .diw-overlay .diw-new-option { min-height:78px; padding:10px; }
  .diw-overlay .diw-new-row { grid-template-columns:minmax(0,1fr); gap:14px; }
  .diw-overlay .diw-new-actions { align-items:stretch; flex-direction:column; }
  .diw-overlay .diw-new-actions > small { flex:0 1 auto; }
  .diw-overlay .diw-new-actions > button { width:100%; }
}
@media(max-width:700px),(pointer:coarse) {
  .diw-workspace-entry, .diw-workspace-new, .diw-workspace-toolbar button, .diw-workspace-library-heading button { min-height:44px; }
  .diw-workspace-context summary { min-height:44px; }
  .diw-workspace-content .diw-overlay.diw-native .diw-nav-item, .diw-workspace-filters button { min-height:44px; }
  .diw-workspace-search, .diw-workspace-search input { min-height:44px; }
  .diw-workspace-context select { min-height:44px; font-size:16px; }
  .diw-workspace-connection button { min-height:44px; }
  .diw-overlay .diw-new-field :is(input,select), .diw-overlay .diw-new-actions > button { min-height:44px; }
}
@media(prefers-reduced-motion:no-preference) {
  .diw-workspace-entry, .diw-workspace-new, .diw-workspace-record, .diw-workspace-filters button, .diw-workspace-toolbar button { transition:background-color 140ms ease,color 140ms ease,border-color 140ms ease; }
  .diw-overlay .diw-new-option { transition:background-color 140ms ease,border-color 140ms ease; }
}

@container diw-workspace (max-width:700px) {
  .diw-workspace-content .diw-overlay.diw-native .diw-layout[data-view=sprint] .diw-role-switch { display:none; }
  .diw-workspace-content .diw-overlay.diw-native .diw-layout[data-view=sprint] .diw-nav-links { display:flex; flex-wrap:nowrap; overflow-x:auto; width:100%; }
  .diw-workspace-content .diw-overlay.diw-native .diw-layout[data-view=sprint] .diw-nav-item { flex:0 0 auto; white-space:nowrap; padding-inline:10px; }
  .diw-workspace-center[data-view=sprint] .diw-workspace-toolbar { flex-wrap:nowrap; min-height:48px; gap:6px; padding-block:6px; }
  .diw-workspace-center[data-view=sprint] .diw-workspace-toolbar > div:first-child { flex:1 1 auto; }
  .diw-workspace-center[data-view=sprint] .diw-workspace-toolbar-actions { flex:0 0 auto; }
}
`;
