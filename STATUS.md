# Project status — Vaishno Rubber (VEXTRA) website

Last updated: 4 Nov 2026 · Stack: Next.js 16 · Payload CMS 3 · SQLite · three.js · GSAP
Project folder: `~/Desktop/Rishi/Practics/vaishnowRubberWebsite` (moved from `rubberCase`) · Git remote: `github.com/Rishi-G/vaishnowRubberWebsite`

## 1. Completed

### Platform and CMS
- [x] Next.js frontend and Payload CMS backend in one project (admin at `/admin`)
- [x] Collections: Products, Enquiries, Media, Users; global: Company Info
- [x] 28 products seeded from the client's catalogue (20 hoses with full data-sheet rows, 8 railway components)
- [x] Saving a product in the CMS refreshes its live pages
- [x] Enquiry forms (quote modal and contact page) save real records with a server-generated reference; success shows only after the server confirms
- [x] Public cannot read enquiries (returns 403)
- [x] SEO: unique title, description and canonical per page; Product structured data; unknown product URLs return a real 404
- [x] 1600px maximum content width

### Content, checked against the client's documents
- [x] Hose data (sizes, pressures, standards, temperatures, constructions) transcribed from the catalogue PDF
- [x] ISO 14001 certificate and hose catalogue downloadable from the site
- [x] Unsupported claims removed (Indian Oil, BIS, OMA/Sintech, weights, working hours, response times, wrong SH33 and Jack Hose specs)
- [x] Customers, capabilities and strengths taken from the client's Q&A

### Pages
- [x] Home: hero story, facts, railway parts in action, hose range, hose finder by pressure, customers, works, quote band
- [x] Products: search, family tabs, deep links (`/products?category=railway`)
- [x] Product detail: hose template (3D viewer, construction, data sheet) and railway template (action viewer)
- [x] Company, Industries, Resources (downloads, flow-size calculator, pressure converter, installation guidance), Contact
- [x] Header with mega menu (hover, click, Escape, outside click), mobile drawer, footer

### 3D and motion
- [x] Hose model with woven braid geometry, built from each product's own reinforcement text; bend and layer peel done in the vertex shader
- [x] Scroll-driven hero story, pinned, reversible, one animation owner; layer call-outs follow the peel
- [x] 8 railway component models, each with an "action" animation, drag to rotate, scrub slider
- [x] Renders only when something changes and the canvas is on screen; three.js is lazy-loaded
- [x] Fallbacks: reduced motion, no WebGL and lost WebGL context show a still image plus text; phone framing and lower quality tier
- [x] Reveal animations use IntersectionObserver (fixes content stuck at opacity 0)

### Quality checks run
- [x] `tsc` clean; `next build` OK (38 routes); lint 0 errors (20 warnings)
- [x] Chrome tests at 1440×900 and 390×844: story forward and reverse, no stuck-invisible content, no sideways overflow, no console errors
- [x] Mega menu, form validation and a real enquiry saved to the database (test record removed)

> After the folder move (3 Nov 2026): dependencies installed (516 packages, Payload 3.92.1, Node 22), `npm run typecheck` clean, `npm run build` passes, and `vaishno.db` holds all 28 products.
> **Clone test passed:** a fresh `git clone` followed by `npm ci`, `npm run seed` and `npm run build` works and seeds 28 products plus company info. `.env`, `vaishno.db`, `media/` and `Segregated picture/` are not in git, so a teammate must copy `.env.example` to `.env`, run `npm run seed`, then create their own admin user at `/admin`. The database is SQLite, so each person has their own copy; a shared database needs Postgres.

### Setup state in this folder
- [x] Payload CMS and all dependencies installed (`node_modules` present; no `npm install` needed)
- [x] Database present and seeded (re-create with `npm run seed`)
- [ ] Production `.env` values (`PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, `DATABASE_URL`)
- [ ] First real admin user created at `/admin`

### CMS migration (4 Nov 2026) — all six phases done
- [x] Phase 1: Site Settings (logos, favicon, share image, tagline, preloader, SEO) and Company Info contact fields
- [x] Phase 2: Navigation (header links, mega-menu columns, catalogue card, footer)
- [x] Phase 3: text and photos of every page, as one editable "page" per route (Home, Products, Company, Industries, Resources, Contact, Career)
- [x] Phase 4: Product categories collection; certificate, catalogue and download PDFs can be uploaded
- [x] Phase 5: Theme global (five colours, two fonts) applied through CSS variables; line art and sliders follow the theme
- [x] Phase 6: `npm run snapshot` copies CMS content into `src/seed/snapshot.json`, which the GitHub Pages build reads; README explains both ways of publishing
- [x] Career page with an application form (Careers → Applications, private resumes)
- [x] Dark/light theme toggle in the header (moon/sun icon), remembered per browser. Dark mode re-maps the fixed Tailwind colour classes in `src/styles/globals.css`; the hero and product viewers use a dark-grey backdrop (`--stage-bg`); header and footer logos sit on a white plate
- [x] Header: navigation aligned right, icon on the Contact link
- [ ] The earlier Jobs collection is hidden but still in the code; remove it with its table in a planned migration
- [ ] Dark mode: the loading screen (preloader) is still white; new pages that use other Tailwind colour classes may need a line in the dark block of `globals.css`
- [ ] Pages is a copy: after editing in the admin, run `npm run snapshot`, commit and push to update it
- [ ] Changing an existing field's type in a SQLite collection can make the schema push rebuild tables and lose data. Back up `vaishno.db` first (see the project notes)

## 2. To do

### A. Needs the client (blocking accuracy)
| # | Item | Why it matters |
|---|---|---|
| 1 | Drawings or datasheets for the 8 railway components | Their 3D models are illustrative; the pages have no specifications |
| 2 | IRIS certificate | Shown as "Stated by the company" until supplied (ISO 9001 and 14001 certificates are in, see D2) |
| 3 | Confirm Governor hose GH-4 values | Catalogue prints 414 bar burst against 7 bar working pressure |
| 4 | Confirm RDSO, Lucknow wording | Listed as a customer; may be an approving body |
| 5 | Confirm the four category photos in `public/assets/` | Origin unknown; client says they have no professional photos. The client has since shared a Drive folder of product images (see section D) |
| 6 | Decide on `satvir21@gmail.com` being public | Printed on the catalogue back cover; shown on contact pages |
| 7 | Supply a full product catalogue for railway items | The hose catalogue covers hoses only |
| 8 | Review the two competitor sites named in the brief | Not reviewed yet (tvsrubber.com/Railways.html, srmexoflex.com) |

### B. Development, before launch
| Priority | Task |
|---|---|
| High | Email or WhatsApp notification when an enquiry arrives (currently stored in the CMS only) |
| High | Spam protection on the public enquiry endpoint (rate limit or captcha) |
| High | Production hosting: set `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, a persistent database (Postgres recommended for multi-instance), media storage. Variables are listed in `.env.example`; `DATABASE_URL` is currently `file:./vaishno.db` |
| High | Create the real admin account(s); remove any seed or test credentials |
| High | Test on real phones and tablets (only desktop Chrome and an emulated phone viewport were tested) |
| Medium | Screen-reader and keyboard pass on the mega menu, quote modal and hero story |
| Medium | Performance budget run (Lighthouse) and check frame rate on a low-end phone |
| Medium | Replace the illustrative railway models with drawing-accurate ones once drawings arrive |
| Medium | Extract real factory and building photos from the catalogue (pages 2, 3, 12) with the client's approval |
| Medium | 301 redirects from old vaishnorubber.com URLs (existing URLs have not been audited) |
| Low | `sitemap.xml` and `robots.txt` (neither exists in `src/app` yet) |
| Medium | Apply the new "drawing sheet" header (`SheetHero`) to the Products pages, which still use `PageHead` |
| Low | Quote modal still uses the old legacy layout and copy; restyle to match the new pages |
| Low | Clean the 20 lint warnings (unused variables, anonymous default exports) |
| Low | Optional: Hindi or other language, dealer pages (client said no dealer locator) |

### C. Out of scope so far
- Defence sector content (client wants to target it; not claimed anywhere on the site)
- Export or technology-transfer landing page beyond the short block on the Company page
- WebGPU (WebGL2 only; no verified benefit for this scene)

### D0. Hero product slides and hose models (3 Nov 2026)
- [x] Hero has four family tabs: Hydraulic, Industrial & LPG, Automotive, Railway components. Choosing one restarts the scroll story from the top
- [x] Railway slide built (`src/components/home/RailwayHero.tsx`): the pinned hero steps through the 8 railway components, and scroll scrubs each part's action. Uses the existing railway models and demo stage; falls back to a plain list on reduced motion or no WebGL
- [x] Hydraulic hose model rebuilt from the client photos: blue-cap swivel ends, and a 2-bolt flange end on one end of SAE 100 R1
- [x] Industrial hose: wrapped cover with spiral seam, clamped nipple and red cap on both ends. LPG and automotive: red-nut ends
- [x] Air brake hose coupling model rebuilt from the photos (white BP and green FP coupling bodies, wrapped hose with spiral seam, band clamps, red dust caps, lever latch). The "VRIPL AAR-M-601" marking is not printed on it
- [x] Railway slide has a clickable list of all 8 parts in the left column, and the model is framed so it is not cropped
- [x] Tried rebuilding the elastomeric pad and the gangway vestibule from the client photos; the client side preferred the earlier versions, so the original laminated pad and pleated gangway are back. The photo-based shapes (green channel plate on a scooped rubber block; thick U-shaped vestibule with label plate and bolted strip) are not in the code now
- [x] Smooth scroll transitions on the Railway slide: each part slides and fades out while the next slides and fades in, in both scroll directions. Rubber now has a surface grain on all railway models
- [ ] The other 5 railway models (UIC flange, FIAT bogie bush, PU side bearer, elastic ring, spheribloc) are still the early illustrative ones; no photos have been supplied for them yet
- [ ] Fitting-to-family choices for industrial, LPG and automotive are guesses from photos that are not labelled by product; the client should confirm, including which hydraulic products take flange or red-nut ends
- [x] Railway slide phone layout fixed (model above, part card below, no overlap); checked in the 375 px emulator
- [ ] Railway slide not yet tested on a real phone

### D1. Inner pages redesigned (3 Nov 2026)
- [x] Company, Industries, Resources and Contact redesigned around an "engineering drawing sheet" look: ink-navy header with a signature line drawing that draws itself once (hose cross-section, rails to the horizon, pressure dial, contour map of the works), a laminated rubber/steel rule under it, and paper-white sections
- [x] Real client photos used: hose range and vestibule label (Company), vestibule and hydraulic fittings (Industries). Resized copies are in `public/assets/photos/`. The lab photo was not used because it shows an identifiable person
- [x] Resources: the pressure converter drives a live dial, the flow calculator draws the computed bore against the standard sizes, and each of the 8 installation points has a line diagram
- [x] Contact: details laid out like a drawing title block, underlined form fields; form logic unchanged
- [x] Checked at 1440 px and 375 px: no sideways overflow
- [ ] LPG sector on the Industries page uses a line drawing because no LPG photo has been supplied
- [ ] Shared graphics live in `src/components/site/graphics.tsx`; the old `PageHead` is still used by the Products pages
- [ ] Not yet checked: keyboard and screen-reader pass on the new pages, and a real phone

### D2. Certificates and quote buttons (4 Nov 2026)
- [x] Added the two ISO 9001:2015 certificates shared on WhatsApp (BSCIC no. BN23392/22379, valid to 5 Dec 2027; QFS no. SCC/2403VU/2032, valid to 14 Mar 2027). PDFs are in `public/documents/`, listed on Company, Home, Resources and the footer. The ISO 14001 PDF supplied again is identical to the one already on the site
- [x] Animated ISO badges (`src/components/site/CertBadge.tsx`): the 9001 ring turns slowly (faster on hover), the 14001 globe draws itself once; both stop for reduced motion
- [x] "Request a quote" removed from the header, mobile menu, footer, hero slides, home sections, Products pages and Contact. Remaining calls to action link to the Contact page. The quote modal code is still in the project but nothing opens it
- [ ] BSCIC certificate says 1st surveillance was due 5 Dec 2025; ask the client for the surveillance letter before relying on it as current
- [ ] Decide whether to delete `EnquiryModal` and the unused `openEnquiry` plumbing

### D. Client product images (in progress)
- Received in `Segregated picture/`: Hose (34 photos), Vestibule (14), EM Pad (10), Lab and testing (3); Production and Store folders were empty. Files are about 6 MB each and need resizing before use.
- Source: client's Google Drive folder `drive.google.com/drive/folders/1K156e6JuU_krWXFGyXda5pUVjaeGJkh9`
- [x] Reviewed the hose, vestibule and pad photos and used them for the hero models and the inner pages (see D0, D1)
- [ ] Match each image to a product (28 products: 20 hoses, 8 railway components) and note which have none; only the air brake coupling, hose fittings, vestibule and pad have been used so far
- [ ] Check quality: resolution, watermarks, whether they are the client's own photos
- [ ] Add to the CMS Media collection, link to products, and replace the unverified category photos in `public/assets/`
- [ ] Optimise (resize, WebP) before use

## 3. Housekeeping
- Project now lives in `vaishnowRubberWebsite`. The old `rubberCase` folder is empty except for a stray `.claude-flow` directory; it can be deleted.
- Git: `main`, remote `origin` = `github.com/Rishi-G/vaishnowRubberWebsite`. The hero tabs, hose and railway models, and inner-page redesign are committed (`93a8daf`, `812bb6a`, `7124308`). This file is committed on its own.
- Work is paused (3 Nov 2026) until the client replies with photos and confirmations (section 2A, D0, D).
- `_legacy/` holds the earlier static and React versions and the old 3D test page (including a large `node_modules`). It is already in `.gitignore`; delete it once you are happy.
- `.env` holds a generated local secret. It is git-ignored; do not commit it.
- Local database `vaishno.db` holds seeded data only. It is git-ignored; re-create it any time with `npm run seed`.
- Full verified and unverified claims list: see `README.md`.
