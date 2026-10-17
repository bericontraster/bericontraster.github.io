import { setupFooterHands } from './footer-hands.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function rollingLabel(text) {
  const label = document.createElement('span');
  label.className = 'rolling-label';
  label.setAttribute('aria-hidden', 'true');
  [...text].forEach((letter, index) => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.style.setProperty('--letter-index', index);
    label.append(span);
  });
  return label;
}

function setupNavigation() {
  const links = [...document.querySelectorAll('.portfolio-nav-link')];
  links.forEach(link => {
    const label = link.textContent.trim();
    link.setAttribute('aria-label', label);
    link.replaceChildren(rollingLabel(label));
  });
  function updateSection() {
    links.forEach(link => {
      const target = new URL(link.href);
      if (!target.hash) return;
      if (target.pathname === location.pathname && target.hash === location.hash) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
  updateSection();
  window.addEventListener('hashchange', updateSection);
}

function setupFooter(settings) {
  const footers = document.querySelectorAll('footer');
  const measure = document.createElement('canvas').getContext('2d');
  function fitWordmarks() {
    footers.forEach(footer => {
      const word = footer.querySelector('[data-brand-wordmark]');
      const label = word?.querySelector('p');
      if (!label || !measure) return;
      const style = getComputedStyle(label);
      measure.font = `${style.fontWeight} 100px ${style.fontFamily}`;
      const tracking = parseFloat(style.letterSpacing) / parseFloat(style.fontSize) || 0;
      const width = measure.measureText(label.textContent).width + Math.max(0, label.textContent.length - 1) * tracking * 100;
      const size = Math.min(416.95, 1180 / Math.max(1, width) * 100);
      label.style.setProperty('--framer-font-size', size + 'px');
      word.setAttribute('viewBox', `0 0 1200 ${size * .9}`);
      footer.style.paddingBottom = Math.ceil(word.getBoundingClientRect().height + 64) + 'px';
    });
  }
  const layout = () => {
    const variant = innerWidth >= 1280 ? '788ly6' : innerWidth >= 810 ? '1w2xgsd' : '1s9g854';
    footers.forEach(footer => {
      footer.classList.remove('framer-v-788ly6', 'framer-v-1w2xgsd', 'framer-v-1s9g854');
      footer.classList.add('framer-v-' + variant);
    });
    fitWordmarks();
  };
  layout();
  document.fonts.ready.then(fitWordmarks);
  window.addEventListener('resize', layout, { passive: true });
  footers.forEach(footer => footer.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.href = 'mailto:' + settings.contactEmail;
    link.textContent = settings.contactEmail;
  }));
}

function setupScrollMotion(settings) {
  const group = document.querySelector('[data-framer-name="Hero & Bio Sections"]');
  const avatar = group?.querySelector('[data-framer-name="Avatar Wrap"]');
  const front = avatar?.querySelector('[data-framer-name="Avatar - Front"]');
  const back = avatar?.querySelector('[data-framer-name="Avatar - Back"]');
  const quoteSection = document.querySelector('[data-framer-name="Quote Section"]');
  const quoteSticky = quoteSection?.querySelector('[data-framer-name="Content"]');
  const quoteParent = quoteSection?.querySelector('span')?.parentElement;
  if (quoteParent && settings.quote) {
    const style = quoteParent.firstElementChild.getAttribute('style');
    quoteParent.replaceChildren(...settings.quote.split(/\s+/).map(word => {
      const span = document.createElement('span');
      span.textContent = word;
      span.setAttribute('style', style);
      return span;
    }));
  }
  const words = [...(quoteParent?.children || [])];
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;
  let progress = group ? clamp(-group.getBoundingClientRect().top / innerHeight) : 0;
  let previousTime = 0;
  let resetMotion = true;
  let portraitsReady = false;
  let lastAnimated = false;
  const portraitImages = [...(avatar?.querySelectorAll('img') || [])];
  portraitImages.forEach(image => { image.loading = 'eager'; });
  Promise.all(portraitImages.map(image => image.decode())).then(() => {
    portraitsReady = true;
    resetMotion = true;
    schedule();
  }).catch(() => { /* Keep the front portrait static if either image fails. */ });
  function paint(time = performance.now()) {
    frame = 0;
    const target = group ? clamp(-group.getBoundingClientRect().top / innerHeight) : 0;
    const animated = portraitsReady && innerWidth >= 1280 && !reducedMotion.matches;
    const delta = previousTime ? Math.min(64, Math.max(0, time - previousTime)) : 1000 / 60;
    previousTime = time;
    if (resetMotion || animated !== lastAnimated) progress = target;
    else if (animated) progress += (target - progress) * (1 - Math.exp(-delta / 95));
    resetMotion = false;
    lastAnimated = animated;
    if (Math.abs(target - progress) < .0005 && animated) progress = target;
    if (front && back) {
      const desktop = innerWidth >= 1280;
      const scale = desktop && !reducedMotion.matches ? .5 + (animated ? progress * .5 : 0) : 1;
      const y = desktop && !reducedMotion.matches ? avatar.offsetHeight * .25 * (animated ? 1 - progress : 1) : 0;
      const angle = animated ? progress * 180 : 0;
      avatar.style.transform = `translate3d(0, ${y}px, 0) scale(${scale}) rotateY(${angle}deg)`;
      front.style.transform = 'rotateY(0deg)';
      back.style.transform = 'rotateY(-180deg)';
      back.style.visibility = animated ? 'visible' : 'hidden';
    }
    if (quoteSection && words.length) {
      const rect = quoteParent.getBoundingClientRect();
      // Start at the text's first line, rather than at the oversized section.
      const start = innerHeight * .85;
      const end = innerHeight * .35;
      // The text stays centered while its sticky container continues scrolling.
      const pinnedTravel = quoteSticky ? Math.max(0, quoteSticky.getBoundingClientRect().top - quoteSticky.parentElement.getBoundingClientRect().top) : 0;
      const reveal = reducedMotion.matches ? 1 : clamp((start - rect.top + pinnedTravel) / (start - end));
      words.forEach((word, index) => {
        const color = index / words.length < reveal ? 'var(--quote-active)' : 'var(--quote-inactive)';
        if (word.dataset.revealed !== color) {
          word.style.color = color;
          word.dataset.revealed = color;
        }
      });
    }
    if (animated && Math.abs(target - progress) >= .0005) schedule();
    else previousTime = 0;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  paint();
  window.addEventListener('scroll', schedule, { passive: true });
  function reset() { resetMotion = true; previousTime = 0; schedule(); }
  window.addEventListener('resize', reset, { passive: true });
  window.addEventListener('pageshow', reset);
  window.addEventListener('load', reset, { once: true });
  document.addEventListener('visibilitychange', reset);
  reducedMotion.addEventListener('change', reset);
}

function setupForms(settings) {
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input[aria-hidden="true"]').forEach(input => input.remove());
    form.querySelectorAll('textarea').forEach(input => input.name = 'Project');
    form.removeAttribute('action');
    const newsletter = form.querySelectorAll('input:not([type="hidden"])').length === 1;
    const endpoint = newsletter ? settings.newsletterEndpoint : settings.contactEndpoint;
    const feedback = document.createElement('p');
    feedback.className = 'form-feedback';
    feedback.setAttribute('role', 'status');
    form.after(feedback);
    form.querySelectorAll('input[type="email"]').forEach(input => input.required = true);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form));
      if (!endpoint) {
        if (newsletter) {
          feedback.textContent = 'Newsletter signup is not connected yet.';
          return;
        }
        const body = Object.entries(data).filter(([key]) => !key.startsWith('_')).map(([key, value]) => key + ': ' + value).join('\n');
        window.location.href = 'mailto:' + settings.contactEmail + '?subject=' + encodeURIComponent('Portfolio project enquiry') + '&body=' + encodeURIComponent(body);
        feedback.textContent = 'Your email app will open with your enquiry. Send it there to complete your message.';
        return;
      }
      form.classList.add('portfolio-form-busy');
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!response.ok) throw new Error('Submission failed');
        feedback.textContent = newsletter ? 'You are subscribed.' : 'Thank you. Your enquiry has been sent.';
        form.reset();
      } catch {
        feedback.textContent = 'Could not send. Please try again or email ' + settings.contactEmail;
      } finally {
        form.classList.remove('portfolio-form-busy');
      }
    });
  });
}

async function setup() {
  const settings = await fetch('/assets/settings.json').then(response => response.json());
  setupNavigation();
  setupFooter(settings);
  setupFooterHands(settings.footerHands);
  setupScrollMotion(settings);
  setupForms(settings);
}

setup().catch(console.error);
