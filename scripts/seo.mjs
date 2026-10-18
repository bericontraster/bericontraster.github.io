import { escapeHtml, renderContentSeo } from './content.mjs';

export const canonicalRoute = route => route === '/' ? '/' : route.replace(/\/$/, '') + '/';
export const localPageUrl = (page, origin) => new URL(canonicalRoute(page.route), origin).href;
export const canonicalPageUrl = (page, origin) => page.entry?.seo.canonical || localPageUrl(page, origin);
const taxonomy = /^\/(?:tags?|categories|category|archives?|search|feeds?|assets|norobots|404)(?:\/|$)/i;

export function sitemapPages(pages, origin) {
  return pages.filter(page => !page.entry?.draft && !page.noindex && page.sitemap !== false && !taxonomy.test(page.route) && canonicalPageUrl(page, origin) === localPageUrl(page, origin));
}

export function pageMetadata(page, settings) {
  const origin = new URL(settings.siteUrl).origin;
  const brand = settings.seo?.titleBrand || settings.displayName;
  const rawTitle = page.entry?.seo.title || page.title;
  const title = page.route === '/' ? brand : `${rawTitle} | ${brand}`;
  const description = page.route === '/' ? (settings.seo?.description || page.description) : page.description;
  const image = page.entry?.seo.image || settings.seo?.defaultImage || '';
  return { title, description, canonical: canonicalPageUrl(page, origin), image: image ? new URL(image, origin).href : '', imageAlt: page.entry?.seo.image ? page.entry.coverAlt : settings.seo?.defaultImageAlt || brand, noindex: Boolean(page.entry?.draft || page.noindex || taxonomy.test(page.route)) };
}

const jsonLd = data => `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;

function pageGraph(page, settings, metadata, pages) {
  const origin = new URL(settings.siteUrl).origin;
  const personId = origin + '/#person';
  const websiteId = origin + '/#website';
  const pageId = metadata.canonical + '#webpage';
  const graph = [];
  if (page.route === '/') {
    graph.push({ '@type': 'WebSite', '@id': websiteId, url: origin + '/', name: settings.displayName, alternateName: 'Beri Contraster', description: metadata.description, inLanguage: 'en', publisher: { '@id': personId } });
    graph.push({ '@type': 'Person', '@id': personId, name: settings.seo?.authorName || settings.displayName, alternateName: settings.displayName, url: origin + '/about/', jobTitle: 'Offensive Security Professional', ...(settings.seo?.sameAs?.length ? { sameAs: settings.seo.sameAs } : {}) });
  }
  const type = page.slug === 'about' ? 'AboutPage' : ['blog', 'work'].includes(page.slug) ? 'CollectionPage' : 'WebPage';
  const webpage = { '@type': type, '@id': pageId, url: metadata.canonical, name: metadata.title, description: metadata.description, inLanguage: 'en', isPartOf: { '@id': websiteId }, ...(metadata.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: metadata.image, caption: metadata.imageAlt } } : {}) };
  if (page.slug === 'about') webpage.mainEntity = { '@id': personId };
  if (['blog', 'work'].includes(page.slug)) {
    const kind = page.slug === 'blog' ? 'post' : 'project';
    const items = sitemapPages(pages, origin).filter(item => item.entry?.kind === kind);
    webpage.mainEntity = { '@type': 'ItemList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.entry.title, url: localPageUrl(item, origin) })) };
  }
  if (page.route !== '/') {
    const items = [{ name: settings.displayName, item: origin + '/' }];
    if (page.entry) items.push({ name: page.entry.kind === 'post' ? 'Blogs' : 'Projects', item: origin + (page.entry.kind === 'post' ? '/blog/' : '/work/') });
    items.push({ name: page.entry?.title || page.title, item: metadata.canonical });
    const breadcrumbId = metadata.canonical + '#breadcrumb';
    webpage.breadcrumb = { '@id': breadcrumbId };
    graph.push({ '@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) });
  }
  graph.push(webpage);
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function renderPageSeo(page, settings, pages = []) {
  const metadata = pageMetadata(page, settings);
  const origin = new URL(settings.siteUrl).origin;
  const meta = (name, content, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}">`;
  const robots = metadata.noindex ? (page.entry?.draft ? 'noindex,nofollow' : 'noindex,follow') : 'index,follow,max-image-preview:large';
  let html = `<link rel="canonical" href="${escapeHtml(metadata.canonical)}">` + meta('description', metadata.description) + meta('author', settings.seo?.authorName || settings.displayName) + meta('robots', robots);
  for (const [name, value] of Object.entries({ 'og:url': metadata.canonical, 'og:title': metadata.title, 'og:description': metadata.description, 'og:type': page.entry?.kind === 'post' ? 'article' : 'website', 'og:site_name': settings.displayName, 'og:locale': 'en_US' })) html += meta(name, value, true);
  html += meta('twitter:card', page.entry?.seo.image ? 'summary_large_image' : 'summary') + meta('twitter:title', metadata.title) + meta('twitter:description', metadata.description);
  if (settings.seo?.twitterHandle) html += meta('twitter:site', settings.seo.twitterHandle);
  if (metadata.image) html += meta('og:image', metadata.image, true) + meta('og:image:alt', metadata.imageAlt, true) + meta('twitter:image', metadata.image) + meta('twitter:image:alt', metadata.imageAlt);
  if (settings.googleSiteVerification) html += meta('google-site-verification', settings.googleSiteVerification);
  if (page.entry) html += renderContentSeo(page.entry, origin, settings.displayName, { includeSocial: false, includeRobots: false, publisherName: settings.seo?.authorName });
  return html + jsonLd(pageGraph(page, settings, metadata, pages));
}
