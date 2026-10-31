// Makes the passwordHash line for a company edition.
// Usage: npm run password -- <company-file-name> <password>
//   e.g. npm run password -- samsara field-route-885
import { hashPassword } from '../src/edition-auth.mjs';

const [slug, ...rest] = process.argv.slice(2);
const password = rest.join(' ');
if (!slug || !password) {
  console.error('Usage: npm run password -- <company-file-name> <password>');
  process.exit(1);
}
console.log(`Paste this into content/companies/${slug}.md:\n`);
console.log(`passwordHash: ${await hashPassword(slug.toLowerCase(), password)}`);
