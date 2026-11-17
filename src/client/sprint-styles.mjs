/*
 * Styles for the seven-day interview sprint.
 *
 * This file is intentionally independent from the panel component. The
 * surface is mounted inside the native overlay, whose buttons and layout
 * rules are global. Every selector therefore starts at the sprint boundary so
 * visual fixes cannot leak into the rest of the workbench.
 */
export const SPRINT_STYLES = `
.diw-overlay .diw-sprint { width:100%; max-width:1080px; min-width:0; margin-inline:auto; padding:0 0 32px; color:var(--diw-ink,#171717); container-type:inline-size; scroll-padding-block:16px; }
.diw-overlay .diw-sprint, .diw-overlay .diw-sprint * { box-sizing:border-box; }
.diw-overlay .diw-sprint :is(h2,h3,h4,p,li,summary) { overflow-wrap:anywhere; }
.diw-overlay .diw-sprint h3 { margin:0; font-size:18px; font-weight:650; line-height:1.45; }
.diw-overlay .diw-sprint h4 { margin:18px 0 8px; font-size:13px; line-height:1.5; }
.diw-overlay .diw-sprint p { margin:7px 0; font-size:13px; line-height:1.7; }
.diw-overlay .diw-sprint button { appearance:none; display:inline-flex !important; align-items:center; justify-content:center; flex:0 0 auto !important; min-width:0; min-height:34px; padding:7px 11px; border:1px solid var(--diw-control,#b9b9b9) !important; border-radius:8px !important; background:var(--diw-panel,#fff); color:var(--diw-ink,#171717); font:inherit; font-size:13px; line-height:1.35; text-align:center; cursor:pointer; touch-action:manipulation; }
.diw-overlay .diw-sprint button:hover:not(:disabled) { border-color:var(--diw-accent,var(--diw-control,#777)) !important; background:var(--diw-soft,#f5f5f5); }
.diw-overlay .diw-sprint button:focus-visible, .diw-overlay .diw-sprint :is(textarea,summary,a):focus-visible { outline:3px solid var(--diw-accent,#555); outline-offset:2px; }
.diw-overlay .diw-sprint button:disabled { cursor:not-allowed; opacity:.55; }
.diw-overlay .diw-sprint button.diw-button-primary, .diw-overlay .diw-sprint .diw-sprint-primary { border-color:var(--diw-accent,#333) !important; background:var(--diw-accent,#333) !important; color:var(--diw-on-accent,#fff) !important; font-weight:650; }
.diw-overlay .diw-sprint-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px 16px; min-width:0; padding-bottom:12px; border-bottom:1px solid var(--diw-line,#ddd); }
.diw-overlay .diw-sprint-header .diw-sprint-save-status { flex:1 1 auto; }
.diw-overlay .diw-sprint-progress { flex:0 0 auto; display:flex; align-items:baseline; gap:8px; color:var(--diw-secondary,#555); font-size:12px; line-height:1.4; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-sprint-progress strong { color:var(--diw-ink,#171717); font-size:15px; font-weight:650; }
.diw-overlay .diw-sprint-meta { margin:8px 0 0; color:var(--diw-secondary,#555); font-size:12px; }
.diw-overlay .diw-sprint-meta summary { display:inline-flex; align-items:center; min-height:44px; margin-inline:-4px; padding-inline:4px; color:var(--diw-secondary,#555); cursor:pointer; }
.diw-overlay .diw-sprint-meta summary:hover { color:var(--diw-ink,#171717); }
.diw-overlay .diw-sprint-meta-body { display:grid; gap:8px; max-width:76ch; margin:7px 0 0; padding:10px 12px; border:1px solid var(--diw-line,#ddd); border-radius:8px; background:var(--diw-rail,#f7f7f7); }
.diw-overlay .diw-sprint-meta-body p { margin:0; color:var(--diw-secondary,#555); font-size:12px; line-height:1.65; }
.diw-overlay .diw-sprint-meta-body .diw-sprint-source { padding-left:10px; border-left:2px solid var(--diw-control,#aaa); }
.diw-overlay .diw-sprint-meta-body .diw-sprint-actions { margin:0; }
.diw-overlay .diw-sprint-days { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:8px; min-width:0; margin:12px 0 16px; }
.diw-overlay .diw-sprint .diw-sprint-day { display:grid !important; grid-template-columns:auto minmax(0,1fr); grid-template-rows:auto auto; align-items:center; justify-content:start; gap:2px 7px; width:100%; min-height:56px; padding:7px 9px; border-color:var(--diw-line,#d2d2d2) !important; border-radius:8px !important; background:var(--diw-panel,#fff); text-align:left; }
.diw-overlay .diw-sprint .diw-sprint-day strong { grid-row:1 / 3; color:var(--diw-secondary,#555); font-size:12px; font-weight:650; line-height:1.2; }
.diw-overlay .diw-sprint .diw-sprint-day span { min-width:0; color:var(--diw-ink,#171717); font-size:12px; font-weight:600; line-height:1.35; }
.diw-overlay .diw-sprint .diw-sprint-day small { min-width:0; color:var(--diw-muted,#777); font-size:11px; line-height:1.3; }
.diw-overlay .diw-sprint .diw-sprint-day[aria-current=step] { border-color:var(--diw-accent,#555) !important; background:var(--diw-soft,#f3f3f3); box-shadow:inset 0 0 0 1px var(--diw-accent,#555); }
.diw-overlay .diw-sprint .diw-sprint-day[aria-current=step] strong { color:var(--diw-accent,#555); }
.diw-overlay .diw-sprint .diw-sprint-day[data-complete=true] small { color:var(--diw-accent,#555); font-weight:600; }
.diw-overlay .diw-sprint-course-heading { display:grid; gap:4px; min-width:0; margin-bottom:12px; }
.diw-overlay .diw-sprint-course-heading p { margin:0; color:var(--diw-secondary,#555); }
.diw-overlay .diw-sprint-stepnav { display:flex; align-items:center; gap:8px; min-width:0; margin:0 0 12px; overflow-x:auto; padding-bottom:2px; overscroll-behavior-inline:contain; scroll-snap-type:x proximity; scrollbar-width:thin; }
.diw-overlay .diw-sprint .diw-sprint-step { flex:0 0 auto !important; min-height:40px; padding:8px 10px; color:var(--diw-secondary,#555); font-size:12px; white-space:nowrap; scroll-snap-align:start; }
.diw-overlay .diw-sprint .diw-sprint-step[aria-pressed=true] { border-color:var(--diw-accent,#555) !important; color:var(--diw-ink,#171717); background:var(--diw-soft,#f3f3f3); font-weight:650; }
.diw-overlay .diw-sprint-timer { display:flex; align-items:center; flex-wrap:wrap; gap:8px 12px; min-width:0; margin:0 0 16px; padding:8px 12px; border-block:1px solid var(--diw-line,#ddd); color:var(--diw-secondary,#555); }
.diw-overlay .diw-sprint-timer > button { min-height:40px; }
.diw-overlay .diw-sprint-timer output { min-width:58px; color:var(--diw-ink,#171717); font:650 17px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-sprint-timer [role=status], .diw-overlay .diw-sprint-lock-note { color:var(--diw-secondary,#555); font-size:12px; line-height:1.5; }
.diw-overlay .diw-sprint-lock-note { padding:4px 7px; border-left:2px solid var(--diw-warm,#a66a00); background:var(--diw-soft,#f3f3f3); }
.diw-overlay .diw-sprint-grid { display:grid; grid-template-columns:minmax(0,1.04fr) minmax(360px,.96fr); align-items:start; gap:24px; min-width:0; }
.diw-overlay .diw-sprint-lesson, .diw-overlay .diw-sprint-practice, .diw-overlay .diw-sprint-recall { min-width:0; }
.diw-overlay .diw-sprint-lesson .diw-content { max-width:72ch; color:var(--diw-ink,#171717); font-size:14px; line-height:1.75; }
.diw-overlay .diw-sprint-lesson .diw-content p { margin:0 0 12px; }
.diw-overlay .diw-sprint-lesson .diw-content :is(ul,ol) { margin:0 0 12px; padding-left:20px; }
.diw-overlay .diw-sprint-lesson .diw-content :is(pre,figure) { max-width:100%; overflow:auto; }
.diw-overlay .diw-sprint-examples { display:grid; gap:8px; margin:16px 0; padding:12px; border:1px solid var(--diw-control,#bbb); border-radius:8px; background:var(--diw-soft,#f5f5f5); }
.diw-overlay .diw-sprint-examples strong { font-size:12px; line-height:1.5; }
.diw-overlay .diw-sprint-example { display:flex; align-items:baseline; justify-content:space-between; gap:12px; min-width:0; min-height:44px; padding-top:6px; border-top:1px solid var(--diw-line,#ddd); font-size:13px; line-height:1.5; }
.diw-overlay .diw-sprint-example code { min-width:0; padding:2px 4px; overflow-wrap:anywhere; border-radius:3px; background:var(--diw-panel,#fff); color:var(--diw-ink,#171717); font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; }
.diw-overlay .diw-sprint-example output { flex:0 0 auto; color:var(--diw-ink,#171717); font:650 13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; }
.diw-overlay .diw-sprint-acceptance { margin:16px 0; border-top:1px solid var(--diw-line,#ddd); border-bottom:1px solid var(--diw-line,#ddd); }
.diw-overlay .diw-sprint-acceptance summary { min-height:40px; padding:10px 0; color:var(--diw-secondary,#555); font-size:12px; cursor:pointer; }
.diw-overlay .diw-sprint-acceptance ul { margin:0 0 9px; padding-left:20px; color:var(--diw-secondary,#555); font-size:12px; line-height:1.65; }
.diw-overlay .diw-sprint-practice { padding:16px; border:1px solid var(--diw-control,#aaa); border-radius:10px; background:var(--diw-soft,#f7f7f7); }
.diw-overlay .diw-sprint-practice h3, .diw-overlay .diw-sprint-recall h3 { margin-bottom:10px; font-size:15px; }
.diw-overlay .diw-sprint-practice label, .diw-overlay .diw-sprint-recap label { display:block; min-width:0; margin:0 0 12px; }
.diw-overlay .diw-sprint-practice label > span, .diw-overlay .diw-sprint-recap label > span { display:block; margin:0 0 6px; color:var(--diw-secondary,#555); font-size:12px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-sprint :is(textarea,input) { max-width:100%; }
.diw-overlay .diw-sprint-editor { display:block; width:100%; min-height:300px; resize:vertical; padding:12px; border:1px solid var(--diw-control,#999) !important; border-radius:8px !important; background:var(--diw-panel,#fff) !important; color:var(--diw-ink,#171717) !important; caret-color:var(--diw-accent,#333); font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace; tab-size:4; }
.diw-overlay .diw-sprint-editor:focus { border-color:var(--diw-accent,#555) !important; }
.diw-overlay .diw-sprint-practice textarea:not(.diw-sprint-editor) { display:block; width:100%; min-height:66px; resize:vertical; padding:8px 12px; border:1px solid var(--diw-control,#999); border-radius:8px; background:var(--diw-panel,#fff); color:var(--diw-ink,#171717); font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace; }
.diw-overlay .diw-sprint-actions { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; margin:12px 0; }
.diw-overlay .diw-sprint-actions > button { min-height:40px; }
.diw-overlay .diw-sprint-practice .diw-sprint-actions { margin:0 0 8px; }
.diw-overlay .diw-sprint-status { min-height:20px; margin:8px 0; color:var(--diw-muted,#777); font-size:11px; line-height:1.6; }
.diw-overlay .diw-sprint-feedback { margin:8px 0; padding:8px 10px; border-left:3px solid var(--diw-control,#999); background:var(--diw-panel,#fff); color:var(--diw-secondary,#555); font-size:12px; line-height:1.6; }
.diw-overlay .diw-sprint-feedback[data-tone=success] { border-left-color:var(--diw-accent,#555); color:var(--diw-ink,#171717); }
.diw-overlay .diw-sprint-feedback[data-tone=error] { border-left-color:var(--diw-danger,#a33); color:var(--diw-danger,#8b1e1e); }
.diw-overlay .diw-sprint-output { min-height:78px; max-height:280px; margin:0 0 12px; padding:12px; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere; border:1px solid var(--diw-control,#999); border-radius:8px; background:var(--diw-panel,#fff); color:var(--diw-ink,#171717); font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace; }
.diw-overlay .diw-sprint-output[data-empty=true] { color:var(--diw-muted,#777); font-family:inherit; }
.diw-overlay .diw-sprint-practice details { margin:8px 0; }
.diw-overlay .diw-sprint details summary { color:var(--diw-secondary,#555); font-size:12px; cursor:pointer; }
.diw-overlay .diw-sprint-practice details .diw-content { max-height:220px; margin-top:8px; overflow:auto; }
.diw-overlay .diw-sprint-practice > a { display:inline-flex; align-items:center; min-height:40px; color:var(--diw-secondary,#555); font-size:12px; }
.diw-overlay .diw-sprint-recall { padding:16px; border:1px solid var(--diw-control,#aaa); border-radius:10px; background:var(--diw-soft,#f7f7f7); }
.diw-overlay .diw-sprint-recall p { margin:0 0 9px; color:var(--diw-secondary,#555); }
.diw-overlay .diw-sprint-recap { display:grid; gap:8px; min-width:0; margin-top:24px; padding-top:16px; border-top:1px solid var(--diw-line,#ddd); }
.diw-overlay .diw-sprint-recap h3 { font-size:16px; }
.diw-overlay .diw-sprint-recap textarea { display:block; width:100%; min-height:94px; resize:vertical; padding:12px; border:1px solid var(--diw-control,#999); border-radius:8px; background:var(--diw-panel,#fff); color:var(--diw-ink,#171717); font:inherit; font-size:14px; line-height:1.65; }
.diw-overlay .diw-sprint-recap > p { margin:0; color:var(--diw-secondary,#555); font-size:12px; }
.diw-overlay .diw-sprint-notice { margin:4px 0; color:var(--diw-secondary,#555); font-size:12px; line-height:1.6; }
.diw-overlay .diw-sprint-save-alert { margin:8px 0 0; padding:8px 10px; border-left:3px solid var(--diw-danger,#a33); background:var(--diw-soft,#f7f7f7); color:var(--diw-danger,#8b1e1e); font-size:12px; line-height:1.6; }
.diw-overlay .diw-sprint .diw-sprint-coach { color:var(--diw-secondary,#555); }

/* Editing and recovery controls. */
.diw-overlay .diw-sprint-editor-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; min-width:0; padding:8px 0; border-bottom:1px solid var(--diw-line,#ddd); }
.diw-overlay .diw-sprint-editor-toolbar > :is(button,a) { min-height:44px; }
.diw-overlay .diw-sprint-editor-toolbar > :first-child { min-width:0; }
.diw-overlay .diw-sprint-editor-meta { display:flex; align-items:baseline; flex-wrap:wrap; gap:4px 12px; min-width:0; margin:8px 0; color:var(--diw-muted,#777); font-size:11px; line-height:1.5; }
.diw-overlay .diw-sprint-editor-meta code { max-width:100%; overflow-wrap:anywhere; color:var(--diw-secondary,#555); font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; }
.diw-overlay .diw-sprint p.diw-sprint-save-status { min-width:0; margin:0; color:var(--diw-muted,#777); font-size:12px; line-height:1.6; }
.diw-overlay .diw-sprint p.diw-sprint-save-status[role=alert] { color:var(--diw-danger,#8b1e1e); }
.diw-overlay .diw-sprint-backup-actions { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-width:0; margin:10px 0; }
.diw-overlay .diw-sprint-backup-actions > :is(button,a) { min-height:44px; }
.diw-overlay .diw-sprint-import-preview { display:grid; gap:8px; min-width:0; max-height:240px; margin:10px 0; padding:10px 12px; overflow:auto; border:1px solid var(--diw-control,#aaa); border-radius:8px; background:var(--diw-soft,#f7f7f7); color:var(--diw-secondary,#555); font-size:12px; line-height:1.6; }
.diw-overlay .diw-sprint-import-preview :is(ul,ol) { margin:0; padding-left:20px; }
.diw-overlay .diw-sprint-import-preview code { overflow-wrap:anywhere; color:var(--diw-ink,#171717); font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; }
.diw-overlay .diw-sprint-completion-reason { display:grid; gap:6px; min-width:0; margin:8px 0; }
.diw-overlay .diw-sprint-completion-reason > span { color:var(--diw-secondary,#555); font-size:12px; font-weight:600; line-height:1.5; }
.diw-overlay .diw-sprint-completion-reason textarea { width:100%; min-height:72px; resize:vertical; padding:8px 12px; border:1px solid var(--diw-control,#999); border-radius:8px; background:var(--diw-panel,#fff); color:var(--diw-ink,#171717); font:inherit; font-size:13px; line-height:1.6; }
.diw-overlay .diw-sprint-shortcuts { margin:12px 0; border-top:1px solid var(--diw-line,#ddd); border-bottom:1px solid var(--diw-line,#ddd); }
.diw-overlay .diw-sprint-shortcuts summary { min-height:40px; padding:10px 0; color:var(--diw-secondary,#555); cursor:pointer; }
.diw-overlay .diw-sprint-shortcuts kbd { display:inline-block; min-width:22px; padding:1px 5px; border:1px solid var(--diw-control,#999); border-bottom-width:2px; border-radius:4px; background:var(--diw-panel,#fff); color:var(--diw-ink,#171717); font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; text-align:center; }
.diw-overlay .diw-sprint-footer-nav { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; min-width:0; margin-top:24px; padding-top:12px; border-top:1px solid var(--diw-line,#ddd); }
.diw-overlay .diw-sprint-footer-nav > :is(button,a) { min-height:44px; }
.diw-overlay .diw-sprint-field-count { display:flex; justify-content:flex-end; min-height:20px; margin:3px 0 8px; color:var(--diw-muted,#777); font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums; }
.diw-overlay .diw-sprint-field-count[data-near-limit=true] { color:var(--diw-warm,#8a5a00); }
.diw-overlay .diw-sprint-field-count[data-over-limit=true] { color:var(--diw-danger,#8b1e1e); font-weight:650; }

@media (min-width:821px) {
  .diw-overlay .diw-sprint-practice { position:sticky; top:16px; max-height:calc(100vh - 32px); overflow:auto; overscroll-behavior:contain; }
}
@container (max-width:820px) {
  .diw-overlay .diw-sprint-grid { grid-template-columns:minmax(0,1fr); }
  .diw-overlay .diw-sprint-practice { position:static; max-height:none; overflow:visible; }
  .diw-overlay .diw-sprint-days { display:flex; gap:8px; margin-block:12px 16px; overflow-x:auto; padding-bottom:3px; scrollbar-width:thin; overscroll-behavior-inline:contain; scroll-snap-type:x proximity; }
  .diw-overlay .diw-sprint .diw-sprint-day { flex:0 0 112px !important; min-height:64px; scroll-snap-align:start; }
}
@container (max-width:700px) {
  .diw-overlay .diw-sprint-grid { gap:16px; }
  .diw-overlay .diw-sprint .diw-sprint-step { min-height:44px; }
  .diw-overlay .diw-sprint :is(.diw-sprint-actions,.diw-sprint-backup-actions) { gap:8px; }
  .diw-overlay .diw-sprint :is(.diw-sprint-actions,.diw-sprint-backup-actions) > button { min-height:44px; }
  .diw-overlay .diw-sprint-editor-toolbar { align-items:stretch; }
  .diw-overlay .diw-sprint-editor-toolbar > :is(button,a) { flex:1 1 auto; }
  .diw-overlay .diw-sprint-footer-nav { align-items:stretch; }
  .diw-overlay .diw-sprint-footer-nav > :is(button,a) { flex:1 1 140px; }
}
@media (max-width:700px) {
  .diw-overlay .diw-sprint-grid { grid-template-columns:minmax(0,1fr); }
  .diw-overlay .diw-sprint .diw-sprint-day { flex:0 0 112px !important; min-height:64px; }
  .diw-overlay .diw-sprint-editor { min-height:260px; font-size:16px; line-height:1.6; }
  .diw-overlay .diw-sprint-practice textarea:not(.diw-sprint-editor), .diw-overlay .diw-sprint-recap textarea, .diw-overlay .diw-sprint-completion-reason textarea { font-size:16px; line-height:1.55; }
  .diw-overlay .diw-sprint :is(.diw-sprint-actions,.diw-sprint-backup-actions) > button { min-height:44px; }
}
@media (max-width:480px) {
  .diw-overlay .diw-sprint { padding-bottom:24px; }
  .diw-overlay .diw-sprint-lesson .diw-content { font-size:15px; line-height:1.75; }
  .diw-overlay .diw-sprint-practice, .diw-overlay .diw-sprint-recall { padding:12px; }
  .diw-overlay .diw-sprint .diw-sprint-day { flex-basis:112px !important; }
}
@media (prefers-reduced-motion:reduce) {
  .diw-overlay .diw-sprint *, .diw-overlay .diw-sprint *::before, .diw-overlay .diw-sprint *::after { scroll-behavior:auto !important; animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
}
@media (prefers-contrast:more) {
  .diw-overlay .diw-sprint :is(button,textarea,.diw-sprint-day,.diw-sprint-practice,.diw-sprint-recall,.diw-sprint-examples,.diw-sprint-output) { border-color:currentColor !important; }
  .diw-overlay .diw-sprint :is(button,textarea,summary,a):focus-visible { outline:3px solid currentColor; outline-offset:3px; }
}
@media (forced-colors:active) {
  .diw-overlay .diw-sprint :is(button,textarea,.diw-sprint-day,.diw-sprint-practice,.diw-sprint-recall,.diw-sprint-examples,.diw-sprint-output) { border:1px solid ButtonText !important; background:Canvas !important; color:CanvasText !important; }
  .diw-overlay .diw-sprint button.diw-button-primary { background:Highlight !important; color:HighlightText !important; }
  .diw-overlay .diw-sprint :is(button,textarea,summary,a):focus-visible { outline:2px solid Highlight; }
}
.diw-overlay .diw-sprint-example[data-long=true] { display:grid; grid-template-columns:minmax(0,1fr); gap:8px; }
.diw-overlay .diw-sprint-example[data-long=true] :is(code,output) { white-space:pre-wrap; overflow-wrap:anywhere; max-width:100%; }
.diw-overlay .diw-sprint[data-focus=true] > :is(.diw-sprint-meta,.diw-sprint-days,.diw-sprint-course-heading,.diw-sprint-stepnav) { display:none; }
.diw-overlay .diw-sprint :is(.diw-sprint-output,.diw-sprint-import-preview):focus-visible { outline:2px solid var(--diw-accent,#555); outline-offset:2px; }
@container (max-width:700px) {
  .diw-overlay .diw-sprint button { min-height:44px !important; }
}
@media print {
  .diw-overlay .diw-sprint { max-width:none; padding:0; color:#000; }
  .diw-overlay .diw-sprint :is(.diw-sprint-header,.diw-sprint-meta,.diw-sprint-days,.diw-sprint-stepnav,.diw-sprint-timer,.diw-sprint-actions,.diw-sprint-editor-toolbar,.diw-sprint-backup-actions,.diw-sprint-shortcuts,.diw-sprint-footer-nav,.diw-sprint-practice > a) { display:none !important; }
  .diw-overlay .diw-sprint-grid { display:block; }
  .diw-overlay .diw-sprint-practice, .diw-overlay .diw-sprint-recall { position:static; max-height:none; overflow:visible; margin-top:16px; border:1px solid #000; background:#fff; }
  .diw-overlay .diw-sprint-editor, .diw-overlay .diw-sprint-recap textarea { min-height:120px; border:1px solid #000 !important; background:#fff !important; color:#000 !important; }
  .diw-overlay .diw-sprint-output { max-height:none; border:1px solid #000; background:#fff; color:#000; }
  .diw-overlay .diw-sprint :is(a,button) { color:#000; }
}`
