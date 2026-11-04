# Vaishno Rubber Industries — VEXTRA website

Next.js 16 frontend + Payload CMS 3 backend (SQLite), with a scroll-driven 3D hose story and in-action 3D models of railway components.

## Run it

```bash
cp .env.example .env        # then set PAYLOAD_SECRET (openssl rand -hex 32)
npm install
npm run seed                # loads the catalogue + company facts into the CMS
npm run dev                 # http://localhost:3000   ·   CMS: http://localhost:3000/admin
```

First visit to `/admin` asks you to create the first admin user.
Other scripts: `npm run build` · `npm start` · `npm run typecheck` · `npm run lint` · `npm run generate:types`.

**Production:** set `NEXT_PUBLIC_SERVER_URL` to the real domain (canonical URLs and Open Graph depend on it) and a strong `PAYLOAD_SECRET`. SQLite is a single file (`vaishno.db`) — fine for one server; switch `src/payload.config.ts` to `@payloadcms/db-postgres` for multi-instance hosting.

## What the CMS holds

Everything on the site is editable in the admin. Empty fields keep today's text, so nothing breaks if a field is left blank.

| Admin section | What it controls |
|---|---|
| Company → Site Settings | Logo, light logo, favicon, share image, tagline, preloader, SEO title pattern, default description, keywords, per-page SEO titles and descriptions. |
| Company → Company Info | Name, phone, WhatsApp, email, address, map link, hours, social links, profile, capabilities, certifications (with PDF upload), customers, strengths. |
| Company → Navigation | Header links, Products mega-menu columns, catalogue card and file, footer headings and links. |
| Company → Theme (colours & fonts) | Brand, hover, accent, dark and page background colours; body and heading fonts. |
| Pages → (one per page) | All text, buttons and photos of Home, Products, Company, Industries, Resources, Career and Contact. |
| Catalogue → Products | 28 products with full data-sheet rows. Saving a product refreshes its live pages. |
| Catalogue → Product categories | The product families: names, tab labels, URL key and quote-form label. Keep the `railway` key. |
| Careers → Applications | Applications from the Career page (name, email, phone, cover note, resume). Admin-only; resumes are stored in `/applications` (git-ignored). |
| Leads → Enquiries | Quote requests and contact messages (public can create, only admins can read). |
| Media / Users | Uploads and admin accounts. |

## Two ways the site is published

1. **Live server (CMS-driven):** `npm run build && npm start` on a server that can run Node. Admin edits show on the site within a minute. This is the version where the Career form and enquiry forms store real records.
2. **GitHub Pages (static):** the workflow in `.github/workflows/nextjs.yml` has no server, so it cannot read the CMS. It builds from `src/seed/snapshot.json`, a copy of the CMS content. To publish admin edits there:

```bash
npm run snapshot            # writes src/seed/snapshot.json from the local database
git add -A && git commit -m "Update site content" && git push
```

On the static site the forms open the visitor's mail app (no server to save them), and files uploaded through the admin are not available — use files from `public/` (paths like `/documents/…`) for anything that must appear on Pages.

`npm run seed` resets every page, the navigation, settings and theme to the built-in defaults (`src/seed/data.ts`, `src/seed/pages.ts`). Do not run it on a database whose admin edits you want to keep.

A hose's `Construction → Reinforcement` text **drives its 3D model** (e.g. "Two braid…" → two braids and a friction layer; "One yarn braided" → one textile braid; LPG IS 9573 Type-II has an orange cover).

## How the 3D and animation work

- `src/three/` — plain three.js. `hose.ts` models the hose on a straight axis with real woven braid geometry; bend and layer peel-back run in a vertex shader (`bend.ts`). `railway.ts` has the 8 component models and their "actions". `studio.ts` is the shared renderer: neutral studio lighting, soft shadow, **renders only when something changed and the canvas is on screen**.
- **One animation owner.** The hero timeline (`components/home/HeroStory.tsx`, GSAP ScrollTrigger) is the only thing that writes the stage's camera/peel/bend numbers. No mouse-parallax. Reverse scroll replays the same timeline.
- Motion for React (framer-motion) is used only for the mega-menu and mobile drawer. Section reveals use an IntersectionObserver (`useReveal`), not GSAP, so pinned sections cannot leave content stuck invisible.
- three.js is lazy-loaded; it is not in the initial bundle.
- Fallbacks: reduced-motion or no WebGL → no pinning, a still product image, and the same copy as plain text. A lost WebGL context switches to the fallback.

## Source of truth for content

Everything shown comes from three client documents: *Hydraulic Hose Fittings & Adapters.pdf* (the hose catalogue), the *ISO 14001 certificate*, and *Vaishno Rubber Website Redesign.pdf* (client Q&A). Both PDFs are served from `public/documents/`.

### Verified (document on file)
- All hose data-sheet rows, standards, temperature ranges, constructions (catalogue).
- ISO 14001:2015 — QFS Management Systems LLP, cert. SCC/2609VU/3448, 30.09.2026 – 29.09.2029, scope = railway items.
- Company: incorporated 14 Nov 2014 by Mr. Satvir Singh and Dr. (Mrs.) Roopam Singh; ~5 acres, Moradabad; address, phone, emails.

### Stated by the client, no document supplied
- IRIS (shown as "Stated by company"). ISO 9001:2015 (BSCIC and QFS) and ISO 14001:2015 certificates are on file.
- Customer list, in-house capabilities, USPs, railway product list.

### Removed from the earlier draft because no document supports it
Indian Oil as a client · BIS certification · OMA/Sintech braiders · extrusion-line, laser-micrometer and 3,000-bar burst-rig claims · "21+ years" · 60,000 sq ft · working hours · "2–4 hour response" · hose weights · Four-spiral SH33 (catalogue says three braids) · Jack Hose 700 bar (catalogue: 725).

## Needs client confirmation

1. **Governor hose GH-4** prints burst 414 bar / 6000 psi against 7 bar working — reproduced as printed; likely a catalogue typo.
2. **ID (mm)** is converted from the catalogue's inch sizes (the catalogue prints inches only).
3. **RDSO, Lucknow** is listed under customers as written in the brief — confirm whether it is a customer or an approving body, and wording.
4. **IRIS certificate** — supply the PDF and it will show as verified.
5. **Railway components have no data sheets, drawings or photos yet.** Their 3D models are illustrative (labelled on screen). Supplying drawings would let them be modelled accurately.
6. The four product category photos in `public/assets/` came with the earlier project; their origin is unconfirmed. The client said they have no professional photography — the catalogue's factory photos could be extracted if wanted.
7. `satvir21@gmail.com` (printed on the catalogue back cover) is shown publicly next to `info@vaishnorubber.com` — remove it in Company Info if not wanted.
8. Enquiries are **stored in the CMS only**; no email/WhatsApp notification is wired yet.
9. Competitor sites named in the brief (tvsrubber.com/Railways.html, srmexoflex.com) were not reviewed.

## QA status (production build)

- `tsc` clean · `next build` OK, 38 routes (28 product pages pre-rendered) · lint 0 errors.
- Tested in Chrome at 1440×900 and 390×844: pinned story forward and reverse, no stuck-invisible content, no horizontal overflow, no console errors; mega-menu (hover, click, Escape); quote modal validation; a real enquiry stored with a server-generated reference.
- Not done: real-device testing, WebGPU (WebGL2 only — no verified benefit here), screen-reader pass, Lighthouse budget run.

`_legacy/` holds the previous static and React versions for reference — safe to delete once you are happy (`_legacy/node_modules` is large).
