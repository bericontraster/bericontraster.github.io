export function setupArticleToc() {
  const article = document.querySelector('.imported-post:not(.blacksite-page)');
  const body = article?.querySelector('.post-body');
  const headings = [...(body?.querySelectorAll('h2[id], h3[id]') || [])];
  if (headings.length < 2) return;

  const toc = document.createElement('aside');
  toc.className = 'article-toc';
  toc.hidden = true;
  const trigger = document.createElement('button');
  trigger.className = 'article-toc-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', 'Open table of contents');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'article-toc-panel');
  const rail = document.createElement('span');
  rail.className = 'article-toc-rail';
  rail.setAttribute('aria-hidden', 'true');
  const mobileIcon = document.createElement('span');
  mobileIcon.className = 'article-toc-mobile-icon';
  mobileIcon.setAttribute('aria-hidden', 'true');
  mobileIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M3 6h1M3 12h1M3 18h1"/></svg>';
  trigger.append(rail, mobileIcon);
  const panel = document.createElement('nav');
  panel.className = 'article-toc-panel';
  panel.id = 'article-toc-panel';
  panel.setAttribute('aria-label', 'Table of contents');
  panel.hidden = true;
  const header = document.createElement('div');
  header.className = 'article-toc-header';
  const label = document.createElement('span');
  label.textContent = 'On this page';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'article-toc-close';
  close.setAttribute('aria-label', 'Close table of contents');
  close.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>';
  header.append(label, close);
  const list = document.createElement('ol');
  list.className = 'article-toc-list';
  const entries = headings.map(heading => {
    const nested = heading.tagName === 'H3';
    const mark = document.createElement('span');
    mark.className = 'article-toc-mark' + (nested ? ' is-nested' : '');
    rail.append(mark);
    const item = document.createElement('li');
    if (nested) item.className = 'is-nested';
    const link = document.createElement('a');
    link.href = '#' + encodeURIComponent(heading.id);
    link.textContent = heading.textContent.trim();
    item.append(link);
    list.append(item);
    return { heading, mark, link };
  });
  panel.append(header, list);
  toc.append(trigger, panel);
  document.body.append(toc);

  const desktop = matchMedia('(min-width: 1100px)');
  let pinned = false;
  let active = null;
  let frame = 0;

  function show(open) {
    panel.hidden = !open;
    toc.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Table of contents is open' : 'Open table of contents');
    if (open) keepCurrentVisible();
  }

  function keepCurrentVisible() {
    if (!active || panel.hidden) return;
    const rect = active.link.getBoundingClientRect();
    const bounds = list.getBoundingClientRect();
    if (rect.top < bounds.top) list.scrollTop -= bounds.top - rect.top + 6;
    else if (rect.bottom > bounds.bottom) list.scrollTop += rect.bottom - bounds.bottom + 6;
  }

  function dismiss(returnFocus = false) {
    pinned = false;
    show(false);
    if (returnFocus) trigger.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', () => {
    pinned = !pinned;
    show(pinned);
    // Keyboard users can continue straight into the contents list.
    if (pinned && trigger.matches(':focus-visible')) (active?.link || entries[0].link).focus({ preventScroll: true });
  });
  toc.addEventListener('pointerenter', event => {
    if (desktop.matches && event.pointerType === 'mouse') show(true);
  });
  toc.addEventListener('pointerleave', () => {
    if (!pinned && !panel.contains(document.activeElement)) show(false);
  });
  toc.addEventListener('focusout', () => {
    queueMicrotask(() => {
      if (!toc.contains(document.activeElement) && !toc.matches(':hover')) dismiss();
    });
  });
  close.addEventListener('click', () => dismiss(true));
  document.addEventListener('pointerdown', event => {
    if (!toc.contains(event.target)) dismiss();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      dismiss(true);
    }
  });
  entries.forEach(entry => entry.link.addEventListener('click', () => {
    dismiss();
    entry.heading.setAttribute('tabindex', '-1');
    entry.heading.focus({ preventScroll: true });
  }));

  function update() {
    frame = 0;
    const offset = parseFloat(getComputedStyle(article).getPropertyValue('--article-anchor-offset')) || 128;
    const rect = body.getBoundingClientRect();
    const visible = rect.top < innerHeight * .8 && rect.bottom > offset;
    toc.hidden = !visible;
    if (!visible) dismiss();
    let current = entries[0];
    for (const entry of entries) {
      if (entry.heading.getBoundingClientRect().top > offset + 2) break;
      current = entry;
    }
    if (active === current) return;
    active = current;
    entries.forEach(entry => {
      const selected = entry === active;
      entry.mark.classList.toggle('is-active', selected);
      if (selected) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    });
    keepCurrentVisible();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  window.addEventListener('hashchange', schedule);
  desktop.addEventListener('change', () => { dismiss(); schedule(); });
  document.fonts.ready.then(schedule);
  new ResizeObserver(schedule).observe(body);
  update();
}
