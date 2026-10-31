# Project history and decisions

This is the record of how the redesign started, carried over from the original Claude conversation (Oct 31, 2026).

## Starting point
The old site was a static HTML résumé template hosted on WebHostingHub. Updating it meant logging in there. It had these problems:
- The portfolio section said "Under Construction".
- The contact section still had template placeholders (example@example.com, 123 Lorem Ipsum).
- The footer said 2024.
- CoStar and Finvi were both listed as "Current May 2019".
- The tagline was a list of titles.

The strongest part was the bio and the team-standard quote, which now leads the site.

## Decisions
| Date | Decision |
|---|---|
| Oct 31, 2026 | Hosting: GitHub (`mattrva/uxmatt`) + Cloudflare Pages, with DNS moving to Cloudflare. MX records for matt@uxmatt.com must be preserved. |
| Oct 31, 2026 | Visual direction: **B · Field Notes**, chosen from six concepts. |
| Oct 31, 2026 | No framework or dependencies. npm was blocked in the cloud workspace, and zero dependencies makes browser edits on GitHub safe. |
| Oct 31, 2026 | Case studies start as flagged sample content, to be replaced with Matt's real material. |
| Oct 31, 2026 | Every company page requires a password and gets a themed welcome page. |
| Oct 31, 2026 | First company: Samsara, Director, Product Design. |

## Design concepts
All six concepts are on a Claude design canvas, "uxmatt.com Concepts": https://claude.ai/artifact/175nYqdXbzMEsonhHvt5wA
- A · Systems: Swiss/modular, white, electric blue
- **B · Field Notes (chosen)**: dark #111318, Space Grotesk + JetBrains Mono, chartreuse #C6F36B. Research-led framing, with problem → research → decision → outcome case study cards.
- C · Coffee Chat: warm, personal, deep green + coral
- D · Editorial: magazine-style "The Greisamer Review", with essays on leadership
- E · Operating Manual: a "Working with Matt" README styled like a SaaS app
- F · Poster: wide uppercase type on yellow

## Samsara research (samsara.com, Oct 31, 2026)
Tokens were read from computed styles and `:root` custom properties on the live homepage.
- **Fonts:** FK Grotesk for the body. Samsara Sans for the bold uppercase h1 (48px/700). FK Grotesk Mono.
  - The page substitutes Hanken Grotesk, Barlow Semi Condensed and IBM Plex Mono.
- **Grays (warm stone):**
  - gray-900 #1C1917, gray-800 #221F1B, gray-700 #403D37
  - gray-600 #716F67, gray-500 #9C9890, gray-400 #B9B6AD, gray-300 #CCC9C1
  - gray-200 #E0DDD5, gray-50 #F5F4F1
- **Brand:** brand-500 #FEAE0F (amber). Buttons are amber with #1C1917 text, 4px radius, weight 700.
- **Other palette:** blue-500 #2A75D4, emerald-500 #01B665, gold-500 #F0BC00.
- **Tone:** "Operator grade. Proven in the field." Short, punchy fragments; words like "operators", "field" and "run better"; outcome-focused proof points.
- **Role:** Director, Product Design, remote US/Canada. https://www.samsara.com/company/careers/roles/7839138
  - Responsibilities: lead and coach design managers; engage customers; define design strategy across product areas; build tools, systems and processes; hire and develop an inclusive team.
  - Minimum qualification: 4–6+ years of product design management.
