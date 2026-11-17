/**
 * Version-scoped DOM adapter for DSH 0.1.1-rc.2. This is a compatibility
 * layer, not a public navigation Slot. Every native React tree stays in place.
 *
 * Adapted from dsh-wemedia-workbench/src/client/content-surface.ts.
 * Source SHA-256: b3876671c40ed7db8127a1dce30341b77655b153fae3d0e305519efcd300d92b
 * Navigation reference SHA-256: b4323bb05422d7398f2890fd911ed0753c738e8dedd2551879d61d5bbd5cea9b
 * Lifecycle reference SHA-256: 7ea6659585e9c57a93f70fcd5901085fc3500d8a2f682f38578370cde6b86c8d
 *
 * MIT License
 * Copyright (c) 2026 dsh-wemedia-workbench contributors
 * Copyright (c) 2026 dsh-oil-creator contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Audited against ui-sidebar SidebarRoot.tsx 9f8e1211e61c1459da64f2df637f6a1b8ece97a8f7a978bcc0cb966ee12724e3
// and ui-layout AppFrame.tsx 53649b22b357e458b4b2ab5c2894f5048464697d5b163448f0a55901d2b3ca75.
// Unknown CSS-module tokens or ancestor structure fail closed, never inferred
// from labels, coordinates or fuzzy class-name matching.
const classProfiles = Object.freeze([Object.freeze({
  frame: 'pI_x6G_frame', sidebar: 'pI_x6G_sidebarCol', center: 'pI_x6G_centerCol',
  details: 'pI_x6G_detailsCol', root: 'hHd-Xa_root', logo: 'hHd-Xa_logoRow',
  brand: 'hHd-Xa_brand', newSession: 'hHd-Xa_newSession', region: 'hHd-Xa_regionArea',
  foot: 'hHd-Xa_footArea', collapsed: 'hHd-Xa_collapsed',
}), Object.freeze({
  // Second exact rc.2 build profile, observed in the live isolated DSH client.
  // CSS-module hashes differ by the compiled bundle, while the audited source
  // and four fixed AppFrame child seats remain the same.
  frame: 'RjZKNG_frame', sidebar: 'RjZKNG_sidebarCol', center: 'RjZKNG_centerCol',
  details: 'RjZKNG_detailsCol', root: 'eJvCrq_root', logo: 'eJvCrq_logoRow',
  brand: 'eJvCrq_brand', newSession: 'eJvCrq_newSession', region: 'eJvCrq_regionArea',
  foot: 'eJvCrq_footArea', collapsed: 'eJvCrq_collapsed',
  newSessionTooltip: '_bubble_owhem_8',
}), Object.freeze({
  // Same audited rc.2 source in the daily Web build. Imagegen 1.2.2 adds a
  // marked sibling button; preserve it and let its owner handle activation.
  frame: 'WyF1KG_frame', sidebar: 'WyF1KG_sidebarCol', center: 'WyF1KG_centerCol',
  details: 'WyF1KG_detailsCol', root: 'cdRMtG_root', logo: 'cdRMtG_logoRow',
  brand: 'cdRMtG_brand', newSession: 'cdRMtG_newSession', region: 'cdRMtG_regionArea',
  foot: 'cdRMtG_footArea', collapsed: 'cdRMtG_collapsed',
  newSessionTooltip: '_bubble_owhem_8',
  headerAction: 'Yvqh9W_entry', headerActionAttribute: 'data-dsh-imagegen-entry',
})])
const scopeAttribute = 'data-diw-workspace-surface'
const activeAttribute = 'data-diw-workspace-active'
const mountAttribute = 'data-diw-workspace-mount'
const attachedFrames = new WeakSet()
let nextSurface = 0

function direct(parent, className) {
  const matches = Array.from(parent.children).filter(child => child.classList.contains(className))
  return matches.length === 1 ? matches[0] : undefined
}

function isHeaderAction(element, classes) {
  return Boolean(classes.headerAction && element?.tagName === 'BUTTON'
    && element.className === classes.headerAction
    && element.getAttribute(classes.headerActionAttribute) !== null)
}

function discover(doc, anchor, owned = []) {
  const candidates = anchor
    ? [anchor.isConnected ? anchor.closest('[data-shell-overlay]') : null].filter(Boolean)
    : Array.from(doc.querySelectorAll('[data-shell-overlay]'))
  if (candidates.length !== 1) return undefined
  const overlay = candidates[0]
  const frame = overlay.parentElement
  if (!frame?.isConnected) return undefined
  const profiles = classProfiles.filter(profile => frame.classList.contains(profile.frame))
  if (profiles.length !== 1) return undefined
  const classes = profiles[0]
  const sidebar = direct(frame, classes.sidebar)
  const center = direct(frame, classes.center)
  const details = direct(frame, classes.details)
  if (!sidebar || !center || !details || frame.children[0] !== sidebar
    || frame.children[1] !== center || frame.children[2] !== details
    || frame.children[3] !== overlay) return undefined
  const boundaries = Array.from(sidebar.children).filter(child => child.getAttribute('data-slot') === 'sidebar')
  if (boundaries.length !== 1) return undefined
  const boundary = boundaries[0]
  if (boundary.tagName !== 'DIV'
    || !/(?:^|;)\s*display\s*:\s*contents\s*(?:;|$)/.test(boundary.getAttribute('style') ?? '')) return undefined
  const root = direct(boundary, classes.root)
  if (!root) return undefined
  const logo = direct(root, classes.logo)
  const newSession = direct(root, classes.newSession)
  const region = direct(root, classes.region)
  const foot = direct(root, classes.foot)
  if (!logo || !newSession || !region || !foot || newSession.tagName !== 'BUTTON') return undefined
  // Tooltip.tsx (SHA-256 9e2c238d1c940df71910ffe1cefc7cd8a9e400216296f537108029b3b4c71409)
  // renders a fixed-position sibling after its anchor, without a portal. The
  // rc.2 New Session control gains this exact span on rail hover/focus. It is
  // transient native UI, not another adapter taking a grid seat. Accept only
  // the observed class, semantics and position; all other extra nodes fail.
  const nativeChildren = Array.from(root.children).filter(child => !owned.includes(child))
  const candidateTooltip = nativeChildren[2]
  const tooltip = classes.newSessionTooltip && candidateTooltip?.tagName === 'SPAN'
    && candidateTooltip.className === classes.newSessionTooltip
    && candidateTooltip.getAttribute('role') === 'tooltip'
    && candidateTooltip.getAttribute('data-side') === 'right'
    && candidateTooltip.children.length === 0 ? candidateTooltip : undefined
  // Another DOM adapter cannot silently compete for this same grid geometry.
  const withoutTooltip = nativeChildren.filter(child => child !== tooltip)
  const headerActions = withoutTooltip.filter(child => isHeaderAction(child, classes))
  if (headerActions.length > 1 || (headerActions.length === 1 && withoutTooltip[2] !== headerActions[0])) return undefined
  const native = withoutTooltip.filter(child => !headerActions.includes(child))
  if (native.length !== 4 || native[0] !== logo || native[1] !== newSession
    || native[2] !== region || native[3] !== foot) return undefined
  return { classes, frame, overlay, sidebar, center, details, boundary, root, logo, newSession, region, foot }
}

/** Restore a previous value only while our exact write still owns the seat. */
function writeAttribute(element, name, value) {
  const previous = element.getAttribute(name)
  element.setAttribute(name, value)
  return () => {
    if (element.getAttribute(name) !== value) return
    if (previous === null) element.removeAttribute(name)
    else element.setAttribute(name, previous)
  }
}

const emptyTargets = Object.freeze({ navigation: null, library: null, center: null })

/**
 * Own three portal seats and their presentation only. Subscribe through
 * getSnapshot/subscribe (stable snapshot identity until a real change).
 *
 * onExit(reason, event?) runs after restoring the native view. Native session
 * buttons retain their original events and handlers. Mount attempts stop after
 * 30 attempts/2.9 seconds; structural failure after mounting is terminal until
 * the caller explicitly creates another adapter.
 */
export function attachWorkspaceSurface({ onExit, onChange, document: suppliedDocument, anchor } = {}) {
  const doc = suppliedDocument ?? anchor?.ownerDocument ?? globalThis.document
  const win = doc?.defaultView
  const listeners = new Set()
  let snapshot = Object.freeze({ ...emptyTargets, wide: true, active: false, available: false, status: 'pending' })
  let live = true
  let attempts = 0
  let timer
  let mounted
  let releaseActive
  let releaseScope
  let observer
  let removeSessionListener
  const publish = next => {
    snapshot = Object.freeze(next)
    for (const listener of [...listeners]) { try { listener() } catch { /* Consumer errors cannot take down the host. */ } }
    try { onChange?.(snapshot) } catch { /* Isolate optional observers. */ }
  }
  const emitExit = (reason, event) => { try { onExit?.(reason, event) } catch { /* Host event continues. */ } }
  const cancelTimer = () => {
    if (timer !== undefined) win?.clearTimeout(timer)
    timer = undefined
  }
  const cleanMount = () => {
    observer?.disconnect()
    observer = undefined
    removeSessionListener?.()
    removeSessionListener = undefined
    releaseActive?.()
    releaseActive = undefined
    releaseScope?.()
    releaseScope = undefined
    if (mounted) {
      for (const element of [mounted.navigation, mounted.library, mounted.portal, mounted.style]) element.remove()
      attachedFrames.delete(mounted.host.frame)
      mounted = undefined
    }
  }
  const unavailable = () => {
    const wasActive = snapshot.active
    cancelTimer()
    cleanMount()
    publish({ ...emptyTargets, wide: true, active: false, available: false, status: 'unavailable' })
    if (wasActive) emitExit('host-unavailable')
  }
  const valid = () => {
    if (!live || !mounted) return false
    const { host, navigation, library, portal, style, id } = mounted
    const current = discover(doc, anchor, [navigation, library])
    return host.frame.getAttribute(scopeAttribute) === id && current !== undefined
      && (!snapshot.active || host.frame.getAttribute(activeAttribute) === id)
      && Object.keys(host).every(key => host[key] === current[key])
      && navigation.parentElement === host.root && library.parentElement === host.root
      && portal.parentElement === host.center && style.parentElement === host.frame
  }
  const setActive = active => {
    if (!mounted || !live) return false
    if (!valid()) { unavailable(); return false }
    const next = Boolean(active)
    if (next === snapshot.active) return true
    if (next) {
      // Close a previously open sibling through its own control. Do not edit
      // its state/attributes or impersonate another panel's activation event.
      const sibling = Array.from(mounted.host.root.children).find(child => isHeaderAction(child, mounted.host.classes))
      if (sibling?.getAttribute('data-active') === 'true') sibling.click()
      releaseActive = writeAttribute(mounted.host.frame, activeAttribute, mounted.id)
    }
    else { releaseActive?.(); releaseActive = undefined }
    publish({ ...snapshot, active: next })
    return true
  }

  const attempt = () => {
    timer = undefined
    if (!live) return
    let host
    try { host = doc && discover(doc, anchor) } catch { /* Unknown document shape is unavailable. */ }
    if (!host || attachedFrames.has(host.frame) || !win?.MutationObserver) {
      if (++attempts < 30 && win?.setTimeout) timer = win.setTimeout(attempt, 100)
      else unavailable()
      return
    }
    const { classes } = host
    const id = `diw-workspace-${++nextSurface}`
    const scope = `[${scopeAttribute}="${id}"]`
    const root = `${scope} > .${classes.sidebar} > [data-slot="sidebar"] > .${classes.root}`
    const active = `${scope}[${activeAttribute}="${id}"]`
    const navigation = doc.createElement('div')
    const library = doc.createElement('div')
    const portal = doc.createElement('div')
    for (const [element, name] of [[navigation, 'navigation'], [library, 'library'], [portal, 'center']]) {
      element.className = `diw-workspace-mount-${name}`
      element.setAttribute(mountAttribute, name)
    }
    const style = doc.createElement('style')
    style.setAttribute('data-diw-workspace-style', id)
    style.textContent = `
${root}:not(.${classes.collapsed}) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(64px, .65fr); grid-template-rows: auto auto ${classes.headerAction ? 'auto ' : ''}minmax(0, 1fr) auto; column-gap: 6px; }
${root} > .${classes.logo} { grid-column: 1 / -1; grid-row: 1; }
${root} > .${classes.newSession} { grid-column: 1; grid-row: 2; min-width: 0; padding-inline: 8px; }
${root} > [${mountAttribute}="navigation"] { grid-column: 2; grid-row: 2; display: flex; min-width: 0; height: 38px; margin: 0 2px 8px 0; }
${classes.headerAction ? `${root} > .${classes.headerAction}[${classes.headerActionAttribute}] { grid-column: 1 / -1; grid-row: 3; }` : ''}
${root} > .${classes.region}, ${root} > [${mountAttribute}="library"] { grid-column: 1 / -1; grid-row: ${classes.headerAction ? 4 : 3}; min-height: 0; }
${root} > .${classes.foot} { grid-column: 1 / -1; grid-row: ${classes.headerAction ? 5 : 4}; }
${scope} [${mountAttribute}="library"], ${scope} [${mountAttribute}="center"] { display: none; min-height: 0; min-width: 0; overflow: hidden; flex: 1 1 0; }
${active} > .${classes.sidebar} > [data-slot="sidebar"] > .${classes.root} > .${classes.region},
${active} > .${classes.center} > :not([${mountAttribute}="center"]) { display: none !important; }
${active} [${mountAttribute}="library"], ${active} [${mountAttribute}="center"] { display: flex; flex-direction: column; }
${root}.${classes.collapsed} > [${mountAttribute}="navigation"] { flex: none; width: 36px; height: 36px; margin: 0 0 12px; }
${root}.${classes.collapsed} > [${mountAttribute}="library"] { display: none; }
${root}.${classes.collapsed} > .${classes.foot} { margin-top: auto; }
`
    mounted = { host, navigation, library, portal, style, id }
    try {
      releaseScope = writeAttribute(host.frame, scopeAttribute, id)
      host.root.insertBefore(navigation, host.newSession.nextSibling)
      host.root.insertBefore(library, host.region.nextSibling)
      host.center.appendChild(portal)
      host.frame.appendChild(style)
      attachedFrames.add(host.frame)
      const onSession = event => {
        const button = event.target?.closest?.('button')
        if (isHeaderAction(button, classes)) {
          if (snapshot.active) { setActive(false); emitExit('other-panel', event) }
          return
        }
        if (button !== host.newSession
          && !(button?.classList.contains(classes.brand) && host.logo.contains(button))) return
        if (snapshot.active) { setActive(false); emitExit('new-session', event) }
      }
      host.root.addEventListener('click', onSession, true)
      removeSessionListener = () => host.root.removeEventListener('click', onSession, true)
      observer = new win.MutationObserver(() => {
        if (!valid()) { unavailable(); return }
        const wide = !host.root.classList.contains(classes.collapsed)
        if (wide !== snapshot.wide) publish({ ...snapshot, wide })
      })
      // Only exact structural seats: no document/body observer, no subtree
      // observation of messages, editor typing, or our own rendered content.
      observer.observe(host.frame, { childList: true, attributes: true, attributeFilter: ['class', scopeAttribute, activeAttribute, 'data-sidebar-collapsed'] })
      observer.observe(host.sidebar, { childList: true, attributes: true, attributeFilter: ['class'] })
      observer.observe(host.boundary, { childList: true, attributes: true, attributeFilter: ['data-slot', 'style'] })
      observer.observe(host.root, { childList: true, attributes: true, attributeFilter: ['class'] })
      observer.observe(host.center, { childList: true, attributes: true, attributeFilter: ['class'] })
      // Class changes on the direct audited children are contract changes.
      for (const element of [host.logo, host.newSession, host.region, host.foot, host.details]) {
        observer.observe(element, { attributes: true, attributeFilter: ['class'] })
      }
      observer.observe(host.overlay, { childList: true, attributes: true, attributeFilter: ['data-shell-overlay'] })
      for (let parent = anchor?.parentElement; parent && parent !== host.overlay; parent = parent.parentElement) {
        observer.observe(parent, { childList: true })
      }
      if (host.frame.parentElement) observer.observe(host.frame.parentElement, { childList: true })
      publish({ navigation, library, center: portal, wide: !host.root.classList.contains(classes.collapsed), active: false, available: true, status: 'ready' })
    } catch { unavailable() }
  }
  attempt()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { if (!live) return () => {}; listeners.add(listener); return () => listeners.delete(listener) },
    setActive,
    dispose() {
      if (!live) return
      live = false
      cancelTimer()
      cleanMount()
      publish({ ...emptyTargets, wide: true, active: false, available: false, status: 'disposed' })
      listeners.clear()
    },
  }
}
