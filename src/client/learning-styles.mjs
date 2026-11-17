export const LEARNING_STYLES = `
.diw-overlay .diw-learning { display:grid; gap:28px; width:100%; max-width:1040px; margin-inline:auto; min-width:0; container-type:inline-size; }
.diw-overlay .diw-learning .diw-page-heading { margin-bottom:0; }
.diw-overlay .diw-learning :is(h3,h4,p) { overflow-wrap:anywhere; }
.diw-overlay .diw-learning-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin:0; }
.diw-overlay .diw-learning-stats > div { display:grid; align-content:start; gap:9px; min-width:0; padding:18px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); }
.diw-overlay .diw-learning-stats dt { color:var(--diw-secondary); font-size:13px; line-height:1.5; }
.diw-overlay .diw-learning-stats dd { margin:0; color:var(--diw-ink); font-size:30px; font-weight:600; line-height:1.15; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-learning-stats small { color:var(--diw-muted); font-size:11px; line-height:1.6; }
.diw-overlay .diw-learning-next { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:24px; padding:24px; border:1px solid var(--diw-control); border-radius:var(--diw-radius-card); background:var(--diw-soft); }
.diw-overlay .diw-learning-next > div:first-child { flex:1 1 300px; min-width:0; }
.diw-overlay .diw-learning-next h3 { margin:9px 0; font-size:22px; line-height:1.45; }
.diw-overlay .diw-learning-next p { margin:0 0 9px; color:var(--diw-secondary); font-size:14px; line-height:1.7; }
.diw-overlay .diw-learning-next-action { display:grid; gap:10px; max-width:100%; }
.diw-overlay .diw-learning-next-action small { max-width:220px; line-height:1.6; }
.diw-overlay .diw-learning-section { display:grid; gap:16px; min-width:0; }
.diw-overlay .diw-learning-section .diw-section-heading { margin-bottom:0; }
.diw-overlay .diw-learning-section h3 { margin:0; }
.diw-overlay .diw-learning-section .diw-section-heading > div { min-width:0; }
.diw-overlay .diw-learning-section .diw-section-heading p { margin:7px 0 0; }
.diw-overlay .diw-learning-topics { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.diw-overlay .diw-learning-topic { display:grid; align-content:start; gap:12px; min-width:0; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-learning-topic h4 { margin:0; font-size:15px; line-height:1.5; }
.diw-overlay .diw-learning-topic p { margin:0; color:var(--diw-secondary); font-size:13px; }
.diw-overlay .diw-learning-topic progress { width:100%; height:5px; }
.diw-overlay .diw-learning-topic-footer,.diw-overlay .diw-learning-note-footer { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
.diw-overlay .diw-learning-queue { display:grid; gap:0; margin:0; padding:0; list-style:none; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); overflow:hidden; }
.diw-overlay .diw-learning-queue li { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 16px; min-width:0; }
.diw-overlay .diw-learning-queue li + li { border-top:1px solid var(--diw-line); }
.diw-overlay .diw-learning-queue li > div { display:grid; gap:7px; min-width:0; }
.diw-overlay .diw-learning-queue strong { overflow-wrap:anywhere; font-size:14px; line-height:1.6; }
.diw-overlay .diw-learning-queue p { margin:0; color:var(--diw-secondary); font-size:13px; line-height:1.6; }
.diw-overlay .diw-learning-queue .diw-button { flex-shrink:0; }
.diw-overlay .diw-learning-evidence { display:grid; gap:12px; }
.diw-overlay .diw-learning-note { display:grid; gap:16px; min-width:0; padding:20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); background:var(--diw-panel); }
.diw-overlay .diw-learning-note h4 { margin:5px 0 0; font-size:16px; line-height:1.6; }
.diw-overlay .diw-learning-note-text { min-width:0; padding:12px 16px; border-left:2px solid var(--diw-control); background:var(--diw-soft); overflow-wrap:anywhere; }
.diw-overlay .diw-learning-note-text .diw-content { font-size:14px; }
.diw-overlay .diw-learning-note-text :is(pre,table) { max-width:100%; overflow:auto; }
.diw-overlay .diw-learning-note-text img { max-width:100%; }
.diw-overlay .diw-learning-activity { display:flex; align-items:flex-end; gap:6px; margin:0; padding:0; list-style:none; min-width:0; overflow:hidden; }
.diw-overlay .diw-learning-activity li { display:grid; grid-template-columns:minmax(0,1fr); gap:7px; justify-items:center; flex:1; min-width:0; color:var(--diw-muted); }
.diw-overlay .diw-learning-activity-count { font-size:11px; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-learning-activity-bar { display:flex; align-items:flex-end; width:min(28px,100%); height:52px; background:var(--diw-soft); border-radius:4px; overflow:hidden; }
.diw-overlay .diw-learning-activity-bar span { display:block; width:100%; background:var(--diw-accent); }
.diw-overlay .diw-learning-activity small { font-size:10px; white-space:nowrap; }
.diw-overlay .diw-learning-empty { display:grid; gap:8px; padding:22px; border:1px dashed var(--diw-control); border-radius:var(--diw-radius-card); color:var(--diw-secondary); }
.diw-overlay .diw-learning-empty strong { font-size:14px; }
.diw-overlay .diw-learning-empty p { margin:0; font-size:13px; line-height:1.7; }
.diw-overlay .diw-learning-alert { display:grid; gap:10px; padding:18px; border:1px solid var(--diw-warm); border-radius:var(--diw-radius-control); font-size:13px; overflow-wrap:anywhere; }
.diw-overlay .diw-learning-alert p { margin:0; }
.diw-overlay .diw-learning-alert .diw-button { justify-self:start; }
.diw-overlay .diw-learning-notice { margin:0; padding-top:16px; border-top:1px solid var(--diw-line); color:var(--diw-muted); font-size:12px; line-height:1.7; }
.diw-overlay .diw-learning-overview-link { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; padding:18px 20px; border:1px solid var(--diw-line); border-radius:var(--diw-radius-card); }
.diw-overlay .diw-learning-overview-link > div { flex:1 1 260px; min-width:0; }
.diw-overlay .diw-learning-overview-link h3 { margin:0; font-size:16px; }
.diw-overlay .diw-learning-overview-link p { margin:6px 0 0; color:var(--diw-secondary); font-size:13px; line-height:1.6; }
@media (max-width:700px) {
  .diw-overlay:not(.diw-native) .diw-nav-links { grid-template-columns:repeat(3,minmax(0,1fr)); }
}
@container (max-width:700px) {
  .diw-overlay .diw-learning-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .diw-overlay .diw-learning-topics { grid-template-columns:minmax(0,1fr); }
}
@container (max-width:390px) {
  .diw-overlay .diw-learning { gap:24px; }
  .diw-overlay :is(.diw-learning-next,.diw-learning-note,.diw-learning-topic) { padding:16px; }
  .diw-overlay .diw-learning-stats > div { padding:14px; }
  .diw-overlay .diw-learning-next-action { width:100%; }
  .diw-overlay .diw-learning-queue li { align-items:flex-start; flex-direction:column; padding:16px; }
  .diw-overlay .diw-learning-activity { gap:4px; }
  .diw-overlay .diw-learning-activity li:nth-child(even) small { visibility:hidden; }
}
`
