// Cloudflare Pages middleware for company editions.
//
//   acme.uxmatt.com/          → the edition built at /for/acme/
//   uxmatt.com/for/acme/      → the same edition
//
// Editions with a password show their welcome page until the visitor signs in.
// A signed-in visitor gets a cookie for 30 days. Every other path (home page,
// case studies, CSS, images) is served as normal.
//
// Cloudflare settings (Pages project → Settings → Variables and secrets):
//   EDITION_SECRET  a long random string used to sign sign-in cookies (recommended)
//   ROOT_DOMAIN     optional; defaults to uxmatt.com

import { hashPassword, sign, safeEqual } from '../src/edition-auth.mjs';

const COOKIE_DAYS = 30;
const SLUG = /^[a-z0-9-]+$/;

export async function onRequest({ request, env, next }) {
  const root = (env.ROOT_DOMAIN || 'uxmatt.com').toLowerCase();
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  const sub = host.endsWith(`.${root}`) ? host.slice(0, -(root.length + 1)) : '';
  const subSlug = sub && sub !== 'www' && SLUG.test(sub) ? sub : null;
  const path = url.pathname;

  // The password list is for this code only, never for visitors.
  if (path === '/_editions.json') return new Response('Not found', { status: 404 });

  if (path === '/__edition/login') {
    if (request.method !== 'POST') return redirect(`${url.origin}/`);
    return login({ request, env, url, subSlug });
  }

  // Work out whether this request is for an edition page.
  let slug = null;
  const forPath = path.match(/^\/for\/([a-z0-9-]+)(?:\/(?:index\.html)?)?$/);
  if (forPath) slug = forPath[1];
  else if (subSlug && (path === '/' || path === '/index.html')) slug = subSlug;
  if (!slug) return next();

  const editions = await loadEditions(env, url);
  if (!(slug in editions)) {
    // Unknown subdomain: send visitors to the main site.
    if (!forPath) return redirect(`https://${root}/`, 302);
    return next();
  }

  const hash = editions[slug];
  if (!hash || (await isSignedIn(request, env, slug, hash))) {
    return serve(env, url, `/for/${slug}/`);
  }
  return serve(env, url, `/for/${slug}/welcome/`);
}

async function login({ request, env, url, subSlug }) {
  const form = await request.formData();
  const slug = String(form.get('slug') || '').toLowerCase();
  const password = String(form.get('password') || '');
  if (!SLUG.test(slug)) return redirect(`${url.origin}/`);

  const editions = await loadEditions(env, url);
  const hash = editions[slug];
  const back = subSlug === slug ? '/' : `/for/${slug}/`;
  if (!hash) return redirect(`${url.origin}${back}`);

  const ok = safeEqual(await hashPassword(slug, password), hash);
  if (!ok) return redirect(`${url.origin}${back}?error=1`);

  const token = await sign(secretFor(env, hash), `${slug}:${hash}`);
  return new Response(null, {
    status: 303,
    headers: {
      Location: `${url.origin}${back}`,
      'Set-Cookie': `uxm_${slug}=${token}; Path=/; Max-Age=${COOKIE_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}

async function isSignedIn(request, env, slug, hash) {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)uxm_${slug}=([a-f0-9]+)`));
  if (!match) return false;
  const expected = await sign(secretFor(env, hash), `${slug}:${hash}`);
  return safeEqual(match[1], expected);
}

function secretFor(env, hash) {
  // Changing an edition's password changes the hash, which signs everyone out of it.
  return `${env.EDITION_SECRET || ''}:${hash}`;
}

async function loadEditions(env, url) {
  const res = await env.ASSETS.fetch(new URL('/_editions.json', url));
  return res.ok ? res.json() : {};
}

async function serve(env, url, assetPath) {
  const res = await env.ASSETS.fetch(new URL(assetPath, url));
  const out = new Response(res.body, res);
  out.headers.set('Cache-Control', 'private, no-store');
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return out;
}

function redirect(location, status = 303) {
  return new Response(null, { status, headers: { Location: location, 'Cache-Control': 'no-store' } });
}
