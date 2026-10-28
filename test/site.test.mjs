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
