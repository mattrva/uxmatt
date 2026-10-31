---
# Copy this file to content/companies/<company>.md (e.g. acme.md).
# The file name becomes the subdomain: acme.md → acme.uxmatt.com
# Files that start with _ are ignored by the build.

company: Company Name
role: Job Title
posting: https://link-to-the-job-posting

# Password for the welcome page. Make the line with: npm run password -- <file-name> <password>
# (or ask Claude). Leave it out to make the page open to anyone with the link.
passwordHash:

# Optional welcome page text
welcomeHeadline:
welcomeText:
headline: One sentence on what you'd do for them.
intro: Two or three sentences connecting your experience to their product and users.

# Case studies to show, by file name (without .md). Leave empty to show all.
caseStudies: [client-advisory-boards, finvi-design-system]

# What the posting asks for | what you've done that proves it
fit:
  - Need from the posting | Proof from your experience
  - Need from the posting | Proof from your experience
  - Need from the posting | Proof from your experience

# Design language: echo their palette and type, never their logo.
bg: "#111318"
surface: "#1B1E25"
surface2: "#23272F"
border: "#2C313B"
text: "#ECEDEE"
muted: "#B9BEC6"
subtle: "#9BA1A9"
accent: "#C6F36B"
onAccent: "#111318"
radius: 0px
# Headline style: uppercase or none, weight, letter spacing
displayTransform: none
displayWeight: 600
displayTracking: -0.03em
fontDisplay: "'Space Grotesk', sans-serif"
fontBody: "'Space Grotesk', sans-serif"
fontsUrl:
bodyHeading: How I'd approach the first 90 days
---

Write the body in Markdown: your read on their product, and what you'd do first.

- First 30 days: ...
- First 60 days: ...
- First 90 days: ...
