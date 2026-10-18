export function setupArticleBackToTop() {
  const article = document.querySelector('.imported-post:not(.blacksite-page)');
  if (!article) return;

  const button = document.createElement('button');
  button.className = 'article-back-to-top';
  button.type = 'button';
  button.setAttribute('aria-label', 'Back to top');
  button.setAttribute('aria-hidden', 'true');
  button.title = 'Back to top';
  button.tabIndex = -1;
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 14 6-6 6 6"/></svg>';
  document.body.append(button);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let visible = false;
  function update() {
    frame = 0;
    const next = window.scrollY > Math.max(640, innerHeight * .85);
    if (next === visible) return;
    visible = next;
    button.classList.toggle('is-visible', visible);
    button.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  button.addEventListener('click', () => {
    const heading = article.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  update();
}
