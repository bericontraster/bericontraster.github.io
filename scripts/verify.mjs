import fs from 'node:fs';
import path from 'node:path';
import { loadSiteContent } from './content.mjs';
import { localPageUrl, pageMetadata, sitemapPages } from './seo.mjs';

const {pages} = loadSiteContent({includeDrafts: process.argv.includes('--drafts')});
const settings = JSON.parse(fs.readFileSync('content/settings.json', 'utf8'));
const origin = new URL(settings.siteUrl).origin;
const failures = [];
let checks = 0;
function check(condition, message) {
  checks++;
  if (!condition) failures.push(message);
}
function exists(target) {
  const file = path.join('dist', decodeURIComponent(target));
  return fs.existsSync(file) && (fs.statSync(file).isFile() || fs.existsSync(path.join(file, 'index.html')));
}
function inspectLinks(html, route) {
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"\s]*)"/g)) {
    const target = href.replaceAll('&amp;', '&').split(/[?#]/)[0];
    if (target) check(exists(target), route + ': missing ' + target);
  }
}
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const expectedSitemap = new Set(sitemapPages(pages, origin).map(page => localPageUrl(page, origin)));
const titles = new Set();
const descriptions = new Set();
for (const page of pages) {
  const file = path.join('dist', page.route, 'index.html');
  check(fs.existsSync(file), page.route + ': page was not built');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  check(!/<!--(?:COMPONENT|HEADER|CONTENT|FOOTER|POST-CARDS|PROJECT-CARDS)|{{displayName}}/.test(html), page.route + ': unresolved component');
  inspectLinks(html, page.route);
  check(!/<script[^>]+src="https?:/.test(html), page.route + ': unexpected third-party runtime script');
  for (const [, id] of html.matchAll(/<use[^>]+href="#([^" ]+)"/g)) {
    check(html.includes('id="' + id + '"'), page.route + ': missing SVG definition ' + id);
  }
  const localUrl = localPageUrl(page, origin);
  const metadata = pageMetadata(page, settings);
  const canonical = metadata.canonical;
  check(html.includes('rel="canonical" href="' + canonical + '"'), page.route + ': incorrect canonical URL');
  check(sitemap.includes('<loc>' + localUrl + '</loc>') === expectedSitemap.has(localUrl), page.route + ': incorrect sitemap inclusion');
  check((html.match(/<title>/g) || []).length === 1, page.route + ': must have exactly one browser title');
  check((html.match(/<meta name="description" /g) || []).length === 1, page.route + ': must have exactly one meta description');
  check((html.match(/<link rel="canonical" /g) || []).length === 1, page.route + ': must have exactly one canonical');
  check(!titles.has(metadata.title), page.route + ': duplicate title'); titles.add(metadata.title);
  check(!descriptions.has(metadata.description), page.route + ': duplicate description'); descriptions.add(metadata.description);
  check(Boolean(metadata.description?.trim()), page.route + ': missing description');
  check(html.includes('name="twitter:card"') && html.includes('property="og:image"'), page.route + ': missing social preview');
  if (metadata.image.startsWith(origin + '/')) check(exists(new URL(metadata.image).pathname), page.route + ': missing social image');
  check(!/templyo|mejed@|builder based in Syria|software engineer and Framer creator/i.test(html), page.route + ': leftover template copy');
  check((html.match(/<h1\b/g) || []).length === 1, page.route + ': must have one main heading');
  check((html.match(/<meta name="robots" /g) || []).length === 1, page.route + ': duplicate or missing robots metadata');
  let schemas = [];
  try {
    schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match => { const schema = JSON.parse(match[1]); return schema['@graph'] || [schema]; });
    check(schemas.some(schema => ['WebPage', 'AboutPage', 'CollectionPage'].includes(schema['@type'])), page.route + ': missing page structured data');
  } catch { check(false, page.route + ': invalid structured data'); }
  if (page.entry) {
    check(schemas.some(schema => schema.headline === page.entry.title), page.route + ': incorrect content structured data');
    check(html.includes('name="robots" content="noindex,nofollow"') === page.entry.draft, page.route + ': incorrect draft indexing');
  }
  if (page.route === '/') check(schemas.some(schema => schema['@type'] === 'WebSite' && schema.name === settings.displayName), 'Homepage must declare the site name');
  check(html.includes('name="google-site-verification" content="' + settings.googleSiteVerification + '"'), page.route + ': missing Google verification');
  check(html.includes('data-measurement-id="' + settings.googleAnalyticsId + '"'), page.route + ': missing analytics configuration');
  if (page.slug.startsWith('blog--')) {
    check(/^\/posts\/[^/]+\/$/.test(page.route), page.route + ': articles must use /posts/<slug>/');
    const oldRoute = '/blog/' + page.route.split('/').filter(Boolean).at(-1);
    const alias = path.join('dist', oldRoute, 'index.html');
    check(fs.existsSync(alias), oldRoute + ': missing compatibility page');
    if (fs.existsSync(alias)) {
      const redirect = fs.readFileSync(alias, 'utf8');
      check(redirect.includes('url=' + page.route), oldRoute + ': incorrect alias target');
      check(redirect.includes('noindex,follow'), oldRoute + ': alias should not be indexed');
      inspectLinks(redirect, oldRoute);
    }
  }
}
check(fs.readFileSync('dist/CNAME', 'utf8').trim() === new URL(origin).hostname, 'CNAME does not match the production domain');
check(fs.existsSync('dist/.nojekyll'), 'Missing .nojekyll');
check(fs.existsSync('dist/404.html'), 'Missing custom 404 page');
check(fs.readFileSync('dist/robots.txt', 'utf8').includes('Sitemap: ' + origin + '/sitemap.xml'), 'robots.txt must reference the production sitemap');
check(!/Disallow:\s*\/\s*(?:\r?\n|$)/m.test(fs.readFileSync('dist/robots.txt', 'utf8')), 'robots.txt blocks indexing');
check(fs.existsSync('dist/sw.min.js'), 'Missing replacement for the old service worker');

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'));
check(sitemapUrls.length === new Set(sitemapUrls).size, 'Sitemap contains duplicate URLs');
check(sitemapUrls.length === expectedSitemap.size, 'Sitemap contains missing or unexpected URLs');
for (const url of sitemapUrls) {
  const parsed = new URL(url.replaceAll('&amp;', '&'));
  check(parsed.origin === origin && exists(parsed.pathname), 'Sitemap URL does not resolve: ' + url);
  check(expectedSitemap.has(url) && !parsed.search && !parsed.hash, 'Noncanonical, draft, taxonomy, or unexpected URL in sitemap: ' + url);
}
function inspectOutput(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    check(!entry.isSymbolicLink(), 'Published output contains a symlink: ' + file);
    check(!/^(?:\.env(?:\..*)?|\.git|\.browser|\.openai|node_modules|private|secrets|credentials\.json)$|\.(?:pem|key|pfx|p12|keystore|bak|backup)$/i.test(entry.name), 'Private file in published output: ' + file);
    if (entry.isDirectory()) inspectOutput(file);
  }
}
inspectOutput('dist');

const legacy = JSON.parse(fs.readFileSync('content/legacy-posts.json', 'utf8'));
const pending = legacy.posts.filter(post => !exists(post.route));
console.log(`Legacy posts: ${legacy.posts.length - pending.length}/${legacy.posts.length} copied; ${pending.length} original URLs pending content.`);
if (process.argv.includes('--require-legacy-posts')) {
  for (const post of legacy.posts) {
    check(exists(post.route), 'Legacy post not yet copied: ' + post.route);
    if (exists(post.route)) {
      const html = fs.readFileSync(path.join('dist', post.route, 'index.html'), 'utf8');
      const expected = origin + post.route;
      const links = [...html.matchAll(/<link\b[^>]*>/g)].map(match => match[0]);
      check(links.some(link => /rel=["']canonical["']/.test(link) && link.includes(expected)), post.route + ': original canonical must be preserved');
      check(!/noindex|http-equiv=["']refresh/i.test(html), post.route + ': must serve an indexable article, not a redirect or placeholder');
    }
  }
}
if (failures.length) {
  console.error([...new Set(failures)].join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${pages.length} pages and ${checks} route, asset, SEO, and deployment checks.`);
  if (pending.length) console.log('Post migration is intentionally deferred. Those original URLs will return 404 until their articles are copied.');
}
