# Website maintenance

The site uses HTML, CSS, vanilla JavaScript, and a Node.js build for Markdown. Use Node.js 22 or later. Edit source files; `dist/` is generated and replaced on every build.

## Daily workflow

On a new checkout, run `npm ci` to install the versions in `package-lock.json`.

```powershell
npm run dev
```

Open `http://localhost:3000`. The development server rebuilds after edits and includes drafts. Stop it with Ctrl+C before running a final production check: both commands rebuild the same `dist/` directory.

```powershell
npm run check
npm run preview
```

`check` runs the tests, builds production output without drafts, and verifies routes, assets, metadata, canonicals, sitemap dates, and deployment files. `preview` serves that output without rebuilding. Neither command publishes anything.

## What to edit

| Change | Source |
| --- | --- |
| Articles | `content/posts/*.md` |
| Projects and BlackSite | `content/projects/*.md` |
| Name, contact, navigation, booking, SEO defaults | `content/settings.json` |
| Existing homepage and footer copy | `content/portfolio.json` |
| Static page routes and metadata | `src/pages.json` |
| Shared styling and phone layouts | `src/styles/custom.css` |
| Page-specific styling | `src/styles/<page>.css` |
| Footer structure | `src/components/home--7--phone.html` and other footer components |
| Images, downloads, icons, fonts | `public/assets/` |
| Sitemap, robots.txt, page assembly | `scripts/build.mjs` |
| Canonicals and sitemap inclusion | `scripts/seo.mjs` |
| Automated deployment | `.github/workflows/pages-deploy.yml` |

Create an article with `npm run new:post -- "Article title"` or a project with `npm run new:project -- "Project title"`. These start as drafts. Complete the metadata and content, preview, then change `draft: true` to `draft: false` to publish.

## Sitemap and search metadata

`npm run build` generates `dist/sitemap.xml` and `dist/robots.txt`. Published Markdown entries enter the sitemap automatically. Do not edit those output files or maintain a second sitemap under `public/`.

- Canonical URLs use `https://bericontraster.com` and trailing slashes.
- Drafts, noindex pages, excluded static pages, taxonomy routes, and entries with a different canonical are omitted.
- Compatibility pages under `/blog/<article>/` point to `/posts/<article>/` and are omitted.
- `date` is the original publication date. Set `updated: YYYY-MM-DD` after a substantive content change. Without `updated`, the publication date supplies `lastmod`.
- Static pages currently omit `lastmod`. Do not insert today's date automatically on every build.
- `sourceUrl` credits an original source without changing the canonical. Setting `seo.canonical` to an external article changes the canonical and removes the local URL from the sitemap.
- Standalone HTML copied from `public/` does not automatically become a sitemap entry. Use the Markdown publishing flow for normal articles.

The robots file permits crawling except under `/norobots/` and points to the sitemap. A robots exclusion is not access control. The generated error page has `noindex`; GitHub Pages supplies the actual HTTP 404 response.

After publication, submit `https://bericontraster.com/sitemap.xml` in the existing Google Search Console property and inspect new or changed URLs there. A sitemap does not guarantee indexing. See [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Deployment and rollback

Review your diff, run `npm run check`, then commit and push the intended source changes to `main`. GitHub Actions installs dependencies, tests, builds, verifies, and deploys only `dist/`. Pull requests run the checks without publishing.

In repository Settings → Pages, keep **Source: GitHub Actions**, **Custom domain: bericontraster.com**, and **Enforce HTTPS**. Keep `content/settings.json` → `siteUrl` and the root `CNAME` consistent; this build checks them together. For an Actions deployment, GitHub's custom-domain setting controls hosting; a `CNAME` file alone does not configure it. See [GitHub's workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

If a published change breaks the site, revert that commit and push the revert to `main`; check Actions for deployment success. Keep `public/sw.min.js` and `src/site-migration.js`: they retire the former site's offline cache for returning visitors.

## Handover audit — 22 October 2026

The live and local production sitemaps contain the same 31 URLs. All 31 live URLs returned HTTP 200, matched their canonicals, and were indexable when checked. The live sitemap is served as XML, robots.txt as plain text, HTTP redirects to HTTPS, and a nonexistent path returns HTTP 404. The deployment workflow has the required permissions, environment, and build dependency.

The full local check passed 27 tests and 2,684 publishing checks. Local preview now serves XML and text files with their proper content types. Verification also checks the sitemap declaration, namespace, URL elements, metadata-derived modification dates, and the 404 page's noindex tag and local links.

### Two outstanding items

1. **The www hostname has a certificate error.** Its current DNS CNAME points to `bericontraster.com`; the certificate presented for `https://www.bericontraster.com/` does not cover that hostname. At your DNS provider, change the `www` CNAME target to `bericontraster.github.io`. Keep the apex custom domain in GitHub Pages, allow DNS and certificate provisioning to complete, then verify that HTTPS www redirects to the working apex domain. This requires DNS/hosting account access; repository edits cannot repair the certificate. [GitHub's domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) require pointing www directly at the default GitHub Pages domain.
2. **Twenty original article paths remain unrestored.** Sixteen of the 36 recorded legacy paths are present. Missing articles are correctly omitted from the sitemap. `npm run verify:migration` intentionally fails until all 36 original paths serve indexable articles with their original canonicals. The ordinary production check reports this backlog without blocking deployment.

Do not casually rename published slugs. The generator creates `/blog/<slug>/` compatibility pages for current posts; it does not automatically redirect an old `/posts/<old-slug>/` after a rename. Compatibility pages use an HTML refresh and canonical link, rather than an HTTP 301. Restore real article content before adding missing URLs to the sitemap.

The Markdown parser currently allows lowercase letters, digits, and hyphens in slugs. The two legacy URLs below containing `&` need explicit generator support or a carefully implemented compatibility route before restoration at their original paths.

```text
/posts/aws-cognito-user-&-identity-poles/
/posts/editor-hackthebox-full-walkthrough/
/posts/fuzzing-the-target/
/posts/how-much-does-a-data-breach-actually-cost-a-small-business/
/posts/hybrid-full-chain-walkthrough-tjnull-list/
/posts/if-i-joined-your-security-team-this-is-what-i-d-fix-in-the-first-90-days/
/posts/linux-torvalds/
/posts/master-active-directory/
/posts/mastering-reflected-cross-site-scripting-&-bypassing-filters/
/posts/mssql-attack-handbook/
/posts/nessus-guide/
/posts/network-pentesting-guide/
/posts/nmap-handbook/
/posts/nuclei-guide/
/posts/openvpn-setup-guide/
/posts/phantom-vulnlab-full-walkthrough-tjnull-list/
/posts/support-hackthebox-detauled-writeup/
/posts/sweep-vulnlab/
/posts/vulnlab-sync-full-walkthrough-tjnull-list/
/posts/whiterose/
```

The original inventory is `content/legacy-posts.json`. Run `npm run verify` for the current count rather than relying on this dated snapshot.
