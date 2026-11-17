export const KNOWLEDGE_STYLES = `
.diw-overlay .diw-knowledge { display:grid; gap:28px; min-width:0; container-type:inline-size; }
.diw-overlay .diw-knowledge .diw-page-heading { margin-bottom:0; }
.diw-overlay .diw-knowledge-steps { display:flex; flex-wrap:wrap; gap:12px 28px; padding:0 0 22px; margin:0; border-bottom:1px solid var(--diw-line); list-style:none; }
.diw-overlay .diw-knowledge-steps li { display:flex; align-items:center; gap:8px; color:var(--diw-secondary); font-size:13px; }
.diw-overlay .diw-knowledge-steps li > span { display:grid; place-items:center; width:25px; height:25px; border:1px solid var(--diw-line); border-radius:50%; color:var(--diw-ink); font-size:12px; }
.diw-overlay .diw-knowledge-section { display:grid; gap:16px; min-width:0; }
.diw-overlay .diw-knowledge-field { display:grid; align-content:start; gap:7px; flex:1 1 180px; min-width:0; color:var(--diw-secondary); font-size:13px; }
.diw-overlay .diw-knowledge-field :is(input,select,textarea) { width:100%; min-width:0; min-height:var(--diw-target); padding:9px 12px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-control); color:var(--diw-ink); background:var(--diw-panel); font:inherit; font-size:14px; }
.diw-overlay .diw-knowledge-field textarea { resize:vertical; line-height:1.6; }
.diw-overlay .diw-knowledge-learning-option { display:flex; align-items:flex-start; gap:9px; color:var(--diw-secondary); font-size:13px; line-height:1.7; }
.diw-overlay .diw-knowledge-learning-option input { flex:none; width:16px; height:16px; margin-top:3px; accent-color:var(--diw-accent); }
.diw-overlay .diw-knowledge-handoff { border-top:1px solid var(--diw-line); padding-top:15px; }
.diw-overlay .diw-knowledge-handoff summary { cursor:pointer; font-size:13px; }.diw-overlay .diw-knowledge-handoff .diw-knowledge-submit { margin-top:14px; }
.diw-overlay :is(.diw-knowledge-repo-form,.diw-knowledge-search-form,.diw-knowledge-compose-fields) { display:flex; align-items:flex-end; flex-wrap:wrap; gap:12px; min-width:0; }
.diw-overlay .diw-knowledge-search-form .diw-knowledge-scope { flex:0 1 230px; }
.diw-overlay .diw-knowledge-repositories { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; min-width:0; }
.diw-overlay .diw-knowledge-repo { display:flex; flex-direction:column; gap:10px; min-width:0; padding:18px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-knowledge-repo :is(strong,p,a,code) { min-width:0; overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-repo strong { font-size:15px; line-height:1.5; }
.diw-overlay .diw-knowledge-repo p { margin:0; color:var(--diw-secondary); font-size:13px; line-height:1.5; }
.diw-overlay .diw-knowledge-repo a { color:inherit; }
.diw-overlay .diw-knowledge-repo-footer { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-top:auto; padding-top:4px; }
.diw-overlay .diw-knowledge :is(.diw-knowledge-progress,.diw-knowledge-notice) { padding:12px 16px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-control); background:var(--diw-soft); color:var(--diw-soft-ink); font-size:13px; line-height:1.7; }
.diw-overlay .diw-knowledge-alert { display:grid; gap:10px; padding:16px; border:1px solid var(--diw-warm); border-radius:var(--diw-radius-control); font-size:13px; overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-alert > .diw-button { justify-self:start; }
.diw-overlay .diw-knowledge-alert p { margin:0; line-height:1.6; }
.diw-overlay .diw-knowledge-suggestions { display:flex; flex-wrap:wrap; gap:8px; }
.diw-overlay .diw-knowledge-suggestions .diw-button { min-height:34px; padding:5px 11px; font-size:12px; font-weight:500; }
.diw-overlay .diw-knowledge-empty { margin:0; padding:20px; border:1px dashed var(--diw-control); border-radius:var(--diw-radius-card); color:var(--diw-muted); font-size:14px; line-height:1.7; }
.diw-overlay .diw-knowledge-results { display:grid; gap:12px; min-width:0; }
.diw-overlay .diw-knowledge-result { display:grid; gap:10px; padding:16px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); min-width:0; }
.diw-overlay .diw-knowledge-result[data-selected=true] { border-color:var(--diw-accent); }
.diw-overlay .diw-knowledge-result h4 { margin:0; color:var(--diw-ink); font-size:17px; line-height:1.5; overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-result .diw-knowledge-excerpt { margin:0; color:var(--diw-secondary); font-size:14px; line-height:1.7; white-space:pre-line; overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-result .diw-meta { overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-result .diw-section-heading > small { min-width:0; overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-original { min-width:0; padding:12px 14px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-control); background:var(--diw-bg); }
.diw-overlay .diw-knowledge-original summary { cursor:pointer; font-size:13px; }
.diw-overlay .diw-knowledge-original > :not(summary) { margin-top:14px; }
.diw-overlay .diw-knowledge-original > small { display:block; overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-compose { display:grid; gap:18px; min-width:0; padding:24px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-card); background:var(--diw-soft); }
.diw-overlay .diw-knowledge-selection { display:grid; gap:0; margin:0; padding:0; list-style:none; }
.diw-overlay .diw-knowledge-selection li { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--diw-line); min-width:0; }
.diw-overlay .diw-knowledge-selection li > div { display:grid; gap:3px; flex:1; min-width:0; }
.diw-overlay .diw-knowledge-selection :is(strong,small) { overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-selection strong { font-size:14px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-knowledge-selection small { color:var(--diw-muted); font-size:12px; }
.diw-overlay .diw-knowledge-selection li > .diw-button { flex:none; background:var(--diw-panel); }
.diw-overlay .diw-knowledge-compose-fields { align-items:flex-start; }
.diw-overlay .diw-knowledge-compose-fields .diw-knowledge-count { flex:0 0 100px; }
.diw-overlay .diw-knowledge-submit { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
.diw-overlay .diw-knowledge-submit > div { flex:1 1 220px; }
.diw-overlay .diw-knowledge-submit strong { font-size:14px; }
.diw-overlay .diw-knowledge-submit p { margin:5px 0 0; line-height:1.7; }
.diw-overlay .diw-knowledge-existing { padding-top:4px; border-top:1px solid var(--diw-line); }
.diw-overlay .diw-knowledge-existing > summary { padding:14px 0; cursor:pointer; color:var(--diw-secondary); font-size:13px; }
.diw-overlay .diw-knowledge-citations { min-width:0; margin-top:6px; font-size:13px; }
.diw-overlay .diw-knowledge-citations summary { cursor:pointer; }
.diw-overlay .diw-knowledge-citations ul { display:grid; gap:10px; padding-left:20px; }
.diw-overlay .diw-knowledge-citations li { min-width:0; overflow-wrap:anywhere; }
.diw-overlay .diw-knowledge-citations small { display:block; margin-top:3px; }
@container (max-width:620px) {
  .diw-overlay .diw-knowledge-repositories { grid-template-columns:minmax(0,1fr); }
  .diw-overlay .diw-knowledge-search-form .diw-knowledge-scope { flex:1 1 180px; }
  .diw-overlay .diw-knowledge-compose { padding:18px; }
  .diw-overlay .diw-knowledge-result { padding:16px; }
}
@container (max-width:390px) {
  .diw-overlay .diw-knowledge { gap:22px; }
  .diw-overlay .diw-knowledge-steps { gap:10px; }
  .diw-overlay .diw-knowledge-steps li { font-size:12px; gap:5px; }
  .diw-overlay .diw-knowledge-repo-form > .diw-button,.diw-overlay .diw-knowledge-search-form > .diw-button,.diw-overlay .diw-knowledge-submit > .diw-button { width:100%; }
  .diw-overlay .diw-knowledge-compose-fields .diw-knowledge-count { flex:1 1 100%; }
  .diw-overlay .diw-knowledge-result .diw-actions { display:grid; grid-template-columns:minmax(0,1fr); }
}
`
