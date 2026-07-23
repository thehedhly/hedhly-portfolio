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
- `robots.txt` and `sitemap.xml` - crawler discovery files

German is the default language. Each language has its own URL, canonical metadata,
reciprocal `hreflang` links and ProfilePage/Person JSON-LD. The production origin is
currently configured as `https://hedhly.com`; update that
origin in the HTML files, `robots.txt` and `sitemap.xml` if the deployment domain changes.
