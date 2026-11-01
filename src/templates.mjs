import { escapeHtml as e, imagePlaceholder } from './markdown.mjs';

const BASE_FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&display=swap';

const arrow = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

// Maps a company file's theme keys to CSS custom properties.
const THEME_VARS = {
  bg: '--bg', surface: '--surface', surface2: '--surface-2', border: '--border',
  text: '--text', muted: '--muted', subtle: '--subtle', accent: '--accent',
  onAccent: '--on-accent', fontDisplay: '--font-display', fontBody: '--font-body',
  fontMono: '--font-mono', radius: '--radius',
  displayTransform: '--display-transform', displayWeight: '--display-weight',
  displayTracking: '--display-tracking',
};

export function themeStyle(data = {}) {
  const decls = Object.entries(THEME_VARS)
    .filter(([key]) => data[key] !== undefined && data[key] !== '')
    .map(([key, v]) => `${v}: ${String(data[key]).replace(/[;{}<>]/g, '')};`);
  // Editions echo their own accent in the background fog instead of the default warm colors.
  if (data.accent) decls.push(`--fog-1: ${String(data.accent).replace(/[;{}<>]/g, '')}; --fog-2: var(--fog-1); --fog-3: var(--fog-1);`);
  return decls.length ? `<style>:root{${decls.join(' ')}}</style>` : '';
}

export function layout({ site, title, description, path = '/', body, home = false, noindex = false, fontsUrl, theme = '', cssHref, external = false }) {
  // Company editions live on their own subdomain, so their nav points back to the main site.
  const nav = home ? '' : external ? `${site.url}/` : '/';
  const brandHref = external ? `${site.url}/` : '/';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(description)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${e(site.url + path)}">`}
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${e(BASE_FONTS)}">
${fontsUrl ? `<link rel="stylesheet" href="${e(fontsUrl)}">` : ''}
<link rel="stylesheet" href="${cssHref}">
${theme}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${body.banner || ''}
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${e(brandHref)}"><span class="brand-mark" aria-hidden="true">${e(site.monogram)}</span>${e(site.shortName)}</a>
    <nav class="nav" aria-label="Primary" data-spy>
      <a href="${nav}#work">Work</a>
      <a href="${nav}#method">How I work</a>
      <a href="${nav}#path">Experience</a>
      <a href="#contact">Contact</a>
    </nav>
  </div>
</header>
<main id="main">
${body.main}
</main>
${footer(site, body.contact)}
<script>
// Marks the section you're reading in the header nav and the case study contents.
(() => {
  const groups = [...document.querySelectorAll('[data-spy]')].map((nav) =>
    [...nav.querySelectorAll('a[href^="#"]')].map((link) => [link, document.getElementById(link.hash.slice(1))]).filter(([, target]) => target));
  const update = () => {
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    for (const items of groups) {
      let current = atEnd ? items.at(-1) : undefined;
      if (!atEnd) for (const item of items) if (item[1].getBoundingClientRect().top <= innerHeight * 0.4) current = item;
      for (const item of items) {
        if (item === current) item[0].setAttribute('aria-current', 'location');
        else item[0].removeAttribute('aria-current');
      }
    }
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();
</script>
</body>
</html>
`;
}

function footer(site, contact = {}) {
  const headline = contact.headline ?? site.contact.headline;
  const highlight = contact.highlight ?? site.contact.highlight;
  const mailto = contact.subject ? `mailto:${site.email}?subject=${encodeURIComponent(contact.subject)}` : `mailto:${site.email}`;
  const year = new Date().getFullYear();
  const linkedin = /^https?:/.test(site.linkedin);
  return `<footer class="site-footer" id="contact">
  <div class="wrap">
    <p class="footer-label">Contact</p>
    <h2>${e(headline)} <span>${e(highlight)}</span></h2>
    <div class="btns">
      <a class="btn btn-primary" href="${e(mailto)}">${e(site.email)}</a>
      ${linkedin ? `<a class="btn btn-ghost" href="${e(site.linkedin)}" rel="noopener">LinkedIn</a>` : ''}
      ${site.hasResume ? `<a class="btn btn-ghost" href="${e(site.resume)}">Résumé</a>` : ''}
    </div>
  </div>
</footer>
<div class="legal"><div class="wrap"><span>© ${year} ${e(site.name)} · ${e(site.location)}</span></div></div>`;
}

export function card(cs) {
  const media = `<div class="card-media">${cs.image ? `<img src="${e(cs.image)}" alt="${e(cs.imageAlt || '')}" loading="lazy">` : imagePlaceholder()}</div>`;
  return `<a class="card" href="/work/${e(cs.slug)}/">
  ${media}
  <div class="card-body">
    <p class="card-kicker">${e(cs.category)} · ${e(cs.company)}${cs.sample ? ' <span class="sample-tag">Sample</span>' : ''}</p>
    <h3>${e(cs.cardTitle || cs.title)}</h3>
    <p class="card-summary">${e(cs.summary)}</p>
    ${cs.outcome ? `<p class="card-outcome"><strong>Outcome:</strong> ${e(cs.outcome)}</p>` : ''}
    <span class="card-cta">Read case study ${arrow}</span>
  </div>
</a>`;
}

function quoteCard(site) {
  return `<figure class="quote-card">
  <p class="label">${e(site.quote.label)}</p>
  <blockquote>“${e(site.quote.text)}”</blockquote>
</figure>`;
}

function methodSection(site) {
  return `<section class="section section-alt" id="method"><div class="wrap">
  <div class="section-head"><h2>How I work</h2><p>From first interview to a stronger team.</p></div>
  <div class="method-body">
    ${quoteCard(site)}
    <ol class="method">
      ${site.method.map((m) => `<li><span class="step">${e(m.step)}</span><span class="text">${e(m.text)}</span></li>`).join('\n      ')}
    </ol>
  </div>
</div></section>`;
}

function pathSection(site) {
  return `<section class="section" id="path"><div class="wrap">
  <div class="section-head"><h2>Experience</h2><p>10+ years in UX, 7+ managing design and research teams.</p>${site.hasResume ? `<p><a href="${e(site.resume)}">Full résumé (PDF)</a></p>` : ''}</div>
  <div class="path">
    ${site.experience.map((x) => `<div class="path-item${x.current ? ' current' : ''}"><p class="co">${e(x.company)}</p><p class="role">${e(x.role)}</p><p class="when">${e(x.dates)}</p></div>`).join('\n    ')}
  </div>
</div></section>`;
}

function workSection(caseStudies, heading = 'Work', note = 'Each case study covers the problem, what we did and the outcome.') {
  return `<section class="section" id="work"><div class="wrap">
  <div class="section-head"><h2>${e(heading)}</h2><p>${e(note)}</p></div>
  <div class="cards">
    ${caseStudies.map(card).join('\n    ')}
  </div>
</div></section>`;
}

export function homePage(site, caseStudies) {
  return {
    main: `<section class="hero hero-home"><div class="wrap">
  <figure class="portrait"><img src="/images/matt.jpg" width="800" height="800" alt="Portrait of Matt Greisamer"></figure>
  <div class="hero-main">
    <p class="eyebrow">${e(site.hero.eyebrow)}</p>
    <h1>${e(site.hero.headline)}</h1>
    <p class="hero-intro">${e(site.hero.intro)}</p>
    <div class="btns hero-actions">
      <a class="btn btn-primary" href="#work">See my work ${arrow}</a>
      <a class="btn btn-ghost" href="#contact">Get in touch</a>
    </div>
  </div>
</div></section>
${workSection(caseStudies)}
${methodSection(site)}
${pathSection(site)}`,
  };
}

export function caseStudyPage(site, cs, next) {
  const meta = [
    ['Company', cs.company], ['My role', cs.role], ['When', cs.years], ['Focus', cs.category],
  ].filter(([, v]) => v);
  const contents = [...cs.html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)];
  return {
    main: `<section class="cs-hero"><div class="wrap cs-col">
  <a class="back" href="/#work">← All case studies</a>
  ${cs.sample ? '<p class="sample-note">Sample content: this case study is a placeholder and will be replaced with the full story.</p>' : ''}
  <p class="eyebrow">${e(cs.category)} · ${e(cs.company)}</p>
  <h1>${e(cs.title)}</h1>
  <p class="cs-summary">${e(cs.summary)}</p>
  <dl class="cs-meta">
    ${meta.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('\n    ')}
  </dl>
</div></section>
<div class="wrap cs-col cs-cover">${cs.image ? `<img src="${e(cs.image)}" alt="${e(cs.imageAlt || '')}">` : imagePlaceholder(cs.imageHint || cs.title)}</div>
<div class="wrap cs-body">
  <nav class="contents" aria-label="On this page" data-spy>
    <p>On this page</p>
    <ul>${contents.map(([, id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('')}</ul>
  </nav>
  <article class="prose">
${cs.html}
  </article>
</div>
${next ? `<div class="wrap cs-col cs-next"><a class="next-cs" href="/work/${e(next.slug)}/"><span class="label">Next case study</span><span class="t">${e(next.cardTitle || next.title)} ${arrow}</span></a></div>` : ''}`,
  };
}

export function editionPage(site, ed, caseStudies) {
  const fit = (ed.fit || []).map((line) => {
    const [need, proof] = String(line).split('|').map((s) => s.trim());
    return `<div class="fit-item"><p class="need">${e(need)}</p><p class="proof">${e(proof || '')}</p></div>`;
  });
  const aiNote = ed.aiNote || `I made this page with AI as a design partner. It studied ${ed.company}'s public product and design language, adapted my site's design tokens to echo it, and drafted a pitch for this role that I edited and own. It's a small example of how I bring AI into product design and research work.`;
  return {
    banner: `<div class="edition-bar"><div class="wrap"><span>An edition of uxmatt.com made for <strong>${e(ed.company)}</strong></span><span>${e(ed.role)}</span></div></div>`,
    contact: {
      headline: ed.contactHeadline || `Let's talk about the ${ed.role} role.`,
      highlight: ed.contactHighlight || '',
      subject: `${ed.role} at ${ed.company}`,
    },
    main: `<section class="hero"><div class="wrap">
  <div class="hero-main">
    <p class="eyebrow">${e(site.name)} → ${e(ed.company)}</p>
    <h1>${e(ed.headline)}</h1>
    <p class="hero-intro">${e(ed.intro)}</p>
    <div class="btns hero-actions">
      <a class="btn btn-primary" href="#fit">Why I fit ${arrow}</a>
      ${ed.posting ? `<a class="btn btn-ghost" href="${e(ed.posting)}" rel="noopener">The role</a>` : ''}
    </div>
  </div>
  ${quoteCard(site)}
</div></section>
${fit.length ? `<section class="section" id="fit"><div class="wrap">
  <div class="section-head"><h2>What you need → what I bring</h2><p>From the ${e(ed.role)} posting.</p></div>
  <div class="fit">${fit.join('')}</div>
</div></section>` : ''}
${ed.html.trim() ? `<section class="section section-alt"><div class="wrap"><div class="section-head"><h2>${e(ed.bodyHeading || 'How I would approach the role')}</h2></div><div class="prose" style="padding-bottom:0">${ed.html}</div></div></section>` : ''}
${workSection(caseStudies, 'Relevant work', `Chosen for ${ed.company}.`)}
<section class="section"><div class="wrap"><div class="ai-note"><h2>How this page was made</h2><p>${e(aiNote)}</p></div></div></section>`,
  };
}

// Password page shown at <company>.uxmatt.com until the visitor signs in.
export function welcomePage({ site, ed, cssHref }) {
  const title = `${site.name} for ${ed.company}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${e(BASE_FONTS)}">
${ed.fontsUrl ? `<link rel="stylesheet" href="${e(ed.fontsUrl)}">` : ''}
<link rel="stylesheet" href="${cssHref}">
${themeStyle(ed)}
</head>
<body class="welcome-body">
<main class="welcome">
  <div class="welcome-card">
    <p class="brand"><span class="brand-mark" aria-hidden="true">${e(site.monogram)}</span>${e(site.shortName)}</p>
    <p class="eyebrow">${e(site.name)} → ${e(ed.company)}</p>
    <h1>${e(ed.welcomeHeadline || `Hi, ${ed.company} team.`)}</h1>
    <p class="welcome-intro">${e(ed.welcomeText || `I made this page for the ${ed.role} role. Enter the password from my application to see it.`)}</p>
    <form class="welcome-form" method="post" action="/__edition/login">
      <input type="hidden" name="slug" value="${e(ed.slug)}">
      <label for="password">Password</label>
      <div class="welcome-row">
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus aria-describedby="login-error">
        <button class="btn btn-primary" type="submit">Enter</button>
      </div>
      <p id="login-error" class="welcome-error" role="alert" hidden>That password didn't match. Please try again.</p>
    </form>
    <p class="welcome-help">No password? Email <a href="mailto:${e(site.email)}?subject=${encodeURIComponent(`${ed.role} at ${ed.company}`)}">${e(site.email)}</a> or visit <a href="${e(site.url)}/">uxmatt.com</a>.</p>
  </div>
</main>
<script>if (new URLSearchParams(location.search).has('error')) document.getElementById('login-error').hidden = false;</script>
</body>
</html>
`;
}

export function notFoundPage() {
  return {
    main: `<section class="hero"><div class="wrap"><div class="hero-main">
  <p class="eyebrow">404</p>
  <h1>That page isn't here.</h1>
  <p class="hero-intro"><a href="/">Back to the home page</a></p>
</div></div></section>`,
  };
}
