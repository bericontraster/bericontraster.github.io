const widgetSource = 'https://assets.calendly.com/assets/external/widget.js';
let widgetPromise;

function loadCalendly() {
  if (window.Calendly?.initInlineWidget) return Promise.resolve(window.Calendly);
  if (widgetPromise) return widgetPromise;
  widgetPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = setTimeout(() => fail(), 15000);
    function fail() {
      clearTimeout(timeout);
      script.remove();
      widgetPromise = undefined;
      reject(new Error('The booking calendar could not be loaded.'));
    }
    script.src = widgetSource;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      if (window.Calendly?.initInlineWidget) resolve(window.Calendly);
      else fail();
    };
    script.onerror = fail;
    document.head.append(script);
  });
  return widgetPromise;
}

export function setupServiceBooking() {
  const link = document.querySelector('[data-booking-open]');
  const dialog = document.querySelector('.services-booking-dialog');
  const calendar = dialog?.querySelector('[data-booking-calendar]');
  const status = dialog?.querySelector('.services-booking-status');
  if (!link || !dialog || !calendar || !status || typeof dialog.showModal !== 'function') return;
  let initialized = false;
  let loading = false;
  let ready = false;
  let previousOverflow = '';
  let readyTimeout;

  link.addEventListener('click', async event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!dialog.open) {
      dialog.showModal();
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    }
    if (initialized || loading) return;
    loading = true;
    status.hidden = false;
    status.textContent = 'Loading available times…';
    calendar.setAttribute('aria-busy', 'true');
    try {
      const Calendly = await loadCalendly();
      if (!dialog.open) return;
      const url = new URL(link.href);
      url.searchParams.set('background_color', '101613');
      url.searchParams.set('text_color', 'f4f4f5');
      url.searchParams.set('primary_color', '097441');
      Calendly.initInlineWidget({ url: url.href, parentElement: calendar });
      const frame = calendar.querySelector('iframe');
      if (frame) frame.title = 'Choose a meeting time with Muhammad Zubair';
      initialized = true;
      readyTimeout = setTimeout(() => {
        if (ready) return;
        calendar.removeAttribute('aria-busy');
        status.textContent = 'Calendar taking longer than expected? Use “Open in Calendly” above to choose a time.';
      }, 15000);
    } catch {
      calendar.removeAttribute('aria-busy');
      status.textContent = 'The calendar could not load. Use “Open in Calendly” above to book your meeting.';
    } finally { loading = false; }
  });

  dialog.querySelector('[data-booking-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    link.focus({ preventScroll: true });
  });
  window.addEventListener('message', event => {
    const frame = calendar.querySelector('iframe');
    if (!frame || event.origin !== 'https://calendly.com' || event.source !== frame.contentWindow || typeof event.data?.event !== 'string') return;
    if (['calendly.profile_page_viewed', 'calendly.event_type_viewed', 'calendly.date_and_time_selected', 'calendly.event_scheduled'].includes(event.data.event)) {
      clearTimeout(readyTimeout);
      ready = true;
      calendar.removeAttribute('aria-busy');
      status.hidden = true;
    }
  });
}
