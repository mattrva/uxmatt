# uxmatt.com

Portfolio site for **Matt Greisamer**, UX Design & Research Leader (Richmond, VA).
Owner email: matt@uxmatt.com. GitHub: mattrva/uxmatt.

## Goals
1. Present Matt as a UX design and research **leader**, not an individual contributor. Lead with team building, research programs, design systems and outcomes.
2. Let Matt update the site by editing text files. Pushes to `main` deploy automatically through Cloudflare Pages.
3. Show that Matt uses AI as a product designer. Each company he applies to gets a tailored, password-protected page at `<company>.uxmatt.com` that echoes the company's design language.

Full background, decisions and research are in `docs/project-history.md`.

## How the site works
- No dependencies, no framework, so there's no `npm install`.
  - `node build.mjs` writes `dist/`.
  - `npm run preview` builds and serves http://localhost:4321.
  - Company pages preview at http://<slug>.localhost:4321, where passwords work too.
- `npm run check` fails while any `[placeholder]` or `sample: true` case study remains. Run it before telling Matt something is ready to share.
- Cloudflare Pages settings:
  - Build command `node build.mjs`, output directory `dist`, `NODE_VERSION=20`
  - Secret `EDITION_SECRET` signs the sign-in cookies
  - Optional `ROOT_DOMAIN`, which defaults to uxmatt.com

| Path | What it is |
|---|---|
| `content/site.json` | Profile, hero, team-standard quote, method, experience, contact |
| `content/case-studies/*.md` | One case study per file. Frontmatter: `title, cardTitle, company, category, role, years, order, summary, outcome, image, imageAlt, imageHint, sample, draft`. With no `image`, the card and cover show a wireframe placeholder and `imageHint` says what belongs there. `![placeholder: what goes here]` holds a spot in the body. `npm run check` lists both |
| `content/companies/*.md` | Company pages. `_template.md` documents every field. Files starting with `_` are skipped |
| `public/` | Copied to the site as-is: `favicon.svg`, `images/`, and `resume.pdf` once it exists |
| `src/site.css` | Field Notes styles. Every color and font is a CSS custom property, and company pages override them |
| `src/templates.mjs` | Page templates: home, case study, company page, welcome/password page, 404. `THEME_VARS` maps frontmatter keys to CSS variables |
| `src/markdown.mjs` | A small Markdown + frontmatter parser. Frontmatter supports `key: value`, `[a, b]` lists, and indented `  - item` lists |
| `src/edition-auth.mjs` | SHA-256 password hashes and HMAC cookie signing, shared by the build and the middleware |
| `functions/_middleware.js` | Cloudflare Pages middleware: subdomain routing, the password gate, and blocking `/_editions.json` |
| `serve.mjs` | Local server that runs the same middleware |
| `tools/password.mjs` | `npm run password -- <slug> <password>` prints the `passwordHash:` line |

### Company pages ("editions")
- `content/companies/acme.md` builds to `/for/acme/` and `/for/acme/welcome/`.
- The middleware serves it at `acme.uxmatt.com/` and at `uxmatt.com/for/acme/`.
- If the file has a `passwordHash:`, visitors see the themed welcome page until they enter the password.
  - Signing in sets an HttpOnly cookie `uxm_<slug>` for 30 days.
  - Changing the password invalidates existing cookies.
- Unknown subdomains redirect to uxmatt.com.
- Company pages are noindex, blocked in robots.txt, and never linked from the main site.
- Each subdomain must also be added as a custom domain in the Cloudflare Pages project. Matt does this in the dashboard; remind him.
- To build a new company page, use the `new-company-edition` skill in `.claude/skills/`.

## Rules for content
- **Be truthful about Matt.** Draw claims only from `content/site.json`, the case studies, and what Matt tells you.
  - Don't invent employers, titles, team sizes or metrics.
  - Mark unknowns as `[placeholder]`s, which the build lists.
- The four current case studies are **sample content** that Matt asked for, flagged with `sample: true`. Their numbers are made up.
  - Replace them with real stories when Matt provides material, then remove `sample: true`.
  - Never remove the flag while the content is still invented.
- Company pages **echo, never impersonate**. Use the company's palette, type feel, radius and tone. Never use its logo, wordmark, product imagery, copied copy or slogans, and never make the page look like the company's own site. The uxmatt header and the "An edition of uxmatt.com made for …" bar must stay.
- Keep text contrast at WCAG AA (4.5:1 for body text) when choosing edition colors.
- Write in plain, direct language. Matt's voice is warm, practical, and focused on the team.

## Facts about Matt
- **Finvi**, Manager, UX Research & Design, Feb 2022–now
  - Created and leads the UX department
  - Built a Figma design system with variables
  - Created the Client Advisory Board research program with client executives across business lines
- **The CoStar Group**, Manager, UX Design, May 2019–Feb 2022
  - UX lead for the internal CRM, managing 2 designers
  - Built a design system and research and process practices
  - Designed mobile apps for internal and external users
- **EAB**, Sr. UX Designer, Mar 2016–May 2019
  - Lead designer for Enrollment Services, managing 2 part-time contractors and 1 full-time employee
  - Analytics products using machine learning
- **Genworth** (shown as "Geworth" on the old site; assumed to be a typo, but Matt hasn't confirmed), Digital Designer, Oct 2014–Mar 2016
- **Capital One** (contract), Digital Designer, 2014–2015
- **Education:** VCU, B.S. Mass Communications (Creative Advertising), 2005–2010. Started as a chemical engineering major. Won a Student ADDY.
- 10+ years in UX design and research, and 7+ years managing UX teams. Describes himself as a servant leader.
- **Team standard:** "Understand the user better than anyone, the product nearly as well as the PMs, and the technology nearly as well as the developers."
- **LinkedIn:** https://www.linkedin.com/in/matthew-greisamer-46944918/
- Likes food and coffee.

## Open items
- Real case studies to replace the four samples (Matt will share files and Figma links)
- `public/resume.pdf` (Matt is still working on it; the Résumé links appear once it exists)
- Confirm Genworth
- Cloudflare setup:
  - Make the repo private
  - Create the Pages project and set `EDITION_SECRET`
  - Move DNS to Cloudflare, keeping the MX records for matt@uxmatt.com
  - Add custom domains uxmatt.com, www, samsara

## Working conventions
- Passwords are never stored in plaintext in the repo, only `passwordHash`. Give Matt any new password in chat.
- Work on a branch and open a PR. `main` deploys to production.
- Don't add npm dependencies without asking. "Zero dependencies" is deliberate, so a browser edit on GitHub can't break the build.
