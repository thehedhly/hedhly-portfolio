# Hamza Hedhly - DevSecOps Portfolio

A crawlable bilingual German/English professional portfolio focused on Azure,
Kubernetes, Infrastructure as Code, CI/CD, GitOps and platform automation.

The site is a dependency-free static website. Open `index.html` directly or serve the
repository with any static web server.

![Hamza Hedhly – DevSecOps & Azure Engineer](assets/images/og-de.png)

## Structure

- `index.html` - German fallback page, canonicalized to `/de/`
- `de/index.html` - static German profile page
- `en/index.html` - static English profile page
- `assets/css/style.css` - responsive visual system
- `assets/js/script.js` - mobile navigation and reveal effects
- `assets/images/og-editorial.png` - English social sharing card
- `assets/images/og-de.png` - German social sharing card
- `_redirects` - Cloudflare Pages path redirect for the site root
- `robots.txt` and `sitemap.xml` - crawler discovery files

German is the default language. Each language has its own URL, canonical metadata,
reciprocal `hreflang` links and ProfilePage/Person JSON-LD. The production origin is
currently configured as `https://hedhly.com`; update that
origin in the HTML files, `robots.txt` and `sitemap.xml` if the deployment domain changes.

## Canonical URL and deployment policy

The only indexable profile URLs are:

- `https://hedhly.com/de/` (German, self-canonical)
- `https://hedhly.com/en/` (English, self-canonical)

The repository is a dependency-free static site and is intended to be deployed from
the repository root as a Cloudflare Pages static project. Cloudflare Pages reads
`_redirects` from the published output, so the apex root `/` permanently redirects
to `https://hedhly.com/de/`. The rule is deliberately limited to `/`; assets,
`robots.txt`, `sitemap.xml`, `/de/`, and `/en/` remain directly accessible.

Cloudflare Pages does not support domain-level redirects in `_redirects`. Configure
the following dashboard Bulk Redirect for the `www` hostname so every path has one
canonical origin, preserving the path and query string:

`https://www.hedhly.com/*` → `https://hedhly.com/:splat` (301)

The `www` hostname must be proxied through Cloudflare for that rule to apply. Do not
add a repo `_redirects` rule attempting to match the hostname; Pages evaluates those
rules by path and cannot safely express this host-wide redirect there.

Run the local SEO contract checks with:

`python3 tests/check_seo.py`

After deploying the changes and applying the dashboard rule, confirm `/`, `www` URLs,
`/de/`, `/en/`, `robots.txt`, and `sitemap.xml` in URL Inspection. Then use **Validate
Fix** in Google Search Console for the “Alternate page with proper canonical tag” report.
