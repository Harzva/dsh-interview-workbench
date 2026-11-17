export const EXPERIENCE_STYLES = `
.diw-overlay .diw-experiences { display:grid; gap:24px; width:100%; max-width:1240px; margin-inline:auto; min-width:0; container-type:inline-size; }
.diw-overlay .diw-experiences :is(h3,h4,p) { overflow-wrap:anywhere; }
.diw-overlay .diw-experience-tabs { display:flex; flex-wrap:wrap; gap:6px; padding-bottom:10px; border-bottom:1px solid var(--diw-line); }
.diw-overlay .diw-experience-tabs button[aria-pressed=true] { background:var(--diw-soft); border-color:var(--diw-accent); color:var(--diw-ink); }
.diw-overlay .diw-experience-rounds { display:flex; flex-wrap:wrap; width:fit-content; max-width:100%; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); overflow:hidden; }
.diw-overlay .diw-experience-rounds .diw-button { border:0; border-radius:0; }
.diw-overlay .diw-experience-rounds .diw-button + .diw-button { border-left:1px solid var(--diw-control); }
.diw-overlay .diw-experience-guide { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:24px; padding:20px 0; border-block:1px solid var(--diw-line); }
.diw-overlay .diw-experience-guide h4 { margin:0 0 4px; }
.diw-overlay .diw-experiences :is(ol,ul) { padding-left:22px; display:grid; gap:8px; }
.diw-overlay .diw-experience-summaries { display:grid; gap:12px; }
.diw-overlay .diw-experience-summary { display:grid; align-content:start; gap:10px; min-width:0; padding:16px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-experience-summary h4 { margin:0; font-size:15px; line-height:1.5; }
.diw-overlay .diw-experience-summary p { margin:0; color:var(--diw-secondary); font-size:14px; line-height:1.7; }
.diw-overlay .diw-experience-summary small { color:var(--diw-muted); }
.diw-overlay .diw-experience-summary .diw-button { justify-self:start; }
.diw-overlay .diw-experience-patterns { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 24px; }
.diw-overlay .diw-experience-pattern { padding:12px 0; border-bottom:1px solid var(--diw-line); }
.diw-overlay .diw-experience-pattern summary { cursor:pointer; font-weight:600; line-height:1.6; }
.diw-overlay .diw-experience-pattern > :not(summary) { margin-top:8px; }
.diw-overlay .diw-experience-form { display:grid; gap:16px; min-width:0; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); }
.diw-overlay .diw-experience-group { display:grid; gap:12px; min-width:0; min-inline-size:0; margin:0; padding:16px 0 0; border:0; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-experience-group:first-of-type { padding-top:0; border-top:0; }
.diw-overlay .diw-experience-group legend { padding:0 8px 0 0; color:var(--diw-secondary); font-size:13px; font-weight:600; }
.diw-overlay .diw-experience-form-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.diw-overlay .diw-experience-form-grid label,.diw-overlay .diw-experiences .diw-field { display:grid; align-content:start; gap:6px; min-width:0; }
.diw-overlay .diw-experiences label > span { color:var(--diw-secondary); font-size:13px; }
.diw-overlay .diw-experiences :is(input,select,textarea) { width:100%; min-width:0; padding:9px 12px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); background:var(--diw-panel); color:var(--diw-ink); font:inherit; font-size:14px; }
.diw-overlay .diw-experiences textarea { resize:vertical; min-height:82px; line-height:1.6; }
.diw-overlay .diw-experience-filters { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; align-items:end; }
.diw-overlay .diw-experience-filters label { display:grid; gap:6px; min-width:0; }
.diw-overlay .diw-experience-record { display:grid; gap:10px; padding:14px 0; border-bottom:1px solid var(--diw-line); }
.diw-overlay .diw-experience-record summary { cursor:pointer; font-weight:600; line-height:1.6; }
.diw-overlay .diw-experience-record summary .diw-badge { margin-left:6px; font-weight:600; }
.diw-overlay .diw-experience-record > .diw-muted { margin:0; font-size:13px; }
.diw-overlay .diw-experience-record dl { display:grid; grid-template-columns:120px minmax(0,1fr); gap:8px 16px; margin:0; font-size:14px; }
.diw-overlay .diw-experience-record dt { color:var(--diw-muted); }
.diw-overlay .diw-experience-record dd { margin:0; white-space:pre-wrap; overflow-wrap:anywhere; }
.diw-overlay .diw-experience-resource { display:grid; gap:12px; min-width:0; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); }
.diw-overlay .diw-experience-resource h3 { margin:0; font-size:17px; line-height:1.5; }
.diw-overlay .diw-experience-resource > .diw-muted { margin:0; font-size:13px; }
.diw-overlay .diw-experience-resource > .diw-button { justify-self:start; }
.diw-overlay .diw-experience-resource .diw-content { max-width:72ch; font-size:15px; line-height:1.8; }
.diw-overlay .diw-experience-resource .diw-content :is(pre,table,.diw-table-scroll) { max-width:100%; overflow:auto; }
.diw-overlay .diw-experience-resource .diw-content img { max-width:100%; }
@media (max-width:900px) {
  .diw-overlay .diw-experience-guide,.diw-overlay .diw-experience-patterns { grid-template-columns:1fr; }
  .diw-overlay .diw-experience-form-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:520px) {
  .diw-overlay .diw-experience-form-grid { grid-template-columns:1fr; }
  .diw-overlay .diw-experience-filters { grid-template-columns:1fr; }
  .diw-overlay .diw-experience-record dl { grid-template-columns:1fr; }
}
@container (max-width:720px) {
  .diw-overlay .diw-experience-guide,.diw-overlay .diw-experience-patterns { grid-template-columns:1fr; }
  .diw-overlay .diw-experience-form-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@container (max-width:420px) {
  .diw-overlay .diw-experience-form-grid { grid-template-columns:1fr; }
  .diw-overlay .diw-experience-filters { grid-template-columns:1fr; }
  .diw-overlay .diw-experience-record dl { grid-template-columns:1fr; }
  .diw-overlay .diw-experience-rounds { width:100%; }
  .diw-overlay .diw-experience-rounds .diw-button { flex:1; }
}
`
