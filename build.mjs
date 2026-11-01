// Builds the site into dist/. No dependencies: run with `node build.mjs`.
import { readFile, writeFile, mkdir, readdir, rm, cp, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdown, parseFrontmatter } from './src/markdown.mjs';
import { layout, homePage, caseStudyPage, editionPage, welcomePage, notFoundPage, themeStyle } from './src/templates.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const strict = process.argv.includes('--strict');
const warnings = [];
const notes = [];

// Finds unfilled [placeholders] (square brackets not followed by a link).
function checkPlaceholders(file, text) {
  // Frontmatter lists like `caseStudies: [a, b]` are data, not placeholders.
  text = text.replace(/^[A-Za-z0-9_]+:\s*\[[^\]\n]*\]\s*$/gm, '');
  for (const m of text.matchAll(/\[([^\]\n]{2,80})\](?!\()/g)) {
    if (/^(x| )$/.test(m[1])) continue;
    warnings.push(`${file}: [${m[1]}]`);
  }
}

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function loadCollection(dir) {
  if (!(await exists(dir))) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const items = [];
  for (const f of files) {
    const raw = await readFile(join(dir, f), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    if (data.draft === true) continue;
    items.push({ ...data, slug: data.slug || basename(f, '.md'), html: markdown(body), file: f, raw });
  }
  return items;
}

async function write(path, html) {
  const full = join(dist, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, html);
}

async function main() {
  const siteRaw = await readFile(join(root, 'content/site.json'), 'utf8');
  const site = JSON.parse(siteRaw);
  checkPlaceholders('content/site.json', siteRaw);
  site.hasResume = await exists(join(root, 'public', site.resume.replace(/^\//, '')));
  if (!site.hasResume) notes.push(`No résumé yet: add public${site.resume} and the Résumé links will appear.`);

  const caseStudies = (await loadCollection(join(root, 'content/case-studies')))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const editions = await loadCollection(join(root, 'content/companies'));
  for (const cs of caseStudies) {
    checkPlaceholders(`content/case-studies/${cs.file}`, cs.raw);
    if (cs.sample) notes.push(`Sample content: content/case-studies/${cs.file} (remove "sample: true" once it's real)`);
    if (!cs.image) warnings.push(`content/case-studies/${cs.file}: no image (set image: and imageAlt:)`);
  }
  for (const ed of editions) {
    checkPlaceholders(`content/companies/${ed.file}`, ed.raw);
    if (!ed.passwordHash) notes.push(`No password: content/companies/${ed.file} is open to anyone with the link.`);
  }

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  if (await exists(join(root, 'public'))) await cp(join(root, 'public'), dist, { recursive: true });

  // Fingerprint the stylesheet so browsers always get the latest version.
  const css = await readFile(join(root, 'src/site.css'), 'utf8');
  const hash = createHash('sha1').update(css).digest('hex').slice(0, 8);
  const cssHref = `/assets/site.${hash}.css`;
  await write(cssHref, css);

  const base = { site, cssHref };
  const desc = `${site.name}, ${site.title}. ${site.hero.intro}`;

  await write('index.html', layout({ ...base, home: true, title: `${site.name} — ${site.title}`, description: desc, body: homePage(site, caseStudies) }));

  for (const [i, cs] of caseStudies.entries()) {
    const next = caseStudies[(i + 1) % caseStudies.length];
    await write(`work/${cs.slug}/index.html`, layout({
      ...base, title: `${cs.title} — ${site.name}`, description: cs.summary, path: `/work/${cs.slug}/`,
      body: caseStudyPage(site, cs, caseStudies.length > 1 ? next : null),
    }));
  }

  for (const ed of editions) {
    const picks = Array.isArray(ed.caseStudies) && ed.caseStudies.length
      ? ed.caseStudies.map((s) => caseStudies.find((c) => c.slug === s)).filter(Boolean)
      : caseStudies;
    await write(`for/${ed.slug}/index.html`, layout({
      ...base, external: true, noindex: true,
      title: `${site.name} for ${ed.company} — ${ed.role}`,
      description: ed.intro || desc,
      fontsUrl: ed.fontsUrl, theme: themeStyle(ed),
      body: editionPage(site, ed, picks),
    }));
    if (ed.passwordHash) await write(`for/${ed.slug}/welcome/index.html`, welcomePage({ site, ed, cssHref }));
  }

  // Read only by functions/_middleware.js, which blocks visitors from fetching it.
  await write('_editions.json', JSON.stringify(Object.fromEntries(editions.map((ed) => [ed.slug, ed.passwordHash || null])), null, 2));

  await write('404.html', layout({ ...base, title: `Not found — ${site.name}`, description: desc, noindex: true, body: notFoundPage() }));
  await write('robots.txt', `User-agent: *\nDisallow: /for/\nSitemap: ${site.url}/sitemap.xml\n`);
  const urls = ['/', ...caseStudies.map((c) => `/work/${c.slug}/`)];
  await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')}\n</urlset>\n`);

  console.log(`Built ${1 + caseStudies.length} pages and ${editions.length} company edition(s) into dist/`);
  for (const ed of editions) console.log(`  edition: ${ed.slug}.uxmatt.com  ${ed.passwordHash ? '(password protected)' : '(open)'}`);
  if (notes.length) {
    console.log('\nNotes:');
    for (const n of notes) console.log(`  - ${n}`);
  }
  if (warnings.length) {
    console.log(`\n${warnings.length} placeholder(s) still to fill in:`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
  const samples = caseStudies.filter((cs) => cs.sample).length;
  if (strict && (warnings.length || samples)) {
    console.error('\nStrict mode: fill in placeholders and replace sample content before publishing.');
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
