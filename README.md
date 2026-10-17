# Editable portfolio

The current site name is **BeriContraster**, used in the navigation, biography, page titles, footer, and opening animation. Footer names automatically fit the available width without clipping.

Recreation of the supplied [Majd reference](https://majd-portfolio.framer.website/), with its home sections, six projects, seven articles, imagery, typography, and responsive styles, plus an editable About page. No framework installation or package dependencies are required.

## Run locally

With Node.js 22 or later:

```sh
npm run build
npm run dev
```

Open `http://localhost:3000`. After changing source or content, rebuild and refresh. You can also run `node scripts/build.mjs` and `node scripts/serve.mjs` directly.

## Where to edit

| Change | File |
| --- | --- |
| Your name, navigation, quote, copyright year, contact recipient, form endpoints | `content/settings.json` |
| Page text, image URLs, image descriptions, links | `content/portfolio.json` |
| Page titles, descriptions, routes, section order | `src/pages.json` |
| Shared navigation component | `src/components/Header.html` |
| Section structure | Named HTML files in `src/components/` |
| Page shells | `src/pages/` |
| Typography, sizes, spacing and source responsive styles | `src/styles/<page>.css` |
| Shared visual adjustments | `src/styles/custom.css` |
| Navigation and form behavior | `src/interactions.js` |
| Local images and fonts | `public/assets/media/` |

`portfolio.json` is grouped by page. Entries have a readable `label` and an editable `value`. `text` fields contain plain text; `html` fields retain article links and formatting. `image` fields also expose `alt`. Keep entry keys intact: they bind content to `data-edit`, `data-edit-image`, or `data-edit-link` attributes in the components. Only use trusted HTML in rich text fields.

The `/about` page has two education entries and three work experience entries with placeholders, ready for your real details. Edit the `about` group in `content/portfolio.json`: each entry has years, a degree or role title, an institution or company, and a short description. Keep the latest entry first. Add or remove rows in `src/components/about--1--education.html` and `src/components/about--2--experience.html`; new rows need unique `data-edit` keys and matching content entries. `src/styles/about.css` reuses the Projects page's typography and footer styles, then defines the year and details columns. On phones, the year sits above the details.

To replace a photo, put the new file in `public/assets/media/` and change its image value to `/assets/media/your-photo.jpg`. The two portrait entries represent front and back views; update both. The original source asset URLs are mapped to downloaded files by `content/assets.json` at build time.

The homepage hero reads **CYBERSECURITY CONSULTANT** and uses `portrait-grayscale.png` on the front and `portrait-red.png` on the back. The cybersecurity biography, portrait choices, contact address, and uppercase footer wordmark have been synced from the edited output into `content/portfolio.json` and `content/settings.json`, so rebuilds preserve them. The heading scales down to keep both words intact on desktop and mobile.

Section names follow the reference. Framer's generated CSS classes are retained to preserve the visual design, while editable content and complete sections are separated. These are HTML components, not React components or an editable Framer project.

The compact fixed header is capped at 680px wide and measures 56px tall on desktop, with the brand on the left and all four navigation links on the right. It uses a borderless dark glass surface at 58% opacity, 48px backdrop blur, and 110% saturation so background colors subtly show through. There is no white overlay or brightness filter. A soft shadow and faint inset highlight give the rounded surface depth. The brand has no decorative dot. Navigation text and selected states use neutral grays and white, and Contact uses a pearly off-white gradient with dark text. On phones below 640px, the brand stays left-aligned above a row containing all four links. Links are built from `navigation` in `content/settings.json` and work before JavaScript loads. The current page is highlighted; homepage section links reflect the selected URL hash. JavaScript adds the rolling hover labels.

Typography uses locally hosted variable fonts in `public/assets/fonts/`, with their SIL Open Font License files included. Headings use Inter Tight at 700, with the uppercase hero and footer wordmark at 800. Body copy uses Inter at 400, responsive 17–18px sizing, and 1.6 line-height. Navigation, metadata, form labels, category tags, and small hero accents use JetBrains Mono at 12–13px, uppercase with wider tracking. The shared font roles and responsive sizing live in `src/styles/custom.css`. The opening animation loads the new heading and label fonts before measuring its text masks.

The larger statement size is controlled separately by `--quote-font-size` (30px) in `src/styles/custom.css`. That file also holds the fixed glass navigation and centered sliding icons. `setupScrollMotion` in `src/interactions.js` controls the desktop portrait's growth and rotation; it respects reduced-motion preferences and keeps the reference's static portrait on smaller screens.

The statement reveal starts when the top of its text reaches 85% of the viewport and continues through the first half viewport of scrolling, reading from the first word in order even while the text is pinned at the center. The hero has custom steel-and-teal terminal and node-graph SVG illustrations in `src/components/home--0--hero-bio-sections.html`. `setupDecorations` supports dragging and release momentum for these illustrations. Focus one and use arrow keys to move it; Escape resets its position. Reduced motion disables release momentum.

Service descriptions sit beside their headings on desktop and tablet, and stack on phones. All arrow buttons share a diagonal slide and growing circular fill on hover or keyboard focus, defined by the `Arrow Button` selectors in `src/styles/custom.css`.

The shared theme uses a neutral near-black background (`#0b0b0e`), charcoal panels (`#161619`), off-white text (`#f4f4f5`), and gray secondary text (`#a1a1aa`). Navigation, social icons, footer links, form fields, quote reveal, separators, and scrollbars use neutral colors. Emerald (`#62f5b5`) and cyan remain accents for primary action buttons and decorative artwork, including the opening dots and footer hands. The homepage network uses muted blue and teal. Adjust the `--cyber-*` variables in `src/styles/custom.css` to retune the palette. The shared grain overlay is disabled for a smooth background.

Every page uses the same flowing network paths and traveling data packets over a faint grid, replacing the old green curtains. The steel-blue paths have stronger contrast on the arcs crossing the center, with a light mask protecting text readability. Tiny lock badges are omitted. The blue and teal artwork is anchored to the first viewport and fades into the page background. `src/components/SecurityNetwork.html` provides the shared canvas and static SVG fallback; `src/security-network.js` draws packets at an even speed along the curved paths. Edit `heroNetwork` in `content/settings.json` to adjust the background across all pages: `color`, `signalColor`, `intensity` (0–1, default 0.82), `speed` (0–2, zero for still artwork), or `enabled`. The animation runs at up to 30 fps, caps pixel density, uses fewer paths on phones, pauses while offscreen or the tab is hidden, and stays still for reduced motion. It is decorative and does not display live monitoring data.

The footer's ASCII hands approach from both sides as you scroll to the footer, behind the copy and above the large name. The emerald characters use 65% opacity. Their scroll movement eases at both ends and follows scrolling with 160ms damping; rendering stops once they settle. There is no mouse tracking, hover scrambling, or hover movement. Edit `footerHands` in `content/settings.json` for color, opacity, character density, or visibility. `src/footer-hands.js` converts local hand silhouettes into text; reduced motion displays their final positions. The silhouettes come from the user-supplied [Luke Baffait footer reference](https://lukebaffait.fr/), and are stored in `public/assets/hands/`.

The homepage opens with emerald dots on the dark background gathering into `[BeriContraster]`, spreading into a square grid, then flowing into the hero heading and portrait. The ending follows the live heading's font and line wrapping and the visible portrait's transformed bounds; those elements emerge in place as the remaining background clears. The final dots stay inside the photograph's outline and the heading's letter shapes, keeping both edges clean. The portrait is decoded in advance and revealed through one dissolve to avoid flashing the paper background. Edit `openingDots` in `content/settings.json` to change the name, duration in milliseconds (default 5600), or visibility. It plays on the first homepage visit per tab; refreshing replays it, while internal return visits skip it. Set `oncePerSession` to `false` to play on every homepage visit. Reduced motion skips the intro, Escape dismisses it, and other routes open directly. `src/components/OpeningDots.html` and `src/opening-dots.js` contain the component and animation; no reference-site runtime or media is required.

## Forms

The contact form validates required fields and opens an email draft to `contactEmail`. It does not send mail automatically. Set `contactEndpoint` to an HTTPS service that accepts JSON to enable submission. The request contains `Name`, `Email`, and `Project`.

Article newsletter forms need `newsletterEndpoint`, accepting JSON with the source form's email field. Until connected, they explicitly report that signup is unavailable. No fake success state is displayed. Your form service must allow requests from the final website domain.

## Routes

- `/` — hero, biography, quote, services, featured projects, thoughts, contact, footer.
- `/about` — education and work experience arranged by year.
- `/work` — project collection.
- `/work/damas`, `/work/najm`, `/work/kavi`, `/work/sham`, `/work/abjad`, `/work/fasselh` — project details. `fasselh` preserves the reference URL spelling.
- `/blog` — article collection.
- Seven `/posts/<slug>/` article pages, listed in `src/pages.json`. The former `/blog/<slug>` paths have compatibility pages.

`/#bio-section`, `/#services`, and `/#contact` are homepage anchors. These are pages and sections under one domain, not separate subdomains. Hosting under the original owner's `majd-portfolio.framer.website` address requires their Framer access; this project cannot claim that address.

## Review notes

See `REFERENCE-REVIEW.md` for the reference's components, existing content issues, and fidelity limits. Replace the reference's identity, sample project content, email, and social destinations when personalizing it.

## Validation and deployment

```sh
node scripts/verify.mjs
```

The check validates compiled pages, internal routes, component insertion, local assets, canonical URLs, Google verification, analytics configuration, sitemap coverage, and deployment files. The static output is `dist/`. GitHub Pages builds and deploys it through `.github/workflows/pages-deploy.yml`; only `dist/` is published. See [deploy.md](deploy.md) for the push commands and Pages settings.

The existing domain is `bericontraster.com`. The public Google verification token and GA4 measurement ID are in `content/settings.json`; these are intentionally included in the HTML. Analytics only loads on the production origin. All settings in this file are public; store real credentials in ignored `.env` files or `private/`, never in source content or `public/`.

Older posts are intentionally not copied yet. `content/legacy-posts.json` records all 36 published post paths, titles, and modification dates from the old site. This file is a migration checklist, not live pages or redirects. Those paths will return 404 after deployment until their articles are restored. Run `npm run verify:migration` after copying the posts; it fails while any original post URL is missing. See the deployment notes before replacing the old site.

The old Chirpy service worker is retired through `public/sw.min.js`, keeping its original URL so returning visitors can leave the old cached site. Keep that file deployed during the transition.
