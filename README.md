# The Justice Firm — Static Website (GitHub Pages)

This repository contains the static website for **The Justice Firm** — Advocates & Legal Consultants (India).  
The site is a single `index.html` (mobile-friendly, modern theme) that includes:

- Responsive layout (desktop + mobile)
- Accessible navigation and mobile menu
- Hero, Practice Areas, About, Team, Articles, Payment, Contact sections
- Booking modal (Formspree integration)
- Improved Articles section (client-side search/filter/preview)
- Enhanced floating chatbot (lead capture + WhatsApp handoff)
- Expandable FAB (WhatsApp / Call)
- Basic JS enhancements (clock, calendar, UPI copy, form AJAX)

---

## Quick start — Deploy to GitHub Pages

1. **Push to GitHub**

   Place `index.html` and your assets (images, thumbnails) at the repository root (or in `/docs` if you prefer) and push to GitHub.

   ```bash
   # from project root
   git init                        # if not already a git repo
   git add .
   git commit -m "Initial site commit"
   git remote add origin <your-repo-url>
   git push -u origin main
