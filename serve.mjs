// Local preview of dist/ with no dependencies: `node serve.mjs`
// Runs the same middleware as Cloudflare, so editions and passwords work locally:
//   http://localhost:4321                 main site
//   http://northwind.localhost:4321       a company edition
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { onRequest } from './functions/_middleware.js';

const dist = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const port = Number(process.env.PORT || 4321);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml' };

// Stands in for Cloudflare's static asset server.
const ASSETS = {
  async fetch(input) {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(dist, rel);
    try {
      if ((await stat(file)).isDirectory()) {
        if (!url.pathname.endsWith('/')) return new Response(null, { status: 308, headers: { Location: `${url.pathname}/` } });
        file = join(file, 'index.html');
      }
      await stat(file);
      return new Response(await readFile(file), { headers: { 'content-type': types[extname(file)] || 'application/octet-stream' } });
    } catch {
      const body = await readFile(join(dist, '404.html')).catch(() => 'Not found');
      return new Response(body, { status: 404, headers: { 'content-type': types['.html'] } });
    }
  },
};

createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const env = { ASSETS, ROOT_DOMAIN: 'localhost', EDITION_SECRET: 'local-preview' };
  const response = await onRequest({ request, env, next: () => ASSETS.fetch(request) });
  const headers = {};
  response.headers.forEach((v, k) => { if (k !== 'set-cookie') headers[k] = v; });
  const cookies = response.headers.getSetCookie?.() ?? [];
  if (cookies.length) headers['set-cookie'] = cookies;
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => {
  console.log(`Preview: http://localhost:${port}`);
  console.log(`Edition: http://<company>.localhost:${port}`);
});
