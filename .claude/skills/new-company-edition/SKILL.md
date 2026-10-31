---
name: new-company-edition
description: Build a tailored, password-protected company page (company.uxmatt.com) for a company Matt is applying to, echoing that company's design language. Use when Matt names a company or a job posting he's applying for.
---

# New company edition

Goal: a page at `<slug>.uxmatt.com` that pitches Matt for a specific role and visibly borrows the company's design language. It's a live demo of Matt using AI as a product designer.

## 1. Gather inputs
- Company name and website. Use a short lowercase slug, e.g. `samsara`.
- The job posting. If Matt didn't give one, search the company's careers page for design leadership roles, like Director, Head, or Senior Manager of Product Design, UX or Research.
  - Pick the best fit and tell Matt which one you chose.
  - Note the posting URL and the responsibilities and qualifications.

## 2. Research the design language
- Read the company's homepage for tone of voice: headline style, sentence length, recurring words.
- Get real tokens, not guesses. In a browser, run JavaScript on their homepage to read computed styles and `:root` custom properties:
  - Body, `h1` and `h2` font family, size, weight, case and letter-spacing
  - The most frequent text and background colors
  - Button background, text color and border radius
  - Any `--*color*` and `--*font*` variables
- Brand fonts are usually proprietary. Pick the closest Google Fonts substitutes and build a `fontsUrl` that includes every weight you use.

## 3. Write `content/companies/<slug>.md`
Start from `content/companies/_template.md`. `samsara.md` is a complete example.

- **Theme.** Map their palette to the theme keys:
  - `bg, surface, surface2, border, text, muted, subtle, accent, onAccent, radius`
  - `displayTransform`, `displayWeight`, `displayTracking`
  - `fontDisplay`, `fontBody`, `fontMono`
  - Dark or light should follow their site. Check contrast: text and muted against `bg` and `surface` must be at least 4.5:1, and so must `onAccent` against `accent`.
- **Copy.** Write `headline` in Matt's voice with a nod to their tone. Echo their tone, but don't reuse their slogans.
- **`intro`.** Two or three sentences linking Matt's experience to their customers and product.
- **`fit`.** Four to six lines of `need from the posting | proof from Matt's real experience`. Use only facts from `content/site.json`, `CLAUDE.md`, or non-sample case studies.
  - Never cite numbers from a case study that still has `sample: true`.
  - Don't overclaim. For example, Matt has managed designers and researchers, so don't say he has managed design managers unless he confirms it.
- **`caseStudies`.** The 2–4 most relevant case study slugs.
- **Body.** A short "why this company" paragraph, then a 30/60/90-day plan specific to their product and users. Set `bodyHeading` if needed.
- **`aiNote`.** Say honestly how the page was made: which public tokens were pulled, which fonts were substituted, and that the AI's draft was edited by Matt. Say there is no logo or copied content.

## 4. Password
- Make a memorable password that is hard to guess, e.g. three words plus a number, like `field-route-885`.
- Run `npm run password -- <slug> <password>` and paste the `passwordHash:` line into the file.
- Never write the plaintext password into the repo. Give it to Matt in chat.

## 5. Check
- Run `npm run build`. Confirm the page is listed as password-protected.
- Run `npm run preview` and open `http://<slug>.localhost:4321`:
  - The welcome page shows.
  - A wrong password shows the error.
  - The right password shows the page.
  - The page has no horizontal scroll at 390px wide.
- Ensure the uxmatt header and the "An edition of uxmatt.com made for …" bar are present, and that there is no company logo.

## 6. Ship
- Commit on a branch named `edition/<slug>` and open a PR.
- Tell Matt three things:
  - The password, and a suggested line for his application, e.g. "A page I made for this role: <slug>.uxmatt.com (password: …)"
  - To add `<slug>.uxmatt.com` under Cloudflare **Workers & Pages → uxmatt → Custom domains** after merging
  - That any `sample: true` case studies it links to should be replaced before he sends it
