import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const dist = join(root, 'dist');
const development = process.argv.includes('--dev');
const getOption = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1] || fallback;
};
const host = getOption('--host', '127.0.0.1');
const port = Number(getOption('--port', '4173'));
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.mjs', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'], ['.ico', 'image/x-icon'], ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'], ['.md', 'text/markdown; charset=utf-8'],
]);

try {
  await access(dist);
} catch {
  console.error('No dist/ directory found. Run `npm run build` first.');
  process.exit(1);
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  if (pathname === '/' || pathname === '/index.html') {
    response.writeHead(301, { Location: '/de/' }).end();
    return;
  }
  if (pathname === '/error.html') {
    response.writeHead(301, { Location: '/404.html' }).end();
    return;
  }
  if (['/de', '/en'].includes(pathname)) {
    response.writeHead(301, { Location: `${pathname}/` }).end();
    return;
  }

  const trailingPath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const relativePath = normalize(trailingPath).replace(/^([/\\])+/, '');
  const path = resolve(dist, relativePath);
  if (path !== dist && !path.startsWith(`${dist}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let file = path;
  let status = 200;
  try {
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
  } catch {
    status = 404;
    file = join(dist, '404.html');
  }

  const extension = extname(file).toLowerCase();
  const headers = {
    'Content-Type': mimeTypes.get(extension) || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
    'Cache-Control': /\.[a-f0-9]{12}\.(css|js|mjs)$/.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache',
  };
  if (file.endsWith('/index.txt')) headers['X-Robots-Tag'] = 'noindex';
  try {
    const { size } = await stat(file);
    headers['Content-Length'] = size;
    response.writeHead(status, headers);
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(500).end('Unable to read file');
  }
});

server.listen(port, host, () => {
  console.log(`${development ? 'Development' : 'Preview'} server listening at http://${host}:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
