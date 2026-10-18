export function setupArticleShare() {
  document.querySelectorAll('.post-share').forEach(details => {
    const toggle = details.querySelector('summary');
    const copy = details.querySelector('.post-share-copy');
    const label = copy.querySelector('span');
    const fallback = details.querySelector('.post-share-url');
    const feedback = details.querySelector('[role="status"]');
    const url = details.dataset.shareUrl;
    let timer;

    function close() { details.open = false; }
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      label.textContent = 'Copy link';
      feedback.textContent = '';
      fallback.hidden = true;
    });
    document.addEventListener('pointerdown', event => {
      if (details.open && !details.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) {
        event.preventDefault(); close(); toggle.focus();
      }
    });
    details.addEventListener('focusout', event => {
      if (event.relatedTarget && !details.contains(event.relatedTarget)) close();
    });
    details.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    copy.addEventListener('click', async () => {
      clearTimeout(timer);
      let copied = false;
      try { await navigator.clipboard.writeText(url); copied = true; } catch {}
      if (!copied) {
        fallback.hidden = false;
        fallback.value = url;
        fallback.focus({ preventScroll: true });
        fallback.select();
        try { copied = document.execCommand('copy'); } catch {}
      }
      if (copied) {
        fallback.hidden = true;
        copy.focus({ preventScroll: true });
        label.textContent = 'Link copied';
        feedback.textContent = 'Article link copied to clipboard.';
        timer = setTimeout(() => { label.textContent = 'Copy link'; }, 2500);
      } else {
        label.textContent = 'Select link';
        feedback.textContent = 'Select and copy the article link below.';
      }
    });
  });
}
