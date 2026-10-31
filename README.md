# uxmatt.com

Matt Greisamer's portfolio. All the words live in plain text files in `content/`.
When you change one on GitHub, Cloudflare rebuilds the site and it's live in about a minute.
There is no hosting control panel to log into.

## Where things live

| To change… | Edit this |
|---|---|
| Headline, intro, quote, method, experience, email, LinkedIn | `content/site.json` |
| A case study | `content/case-studies/<name>.md` |
| A company edition (e.g. acme.uxmatt.com) | `content/companies/<company>.md` |
| Résumé PDF | put it at `public/resume.pdf` |
| Images | add to `public/images/`, then refer to them as `/images/file.png` |
| Colors and fonts | `src/site.css` (the tokens at the top) |

### Edit a page from your browser
1. Open the file on github.com and click the pencil icon.
2. Make the change and click **Commit changes**.
3. Cloudflare publishes it automatically.

### Case studies
Each case study is a Markdown file. The settings at the top, between the `---` lines, control the card on the home page.
The text below them is the case study page.

- `order:` sets the position on the home page.
- `image:` adds a cover image, e.g. `image: /images/cab-board.jpg` and `imageAlt: Synthesis board from a CAB session`.
- `draft: true` hides a case study without deleting it.
- Use `## Heading` for sections, `- item` for lists, `**bold**`, `[link](https://…)` and `![caption](/images/file.png)` for images.

### Placeholders and sample content
`sample: true` marks a case study as placeholder content. It shows a small "Sample" tag on the card and a note on the page.
Remove that line once the story is real.

Text in square brackets, like `[Years]`, is a placeholder.
Every build lists the placeholders and sample case studies that are left. `npm run check` fails the build until they're all gone.

The résumé links appear automatically once `public/resume.pdf` exists.

## Company editions (company.uxmatt.com)

Each file in `content/companies/` becomes a tailored page.
`acme.md` is served at `acme.uxmatt.com`, and also at `uxmatt.com/for/acme/`.

1. Copy `content/companies/_template.md` to `content/companies/acme.md`, or ask Claude to make one from the job posting.
2. Fill in the role, the fit list (`need | proof`), the case studies to show, and the color and font tokens.
3. Set a password (see below).
4. Commit. The page is live right away at `uxmatt.com/for/acme/`.
5. In Cloudflare, go to **Workers & Pages → uxmatt-site → Custom domains → Set up a domain** and enter `acme.uxmatt.com`. Cloudflare adds the DNS record itself.

Edition pages are hidden from search engines and aren't linked from the main site.
They echo a company's palette and type, but never use its logo or copy its site.
`northwind.md` is a sample for a fictional company (password `northwind-demo`). Delete it when you no longer need it.

### Passwords
Each edition with a `passwordHash:` line shows a welcome page that asks for a password.
After someone enters it, they stay signed in on that browser for 30 days.

- Only a scrambled version of the password (the hash) is stored, never the password itself.
  To make the line, run `npm run password -- acme my-password`, or ask Claude.
- Changing the password signs everyone out of that edition.
- Remove the `passwordHash:` line to make an edition open to anyone with the link.
- Put the password in your application or cover letter, e.g. "A page made for this role: samsara.uxmatt.com (password: …)".

## One-time setup: GitHub + Cloudflare Pages

**1. GitHub.** The code lives in `github.com/mattrva/uxmatt`.
Keep the repository **private** (Settings → General → Danger Zone → Change visibility).
That keeps the password hashes and sample content out of public view.

**2. Cloudflare Pages.**
In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git** and pick `mattrva/uxmatt`. Use these settings:
- Build command: `node build.mjs`
- Build output directory: `dist`
- Environment variable: `NODE_VERSION` = `20`
- Secret: `EDITION_SECRET` = a long random string, like a password-manager-generated 32+ characters.
  This signs the sign-in cookies so they can't be forged. Set it under **Settings → Variables and secrets** as type **Secret**.

You'll get a free `uxmatt-site.pages.dev` address to check before switching the domain.

**3. Move the domain.**
In Cloudflare, **Add a site → uxmatt.com** (Free plan). Cloudflare scans your current DNS records.
**Before switching, confirm the MX records for matt@uxmatt.com email were imported.**
If email is hosted at WebHostingHub, those records must stay pointing there, or email will stop.
Then, at WebHostingHub or wherever the domain is registered, change the nameservers to the two Cloudflare gives you.

**4. Connect the domain.**
In the Pages project, go to **Custom domains** and add `uxmatt.com` and `www.uxmatt.com`.

When the new site is live and email is confirmed working, the WebHostingHub hosting plan can be cancelled.
Keep the domain registration and the email hosting, wherever those live.

## Run it on your computer (optional)

With Node 18 or newer installed, run:

```
npm run preview
```

Then open http://localhost:4321. Company editions open at http://northwind.localhost:4321, and passwords work there too.
The site has no dependencies, so there's nothing to install.

## How it works

- `build.mjs` reads `content/` and writes the finished site to `dist/`, including each edition's welcome page.
- `src/templates.mjs` holds the page layouts, and `src/markdown.mjs` is a small Markdown reader.
- `functions/_middleware.js` runs on Cloudflare. It serves `<name>.uxmatt.com`, shows the welcome page until the right password is entered, and keeps the password list private.
- `src/edition-auth.mjs` holds the password hashing and cookie signing, shared by the build and the middleware.
- `serve.mjs` runs the same middleware locally.
