const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const icon = (body, filled = false) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"${filled ? ' fill="currentColor"' : ' fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
const share = icon('<path d="M12 15V3m-4 4 4-4 4 4M7 10H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2"/>');
const link = icon('<path d="m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 1)"/>');
const x = icon('<path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l8.2-9.4L.8 2h6.5l5.4 7.1L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z"/>', true);
const linkedin = icon('<path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM8 19H5V9h3ZM6.5 7.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM19 19h-3v-5.2c0-1.6-.7-2.1-1.6-2.1-1 0-1.7.6-1.7 2.1V19h-3V9h2.9v1.4c.4-.8 1.4-1.7 3-1.7 2.3 0 3.4 1.4 3.4 4.1Z"/>', true);
// Threads glyph from Simple Icons (CC0): github.com/simple-icons/simple-icons.
const threads = icon('<path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z"/>', true);

export function articleShareLinks(title, url) {
  return [
    { label: 'Share on X', icon: x, href: 'https://twitter.com/intent/tweet?' + new URLSearchParams({ text: title, url }) },
    { label: 'Share on LinkedIn', icon: linkedin, href: 'https://www.linkedin.com/sharing/share-offsite/?' + new URLSearchParams({ url }) },
    { label: 'Share on Threads', icon: threads, href: 'https://www.threads.com/intent/post?' + new URLSearchParams({ text: title + '\n' + url }) },
  ];
}

export function renderArticleShare(title, url) {
  return `<details class="post-share" data-share-url="${escapeHtml(url)}"><summary class="post-share-toggle" aria-label="Share article" title="Share article">${share}</summary><div class="post-share-menu"><button type="button" class="post-share-copy">${link}<span>Copy link</span></button><div class="post-share-divider"></div>${articleShareLinks(title, url).map(item => `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${item.icon}<span>${item.label}</span></a>`).join('')}<input class="post-share-url" type="url" readonly aria-label="Article link to copy" hidden><span class="post-share-feedback" role="status" aria-live="polite"></span></div></details>`;
}
