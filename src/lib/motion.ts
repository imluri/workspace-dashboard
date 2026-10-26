/** Small, framework-neutral UI springs. Page scrolling stays with the browser.
 * Inspired by https://blog.justinbuilds.mov/ios/: m=1, k=(2π/response)^2,
 * damping=2ζ√k. Retargeting preserves the current position and velocity.
 */
export type MotionValues = { x: number; y: number; scale: number; opacity: number };
type MotionOptions = { response?: number; damping?: number; initial?: Partial<MotionValues> };
type SpringState = {
  value: MotionValues;
  velocity: MotionValues;
  target: MotionValues;
  frame: number;
  last: number;
  response: number;
  damping: number;
  done?: (settled: boolean) => void;
};
type LayerState = {
  opener: HTMLElement | null;
  revision: number;
  closing: boolean;
  inertBeforeClose?: boolean;
  closingTask?: Promise<void>;
  cleanup: () => void;
};
const rest = (): MotionValues => ({ x: 0, y: 0, scale: 1, opacity: 1 });
const zero = (): MotionValues => ({ x: 0, y: 0, scale: 0, opacity: 0 });
const springs = new WeakMap<HTMLElement, SpringState>();
const active = new Set<HTMLElement>();
const layers = new Map<HTMLDialogElement, LayerState>();
const order: HTMLDialogElement[] = [];
const installed = new WeakMap<Document, () => void>();
const keys = ['x', 'y', 'scale', 'opacity'] as const;
const reduceMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function paint(element: HTMLElement, state: SpringState) {
  element.setAttribute('data-ui-motion', '');
  element.style.setProperty('--ui-motion-x', `${state.value.x.toFixed(3)}px`);
  element.style.setProperty('--ui-motion-y', `${state.value.y.toFixed(3)}px`);
  element.style.setProperty('--ui-motion-scale', String(Math.max(0.1, state.value.scale)));
  element.style.setProperty(
    '--ui-motion-opacity',
    String(Math.min(1, Math.max(0, state.value.opacity))),
  );
}
function finish(element: HTMLElement, state: SpringState, settled: boolean) {
  cancelAnimationFrame(state.frame);
  state.frame = 0;
  active.delete(element);
  element.removeAttribute('data-ui-motion-active');
  const done = state.done;
  state.done = undefined;
  done?.(settled);
}
function tick(element: HTMLElement, state: SpringState, time: number) {
  if (!element.isConnected) {
    finish(element, state, false);
    return;
  }
  const elapsed = Math.min(0.04, Math.max(0.001, (time - (state.last || time - 16.67)) / 1000));
  state.last = time;
  // Small integration steps remain stable after a dropped frame or background tab.
  const steps = Math.ceil(elapsed / 0.008),
    dt = elapsed / steps;
  const stiffness = ((2 * Math.PI) / state.response) ** 2,
    friction = 2 * state.damping * Math.sqrt(stiffness);
  for (let step = 0; step < steps; step++)
    for (const key of keys) {
      state.velocity[key] +=
        (-stiffness * (state.value[key] - state.target[key]) - friction * state.velocity[key]) * dt;
      state.value[key] += state.velocity[key] * dt;
    }
  const settled =
    reduceMotion() ||
    keys.every(
      (key) =>
        Math.abs(state.value[key] - state.target[key]) <
          (key === 'x' || key === 'y' ? 0.08 : 0.001) &&
        Math.abs(state.velocity[key]) < (key === 'x' || key === 'y' ? 0.3 : 0.004),
    );
  if (settled) {
    state.value = { ...state.target };
    state.velocity = zero();
  }
  paint(element, state);
  if (settled) finish(element, state, true);
  else state.frame = requestAnimationFrame((next) => tick(element, state, next));
}
export function animatePortalElement(
  element: HTMLElement,
  target: Partial<MotionValues>,
  options: MotionOptions = {},
): Promise<boolean> {
  let state = springs.get(element);
  if (!state) {
    state = {
      value: { ...rest(), ...options.initial },
      velocity: zero(),
      target: rest(),
      frame: 0,
      last: 0,
      response: 0.5,
      damping: 0.85,
    };
    springs.set(element, state);
  } else if (options.initial && !state.frame) {
    state.value = { ...state.value, ...options.initial };
    state.velocity = zero();
  }
  if (state.done) {
    const previous = state.done;
    state.done = undefined;
    previous(false);
  }
  state.target = { ...state.target, ...target };
  state.response = Math.min(1.2, Math.max(0.12, options.response ?? 0.5));
  state.damping = Math.min(2, Math.max(0.6, options.damping ?? 0.85));
  paint(element, state);
  if (reduceMotion()) {
    state.value = { ...state.target };
    state.velocity = zero();
    paint(element, state);
    finish(element, state, true);
    return Promise.resolve(true);
  }
  const promise = new Promise<boolean>((resolve) => {
    state!.done = resolve;
  });
  active.add(element);
  element.setAttribute('data-ui-motion-active', '');
  if (!state.frame) {
    state.last = 0;
    state.frame = requestAnimationFrame((time) => tick(element, state!, time));
  }
  return promise;
}
/** Bounded resistance used only by explicit sheet handles, never wheel scrolling. */
export function rubberBand(distance: number, dimension: number, coefficient = 0.55): number {
  const size = Math.max(1, dimension),
    amount = Math.abs(distance);
  return (Math.sign(distance) * coefficient * amount * size) / (size + coefficient * amount);
}
export function topPortalLayer(): HTMLDialogElement | undefined {
  return order.filter((dialog) => dialog.isConnected && dialog.open).at(-1);
}
function stackLayers() {
  const opened = order.filter((dialog) => dialog.isConnected && dialog.open);
  document.body.toggleAttribute('data-portal-layers-open', opened.length > 0);
  opened.forEach((dialog, index) => {
    const depth = opened.length - index - 1;
    dialog.dataset.layerDepth = String(depth);
    if (!layers.get(dialog)?.closing)
      void animatePortalElement(dialog, {
        y: -Math.min(depth, 3) * 14,
        scale: 1 - Math.min(depth, 3) * 0.035,
        opacity: 1,
      });
  });
}
function restoreOpener(state: LayerState) {
  const opener = state.opener,
    top = topPortalLayer();
  const parent = opener?.closest('dialog');
  if (
    opener?.isConnected &&
    (!parent || parent.open) &&
    opener.getClientRects().length &&
    (!top || top.contains(opener)) &&
    !opener.closest('[inert]') &&
    !opener.matches(':disabled')
  )
    opener.focus({ preventScroll: true });
}
const layerBusy = (dialog: HTMLDialogElement) =>
  dialog.dataset.layerBusy === 'true' ||
  dialog.getAttribute('aria-busy') === 'true' ||
  Boolean(dialog.querySelector('[aria-busy="true"]'));
function unregisterLayer(dialog: HTMLDialogElement) {
  const state = layers.get(dialog);
  if (!state) return;
  if (state.inertBeforeClose !== undefined) dialog.inert = state.inertBeforeClose;
  state.revision++;
  state.cleanup();
  layers.delete(dialog);
  const index = order.indexOf(dialog);
  if (index >= 0) order.splice(index, 1);
  const spring = springs.get(dialog);
  if (spring) finish(dialog, spring, false);
  stackLayers();
  restoreOpener(state);
}
function registerLayer(dialog: HTMLDialogElement, opener: HTMLElement | null) {
  if (layers.has(dialog)) return;
  const controller = new AbortController(),
    signal = controller.signal;
  const state: LayerState = {
    opener,
    revision: 0,
    closing: false,
    cleanup: () => controller.abort(),
  };
  layers.set(dialog, state);
  order.push(dialog);
  dialog.setAttribute('data-portal-layer', '');
  dialog.addEventListener(
    'cancel',
    (event) => {
      // A form can refuse cancellation while a write is in flight.
      if (event.defaultPrevented) return;
      event.preventDefault();
      queueMicrotask(() => {
        if (topPortalLayer() === dialog && !layerBusy(dialog)) void closePortalLayer(dialog);
      });
    },
    { signal },
  );
  dialog.addEventListener('close', () => unregisterLayer(dialog), { signal });
  let drag: {
    id: number;
    start: number;
    lastY: number;
    time: number;
    velocity: number;
    handle: HTMLElement;
  } | null = null;
  const release = (cancelled = false) => {
    const current = drag;
    drag = null;
    if (!current) return;
    try {
      current.handle.releasePointerCapture(current.id);
    } catch {
      /* Already released. */
    }
    if (cancelled || !dialog.open) {
      if (dialog.open) stackLayers();
      return;
    }
    const moved = springs.get(dialog)?.value.y ?? 0;
    if (
      moved > 110 &&
      current.velocity > 0.05 &&
      dialog.dataset.layerDragDismiss !== 'false' &&
      !layerBusy(dialog)
    )
      void closePortalLayer(dialog);
    else void animatePortalElement(dialog, { y: 0, scale: 1, opacity: 1 });
  };
  dialog.addEventListener(
    'pointerdown',
    (event) => {
      const handle = (event.target as Element)?.closest<HTMLElement>('[data-layer-handle]');
      if (
        !handle ||
        state.closing ||
        event.button !== 0 ||
        topPortalLayer() !== dialog ||
        reduceMotion() ||
        layerBusy(dialog)
      )
        return;
      if ((event.target as Element).closest('button,a,input,select,textarea')) return;
      state.revision++;
      state.closing = false;
      const spring = springs.get(dialog);
      if (spring) finish(dialog, spring, false);
      drag = {
        id: event.pointerId,
        start: event.clientY,
        lastY: event.clientY,
        time: event.timeStamp,
        velocity: 0,
        handle,
      };
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    { signal },
  );
  dialog.addEventListener(
    'pointermove',
    (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      const elapsed = Math.max(1, event.timeStamp - drag.time);
      drag.velocity = (event.clientY - drag.lastY) / elapsed;
      drag.lastY = event.clientY;
      drag.time = event.timeStamp;
      const spring = springs.get(dialog);
      if (!spring) return;
      const next = rubberBand(
        event.clientY - drag.start,
        dialog.clientHeight || 600,
        event.pointerType === 'touch' ? 0.55 : 0.4,
      );
      spring.velocity.y = ((next - spring.value.y) / elapsed) * 1000;
      spring.value.y = next;
      paint(dialog, spring);
    },
    { signal },
  );
  dialog.addEventListener('pointerup', () => release(), { signal });
  dialog.addEventListener('pointercancel', () => release(true), { signal });
  signal.addEventListener('abort', () => release(true), { once: true });
}
export function openPortalLayer(dialog: HTMLDialogElement): void {
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const existing = layers.get(dialog);
  if (existing) {
    existing.revision++;
    existing.closing = false;
    existing.closingTask = undefined;
    if (existing.inertBeforeClose !== undefined) {
      dialog.inert = existing.inertBeforeClose;
      delete existing.inertBeforeClose;
    }
  }
  if (!dialog.open) dialog.showModal();
  registerLayer(dialog, opener);
  if (!existing)
    void animatePortalElement(
      dialog,
      { y: 0, scale: 1, opacity: 1 },
      { initial: { y: 32, scale: 0.965, opacity: 0 } },
    );
  stackLayers();
}
export function closePortalLayer(dialog: HTMLDialogElement): Promise<void> {
  if (!dialog.open) {
    unregisterLayer(dialog);
    return Promise.resolve();
  }
  const state = layers.get(dialog);
  if (!state) {
    dialog.close();
    return Promise.resolve();
  }
  if (state.closingTask) return state.closingTask;
  // Keep the backdrop's native modal inertness and also make the closing form
  // inert, so it cannot start a write while its dismissal spring is settling.
  const revision = ++state.revision;
  state.closing = true;
  state.inertBeforeClose = dialog.inert;
  dialog.inert = true;
  state.closingTask = (async () => {
    const finished = await animatePortalElement(
      dialog,
      { y: 24, scale: 0.97, opacity: 0 },
      { response: 0.32, damping: 1 },
    );
    if (!finished || !dialog.open || layers.get(dialog) !== state || revision !== state.revision)
      return;
    dialog.close();
    unregisterLayer(dialog);
  })();
  return state.closingTask;
}
export function revealPortalElements(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLElement>(
      '[data-motion-enter], .quick-grid > li, .insight-card, .desk-card',
    )
    .forEach((element) => {
      if (element.dataset.motionEntered || element.closest('[hidden],dialog:not([open])')) return;
      element.dataset.motionEntered = 'true';
      const rect = element.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= innerHeight || reduceMotion()) return;
      void animatePortalElement(
        element,
        { y: 0, opacity: 1, scale: 1 },
        { initial: { y: 10, opacity: 0.5 }, response: 0.36, damping: 1 },
      );
    });
}

declare global {
  interface Window {
    portalLayers?: {
      open: typeof openPortalLayer;
      close: typeof closePortalLayer;
      top: typeof topPortalLayer;
    };
  }
}
/** Install once per document; returned cleanup supports React apps and Astro swaps. */
export function installPortalMotion(doc: Document = document): () => void {
  const previous = installed.get(doc);
  if (previous) return previous;
  const view = doc.defaultView;
  if (!view) return () => {};
  const controller = new AbortController(),
    signal = controller.signal;
  view.portalLayers = { open: openPortalLayer, close: closePortalLayer, top: topPortalLayer };
  const motionPreference = view.matchMedia('(prefers-reduced-motion: reduce)');
  motionPreference.addEventListener(
    'change',
    () => {
      if (!motionPreference.matches) return;
      for (const element of [...active]) {
        const state = springs.get(element);
        if (!state) continue;
        state.value = { ...state.target };
        state.velocity = zero();
        paint(element, state);
        finish(element, state, true);
      }
    },
    { signal },
  );
  const pressTargets = new Map<number, HTMLElement>();
  const releasePress = (event: PointerEvent) => {
    const element = pressTargets.get(event.pointerId);
    pressTargets.delete(event.pointerId);
    if (element) void animatePortalElement(element, { scale: 1 }, { response: 0.22, damping: 0.7 });
  };
  doc.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0 || reduceMotion()) return;
      const element = (event.target as Element)?.closest<HTMLElement>(
        '.btn,button[data-ui-press],[data-nav-trigger],.quick-grid a',
      );
      if (
        !element ||
        element.matches(':disabled,[aria-disabled="true"]') ||
        element.closest('.tt-grid,[data-layer-handle]')
      )
        return;
      pressTargets.set(event.pointerId, element);
      void animatePortalElement(element, { scale: 0.975 }, { response: 0.16, damping: 1 });
    },
    { signal },
  );
  doc.addEventListener('pointerup', releasePress, { signal });
  doc.addEventListener('pointercancel', releasePress, { signal });
  const resetPress = () => {
    for (const element of pressTargets.values()) void animatePortalElement(element, { scale: 1 });
    pressTargets.clear();
  };
  view.addEventListener('blur', resetPress, { signal });
  doc.addEventListener(
    'toggle',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const panel =
        target.matches('[data-nav-flyout]') && (event as ToggleEvent).newState === 'open'
          ? target
          : target instanceof HTMLDetailsElement && target.open
            ? target.querySelector<HTMLElement>('.portal-account__menu,[data-motion-panel]')
            : null;
      if (panel)
        void animatePortalElement(panel, rest(), {
          initial: {
            x: target.matches('[data-nav-flyout]') ? -8 : 0,
            y: 5,
            scale: 0.98,
            opacity: 0.2,
          },
          response: 0.32,
          damping: 0.9,
        });
    },
    { capture: true, signal },
  );
  const observeDialogs = () =>
    doc.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((dialog) => {
      if (!layers.has(dialog)) openPortalLayer(dialog);
    });
  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.type === 'childList' || record.attributeName === 'open')) {
      for (const dialog of [...layers.keys()])
        if (!dialog.open || !dialog.isConnected) unregisterLayer(dialog);
      observeDialogs();
    }
  });
  observer.observe(doc.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open'],
  });
  observeDialogs();
  revealPortalElements(doc);
  const cleanupPage = () => {
    resetPress();
    for (const dialog of [...order].reverse()) {
      if (dialog.open) dialog.close();
      unregisterLayer(dialog);
    }
    for (const element of [...active]) {
      const state = springs.get(element);
      if (state) {
        state.value = { ...state.target };
        paint(element, state);
        finish(element, state, false);
      }
    }
  };
  doc.addEventListener('astro:before-swap', cleanupPage, { signal });
  doc.addEventListener(
    'astro:page-load',
    () => {
      observeDialogs();
      revealPortalElements(doc);
    },
    { signal },
  );
  const cleanup = () => {
    observer.disconnect();
    controller.abort();
    cleanupPage();
    installed.delete(doc);
    if (view.portalLayers?.open === openPortalLayer) delete view.portalLayers;
  };
  installed.set(doc, cleanup);
  return cleanup;
}
