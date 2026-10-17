import fs from 'node:fs';
import path from 'node:path';

const pages = JSON.parse(fs.readFileSync('src/pages.json', 'utf8'));
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
for (const page of pages) {
  const file = path.join('dist', page.route, 'index.html');
  check(fs.existsSync(file), page.route + ': page was not built');
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  check(!/<!--(?:COMPONENT|HEADER)|{{displayName}}/.test(html), page.route + ': unresolved component');
  inspectLinks(html, page.route);
  check(!/<script[^>]+src="https?:/.test(html), page.route + ': unexpected third-party runtime script');
  for (const [, id] of html.matchAll(/<use[^>]+href="#([^" ]+)"/g)) {
    check(html.includes('id="' + id + '"'), page.route + ': missing SVG definition ' + id);
  }
  const canonical = origin + (page.route === '/' ? '/' : page.route.replace(/\/$/, '') + '/');
  check(html.includes('rel="canonical" href="' + canonical + '"'), page.route + ': incorrect canonical URL');
  check(sitemap.includes('<loc>' + canonical + '</loc>'), page.route + ': absent from sitemap');
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

for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const parsed = new URL(url.replaceAll('&amp;', '&'));
  check(parsed.origin === origin && exists(parsed.pathname), 'Sitemap URL does not resolve: ' + url);
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
