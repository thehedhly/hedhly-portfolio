import { routePath } from './routes.mjs';
import { shared } from './content/shared.mjs';
import { site } from './config/site.mjs';

const recordValue = (value, locale) => typeof value === 'string' ? value : value[locale];
const assetUrl = path => path;

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

const attrs = values => Object.entries(values)
  .filter(([, value]) => value !== false && value != null)
  .map(([name, value]) => value === true ? name : `${name}="${escapeHtml(value)}"`)
  .join(' ');

const link = (href, label, options = {}) =>
  `<a ${attrs({ href, ...options })}>${label}</a>`;

function topbar(locale, routeId, ui, theme) {
  const isHome = routeId === 'home';
  const localeRoute = routeId === 'notFound' ? 'home' : routeId;
  return `<a class="skip-link" href="#main">${escapeHtml(ui.skip)}</a>
  <header class="terminal-bar${isHome ? ' terminal-bar--entry' : ''}" aria-label="${escapeHtml(ui.topbar)}">
    ${!isHome ? link(routePath('home', locale), '<span>hamza@hedhly:~/explore$</span><span aria-hidden="true"> _</span>', { class: 'terminal-brand', 'aria-label': ui.home }) : ''}
    <div class="terminal-controls">
      <label class="visually-hidden" for="theme-choice">${escapeHtml(ui.theme)}</label>
      <select class="theme-choice" data-theme-choice id="theme-choice" aria-label="${escapeHtml(ui.theme)}" disabled>
        <option value="ayu-dark"${theme === 'ayu-dark' ? ' selected' : ''}>${escapeHtml(ui.darkTheme)}</option>
        <option value="ayu-light"${theme === 'ayu-light' ? ' selected' : ''}>${escapeHtml(ui.lightTheme)}</option>
      </select>
      <nav class="language-switch" aria-label="${escapeHtml(ui.language)}">
        ${['de', 'en'].map(language => link(routePath(localeRoute, language), language.toUpperCase(), {
    class: 'language-link', lang: language, hreflang: language,
    'aria-current': language === locale ? 'page' : false,
    title: language === 'de' ? 'Deutsch' : 'English',
  })).join('<span class="language-divider" aria-hidden="true">/</span>')}
      </nav>
      ${!isHome ? link(routePath('home', locale), '&lt; EXIT', { class: 'exit-link', 'aria-label': ui.exit }) : ''}
    </div>
  </header>`;
}

function emailReveal(locale, c, contact, options = {}) {
  const id = options.id || `contact-${locale}`;
  return `<div class="contact-reveal" id="${escapeHtml(id)}" data-contact ${attrs({
    'data-address-module': contact.addressModule,
    'data-reveal-error': contact.failed,
    'data-reveal-status': contact.revealed,
    'data-copy-success': contact.copied,
    'data-copy-error': contact.copyError,
  })}>
    <p class="contact-reveal__initial" data-address-prompt><span>${escapeHtml(c.emailPrompt || c.contactLabel)} </span><button class="text-action" data-reveal-address type="button">${escapeHtml(contact.reveal)}</button></p>
    <div class="contact-reveal__result" data-address-result hidden>
      <span class="email-address" data-address-text aria-label="${escapeHtml(contact.contactLabel)}"></span>
      <button class="text-action" data-copy-address type="button">${escapeHtml(contact.copy)}</button>
      <a class="text-action" data-email-link hidden>${escapeHtml(contact.emailLink)} <span aria-hidden="true">↗</span></a>
    </div>
    <div class="contact-reveal__error" data-address-error hidden>
      <span data-address-error-text>${escapeHtml(contact.failed)}</span>
      <button class="text-action" data-retry-address type="button">${escapeHtml(contact.retry)}</button>
    </div>
    <p class="visually-hidden" data-address-status role="status" aria-live="polite" aria-atomic="true"></p>
    <noscript><p class="noscript-contact">${escapeHtml(contact.noScript)} ${link(shared.social[0].href, escapeHtml(contact.linkedin), { rel: 'noopener noreferrer' })}</p></noscript>
  </div>`;
}

function sectionCommand(command) {
  return `<p class="command-line"><span class="command-prompt">hamza@hedhly:~/explore$</span> <span>${escapeHtml(command)}</span></p>`;
}

function markdownHeading(level, text, attributes = {}) {
  return `<h${level} ${attrs(attributes)}><span class="markdown-marker" aria-hidden="true">${'#'.repeat(level)} </span>${escapeHtml(text)}</h${level}>`;
}

function technologies(items, locale) {
  return `<p class="technology-line"><span>${locale === 'de' ? 'Technologien' : 'Technologies'}:</span> ${items.map(escapeHtml).join(', ')}</p>`;
}

function capabilityList(locale, sectionId) {
  return `<ul class="capability-list">${shared.expertise.filter(item => item.section === sectionId).map(item => `<li>
    ${markdownHeading(3, recordValue(item.title, locale))}
    <p>${escapeHtml(recordValue(item.summary, locale))}</p>
    ${technologies(item.tags, locale)}
  </li>`).join('')}</ul>`;
}

function experienceList(locale, copy) {
  return `<ol class="experience-list">${shared.experience.map(entry => `<li>
    ${markdownHeading(3, `${recordValue(entry.role, locale)} — ${recordValue(entry.focus, locale)}`)}
    <p class="experience-date"><time datetime="${entry.start}">${entry.start.replace('-', '/')}</time> – ${entry.end ? `<time datetime="${entry.end}">${entry.end.replace('-', '/')}</time>` : escapeHtml(copy.present)}</p>
    <p>${escapeHtml(recordValue(entry.details, locale))}</p>
  </li>`).join('')}</ol>`;
}

function credentials() {
  return `<ul class="credential-list">${shared.credentials.map(item => `<li>${link(item.url,
    `<span class="link-marker" aria-hidden="true">[EXT]</span> ${escapeHtml(item.name)}`,
    { rel: 'noopener noreferrer', target: '_blank' })}<span class="credential-provider"> — ${escapeHtml(item.provider)}</span></li>`).join('')}</ul>`;
}

function socialLinks() {
  return `<ul class="resource-links">${shared.social.map(item => `<li>${link(item.href,
    `<span class="link-marker" aria-hidden="true">[EXT]</span> ${escapeHtml(item.name)}`,
    { rel: 'noopener noreferrer' })}</li>`).join('')}</ul>`;
}

function menu(locale, copy, activeId) {
  return `<div class="menu-region" data-menu data-overview-url="${routePath('explore', locale)}" tabindex="-1">
    <p class="visually-hidden" id="shortcut-help">${escapeHtml(copy.shortcutHelp)}</p>
    <ol class="terminal-menu">${copy.menu.map((item, index) => link(routePath(item.id, locale),
    `<span class="menu-number" aria-hidden="true">[${index + 1}]</span><span>${escapeHtml(item.label)}</span>`, {
      class: `menu-link${activeId === item.id ? ' menu-link--current' : ''}`,
      'data-document-id': item.id,
      'aria-current': activeId === item.id ? 'page' : false,
      'aria-describedby': 'shortcut-help',
      'aria-keyshortcuts': String(index + 1),
    })).map(markup => `<li>${markup}</li>`).join('')}</ol>
  </div>`;
}

function documentBody(locale, routeId, content) {
  const page = content[routeId];
  const menuItem = content.explore.menu.find(item => item.id === routeId);
  let details = '';
  if (routeId === 'platform') {
    details = `<section class="document-section">${markdownHeading(2, page.skillsHeading)}${capabilityList(locale, 'platform')}</section>
      <section class="document-section" id="outcomes">${markdownHeading(2, page.outcomesHeading)}
        ${markdownHeading(3, recordValue(shared.outcomes[0].title, locale))}<p>${escapeHtml(page.project1)}</p>
        ${markdownHeading(3, recordValue(shared.outcomes[1].title, locale))}<p>${escapeHtml(page.project2)}</p>
      </section>
      <nav class="document-links" aria-label="${escapeHtml(page.moreHeading)}">
        ${link(routePath('automation', locale), escapeHtml(page.moreAutomation))}
        ${link(routePath('experience', locale), escapeHtml(page.moreExperience))}
      </nav>`;
  } else if (routeId === 'automation') {
    details = `<section class="document-section">${markdownHeading(2, page.skillsHeading)}${capabilityList(locale, 'automation')}</section>
      <section class="document-section" id="outcomes">${markdownHeading(2, page.outcomesHeading)}
        ${markdownHeading(3, recordValue(shared.outcomes[2].title, locale))}<p>${escapeHtml(page.project)}</p>
      </section>
      <nav class="document-links" aria-label="${escapeHtml(page.relatedHeading)}">
        ${link(routePath('platform', locale), escapeHtml(page.platformLink))}
        ${link(routePath('experience', locale), escapeHtml(page.experienceLink))}
      </nav>`;
  } else if (routeId === 'experience') {
    details = `<section class="document-section">${markdownHeading(2, page.timelineHeading)}${experienceList(locale, page)}</section>
      <section class="document-section">${markdownHeading(2, page.principleHeading)}<p>${escapeHtml(page.principle)}</p></section>
      <section class="document-section" id="certifications">${markdownHeading(2, page.certHeading)}<p>${escapeHtml(page.certIntro)}</p>${credentials()}</section>
      <nav class="document-links" aria-label="${escapeHtml(page.timelineHeading)}">
        ${link(`${routePath('platform', locale)}#outcomes`, escapeHtml(page.outcomesLink))}
        ${link(routePath('automation', locale), escapeHtml(page.automationLink))}
      </nav>`;
  } else if (routeId === 'profile') {
    details = `<p>${escapeHtml(shared.profile.role[locale])} / ${escapeHtml(shared.profile.location[locale])}</p>
      <section class="document-section">${markdownHeading(2, page.principleHeading)}<p>${escapeHtml(page.principle)}</p></section>
      <section class="document-section">${markdownHeading(2, page.expertiseHeading)}${technologies(shared.profile.knowsAbout, locale)}</section>
      <section class="document-section">${markdownHeading(2, page.socialHeading)}${socialLinks()}<p>${escapeHtml(page.locationLabel)}: ${escapeHtml(shared.profile.location[locale])}</p></section>
      <nav class="document-links" aria-label="${escapeHtml(page.linksHeading)}">
        ${link(routePath('experience', locale), escapeHtml(content.experience.timelineHeading))}
        ${link(routePath('platform', locale), escapeHtml(content.platform.heading))}
      </nav>`;
  }
  return `<article class="document-output" aria-labelledby="document-heading">
    ${sectionCommand(`cat ${menuItem.file}`)}
    <div class="document-copy">
      ${markdownHeading(1, page.heading, { id: 'document-heading' })}
      <p>${escapeHtml(page.intro)}</p>
      ${details}
      ${link(routePath('explore', locale), `← ${escapeHtml(content.ui.backToMenu)}`, { class: 'back-to-menu', 'data-menu-reset': true })}
    </div>
  </article>`;
}

function exploreBody(locale, content, activeId = null) {
  const copy = content.explore;
  return `<main id="main" tabindex="-1" class="terminal-screen" data-terminal>
    <div data-overview-heading>${!activeId ? `<h1 class="visually-hidden">${escapeHtml(site.name)} — ${escapeHtml(shared.profile.role[locale])}</h1>` : ''}</div>
    <section class="intro-block" aria-label="${escapeHtml(site.name)}">
      ${sectionCommand(copy.command)}
      <div class="terminal-output">
        <p class="intro-copy">${escapeHtml(copy.intro)}</p>
        ${emailReveal(locale, { emailPrompt: copy.emailPrompt }, content.contact, { id: 'terminal-contact' })}
      </div>
    </section>
    <section class="menu-block" aria-labelledby="menu-heading">
      ${sectionCommand(copy.menuCommand)}
      <div class="terminal-output">
        <h2 class="menu-heading" id="menu-heading">${escapeHtml(copy.menuHeading)}</h2>
        ${menu(locale, copy, activeId)}
      </div>
    </section>
    <div data-document-region>${activeId ? documentBody(locale, activeId, content) : ''}</div>
    <p class="terminal-ready" aria-hidden="true"><span class="command-prompt">hamza@hedhly:~/explore$</span> <span class="cursor">▊</span></p>
    <p class="visually-hidden" data-navigation-status role="status" aria-live="polite" data-loading="${escapeHtml(content.ui.documentLoading)}" data-opened="${escapeHtml(content.ui.documentOpened)}" data-closed="${escapeHtml(content.ui.menuRestored)}"></p>
  </main>`;
}

function homeBody(locale, content) {
  const copy = content.home;
  const hiring = site.availability === 'for-hire';
  const legacyRoutes = [
    ['expertise', 'platform', content.platform.heading],
    ['experience', 'experience', content.experience.timelineHeading],
    ['outcomes', 'platform', copy.outcomesHeading, '#outcomes'],
    ['certifications', 'experience', copy.certHeading, '#certifications'],
    ['contact', 'profile', copy.profileLink],
  ];
  // CTA and status text are controlled by site.availability in src/config/site.mjs
  return `<main id="main" tabindex="-1" class="entry-screen">
    <div class="entry-content" id="top">
      <p class="entry-status"><span class="status-dot" aria-hidden="true"></span>${escapeHtml(hiring ? copy.statusHire : copy.statusExplore)}</p>
      <h1>${escapeHtml(site.name)}<span class="entry-cursor" aria-hidden="true">▊</span></h1>
      <p class="entry-role">${escapeHtml(shared.profile.role[locale])} · ${escapeHtml(shared.profile.locationName)}</p>
      <p class="entry-lead">${escapeHtml(copy.lead)}</p>
      ${link(routePath('explore', locale), `<span aria-hidden="true">→</span> ${escapeHtml(hiring ? copy.hireCta : copy.explore)}`, {
    class: 'entry-action', 'aria-label': hiring ? copy.hireLabel : copy.exploreLabel,
  })}
      ${link(routePath('profile', locale), escapeHtml(copy.profileLink), { class: 'entry-secondary' })}
    </div>
    <nav class="legacy-anchor-links" aria-label="${escapeHtml(content.ui.continue)}">${legacyRoutes.map(([id, route, label, hash = '']) => link(`${routePath(route, locale)}${hash}`, escapeHtml(label), { id, 'data-legacy-link': true })).join('')}</nav>
  </main>`;
}

function notFoundBody(locale, content) {
  return `<main id="main" class="terminal-screen" tabindex="-1">
    ${sectionCommand('cat 404.md')}
    <div class="document-copy">
      ${markdownHeading(1, locale === 'de' ? 'Seite nicht gefunden.' : 'Page not found.')}
      <p>${escapeHtml(locale === 'de' ? 'Diese Datei ist in diesem Portfolio nicht vorhanden.' : 'This file is not part of the portfolio.')}</p>
      <nav class="document-links" aria-label="${escapeHtml(content.ui.language)}">
        ${link(routePath('home', 'de'), 'Deutsch →')}
        ${link(routePath('home', 'en'), 'English →')}
      </nav>
    </div>
  </main>`;
}

function personEntity(locale) {
  return {
    '@type': 'Person',
    '@id': shared.personId,
    name: site.name,
    jobTitle: shared.profile.role[locale],
    description: shared.profile.summary[locale],
    url: `${site.origin}${routePath('profile', locale)}`,
    image: `${site.origin}${shared.image}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: shared.profile.locationName,
      addressCountry: shared.profile.countryCode,
    },
    sameAs: shared.profile.sameAs,
    knowsAbout: shared.profile.knowsAbout,
  };
}

function structuredData(routeId, locale, currentUrl, title) {
  const person = personEntity(locale);
  const pageType = routeId === 'profile'
    ? 'ProfilePage'
    : routeId === 'home'
      ? 'WebPage'
      : routeId === 'explore'
        ? 'CollectionPage'
        : 'WebPage';
  const page = {
    '@type': pageType,
    '@id': `${currentUrl}#webpage`,
    url: currentUrl,
    name: title,
    inLanguage: locale,
    isPartOf: { '@id': `${site.origin}/#website` },
    about: { '@id': shared.personId },
  };
  if (routeId === 'profile') page.mainEntity = { '@id': shared.personId };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${site.origin}/#website`,
        url: `${site.origin}/`,
        name: site.name,
        inLanguage: ['de', 'en'],
      },
      person,
      page,
    ],
  };
}

function languageAlternates(routeId) {
  const canonicalRoute = routeId === 'notFound' ? 'home' : routeId;
  const entries = [
    ['de', `${site.origin}${routePath(canonicalRoute, 'de')}`],
    ['en', `${site.origin}${routePath(canonicalRoute, 'en')}`],
    ['x-default', `${site.origin}${routePath(canonicalRoute, 'de')}`],
  ];
  const links = entries.map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}">`).join('\n    ');
  return links;
}

function documentHead({ routeId, locale, canonicalPath, title, description, assets, isRoot = false, noindex = false }) {
  const canonical = `${site.origin}${canonicalPath}`;
  const image = `${site.origin}${locale === 'de' ? '/assets/images/og-de.png' : '/assets/images/og-editorial.png'}`;
  const imageAlt = locale === 'de'
    ? 'Hamza Hedhly, DevSecOps und Azure Cloud Engineer in Düsseldorf'
    : 'Hamza Hedhly, DevSecOps and Azure Cloud Engineer in Düsseldorf';
  const person = structuredData(routeId, locale, canonical, title);
  const serializedSchema = JSON.stringify(person).replace(/</g, '\\u003c');
  const ogLocale = locale === 'de' ? 'de_DE' : 'en_US';

  return `<!doctype html>
<html lang="${locale}" data-theme="ayu-dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="dark light">
  <meta name="theme-color" content="${locale === 'de' ? '#0b0e14' : '#0b0e14'}" data-theme-color>
  <meta name="author" content="${escapeHtml(site.name)}">
  <meta name="description" content="${escapeHtml(description)}">
  ${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${canonical}">
  ${languageAlternates(routeId)}
  <link rel="icon" type="image/png" href="/assets/images/brand-avatar.png">
  <link rel="preload" href="${assets.css}" as="style">
  <link rel="stylesheet" href="${assets.css}">
  <script src="${assets.themeInit}" data-theme-bootstrap></script>
  <meta property="og:type" content="${routeId === 'profile' ? 'profile' : 'website'}">
  <meta property="og:site_name" content="${escapeHtml(site.name)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${ogLocale}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:secure_url" content="${image}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <script type="application/ld+json">${serializedSchema}</script>
</head>`;
}

export function renderDocument({ routeId, locale, content, assets, theme = site.defaultTheme }) {
  if (routeId === 'home') return renderHome({ locale, content, assets, theme });
  if (!['explore', 'platform', 'automation', 'experience', 'profile'].includes(routeId)) throw new Error(`Unknown document: ${routeId}`);
  return `${documentHead({ routeId, locale, canonicalPath: routePath(routeId, locale), title: content[routeId].title, description: content[routeId].description, assets })}
<body data-page="${routeId}" data-locale="${locale}" data-availability="${site.availability}">
  ${topbar(locale, routeId, content.ui, theme)}
  ${exploreBody(locale, content, routeId === 'explore' ? null : routeId)}
  <script src="${assets.theme}" defer></script>
  <script src="${assets.menu}" defer></script>
  <script src="${assets.contact}" defer></script>
</body>
</html>`;
}

export function renderHome({ locale, content, assets, theme = site.defaultTheme, isRoot = false }) {
  const markup = `${documentHead({ routeId: 'home', locale, canonicalPath: routePath('home', locale), title: content.home.title, description: content.home.description, assets })}
<body data-page="home" data-locale="${locale}" data-availability="${site.availability}">
  ${topbar(locale, 'home', content.ui, theme)}
  ${homeBody(locale, content)}
  <script src="${assets.theme}" defer></script>
  <script src="${assets.home}" defer></script>
</body>
</html>`;
  if (!isRoot) return markup;
  return markup
    .replace('<head>', '<head>\n  <meta http-equiv="refresh" content="0; url=/de/">');
}

export function renderHomeNotFound({ locale, content, assets }) {
  const title = locale === 'de' ? 'Seite nicht gefunden | Hamza Hedhly' : 'Page not found | Hamza Hedhly';
  return `${documentHead({ routeId: 'notFound', locale, canonicalPath: routePath('home', locale), title, description: title, assets, noindex: true })}
<body data-page="notFound" data-locale="${locale}">
  ${topbar(locale, 'notFound', content.ui, site.defaultTheme)}
  ${notFoundBody(locale, content)}
  <script src="${assets.theme}" defer></script>
</body>
</html>`;
}
