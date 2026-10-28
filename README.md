# Hamza Hedhly — portfolio

A German-first, bilingual static portfolio styled around a command-line interface. It uses the Ayu Dark palette by default and lets visitors switch to Ayu Light, switch languages, explore separate portfolio documents, and reveal the contact address on demand.

The site is generated with Node.js and has no package dependencies or client-side framework. All page content is present in the generated HTML, so the site remains readable and navigable when JavaScript is unavailable.

## Local preview

Use Node.js 22 or later. No dependency installation is required.

```sh
npm run dev
```

This builds the static site in `dist/` and serves it at `http://127.0.0.1:4173`. To build and run the implementation checks:

```sh
npm run check
```

To build without starting a server, run `npm run build`. To serve the existing build without rebuilding it, run `npm run preview`.

## Content and settings

- Update German copy in `src/content/de.json` and English copy in `src/content/en.json`. The build fails if the translation keys or menu routes drift.
- Update shared expertise, work history, project outcomes, and certifications in `src/content/shared.mjs`.
- The homepage shows **Explore** by default. To change its CTA when looking for work, edit `availability` in `src/config/site.mjs` from `'explore'` to `'for-hire'`, then rebuild. The adjacent source comments explain how to switch it back.
- Ayu Dark is the first-visit theme. A visitor's Ayu Light choice is saved in local storage and follows them between routes and languages.
- The address module is loaded only when a visitor activates the reveal button. The emitted HTML and text exports have no plaintext address or prebuilt `mailto:` link. Click-to-reveal deters simple harvesting but cannot keep a static site's public JavaScript secret from a determined scraper.

## Generated output

`dist/` contains twelve fully rendered locale routes, a German-first root redirect, a useful 404 page, fingerprinted CSS and JavaScript, allowlisted image assets, a sitemap, `robots.txt`, German and English plain text portfolio indexes, and `llms.txt`. The pages use canonical and reciprocal `hreflang` links, Open Graph and Twitter metadata, JSON-LD, semantic headings, and real internal links.

## Deployment (Cloudflare Pages)

Production is served by Cloudflare Pages. The current production site is still the
previous root-level static site (`index.html`, `de/`, `en/`, `_redirects`, `robots.txt`,
`sitemap.xml`). Switching to this generator requires changing the Pages project to
build command `npm run build` and output directory `dist`, then removing the old
root-level files. See `.design/portfolio-modernization-plan.md` (§10, §13).

Cloudflare Pages reads `_redirects` and `_headers` from the published output, so they
live in `public/` and are copied to `dist/`. The apex root `/` permanently redirects to
the German homepage; assets, `robots.txt`, `sitemap.xml`, `/de/`, and `/en/` remain
directly accessible.

Cloudflare Pages does not support domain-level redirects in `_redirects`. Configure
the following dashboard Bulk Redirect for the `www` hostname so every path has one
canonical origin, preserving the path and query string:

`https://www.hedhly.com/*` → `https://hedhly.com/:splat` (301)

The `www` hostname must be proxied through Cloudflare for that rule to apply. Do not
add a repo `_redirects` rule attempting to match the hostname.

After deploying, confirm `/`, `www` URLs, the German and English routes, `robots.txt`,
and `sitemap.xml` in Google Search Console URL Inspection, and use **Validate Fix** for
any “Alternate page with proper canonical tag” report.

## Source layout

- `src/templates.mjs` — semantic HTML and page metadata rendering
- `src/content/` — bilingual copy and shared portfolio facts
- `src/styles/` — Ayu palette tokens and responsive terminal UI
- `src/runtime/` — theme, keyboard menu, and click-to-reveal behavior
- `scripts/build.mjs` — dependency-free static build
- `scripts/serve.mjs` — local preview server with redirects, 404 status, and security headers
- `test/site.test.mjs` — build, metadata, routing, email disclosure, and HTTP checks
