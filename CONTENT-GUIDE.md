# Writing blogs and projects

Write Markdown files in `content/posts/` or `content/projects/`. The build creates their pages, cards, SEO metadata, and sitemap entries automatically. Keep editing source files; `dist/` is generated and overwritten.

## First setup

Install Node.js 22 or newer, then run these commands in the repository:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Saving content, images or styles rebuilds the preview and reloads your browser. Drafts are included in this local preview. If port 3000 is already used by another preview, stop that server first. After changing dependencies, restart the preview.

## Create a blog or project

```sh
npm run new:post -- "My new security article"
npm run new:project -- "My new project"
```

Each command creates a Markdown draft with today's date and a URL slug based on your title. It never overwrites existing files. You can also copy the `_template.md` in either folder and rename it. Files starting with `_` are ignored by the build.

Your current examples are:

- [GitLab article](content/posts/cve-2026-85706-gitlab-file-read.md)
- [BlackSite project](content/projects/blacksite.md)

## Metadata at the top

Every file starts with YAML between two `---` lines:

```yaml
---
title: "My new security article"
description: "A specific summary of what this article covers."
slug: "my-new-security-article"
date: "2026-10-18"
author: "Beri Contraster"
tags: ["Web Security", "Research"]
cover: "/assets/media/my-article/cover.webp"
coverAlt: "Describe the cover image"
featured: true
draft: true
---
```

- `title` and `description` are required. Quote text containing punctuation such as colons.
- `date` is required for posts; use `YYYY-MM-DD`. Projects may omit it. Posts and projects are sorted newest first.
- `slug` sets `/posts/my-new-security-article/` or `/work/my-new-project/`. If omitted, the filename supplies it. Keep slugs stable after publishing to preserve links.
- `tags` appear on the page and in structured metadata.
- `cover` is optional. Put the actual image in `public/assets/media/my-article/cover.webp`; omit `public` in the URL. Missing local images stop the build with the filename and error.
- `excerpt` optionally changes the listing card description without changing the SEO description.
- `featured: true` includes the item on the homepage (latest 3 posts and 4 projects). `false` keeps it on its listing page only.
- `draft: true` includes the item only in local draft builds. Change to `false` to publish. Future dates do **not** schedule publication.
- `updated: "2026-10-20"` optionally records the last substantial edit for SEO and the sitemap.
- `sourceUrl` optionally adds an original-publication link, useful for Medium articles. It does not change your website's canonical URL.

Drafts are excluded from production pages, cards, aliases and sitemap. Local draft pages also carry `noindex` metadata. Draft source files committed to a public repository are still publicly readable on GitHub.

## Formatting the body

Start your body with `## Introduction`. The page already displays the title as its main heading. `##` and `###` headings automatically populate the floating blog TOC and receive stable section links.

Each blog automatically gets a share button beside the author, publication date, and reading time. Readers can copy the public article link or open sharing on X, LinkedIn, and Threads. No extra Markdown fields are needed.

Leave a **blank line between paragraphs**. For a line break inside one paragraph, end the line with two spaces. Write **bold**, *italic*, links, lists, blockquotes and tables with standard Markdown.

Use single backticks for inline code: `` `%2F` ``. For multiline code, use triple backticks and a language:

````markdown
```bash
# Commands keep their separate lines
echo "Hello"
pwd
```
````

Highlighting is available for `bash` (also `sh` and `shell`), `shell-session` (terminal transcripts) and `http`. Other language labels render safely in monospace with line breaks preserved. Raw HTML is displayed as text; use Markdown for formatting.

To insert an image with an optional caption:

```markdown
![Describe what the screenshot shows](/assets/media/my-article/screenshot.webp "Optional caption")
```

Put the image on its own line, with blank lines around it. Use descriptive alt text. Optimize large images before adding them; the build preserves your image files.

## Projects and BlackSite

Projects use the same Markdown formatting and the existing centered project layout. Optional project fields:

```yaml
category: "Offensive security"
cta: "Explore the project"
showCover: true
# Keep an existing URL, as BlackSite does:
permalink: "/blacksite/"
# One or two artworks for the card (defaults to cover):
cardImages:
  - "/assets/media/my-project/cover.webp"
# Jump links use generated heading IDs:
jumpLinks: ["overview", "getting-started"]
```

BlackSite additionally uses `labSections: ["SillyAuthority", "Cascading Trust"]`. Each matching `##` section has an image on its own line. The renderer places that artwork beside the section details. Normal projects do not need this field. `showCover: false` hides the large cover on the page while keeping it on the listing card.

## SEO and sharing

Title, description, cover, tags, dates and author generate the page title, meta description, canonical URL, Open Graph/Twitter previews and JSON-LD (`BlogPosting` or `CreativeWork`). Published content is automatically included in `sitemap.xml`. Posts retain `/blog/<slug>/` compatibility redirects to `/posts/<slug>/`.

Optional overrides:

```yaml
seo:
  title: "Custom search title"
  description: "Custom search and sharing description"
  image: "/assets/media/my-article/social.webp"
  # Only set this if another URL should be the canonical source:
  # canonical: "https://example.com/original-article/"
```

The default canonical points to your own site. Choose a clear, unique description and a useful sharing image. Global domain, navigation, analytics and Google verification remain in `content/settings.json`.

The homepage browser tab uses `Beri Contraster`. Other pages use `Page title | Beri Contraster`; do not add the brand to your Markdown `seo.title` yourself. The tab brand (`titleBrand`), homepage description, site author, profile links and fallback sharing image live under `seo` in `content/settings.json`. Static About, Blogs and Projects metadata lives in `src/pages.json`.

The sitemap includes only published, indexable pages that point to their own canonical URL. Drafts, redirects, 404 pages, tag/category archives, search pages and pages canonicalized to another URL are excluded. Tags remain article labels and metadata; they do not create archive URLs. Do not add image files or assets to the page manifest. `lastmod` uses the content's `updated` date, falling back to its publication date, rather than the build time.

Google can choose a different search title or snippet based on the query. These fields state your preferences; see [Google's title guidance](https://developers.google.com/search/docs/appearance/title-link) and [description guidance](https://developers.google.com/search/docs/appearance/snippet).

## Publish

1. Finish the Markdown, set `draft: false`, and save.
2. Stop the live preview and run `npm run check` (tests, production build and verification).
3. Optionally run `npm run preview` to inspect the production output without drafts.
4. Commit the Markdown, any new images, and code changes; push to `main`. The existing GitHub Pages workflow installs dependencies, tests, builds, verifies and deploys.

For draft-only validation: `npm run build -- --drafts` then `npm run verify -- --drafts`. Run the normal production build again before manually publishing `dist/`.

To remove an item, delete its Markdown file and rebuild. The generated page, card, alias and sitemap entry are removed together. Neither GitBook nor a separate database is required.
