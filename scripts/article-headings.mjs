// Stable anchors are generated at build time so shared section links work immediately.
export function addArticleHeadingIds(html) {
  const used = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  return html.replace(/<main\b([^>]*)>([\s\S]*?)<\/main>/g, (main, attrs, contents) => {
    const start = contents.indexOf('<div class="post-body">');
    if (start < 0) return main;
    const body = contents.slice(start).replace(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/g, (heading, level, attributes, text) => {
      if (/\bid="/.test(attributes)) return heading;
      const label = text.replace(/<[^>]*>/g, '').replace(/&amp;/g, ' and ').replace(/&[^;]+;/g, ' ');
      const base = label.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
      let id = base;
      for (let suffix = 2; used.has(id); suffix++) id = `${base}-${suffix}`;
      used.add(id);
      return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
    });
    return `<main${attrs}>${contents.slice(0, start)}${body}</main>`;
  });
}
