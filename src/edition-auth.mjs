// Shared by the build (to hash passwords) and the Cloudflare middleware
// (to check them). Uses Web Crypto, available in Node 18+ and Workers.

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function hashPassword(slug, password) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(`uxmatt-edition:${slug}:${password}`));
  return `sha256$${hex(digest)}`;
}

export async function sign(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export function safeEqual(a = '', b = '') {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
