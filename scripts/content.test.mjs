import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { loadSiteContent, parseContent, renderContentPage, renderContentSeo, renderMarkdown } from './content.mjs';
import { highlightCodeBlocks } from './highlight-code.mjs';
import { createContent } from './new-content.mjs';
import { articleShareLinks, renderArticleShare } from './article-share.mjs';
import { sitemapPages, pageMetadata, renderPageSeo } from './seo.mjs';

const repo = process.cwd();
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-content-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const folder of ['src', 'content/posts', 'content/projects', 'public/assets/media']) fs.mkdirSync(path.join(root, folder), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/pages.json'), JSON.stringify([{ route: '/', slug: 'home' }, { route: '/blog', slug: 'blog' }, { route: '/work', slug: 'work' }]));
  fs.writeFileSync(path.join(root, 'public/assets/media/test.webp'), 'test image');
  return root;
}
const source = (metadata = {}, body = '## Introduction\n\nFirst paragraph with `%2F`.\n\nSecond paragraph.') => '---\n' + Object.entries({ title: 'A security article', description: 'A useful description.', slug: 'test-article', date: '2026-10-18', ...metadata }).map(([key, value]) => key + ': ' + JSON.stringify(value)).join('\n') + '\n---\n\n' + body;
function parse(root, text = source(), options = {}) { return parseContent(text, { root, file: 'test.md', kind: 'post', ...options }); }
function write(root, folder, name, text) { fs.writeFileSync(path.join(root, 'content', folder, name), text); }

test('Markdown keeps paragraphs, inline code, code lines, tables and unique anchors', t => {
  const root = fixture(t);
  const markdown = '## A & B\n\nFirst `%2F`.\n\nSecond paragraph.\n\n## A & B\n\n```bash\n# Comment\necho "hello"\npwd\n```\n\n| Item | Value |\n| --- | --- |\n| Test | 1 |';
  const rendered = renderMarkdown(markdown, { root });
  assert.deepEqual(rendered.headings.map(h => h.id), ['a-and-b', 'a-and-b-2']);
  assert.match(rendered.html, /<p>First <code>%2F<\/code>\.<\/p>\n<p>Second paragraph\.<\/p>/);
  assert.match(rendered.html, /# Comment\necho &quot;hello&quot;\npwd\n/);
  assert.match(rendered.html, /<table>/);
  const highlighted = highlightCodeBlocks(rendered.html);
  assert.match(highlighted, /class="token comment"/);
  assert.match(highlighted, /class="token builtin/);
  assert.equal(highlighted.split('\n').length, rendered.html.split('\n').length);
});

test('images become figures with captions and missing assets fail clearly', t => {
  const root = fixture(t);
  const {html} = renderMarkdown('![Test image](/assets/media/test.webp "A caption")', { root });
  assert.match(html, /<figure><img/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /<figcaption>A caption<\/figcaption>/);
  assert.throws(() => renderMarkdown('![No image](/assets/missing.png)', { root, file: 'article.md' }), /article\.md: image not found/);
  assert.throws(() => parse(root, source({ cover: '/assets/../../outside.png' })), /image not found/);
  assert.throws(() => parse(root, source({ cover: 'https://' })), /invalid image URL/);
});

test('invalid metadata reports actionable errors', t => {
  const root = fixture(t);
  assert.throws(() => parse(root, 'No front matter'), /start the file with YAML/);
  for (const [metadata, error] of [[{ date: '2026-02-30' }, /real date/], [{ tags: 'security' }, /list of text/], [{ draft: 'false' }, /without quotes/], [{ slug: '../outside' }, /slug/], [{ title: '' }, /title is required/], [{ permalink: '/about/' }, /posts use/], [{ seo: { canonical: 'javascript:alert(1)' } }, /https/]]) {
    assert.throws(() => parse(root, source(metadata)), error);
  }
  assert.throws(() => parse(root, '---\ntitle: One\ntitle: Two\n---\nBody'), /Map keys must be unique/);
});

test('drafts, templates, featured flags, sorting, and URL collisions', t => {
  const root = fixture(t);
  assert.equal(parse(root, '---\ndraft: true\n---\nUnfinished draft'), null);
  assert.throws(() => parse(root, '---\ndraft: true\n---\nUnfinished draft', { includeDrafts: true }), /title is required/);
  write(root, 'posts', 'published.md', source({ date: '2026-10-17', featured: false }));
  write(root, 'posts', 'draft.md', source({ slug: 'draft', draft: true }));
  write(root, 'posts', '_template.md', 'Ignored unfinished template');
  let site = loadSiteContent({ root });
  assert.equal(site.posts.length, 1);
  assert.equal(site.posts[0].featured, false);
  site = loadSiteContent({ root, includeDrafts: true });
  assert.deepEqual(site.posts.map(entry => entry.slug), ['draft', 'test-article']);
  assert.match(renderContentSeo(site.posts[0], 'https://example.com', 'Beri Contraster'), /noindex,nofollow/);
  write(root, 'projects', 'collision.md', source({ permalink: '/blog/' }));
  assert.throws(() => loadSiteContent({ root }), /duplicate or reserved URL/);
  fs.unlinkSync(path.join(root, 'content/projects/collision.md'));
  write(root, 'projects', 'alias.md', source({ permalink: '/blog/test-article/' }));
  assert.throws(() => loadSiteContent({ root }), /conflicts with the article alias/);
});

test('SEO defaults, overrides, and JSON-LD preserve text without script injection', t => {
  const root = fixture(t);
  const entry = parse(root, source({ title: 'Research </script> $&', cover: '/assets/media/test.webp', tags: ['Web', 'API'], updated: '2026-10-19', seo: { title: 'Search title', description: 'Search description', canonical: 'https://example.org/original/' } }));
  const seo = renderContentSeo(entry, 'https://example.com', 'Beri Contraster');
  const json = seo.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const schema = JSON.parse(json);
  assert.equal(schema.headline, entry.title);
  assert.equal(schema.url, 'https://example.org/original/');
  assert.equal(schema.image, 'https://example.com/assets/media/test.webp');
  assert.equal(schema.dateModified, '2026-10-19');
  assert.equal(schema.keywords, 'Web, API');
  assert.doesNotMatch(json, /<\/script>/);
  assert.match(seo, /content="Search title"/);
  assert.doesNotMatch(seo, /noindex/);
  assert.match(renderContentPage(entry), /Research &lt;\/script&gt; \$&/);
});

test('project sections retain artwork layout and validated jump links', t => {
  const root = fixture(t);
  const entry = parse(root, source({ permalink: '/blacksite/', labSections: ['Example lab'], jumpLinks: ['example-lab'], showCover: false }, '## Example lab\n\n![Lab artwork](/assets/media/test.webp)\n\nLab details.\n\n## Setup\n\nInstructions.'), { kind: 'project' });
  const html = renderContentPage(entry);
  assert.match(html, /class="blacksite-lab" id="example-lab"/);
  assert.match(html, /class="blacksite-lab-art"/);
  assert.match(html, /href="#example-lab"/);
  assert.match(html, /<h2 id="setup">Setup<\/h2>/);
  entry.jumpLinks = ['missing'];
  assert.throws(() => renderContentPage(entry), /missing heading/);
});

test('article sharing encodes titles and public URLs for each platform', t => {
  const root = fixture(t);
  const title = 'Research: A & B / "notes"';
  const url = 'https://example.com/posts/test-article/';
  const links = articleShareLinks(title, url);
  assert.deepEqual(links.map(link => link.label), ['Share on X', 'Share on LinkedIn', 'Share on Threads']);
  const x = new URL(links[0].href);
  assert.equal(x.searchParams.get('text'), title);
  assert.equal(x.searchParams.get('url'), url);
  assert.equal(new URL(links[1].href).searchParams.get('url'), url);
  assert.equal(new URL(links[2].href).searchParams.get('text'), title + '\n' + url);
  const html = renderArticleShare(title, url);
  assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length, 3);
  assert.match(html, /aria-label="Share article"/);
  assert.match(html, /data-share-url="https:\/\/example.com\/posts\/test-article\/"/);
  assert.match(renderContentPage(parse(root), { shareUrl: url }), /class="post-meta-row"/);
  const project = parse(root, source(), { kind: 'project' });
  assert.doesNotMatch(renderContentPage(project, { shareUrl: url }), /class="post-share"/);
});

test('sitemap includes only published, canonical content pages', () => {
  const origin = 'https://example.com';
  const pages = [
    { route: '/', slug: 'home' }, { route: '/about', slug: 'about' },
    { route: '/posts/research/', entry: { draft: false, seo: {} } },
    { route: '/posts/draft/', entry: { draft: true, seo: {} } },
    { route: '/posts/republished/', entry: { seo: { canonical: 'https://medium.com/original/' } } },
    { route: '/tags/security/' }, { route: '/categories/research/' }, { route: '/search/' },
    { route: '/private/', noindex: true }, { route: '/hidden/', sitemap: false },
  ];
  assert.deepEqual(sitemapPages(pages, origin).map(page => page.route), ['/', '/about', '/posts/research/']);
});

test('site metadata brands browser tabs and produces one coherent social and schema set', t => {
  const root = fixture(t);
  const settings = { siteUrl: 'https://example.com', displayName: 'BeriContraster', seo: { description: 'Offensive security research and free labs.', authorName: 'Muhammad Zubair', defaultImage: '/assets/media/test.webp', defaultImageAlt: 'BeriContraster logo' } };
  const home = { route: '/', slug: 'home', title: 'An old title', description: 'Old description' };
  assert.equal(pageMetadata(home, settings).title, 'BeriContraster');
  assert.equal(pageMetadata(home, settings).description, settings.seo.description);
  const homeSeo = renderPageSeo(home, settings);
  const homeGraph = JSON.parse(homeSeo.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.ok(homeGraph.some(node => node['@type'] === 'WebSite' && node.name === 'BeriContraster'));
  assert.ok(homeGraph.some(node => node['@type'] === 'Person' && node.name === 'Muhammad Zubair'));
  const entry = parse(root, source({ title: 'Research </script>', seo: { title: 'Short research title', description: 'Specific search description.' } }));
  const article = { route: entry.route, slug: 'blog--test-article', title: entry.seo.title, description: entry.seo.description, entry };
  const metadata = pageMetadata(article, settings);
  assert.equal(metadata.title, 'Short research title | BeriContraster');
  const html = renderPageSeo(article, settings);
  assert.equal((html.match(/name="description"/g) || []).length, 1);
  assert.equal((html.match(/name="robots"/g) || []).length, 1);
  assert.equal((html.match(/name="twitter:card"/g) || []).length, 1);
  assert.equal((html.match(/property="og:image"/g) || []).length, 1);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.equal(schemas[0].headline, entry.title);
  assert.equal(schemas[0].author.name, 'Muhammad Zubair');
  assert.equal(schemas[0].author['@id'], 'https://example.com/#person');
  assert.ok(schemas[1]['@graph'].some(node => node['@type'] === 'BreadcrumbList'));
});

test('starter commands create valid drafts and never overwrite content', t => {
  const root = fixture(t);
  for (const folder of ['posts', 'projects']) fs.copyFileSync(path.join(repo, 'content', folder, '_template.md'), path.join(root, 'content', folder, '_template.md'));
  const title = 'API: Notes $& and "quotes"';
  for (const kind of ['post', 'project']) {
    const file = createContent(kind, title, { root, today: '2026-10-18' });
    const text = fs.readFileSync(file, 'utf8');
    const entry = parseContent(text, { root, file, kind, includeDrafts: true });
    assert.equal(entry.title, title);
    assert.equal(entry.date, '2026-10-18');
    assert.equal(entry.draft, true);
    assert.throws(() => createContent(kind, title, { root }), /EEXIST/);
    const cli = spawnSync(process.execPath, [path.join(repo, 'scripts/new-content.mjs'), kind, 'CLI draft'], { cwd: root, encoding: 'utf8' });
    assert.equal(cli.status, 0, cli.stderr);
    assert.match(cli.stdout, /Created draft:/);
  }
  assert.equal(loadSiteContent({ root }).entries.length, 0);
});

test('production build discovers content, excludes drafts, and removes deleted routes', t => {
  const root = fixture(t);
  fs.cpSync(path.join(repo, 'src'), path.join(root, 'src'), { recursive: true });
  for (const name of ['portfolio.json', 'settings.json', 'assets.json']) fs.copyFileSync(path.join(repo, 'content', name), path.join(root, 'content', name));
  fs.copyFileSync(path.join(repo, 'CNAME'), path.join(root, 'CNAME'));
  fs.mkdirSync(path.join(root, 'public/assets/brand'), { recursive: true });
  fs.copyFileSync(path.join(repo, 'public/assets/brand/bericontraster-logo-512.png'), path.join(root, 'public/assets/brand/bericontraster-logo-512.png'));
  write(root, 'posts', 'live.md', source({ cover: '/assets/media/test.webp' }));
  write(root, 'posts', 'draft.md', source({ slug: 'draft-article', draft: true }));
  write(root, 'posts', 'external.md', source({ slug: 'external-article', seo: { canonical: 'https://medium.com/original/' } }));
  write(root, 'projects', 'project.md', source({ slug: 'new-project', cover: '/assets/media/test.webp' }));
  const run = (...args) => {
    const result = spawnSync(process.execPath, [path.join(repo, 'scripts/build.mjs'), ...args], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr); return result;
  };
  const read = name => fs.readFileSync(path.join(root, 'dist', name), 'utf8');
  run();
  assert.match(read('posts/test-article/index.html'), /application\/ld\+json/);
  assert.match(read('blog/index.html'), /href="\/posts\/test-article\/"/);
  assert.match(read('work/index.html'), /href="\/work\/new-project\/"/);
  assert.match(read('index.html'), /href="\/work\/new-project\/"/);
  assert.match(read('sitemap.xml'), /\/posts\/test-article\//);
  assert.ok(fs.existsSync(path.join(root, 'dist/blog/test-article/index.html')));
  assert.ok(!fs.existsSync(path.join(root, 'dist/posts/draft-article')));
  assert.doesNotMatch(read('sitemap.xml'), /draft-article/);
  assert.doesNotMatch(read('sitemap.xml'), /external-article|medium\.com|\/tags\//);
  run('--drafts');
  assert.match(read('posts/draft-article/index.html'), /noindex,nofollow/);
  assert.doesNotMatch(read('sitemap.xml'), /draft-article/);
  const before = read('index.html');
  write(root, 'posts', 'broken.md', '---\ntitle: [invalid YAML\n---\nBody');
  const bad = spawnSync(process.execPath, [path.join(repo, 'scripts/build.mjs')], { cwd: root, encoding: 'utf8' });
  assert.notEqual(bad.status, 0);
  assert.equal(read('index.html'), before, 'Invalid Markdown metadata must preserve the last successful build');
  fs.unlinkSync(path.join(root, 'content/posts/broken.md'));
  fs.unlinkSync(path.join(root, 'content/posts/live.md'));
  run();
  assert.ok(!fs.existsSync(path.join(root, 'dist/posts/test-article')));
  assert.ok(!fs.existsSync(path.join(root, 'dist/blog/test-article')));
  assert.doesNotMatch(read('blog/index.html'), /\/posts\/test-article\//);
  assert.doesNotMatch(read('sitemap.xml'), /test-article|draft-article/);
});

test('C highlighting preserves code and warning callouts preserve quote semantics', () => {
  const code = '#include <stdio.h>\n// Example\nint main(void) { printf("hello"); return 0; }\n';
  const rendered = renderMarkdown('```c\n' + code + '```\n\n> [!WARNING]\n> **Disclaimer:** Example.\n>\n> Second paragraph.\n\n> Ordinary quote.\n\n`[!WARNING]`');
  const highlighted = highlightCodeBlocks(rendered.html);
  assert.match(highlighted, /data-language="C"/);
  for (const type of ['keyword', 'comment', 'string', 'function', 'directive']) assert.match(highlighted, new RegExp('class="token ' + type));
  const stripTags = html => html.replace(/<[^>]*>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
  assert.equal(stripTags(highlighted), stripTags(rendered.html));
  assert.match(rendered.html, /<blockquote class="content-callout content-callout-warning">\n<p><strong>Disclaimer:<\/strong> Example\.<\/p>\n<p>Second paragraph\.<\/p>/);
  assert.match(rendered.html, /<blockquote>\n<p>Ordinary quote\.<\/p>/);
  assert.match(rendered.html, /<code>\[!WARNING\]<\/code>/);
  const separate = renderMarkdown('> [!WARNING]\n>\n> Separate paragraph.').html;
  assert.match(separate, /content-callout-warning/);
  assert.doesNotMatch(separate, /\[!WARNING\]/);
});

test('article images get separate figures and consistent legacy captions', () => {
 const image = '![Screenshot](https://example.com/image.png)';
 const {html} = renderMarkdown(image + '\n' + image + '\n' + image + '\n\nText between groups.\n\n' + image + '\n_An italic caption_\n\n' + image + '\n\n*A separate caption*');
 assert.equal((html.match(/<figure>/g) || []).length, 5);
 assert.match(html, /<p>Text between groups\.<\/p>/);
 assert.match(html, /<figcaption>An italic caption<\/figcaption>/);
 assert.match(html, /<figcaption>A separate caption<\/figcaption>/);
 assert.doesNotMatch(html, /<p><img/);
});

test('related articles prioritize shared tags and exclude the current post and drafts', t => {
 const root = fixture(t);
 const entry = parse(root, source({tags: ['Security']}));
 const make = (slug, tags, date, draft = false) => ({...entry, slug, route: `/posts/${slug}/`, title: slug, tags, date, draft});
 const posts = [entry, make('newest', [], '2026-10-19'), make('related', ['security'], '2025-01-01'), make('draft', ['Security'], '2026-10-20', true), make('older', [], '2026-01-01'), make('oldest', [], '2024-01-01')];
 const html = renderContentPage(entry, {posts});
 const related = html.slice(html.indexOf('<section class="related-posts"'));
 assert.equal((related.match(/class="featured-blog-card"/g) || []).length, 3);
 assert(related.indexOf('/posts/related/') < related.indexOf('/posts/newest/'));
 assert(!related.includes('/posts/test-article/'));
 assert(!related.includes('/posts/draft/'));
 assert(!related.includes('/posts/oldest/'));
 assert(!renderContentPage({...entry, kind: 'project'}, {posts}).includes('class="related-posts"'));
});

test('bold image captions use spaced figures rather than sharing a text paragraph', () => {
  const image = '![Screenshot](https://example.com/image.png)';
  for (const separator of ['\n', '\n\n']) {
    const { html } = renderMarkdown(image + separator + '**Reverse Shell**\n\nFollowing explanation.');
    assert.match(html, /<figure><img[^>]*><figcaption>Reverse Shell<\/figcaption><\/figure>/);
    assert.match(html, /<p>Following explanation\.<\/p>/);
    assert.doesNotMatch(html, /<p><img/);
  }
});

test('tips and cautions render as distinct callouts while ordinary quotes stay simple', () => {
  for (const [marker, kind] of [['TIP', 'tip'], ['CAUTION', 'caution'], ['WARNING', 'warning']]) {
    const {html} = renderMarkdown(`> [!${marker}]\n> **Label:** Message.\n>\n> Another paragraph.\n\n> Ordinary quote.\n\n\`[!${marker}]\``);
    assert(html.includes(`class="content-callout content-callout-${kind}"`));
    assert.match(html, /<strong>Label:<\/strong> Message\./);
    assert.match(html, /<p>Another paragraph\.<\/p>/);
    assert.match(html, /<blockquote>\n<p>Ordinary quote\.<\/p>/);
    assert(html.includes(`<code>[!${marker}]</code>`));
    const separate = renderMarkdown(`> [!${marker}]\n>\n> Separate paragraph.`).html;
    assert(separate.includes(`content-callout-${kind}`));
    assert(!separate.includes(`[!${marker}]`));
  }
  assert(!renderMarkdown('> [!UNKNOWN]\n> Keep this text.').html.includes('content-callout'));
});

test('NASM highlighting identifies registers, labels, comments, strings and numbers without changing code', () => {
  const code = "section .data\nmsg db 'Hello', 0xA\nsection .text\nglobal _start\n_start:\n    mov eax, 4 ; sys_write\n    int 0x80\n";
  const {html} = renderMarkdown('```nasm\n' + code + '```');
  const highlighted = highlightCodeBlocks(html);
  assert.match(highlighted, /data-language="NASM"/);
  for (const token of ['register variable', 'label function', 'comment', 'string', 'number', 'keyword']) assert(highlighted.includes(`class="token ${token}"`));
  const text = value => value.replace(/<[^>]*>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
  assert.equal(text(highlighted), text(html));
});

test('link cards render safe metadata, optional images and local routes', t => {
  const root = fixture(t);
  const fence = fields => '```link-card\n' + fields + '\n```';
  const html = renderMarkdown(fence('url: https://github.com/starship/starship\ntitle: "Starship <script>"\ndescription: "Fast & flexible"\nimage: /assets/media/test.webp\nimageAlt: "A logo"'), {root}).html;
  assert.match(html, /class="post-link-card has-image" href="https:\/\/github.com\/starship\/starship"/);
  assert.match(html, /Starship &lt;script&gt;/);
  assert.match(html, /Fast &amp; flexible/);
  assert.match(html, /post-link-card-domain">github\.com/);
  assert.match(html, /alt="A logo" loading="lazy"/);
  assert.doesNotMatch(html, /<pre|<script>/);
  const local = renderMarkdown(fence('url: /blog/\ntitle: More articles'), {root}).html;
  assert.match(local, /class="post-link-card" href="\/blog\/"/);
  assert.doesNotMatch(local, /<img/);
  for (const fields of ['url: javascript:alert(1)\ntitle: Bad', 'url: //evil.example/\ntitle: Bad', 'url: https://example.com\ntitle: One\ntitle: Two', 'url: https://example.com', '[]']) assert.throws(() => renderMarkdown(fence(fields), {root, file: 'card.md'}), /card\.md: link-card/);
  assert.throws(() => renderMarkdown(fence('url: https://example.com\ntitle: Test\nimage: /assets/missing.png'), {root}), /image not found/);
  assert.match(renderMarkdown('[Normal link](https://example.com)', {root}).html, /<p><a href="https:\/\/example.com">Normal link<\/a><\/p>/);
});
