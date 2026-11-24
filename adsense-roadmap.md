# AdSense-approval roadmap — sjbijbel.app

Current state (24 nov 2026): 3 crawlable pages (`/`, `/about`, `/privacy`), 1 search tool that
redirects to Bible.com, Adsense loader present, `ads.txt` correct, no consent message, no
original content, domain ~2 months old. Zero chance of approval in this shape — the blocker
is content, not code.

Target: apply once, pass first time. Realistic: 3–5 weeks of work, then a 1–4 week review.

---

## Phase 0 — Before touching content (1 evening)

- [ ] Verify the site in Google Search Console (DNS record, it's on Cloudflare so it's 2 clicks).
- [ ] Submit `https://sjbijbel.app/sitemap.xml` in Search Console.
- [ ] Make sure all real pages get indexed (Search Console → URL inspection → Request indexing).
- [ ] Remove or block `/README.md` and `/secret.html` from the deployed assets. Right now
      `https://sjbijbel.app/README.md` serves the repo readme with the slurs in it. Google's
      reviewer will find it, and it can get you rejected for "content" alone.
- [ ] Decide the site's purpose in one sentence. Write it on `/about`. This becomes the
      editorial line every new page has to fit.

Definition of done: Search Console shows the 3 URLs indexed, `/README.md` returns 404.

---

## Phase 1 — Content base (2–3 weeks, the actual work)

AdSense does not publish a page minimum. Reviewers judge "does this site have enough original,
useful content that a visitor came for". For a Bible reference tool that means: the tool alone
is not content, the pages around it must be.

Target: **20–25 pages of original Dutch text**, roughly 150–300 words each, no filler.

Per-book pages (the backbone, do ~15 first):
- [ ] One page per Bible book, route `/bijbel/genesis` etc.
      Each page needs to stand alone:
      - 2–3 paragraphs: what the book is, who wrote it, theme, why you'd search it.
      - Chapter grid linking to Bible.com (this is the actual utility, not padding).
      - 3–5 notable passages with one-line context.
      - Link back to the search tool, pre-filled where possible.
- [ ] Do NOT mass-generate 66 identical pages with one swapped word. That is exactly what
      "low value / auto-generated content" means and it gets rejected fast. Better 15 real
      pages than 66 stubs.

Guides / explainers (pick 5–8):
- [ ] Hoe lees je een bijbelverwijzing (Johannes 3:16, 1 Kor 13:4-7, ...) — genuinely useful,
      answers a real query.
- [ ] Welke Bijbelvertalingen zijn er (HSV, NBV21, BGT, Statenvertaling) en welke gebruikt Bible.com.
- [ ] Veelgezochte Bijbelteksten bij o.a. rouw, trouwen, examens, angst.
- [ ] Hoe de zoeker werkt + zoektips (boekafkortingen, versbereik).
- [ ] Over het project / SJB (expand the current about page).
- [ ] Contact page with a real, working e-mail address (not only a modal).

Definition of done: 20+ URLs in the sitemap, every page has unique title/description/H1, no page
is a copy of another, and the site is genuinely usable for someone who lands on a book page
directly from Google.

---

## Phase 2 — Site quality pass (1 evening)

- [ ] One `<h1>` per page, logical heading order.
- [ ] Unique `<title>` and `<meta name="description">` on every page.
- [ ] Internal linking: every book page links to 2–3 related pages, footer links to the guides.
- [ ] `sitemap.xml` regenerated with every new URL + correct `lastmod`.
- [ ] 404 behaviour: unknown URL returns an actual 404 page, not the homepage.
- [ ] Mobile check at 360px width (they review on a phone).
- [ ] No console errors, no broken images, no `undefined`/placeholder text.
- [ ] Optional: `Organization` + `WebSite` JSON-LD, breadcrumbs on book pages.

---

## Phase 3 — Policy / consent (30 min, do before applying)

- [ ] Privacy policy already at `/privacy` — keep it accurate. When you add content pages,
      nothing changes there unless you add new third parties.
- [ ] No other ad network on the site. No popunders, no "atOptions", no redirect scripts,
      no `bauval.org`/Monetag/Adsterra leftovers. This was already the thing that got the site
      filtered by Telenet Safesurf.
- [ ] No affiliate links mixed into content pages (AdSense asks you to declare them, and for a
      school site it muddies review).
- [ ] Ads only in real slots: nothing that overlaps content, no ads above the fold that push
      content down on mobile, no 3 ads stacked.
- [ ] Ads.txt already correct: `google.com, pub-1917341992266293, DIRECT, f08c47fec0942fa0`.
- [ ] Google's own consent message (AdSense → Privacy & messaging → GDPR message) as soon as
      it's available in your account — without it, EEA traffic (all of BE/NL) gets no ads at all
      after approval.

---

## Phase 4 — Apply (once)

- [ ] Re-check: 20+ pages indexed in Search Console (not just in the sitemap).
- [ ] AdSense → Sites → add `sjbijbel.app` → submit.
- [ ] Do not touch the site's structure while it's under review. Adding a page is fine; renaming
      routes, removing pages or swapping ad code mid-review is not.
- [ ] Review usually takes days to 4 weeks. Silence is normal.

If rejected:
- [ ] Read the exact reason, map it to one phase above, fix that phase only.
- [ ] Wait ~2 weeks, then re-apply once. Don't spam applications — repeated submissions on an
      unchanged site slow everything down.

---

## Phase 5 — After approval

- [ ] Consent message live and tested from an EU IP (incognito, accept/decline both paths).
- [ ] 2–3 responsive ad units: one under the search results, one in the sidebar on desktop or
      between content blocks on mobile, one on book pages. No ads inside the search form.
- [ ] Watch RPM in the first weeks; low traffic means cents. Don't chase it by adding networks —
      that's what got you blocked by the ISP filter.
- [ ] Report the domain as "safe" on the Telenet Safesurf block page so students on the school
      network can reach it again (separate from AdSense, but same audience).

---

## Do not

- Mass-generate filler pages to hit a number.
- Copy Bible commentary text from other sites.
- Add a second ad network "in the meantime".
- Buy traffic, use popunders, or put ads behind the search button.
- Re-apply every few days with no changes.

---

## Timeline

| Week | Work |
|------|------|
| 1 | Phase 0 + 8–10 book pages, 2 guides |
| 2 | Rest of book pages, 3–4 guides, contact page |
| 3 | Phase 2 quality pass, index everything, Phase 3 policy pass |
| 4 | Submit application |
| 5–8 | Review outcome; if rejected, fix one phase, wait 2 weeks, resubmit |
