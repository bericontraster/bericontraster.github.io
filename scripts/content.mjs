import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import { parseDocument } from 'yaml';
import { renderArticleShare } from './article-share.mjs';

export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugify = text => text.normalize('NFKD').toLowerCase().replaceAll('&', ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
const dateLabel = value => value ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z')) : '';

function fail(file, message) { throw new Error(`${file}: ${message}`); }
function validDate(value, file, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) fail(file, `${field} must be a real date in YYYY-MM-DD format`);
}
function imageUrl(value, root, file) {
  if (typeof value !== 'string') fail(file, 'image paths must be strings');
  if (/^https:\/\//.test(value)) {
    try { new URL(value); return value; }
    catch { fail(file, `invalid image URL: ${value}`); }
  }
  if (!value.startsWith('/assets/')) fail(file, `use /assets/... or an https:// URL for image ${value}`);
  const target = path.resolve(root, 'public', '.' + decodeURIComponent(value.split(/[?#]/)[0]));
  const publicRoot = path.resolve(root, 'public');
  if (!target.startsWith(publicRoot + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) fail(file, `image not found: ${value} (put the file inside public/assets/)`);
  return value;
}
function webUrl(value, file, field) {
  if (value === undefined) return '';
  try { if (new URL(value).protocol === 'https:') return value; } catch {}
  fail(file, `${field} must be an https:// URL`);
}

export function renderMarkdown(body, { root = process.cwd(), file = 'Markdown', labSections = [] } = {}) {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
  const originalFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, index, options, env, renderer) => {
    const language = tokens[index].info.trim().split(/\s+/)[0];
    const labels = { c: 'C', bash: 'Bash', sh: 'Bash', shell: 'Bash', http: 'HTTP', 'shell-session': 'Terminal' };
    const block = originalFence(tokens, index, options, env, renderer);
    return language ? block.replace('<pre>', () => `<pre data-language="${escapeHtml(labels[language] || language)}">`) : block;
  };
  const headingIds = new Set(['hero-section', 'article-section']);
  // Recognize a warning marker only at the start of a blockquote.
  md.core.ruler.after('inline', 'warning-callouts', state => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type !== 'blockquote_open' || state.tokens[i + 1]?.type !== 'paragraph_open') continue;
      const inline = state.tokens[i + 2];
      const first = inline?.children?.[0];
      if (inline?.type !== 'inline' || first?.type !== 'text' || first.content !== '[!WARNING]') continue;
      token.attrJoin('class', 'content-callout content-callout-warning');
      inline.children.shift();
      if (inline.children[0]?.type === 'softbreak') inline.children.shift();
      if (!inline.children.length) state.tokens.splice(i + 1, 3);
    }
  });
  const headings = [];
  md.renderer.rules.heading_open = (tokens, index) => {
    const inline = tokens[index + 1];
    const label = (inline.children || []).map(token => token.content).join('');
    const base = slugify(label);
    let id = base;
    for (let suffix = 2; headingIds.has(id); suffix++) id = `${base}-${suffix}`;
    headingIds.add(id);
    headings.push({ id, label, level: Number(tokens[index].tag.slice(1)) });
    return `<${tokens[index].tag} id="${id}">`;
  };
  const originalImage = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    imageUrl(token.attrGet('src'), root, file);
    token.attrSet('loading', 'lazy');
    token.attrSet('decoding', 'async');
    return originalImage(tokens, index, options, env, renderer);
  };
  let html = md.render(body);
  // Split adjacent images into figures, including legacy italic captions.
  html = html.replace(/<p>([\s\S]*?)<\/p>/g, (paragraph, contents) => {
    if (!/^(?:\s|<img\b[^>]*>|<em>[\s\S]*?<\/em>|<br\s*\/?>)*$/.test(contents) || !contents.includes('<img')) return paragraph;
    return contents.replace(/(<img\b[^>]*>)(?:\s*(?:<br\s*\/?>\s*)?<em>([\s\S]*?)<\/em>)?/g, (_, image, legacyCaption) => {
      const caption = legacyCaption || image.match(/\btitle="([^"]*)"/)?.[1];
      return `<figure>${image}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
    });
  });
  html = html.replace(/<\/figure>\s*<p><em>([\s\S]*?)<\/em><\/p>/g, (match, caption) => `<figcaption>${caption}</figcaption></figure>`);
  if (labSections.length) {
    const found = new Set();
    html = html.split(/(?=<h2\b)/).map(section => {
      const heading = section.match(/^<h2 id="([^"]+)">/);
      if (!heading || !labSections.some(label => slugify(label) === heading[1])) return section;
      const artwork = section.match(/<figure>(<img\b[^>]*>)(?:<figcaption>[\s\S]*?<\/figcaption>)?<\/figure>/);
      if (!artwork) fail(file, `lab section ${heading[1]} needs a Markdown image on its own line`);
      found.add(heading[1]);
      const details = section.replace(artwork[0], '').replace(` id="${heading[1]}"`, '');
      return `<section class="blacksite-lab" id="${heading[1]}"><div class="blacksite-lab-art">${artwork[1]}</div><div class="blacksite-lab-details">${details}</div></section>`;
    }).join('');
    for (const label of labSections) if (!found.has(slugify(label))) fail(file, `labSections names a missing ## heading: ${label}`);
  }
  return { html, headings };
}

export function parseContent(source, { kind, file, root = process.cwd(), includeDrafts = false } = {}) {
  source = source.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
  const front = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!front) fail(file, 'start the file with YAML metadata between two --- lines');
  const document = parseDocument(front[1], { uniqueKeys: true });
  if (document.errors.length) fail(file, document.errors[0].message);
  const data = document.toJS({ maxAliasCount: 50 });
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail(file, 'metadata must be a mapping');
  for (const field of ['draft', 'featured', 'showCover']) if (data[field] !== undefined && typeof data[field] !== 'boolean') fail(file, `${field} must be true or false, without quotes`);
  if (data.draft && !includeDrafts) return null;
  for (const field of ['title', 'description']) if (typeof data[field] !== 'string' || !data[field].trim()) fail(file, `${field} is required`);
  for (const field of ['slug', 'excerpt', 'author', 'category', 'cta', 'coverAlt', 'coverCaption']) if (data[field] !== undefined && (typeof data[field] !== 'string' || !data[field].trim())) fail(file, `${field} must be nonempty text`);
  const slug = data.slug || path.basename(file, '.md');
  if (!slugPattern.test(slug)) fail(file, 'slug must contain lowercase words separated by hyphens');
  if (kind === 'post' && !data.date) fail(file, 'date is required for posts');
  for (const field of ['date', 'updated']) if (data[field] !== undefined) validDate(data[field], file, field);
  for (const field of ['tags', 'labSections', 'jumpLinks']) if (data[field] !== undefined && (!Array.isArray(data[field]) || data[field].some(item => typeof item !== 'string' || !item.trim()))) fail(file, `${field} must be a list of text values`);
  const route = data.permalink || `/${kind === 'post' ? 'posts' : 'work'}/${slug}/`;
  if (typeof route !== 'string' || !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+$/.test(route)) fail(file, 'permalink must be a local path with a trailing slash, such as /blacksite/');
  if (kind === 'post' && route !== `/posts/${slug}/`) fail(file, 'posts use /posts/<slug>/; choose the slug to set the URL');
  const cover = data.cover ? imageUrl(data.cover, root, file) : '';
  const cardImages = data.cardImages || (cover ? [cover] : []);
  if (!Array.isArray(cardImages) || cardImages.some(value => typeof value !== 'string')) fail(file, 'cardImages must be a list of image paths');
  cardImages.forEach(value => imageUrl(value, root, file));
  const seo = data.seo || {};
  if (!seo || typeof seo !== 'object' || Array.isArray(seo)) fail(file, 'seo must be a mapping');
  for (const field of ['title', 'description', 'image', 'canonical']) if (seo[field] !== undefined && (typeof seo[field] !== 'string' || !seo[field].trim())) fail(file, `seo.${field} must be nonempty text`);
  const body = source.slice(front[0].length).trim();
  if (!body) fail(file, 'add Markdown content below the metadata');
  const rendered = renderMarkdown(body, { root, file, labSections: data.labSections || [] });
  const words = body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').match(/\S+/g)?.length || 0;
  return {
    kind, file, slug, route, title: data.title.trim(), description: data.description.trim(),
    excerpt: data.excerpt || data.description.trim(), date: data.date || '', updated: data.updated || data.date || '',
    author: data.author || 'Beri Contraster', tags: data.tags || [], draft: data.draft === true,
    featured: data.featured !== false, cover, coverAlt: data.coverAlt || data.title, coverCaption: data.coverCaption || '',
    cardImages, category: data.category || '', cta: data.cta || 'View project', showCover: data.showCover !== false,
    labSections: data.labSections || [], jumpLinks: data.jumpLinks || [],
    seo: { title: seo.title || data.title, description: seo.description || data.description, image: seo.image ? imageUrl(seo.image, root, file) : cover, canonical: webUrl(seo.canonical, file, 'seo.canonical') },
    sourceUrl: webUrl(data.sourceUrl, file, 'sourceUrl'), readingMinutes: Math.max(1, Math.ceil(words / 220)),
    html: rendered.html, headings: rendered.headings,
  };
}

export function loadSiteContent({ root = process.cwd(), includeDrafts = false } = {}) {
  const pages = JSON.parse(fs.readFileSync(path.join(root, 'src/pages.json'), 'utf8'));
  const entries = [];
  for (const [folder, kind] of [['posts', 'post'], ['projects', 'project']]) {
    const dir = path.join(root, 'content', folder);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      if (!name.endsWith('.md') || name.startsWith('_')) continue;
      const file = path.join(dir, name);
      const entry = parseContent(fs.readFileSync(file, 'utf8'), { kind, file, root, includeDrafts });
      if (entry) entries.push(entry);
    }
  }
  entries.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const routes = new Set(pages.map(page => page.route === '/' ? '/' : page.route.replace(/\/$/, '') + '/'));
  for (const entry of entries) {
    if (routes.has(entry.route)) fail(entry.file, `duplicate or reserved URL: ${entry.route}`);
    routes.add(entry.route);
    pages.push({ route: entry.route, slug: `${entry.kind === 'post' ? 'blog' : 'project'}--${entry.slug}`, title: entry.seo.title, description: entry.seo.description, entry });
  }
  for (const entry of entries.filter(item => item.kind === 'post')) {
    const alias = `/blog/${entry.slug}/`;
    if (routes.has(alias)) fail(entry.file, `URL conflicts with the article alias ${alias}`);
    routes.add(alias);
  }
  return { pages, entries, posts: entries.filter(entry => entry.kind === 'post'), projects: entries.filter(entry => entry.kind === 'project') };
}

const tagList = tags => tags.length ? `<ul class="content-tags" aria-label="Tags">${tags.map(tag => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>` : '';

export function renderContentPage(entry, { shareUrl = '', posts = [] } = {}) {
  const project = entry.kind === 'project';
  const date = entry.date ? `<time datetime="${entry.date}">${dateLabel(entry.date)}</time>` : '';
  const meta = project ? (date ? `<p class="post-meta">${date}</p>` : '') : `<p class="post-meta">${escapeHtml(entry.author)} · ${date} · ${entry.readingMinutes} min read</p>`;
  const metaRow = project ? meta : `<div class="post-meta-row">${meta}${shareUrl ? renderArticleShare(entry.title, shareUrl) : ''}</div>`;
  const source = entry.sourceUrl ? `<p class="post-source">Originally published on <a href="${escapeHtml(entry.sourceUrl)}">${new URL(entry.sourceUrl).hostname === 'medium.com' ? 'Medium' : 'the original site'}</a>.</p>` : '';
  const jumps = entry.jumpLinks.map(id => {
    const heading = entry.headings.find(item => item.id === id);
    if (!heading) fail(entry.file, `jumpLinks names a missing heading: ${id}`);
    return `<a href="#${id}">${escapeHtml(heading.label)}</a>`;
  }).join('');
  const cover = entry.cover && entry.showCover ? `<figure><img src="${escapeHtml(entry.cover)}" alt="${escapeHtml(entry.coverAlt)}" decoding="async" fetchpriority="high">${entry.coverCaption ? `<figcaption>${escapeHtml(entry.coverCaption)}</figcaption>` : ''}</figure>` : '';
  const tags = new Set(entry.tags.map(tag => tag.toLowerCase()));
  const related = project ? [] : posts.filter(post => post.route !== entry.route && !post.draft)
    .map(post => ({ post, score: new Set(post.tags.map(tag => tag.toLowerCase()).filter(tag => tags.has(tag))).size }))
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date) || a.post.slug.localeCompare(b.post.slug))
    .slice(0, 3).map(item => item.post);
  const recommendations = related.length ? `<section class="related-posts" aria-labelledby="related-posts-title"><header><h2 id="related-posts-title">More to Explore</h2><a href="/blog/">Browse all articles <span aria-hidden="true">↗</span></a></header><div class="related-posts-grid">${related.map(renderPostCard).join('')}</div></section>` : '';
  return `<main class="imported-post${project ? ' blacksite-page' : ''}" id="${project ? 'hero-section' : 'article-section'}">
${entry.draft ? '<p class="content-draft">Draft preview — excluded from the production build</p>' : ''}
<header>${project && entry.category ? `<p class="blacksite-eyebrow">${escapeHtml(entry.category)}</p>` : ''}<h1>${escapeHtml(entry.title)}</h1>${project ? `<p class="blacksite-intro">${escapeHtml(entry.description)}</p>` : ''}${metaRow}${source}${tagList(entry.tags)}${jumps ? `<nav class="blacksite-jump" aria-label="Project sections">${jumps}</nav>` : ''}</header>
<div class="post-body">${cover}${entry.html}</div>${recommendations}</main>`;
}

export function renderPostCard(entry) {
  return `<a class="featured-blog-card" href="${entry.route}">${entry.cover ? `<img src="${escapeHtml(entry.cover)}" alt="${escapeHtml(entry.coverAlt)}" loading="lazy" decoding="async">` : ''}<div><p class="post-meta">${dateLabel(entry.date)} · ${entry.readingMinutes} min read${entry.draft ? ' · Draft' : ''}</p><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.excerpt)}</p></div></a>`;
}
export function renderProjectCard(entry) {
  return `<a class="blacksite-project-card" href="${entry.route}">${entry.cardImages.length ? `<div class="blacksite-project-art${entry.cardImages.length === 1 ? ' is-single' : ''}">${entry.cardImages.slice(0, 2).map((src, index) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(index === 0 ? entry.coverAlt : entry.title + ' artwork')}" loading="lazy" decoding="async">`).join('')}</div>` : ''}<div class="blacksite-project-copy">${entry.category ? `<p class="blacksite-eyebrow">${escapeHtml(entry.category)}${entry.draft ? ' · Draft' : ''}</p>` : ''}<h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.excerpt)}</p><span class="blacksite-project-link">${escapeHtml(entry.cta)} <span aria-hidden="true">↗</span></span></div></a>`;
}

export function renderContentSeo(entry, siteUrl, displayName, { includeSocial = true, includeRobots = true, publisherName = displayName } = {}) {
  const canonical = entry.seo.canonical || siteUrl + entry.route;
  const image = entry.seo.image ? new URL(entry.seo.image, siteUrl).href : '';
  const ownerAuthor = [displayName, publisherName, 'Beri Contraster'].includes(entry.author);
  const record = {
    '@context': 'https://schema.org', '@type': entry.kind === 'post' ? 'BlogPosting' : 'CreativeWork', '@id': canonical + (entry.kind === 'post' ? '#article' : '#project'),
    headline: entry.title, name: entry.title, description: entry.seo.description, url: canonical,
    mainEntityOfPage: canonical, author: ownerAuthor ? { '@type': 'Person', '@id': siteUrl + '/#person', name: publisherName, alternateName: entry.author, url: siteUrl + '/about/' } : { '@type': 'Person', name: entry.author },
    publisher: { '@type': 'Person', '@id': siteUrl + '/#person', name: publisherName, url: siteUrl + '/about/' },
    ...(image ? { image } : {}), ...(entry.date ? { datePublished: entry.date, dateModified: entry.updated } : {}),
    ...(entry.tags.length ? { keywords: entry.tags.join(', ') } : {}),
  };
  const social = includeSocial ? `${image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:alt" content="${escapeHtml(entry.coverAlt)}"><meta name="twitter:image" content="${escapeHtml(image)}">` : ''}<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}"><meta name="twitter:title" content="${escapeHtml(entry.seo.title)}"><meta name="twitter:description" content="${escapeHtml(entry.seo.description)}">` : '';
  const article = entry.kind === 'post' ? entry.tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join('') + `<meta property="article:published_time" content="${entry.date}"><meta property="article:modified_time" content="${entry.updated}">` : '';
  const robots = includeRobots && entry.draft ? '<meta name="robots" content="noindex,nofollow">' : '';
  return social + article + robots + `<script type="application/ld+json">${JSON.stringify(record).replaceAll('<', '\\u003c')}</script>`;
}
