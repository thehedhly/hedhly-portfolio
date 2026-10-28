import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import test, { after, before } from 'node:test';
import { routeDefinitions, routePath } from '../src/routes.mjs';
import { site } from '../src/config/site.mjs';

const root = new URL('../', import.meta.url).pathname;
const dist = new URL('../dist/', import.meta.url).pathname;
const read = async path => readFile(`${dist}${path}`, 'utf8');

async function availablePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise(resolve => server.close(resolve));
  return port;
}

let serverProcess;
let origin;
before(async () => {
  const port = await availablePort();
  origin = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, ['scripts/serve.mjs', '--host', '127.0.0.1', '--port', String(port)], { cwd: root, stdio: 'ignore' });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fetch(origin);
      break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  }
});
after(() => serverProcess?.kill('SIGTERM'));

test('build emits every German-default and English static route', async () => {
  for (const route of routeDefinitions) {
    for (const locale of ['de', 'en']) {
      const path = routePath(route.id, locale);
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 200, `${locale}/${route.id}`);
      const html = await response.text();
      assert.match(html, new RegExp(`<html lang="${locale}"`));
      assert.ok(html.includes(`<link rel="canonical" href="${site.origin}${path}">`), path);
      assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${site.origin}${routePath(route.id, 'de')}">`), `${path} x-default`);
      const socialImage = locale === 'de' ? 'og-de.png' : 'og-editorial.png';
      assert.ok(html.includes(`<meta property="og:image" content="${site.origin}/assets/images/${socialImage}">`), `${path} social image`);
      assert.match(html, /rel="icon" type="image\/png" href="\/assets\/images\/brand-avatar\.png"/);
      assert.match(html, /type="application\/ld\+json"/);
      assert.match(html, /data-theme-choice/);
      if (route.id !== 'home') {
        assert.match(html, /data-contact/);
        assert.match(html, /data-address-module="\/assets\/js\/contact-address\.[a-f0-9]{12}\.mjs"/);
      }
      assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[a-z]{2,}|mailto:/i);
    }
  }
});

test('redirect, robots, sitemap, AI text guide and response headers are present', async () => {
  const rootResponse = await fetch(origin, { redirect: 'manual' });
  assert.equal(rootResponse.status, 301);
  assert.equal(rootResponse.headers.get('location'), '/de/');

  const robots = await read('robots.txt');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Sitemap: https:\/\/hedhly\.com\/sitemap\.xml/);

  const sitemap = await read('sitemap.xml');
  assert.equal((sitemap.match(/<url>/g) || []).length, routeDefinitions.length * 2);
  for (const route of routeDefinitions) {
    assert.ok(sitemap.includes(`${site.origin}${routePath(route.id, 'de')}`));
    assert.ok(sitemap.includes(`${site.origin}${routePath(route.id, 'en')}`));
  }
  assert.match(sitemap, /hreflang="x-default" href="https:\/\/hedhly\.com\/de\/"/);
  assert.match(await read('index.html'), /<link rel="canonical" href="https:\/\/hedhly\.com\/de\/">/);
  assert.match(await read('llms.txt'), /^# Hamza Hedhly/m);
  assert.match(await read('index.txt'), /## Projektergebnisse/);
  assert.match(await read('en/index.txt'), /## Selected outcomes/);
  assert.doesNotMatch(await read('index.txt'), /[\w.+-]+@[\w-]+\.[a-z]{2,}|mailto:/i);
  assert.doesNotMatch(await read('en/index.txt'), /[\w.+-]+@[\w-]+\.[a-z]{2,}|mailto:/i);

  const home = await read('de/index.html');
  const cssPath = home.match(/href="([^"]+\.css)"/)[1];
  const cssResponse = await fetch(`${origin}${cssPath}`);
  assert.equal(cssResponse.status, 200);
  assert.match(cssResponse.headers.get('cache-control'), /immutable/);
  assert.match(cssResponse.headers.get('content-security-policy'), /object-src 'none'/);
});

test('missing URLs return the German 404 page and a 404 status', async () => {
  const response = await fetch(`${origin}/missing-page/`);
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Seite nicht gefunden\./);
});

test('public build contains no literal email address', async () => {
  const files = await readdir(dist, { recursive: true });
  for (const relative of files) {
    const path = `${dist}${relative}`;
    if (!(await stat(path)).isFile() || !/\.(html|txt|xml|json|js|mjs|css)$/.test(relative)) continue;
    assert.doesNotMatch((await readFile(path)).toString('utf8'), /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, relative);
  }
});

test('each localized route has one page heading and no repeated ids', async () => {
  for (const route of routeDefinitions) {
    for (const locale of ['de', 'en']) {
      const path = routePath(route.id, locale).replace(/^\//, '') + 'index.html';
      const html = await read(path);
      assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(new Set(ids).size, ids.length, `${path} repeats an id`);
    }
  }
  assert.equal((await stat(`${dist}404.html`)).isFile(), true);
});

test('structured data parses and local links point to generated routes or assets', async () => {
  for (const route of routeDefinitions) {
    for (const locale of ['de', 'en']) {
      const sourcePath = routePath(route.id, locale);
      const html = await read(`${sourcePath.slice(1)}index.html`);
      const schemaText = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
      assert.ok(schemaText, `${sourcePath} has JSON-LD`);
      const schema = JSON.parse(schemaText);
      assert.ok(schema['@graph'].some(entity => entity['@type'] === 'Person'));

      for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
        if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(href)) continue;
        const url = new URL(href, `${origin}${sourcePath}`);
        const relative = url.pathname.endsWith('/') ? `${url.pathname.slice(1)}index.html` : url.pathname.slice(1);
        assert.equal((await stat(`${dist}${relative}`)).isFile(), true, `${sourcePath} links to missing ${href}`);
      }
    }
  }
});

test('homepage keeps the legacy summary anchors as real sections in both languages', async () => {
  for (const locale of ['de', 'en']) {
    const html = await read(`${locale}/index.html`);
    for (const id of ['top', 'main', 'expertise', 'experience', 'outcomes', 'certifications', 'contact']) {
      assert.match(html, new RegExp(`<(?:section|div|main)[^>]* id="${id}"`), `${locale} #${id}`);
    }
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${locale} home h1`);
  }
});

test('every fragment link resolves to an id on its target page', async () => {
  const files = (await readdir(dist, { recursive: true })).filter(file => file.endsWith('.html'));
  const missing = [];
  for (const file of files) {
    const html = await read(file);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.includes('#') || /^(?:https?:|mailto:|tel:)/i.test(href)) continue;
      const [pathPart, fragment] = href.split('#');
      if (!fragment) continue;
      const target = pathPart === '' ? file : pathPart.replace(/^\//, '').replace(/\/$/, '/index.html').replace(/^$/, 'index.html');
      const targetHtml = pathPart === '' ? html : await read(target).catch(() => '');
      if (!new RegExp(` id="${fragment}"`).test(targetHtml)) missing.push(`${file} -> ${href}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('migrated evidence appears in the built German and English pages', async () => {
  const { shared } = await import('../src/content/shared.mjs');
  for (const locale of ['de', 'en']) {
    const home = await read(`${locale}/index.html`);
    const experience = await read(`${locale}/explore/experience/index.html`);
    const platform = await read(`${locale}/explore/platform/index.html`);
    for (const outcome of shared.outcomes) {
      const title = outcome.title[locale].replace(/&/g, '&amp;');
      assert.ok(home.includes(title), `${locale} home lists outcome ${outcome.title[locale]}`);
    }
    for (const credential of shared.credentials) {
      assert.ok(home.includes(credential.name), `${locale} home lists ${credential.name}`);
      assert.ok(experience.includes(credential.name), `${locale} experience lists ${credential.name}`);
    }
    for (const entry of shared.experience) {
      assert.ok(experience.includes(`datetime="${entry.start}"`), `${locale} experience starts ${entry.start}`);
    }
    assert.ok(platform.includes('id="outcomes"'), `${locale} platform outcomes`);
  }
});

test('English certification copy names AWS, not Azure', async () => {
  const en = JSON.parse(await readFile(new URL('../src/content/en.json', import.meta.url), 'utf8'));
  assert.match(en.home.certSummary, /AWS/);
  assert.match(en.experience.certIntro, /AWS/);
  assert.doesNotMatch(en.experience.certIntro, /Azure/);
});

test('interaction markup works under the CSP: no inline style attributes, typed commands and toggles where expected', async () => {
  const files = (await readdir(dist, { recursive: true })).filter(file => file.endsWith('.html'));
  for (const file of files) {
    const html = await read(file);
    assert.doesNotMatch(html, / style="/, `${file} has an inline style attribute`);
    assert.doesNotMatch(html, /home\.[a-f0-9]{12}\.js/, `${file} references the removed home script`);
  }
  for (const locale of ['de', 'en']) {
    const explore = await read(`${locale}/explore/index.html`);
    assert.match(explore, /data-shortcut-toggle[^>]* hidden>/, `${locale} explore toggle starts hidden`);
    assert.doesNotMatch(explore, /data-typed/, `${locale} overview does not type`);
    const platform = await read(`${locale}/explore/platform/index.html`);
    assert.match(platform, /<span class="cmd-typed" data-typed>cat platform\.md<\/span>/, `${locale} platform command`);
  }
});

test('runtime scripts parse as classic scripts', async () => {
  const vm = await import('node:vm');
  for (const name of ['theme-init', 'theme', 'menu', 'contact']) {
    const source = await readFile(new URL(`../src/runtime/${name}.js`, import.meta.url), 'utf8');
    assert.doesNotThrow(() => new vm.Script(source), name);
  }
});

test('profile page has its own contact section with the reveal control', async () => {
  for (const locale of ['de', 'en']) {
    const html = await read(`${locale}/explore/profile/index.html`);
    assert.match(html, /<section class="document-section" id="profile-contact">/, `${locale} profile contact section`);
    assert.match(html, /id="profile-contact-reveal" data-contact/, `${locale} profile reveal`);
    assert.doesNotMatch(html, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, `${locale} profile has no literal address`);
  }
});

test('not-found page is noindex, bilingual and carries no canonical or structured data', async () => {
  const html = await read('404.html');
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.doesNotMatch(html, /application\/ld\+json/);
  assert.match(html, /Seite nicht gefunden/);
  assert.match(html, /Page not found/);
});

test('light theme text colours meet 4.5:1 on the light canvas', async () => {
  const css = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
  const light = css.slice(css.indexOf('ayu-light"]'));
  const value = name => light.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  const luminance = hex => {
    const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const canvas = value('ayu-bg');
  assert.ok(canvas, 'light canvas is defined');
  for (const name of ['prompt', 'link', 'menu-accent']) {
    const hex = light.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
    assert.ok(hex, `${name} is a hex value`);
    assert.ok(ratio(hex, canvas) >= 4.5, `${name} ${hex} is ${ratio(hex, canvas).toFixed(2)}:1`);
  }
  const label = light.match(/--action-label:\s*(#[0-9a-fA-F]{6})/)[1];
  const fill = light.match(/--action-wash:\s*var\(--ayu-yellow\)/) ? value('ayu-yellow') : null;
  assert.ok(fill, 'action fill is the exact Ayu Light yellow');
  assert.ok(ratio(label, fill) >= 4.5, `action label on yellow ${ratio(label, fill).toFixed(2)}:1`);
});
