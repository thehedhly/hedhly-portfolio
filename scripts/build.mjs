import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { site } from '../src/config/site.mjs';
import { shared } from '../src/content/shared.mjs';
import { locales, outputFile, routePath, routeDefinitions, sitemapRoutes } from '../src/routes.mjs';
import { renderDocument, renderHome, renderHomeNotFound } from '../src/templates.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const source = path => join(root, path);
const target = path => join(dist, path);
const readJson = async path => JSON.parse(await readFile(source(path), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(`Build check failed: ${message}`);
}

function compareKeys(reference, candidate, path = '') {
  const left = Object.keys(reference).sort();
  const right = Object.keys(candidate).sort();
  assert(left.join('\0') === right.join('\0'), `content keys differ at ${path || '<root>'}`);
  for (const key of left) {
    const next = path ? `${path}.${key}` : key;
    if (reference[key] && candidate[key] && typeof reference[key] === 'object' && typeof candidate[key] === 'object') {
      compareKeys(reference[key], candidate[key], next);
    }
  }
}

function fingerprint(bytes) {
  return createHash('sha256').update(bytes).digest('hex').slice(0, 12);
}

async function writeFileAt(path, contents) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

function xmlEscape(value) {
  return String(value).replace(/[<>&"']/g, character => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[character]);
}

function buildSitemap() {
  const blocks = sitemapRoutes().map(({ routeId, path }) => {
    const alternates = locales.map(locale => `      <xhtml:link rel="alternate" hreflang="${locale}" href="${site.origin}${routePath(routeId, locale)}" />`).join('\n');
    return `  <url>\n    <loc>${xmlEscape(`${site.origin}${path}`)}</loc>\n${alternates}\n      <xhtml:link rel="alternate" hreflang="x-default" href="${site.origin}${routePath(routeId, 'de')}" />\n  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${blocks}\n</urlset>\n`;
}

function buildTextIndex(contents, locale) {
  const content = contents[locale];
  const areas = shared.expertise.map(item => `- ${item.title[locale]}: ${item.summary[locale]}\n  ${locale === 'de' ? 'Technologien' : 'Tools'}: ${item.tags.join(', ')}`).join('\n');
  const experience = shared.experience.map(item => `- ${item.start}–${item.end || content.experience.present}: ${item.role[locale]} — ${item.focus[locale]}. ${item.details[locale]}`).join('\n');
  const outcomes = shared.outcomes.map(item => `- ${item.title[locale]}: ${item.details[locale]}`).join('\n');
  const credentials = shared.credentials.map(item => `- ${item.name} (${item.provider})`).join('\n');
  const contactNote = locale === 'de'
    ? `Nutze die Kontaktfunktion unter ${site.origin}/de/explore/profile/, um die E-Mail-Adresse nach einem Klick anzuzeigen.`
    : `Use the contact reveal on ${site.origin}/en/explore/profile/ to display the email address after a click.`;
  const languageLinks = locale === 'de'
    ? `- Deutsch (Standardsprache): ${site.origin}/de/\n- Englisch: ${site.origin}/en/`
    : `- German (default): ${site.origin}/de/\n- English: ${site.origin}/en/`;
  return `# ${site.name}\n\n${shared.profile.role[locale]} — ${shared.profile.location[locale]}. ${content.home.lead}\n\n## ${locale === 'de' ? 'Profil' : 'Profile'}\n\n${content.profile.intro}\n\n${content.profile.principle}\n\n## ${locale === 'de' ? 'Fachgebiete' : 'Expertise'}\n\n${areas}\n\n## ${locale === 'de' ? 'Berufserfahrung' : 'Experience'}\n\n${experience}\n\n## ${locale === 'de' ? 'Projektergebnisse' : 'Selected outcomes'}\n\n${outcomes}\n\n## ${locale === 'de' ? 'Zertifizierungen' : 'Certifications'}\n\n${credentials}\n\n## ${locale === 'de' ? 'Sprachen' : 'Languages'}\n\n${languageLinks}\n\n## ${locale === 'de' ? 'Kontakt' : 'Contact'}\n\n${contactNote}\n\n## ${locale === 'de' ? 'Portfolio-Seiten' : 'Portfolio pages'}\n\n${routeDefinitions.map(route => `- ${content[route.id].title}: ${site.origin}${routePath(route.id, locale)}`).join('\n')}\n`;
}

function buildLlmsIndex() {
  const routes = routeDefinitions.flatMap(route => locales.map(locale => `- [${locale.toUpperCase()} — ${locale === 'de' ? 'Deutsch' : 'English'} — ${route.id}](${site.origin}${routePath(route.id, locale)})`)).join('\n');
  return `# ${site.name}\n\n> Bilingual portfolio for ${shared.profile.role.en} Hamza Hedhly, based in Düsseldorf, Germany. German is the default language; English pages are available at /en/.\n\nThe static HTML pages include the full portfolio content, with canonical URLs, language alternates and structured Person/WebSite/WebPage metadata. Use the relevant page below as the source for professional history and project claims. The contact address is omitted until a visitor activates the reveal control.\n\n## Portfolio\n\n${routes}\n\n## Text indexes\n\n- [German text index](${site.origin}/index.txt): expertise, experience, project outcomes and certifications in the default language.\n- [English text index](${site.origin}/en/index.txt): English version of the portfolio text index.\n`;
}

function validateContent(contents) {
  compareKeys(contents.de, contents.en);
  assert(locales.includes(site.defaultLocale), 'default locale must be supported');
  assert(site.availability === 'explore' || site.availability === 'for-hire', 'availability flag must be explore or for-hire');
  for (const locale of locales) {
    for (const route of routeDefinitions) {
      assert(contents[locale][route.id]?.title, `${locale}/${route.id} needs a page title`);
      assert(contents[locale][route.id]?.description, `${locale}/${route.id} needs a meta description`);
    }
    assert(contents[locale].explore.menu.length === contents.en.explore.menu.length, `${locale} menu item count must match`);
    assert(contents[locale].explore.menu.map(item => item.id).join() === contents.en.explore.menu.map(item => item.id).join(), `${locale} menu routes must match`);
  }
  for (const entry of [...shared.expertise, ...shared.experience, ...shared.outcomes]) {
    for (const field of ['title', 'summary', 'role', 'focus', 'details']) {
      if (entry[field] && typeof entry[field] === 'object') {
        assert(entry[field].de && entry[field].en, `${entry.id || entry.start}.${field} needs German and English`);
      }
    }
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(target('assets/css'), { recursive: true });
await mkdir(target('assets/js'), { recursive: true });

const contents = {
  de: await readJson('src/content/de.json'),
  en: await readJson('src/content/en.json'),
};
validateContent(contents);

const cssBytes = Buffer.from(`${await readFile(source('src/styles/tokens.css'), 'utf8')}\n${await readFile(source('src/styles/terminal.css'), 'utf8')}`);
const javascript = new Map([
  ['theme-bootstrap', 'src/runtime/theme-init.js'],
  ['theme', 'src/runtime/theme.js'],
  ['menu', 'src/runtime/menu.js'],
  ['contact', 'src/runtime/contact.js'],
  ['contact-address', 'src/runtime/contact-address.mjs'],
]);
const assets = { css: `/assets/css/site.${fingerprint(cssBytes)}.css` };
await writeFileAt(target(assets.css.slice(1)), cssBytes);
for (const [key, path] of javascript) {
  const bytes = await readFile(source(path));
  const extension = path.endsWith('.mjs') ? 'mjs' : 'js';
  const outputKey = key === 'theme-bootstrap' ? 'themeInit' : key === 'contact-address' ? 'contactAddress' : key;
  assets[outputKey] = `/assets/js/${key}.${fingerprint(bytes)}.${extension}`;
  await writeFileAt(target(assets[outputKey].slice(1)), bytes);
}

for (const path of ['brand-avatar.png', 'my-avatar.png', 'og-de.png', 'og-editorial.png', 'logo-kubernetes.svg', 'logo-terraform.svg', 'logo-aws.png']) {
  await cp(source(`assets/images/${path}`), target(`assets/images/${path}`));
}

for (const locale of locales) {
  const content = { ...contents[locale], contact: { ...contents[locale].contact, addressModule: assets.contactAddress } };
  for (const route of routeDefinitions) {
    const html = route.id === 'home'
      ? renderHome({ locale, content, assets })
      : renderDocument({ routeId: route.id, locale, content, assets });
    await writeFileAt(target(outputFile(route.id, locale)), html);
  }
}

const defaultContent = { ...contents[site.defaultLocale], contact: { ...contents[site.defaultLocale].contact, addressModule: assets.contactAddress } };
await writeFileAt(target('index.html'), renderHome({ locale: site.defaultLocale, content: defaultContent, assets, isRoot: true }));
await writeFileAt(target('404.html'), renderHomeNotFound({ locale: site.defaultLocale, content: defaultContent, assets }));
await cp(source('public/robots.txt'), target('robots.txt'));
await cp(source('public/_redirects'), target('_redirects'));
await cp(source('public/_headers'), target('_headers'));
await writeFileAt(target('sitemap.xml'), buildSitemap());
await writeFileAt(target('index.txt'), buildTextIndex(contents, 'de'));
await writeFileAt(target('de/index.txt'), buildTextIndex(contents, 'de'));
await writeFileAt(target('en/index.txt'), buildTextIndex(contents, 'en'));
await writeFileAt(target('llms.txt'), buildLlmsIndex());

const builtFiles = (await readdir(dist, { recursive: true })).length;
console.log(`Built ${routeDefinitions.length * locales.length} localized pages and ${builtFiles} static files in dist/.`);
console.log(`Default locale: ${site.defaultLocale}; default theme: ${site.defaultTheme}; availability: ${site.availability}.`);
