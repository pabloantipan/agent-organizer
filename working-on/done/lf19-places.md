---
title: "Settings has its heading, Help is an overlay, the bar's last marks"
status: done
repos: [organizer]
branch: lf19-places
seat: pl-build
stage: one-window
updated: 2026-10-11
next: "review: lf19-places, gate met (L1-L6, X0), 79d9049"
depends_on: []
boundary: ["docs/specs/leftovers-19.md Boundary, lf19-places"]
spec: "docs/specs/leftovers-19.md (FR-1 to FR-6; initiatives-view Amendment 4, I28-I32)"
gate: "docs/specs/leftovers-19.md Acceptance, rows L1, L2, L3, L4, L5, L6 and X0"
ui_review: true
review: pass
---

## Goal
lf18-current-mark's UI review U1-U5 and the title (Aglaea, e93a3ef).

## Gate
docs/specs/leftovers-19.md, rows L1, L2, L3, L4, L5, L6 and X0.

- [x] L1: `.wt-notes/pl-build/L1-L6-vitest.log`, `ax-L1-settings.txt`
- [x] L2: `.wt-notes/pl-build/L1-L6-vitest.log`, `ax-L2-initiative.txt`, `ax-L2-after-back.txt`
- [x] L3: `.wt-notes/pl-build/L1-L6-vitest.log`, `styles-stale.json`, `styles-fresh.json`, `styles-fresh-regular.json`
- [x] L4: `.wt-notes/pl-build/L1-L6-vitest.log`, `ax-L4-help-over-home.txt`, `ax-L4-help-over-settings.txt`, `ax-L4-help-over-initiative.txt`
- [x] L5: `.wt-notes/pl-build/styles-initiative-off.json`, `L5-initiative-1280.png`
- [x] L6: `.wt-notes/pl-build/L6-grep.txt`
- [x] X0: `.wt-notes/pl-build/X0-make-test.log`, `X0-pnpm-build.log`, `X0-wails-build.log`, `X0-git-status.txt`

## Done
- 2026-10-11 pl-build: Settings h1, rail back link to Initiatives, Sync ghost, Help as an overlay (aria-expanded, no aria-current), title at 600, `.needs-me.on` gone; gate met at 79d9049.

## Notes
- Help dropped `aria-haspopup`: with it WebKit exposes `?` as a pop-up button without AXExpanded, so the open state was invisible to AX (34d2866). The Memory button has the same blindness; outside this card.
- L5's computed style is read in an offscreen WKWebView with the review build's css (the review app's page is AX-only); the review app's shot shows the result.

## UI review
- pl-ui, 2026-10-11, at 79d9049 (the branch did not move). **Verdict: pass.** No severity 4 or 3.
- How each state was checked. The review build (`make review-build`, fixture, auth off, pid 61099) launched, but the Mac's screen was locked from 02:35 (`CGSSessionScreenIsLocked=1`): AX returned no window and `screencapture -o -l` could not create an image. I did not wait for Pablo, so every row was judged off screen, in `.wt-notes/pl-ui/`:
  - L1-L5 vitest: `vitest-L1-L5.log` (Places, TopBar, place: 35 passed).
  - L1, L3, L4, L5 computed styles: my own bar and Settings markup (a scratch render, deleted after) in an offscreen WKWebView with this build's css, saved as `markup/*.html` and `styles-*.json`. L1: the `h1` reads `Settings` at 20px/600 `--fg`, the same as Initiatives' `h1`. L3: Sync is `ghost` with a transparent background and border, fresh or stale, at compact and regular, and no button in the bar has the accent fill. `stale` is rgb(217,70,239) and is the only magenta in the bar. L4: Help over Settings gives `?` and the gear both `--surface-selected` with `--fg`. L5: the title is `--fg` at 600, no text-decoration, no box-shadow, against the tabs' `--fg-muted` at 500.
  - L6 `L6-grep.txt`: empty (rc 1).
- Findings (none blocks):
  - U1 (1) **What the lead cannot do:** with Help open over Settings, he cannot tell from the bar which control is the screen and which is the overlay. **Where:** `?` and the gear in the bar (`styles-controls-help-over-settings.json`). **Evidence:** both buttons compute to the same background, rgb(47,27,85), and the same `--fg`. AX tells them apart (expanded against current); the eye cannot. Help covers the content, so the lead loses nothing he can act on. **Severity:** 1. **Proposal:** none now. If it bothers anyone, give the expanded `?` a 1px `--border-strong` ring.
  - U2 (1) **What the lead cannot do:** a keyboard user does not land on Settings' new `h1`. Initiatives' `h1` takes focus on navigation (`tabIndex=-1`, focus-visible ring); Settings' does not, so focus stays on the gear. **Where:** `Settings.tsx`, `.settings-title`. **Evidence:** read from the code, not seen. **Severity:** 1. **Proposal:** none for this card. The design system's "focus onto what a navigation names" would cover it.
- Spec gaps (for the FSE): FR-2 says "back link", but the built control is the whole rail hero as one button. Its accessible name is the hero's stats followed by "Initiatives", and its press lands on the initiative's own card (`openInitiatives(id)`). That matches I29's intent; the spec never said whether the back is a separate control.
- For aglaea: U1, whether the opened `?` and the current gear should differ when both are lit.
- Not verified in WKWebView: every on-screen row (L1 AX heading, L2 AXPress on the hero landing on Initiatives, L4 AXExpanded and `aria-current` count, L5 shot), because the screen was locked. They rest on vitest, on the computed styles above, and on the builder's AX dumps from 02:26 (`.wt-notes/pl-build/ax-L*.txt`, `L5-initiative-1280.png`), which agree. No shots were taken. Firebase states (L3) are vitest plus computed styles only, by rule.

## Review
- **Verdict: pass.** Unmet rows: none. Reviewer `pl-review`, 2026-10-11, commit 79d90499156cd96d664c07393ed4a6dee83af8dc (the branch did not move). Evidence in `.wt-notes/pl-review/`.
- I ran these from a fresh clone at that SHA (removed after): `make test`, the three vitest files, the grep, a markup render, the review build. The diff stays inside the Boundary (TopBar, Settings, the Rail hero and its two helpers, the `.sync-stale`, Settings `h1`, `.crumbs b` and `.needs-me*` rules, tests) and touches neither No-go.
- L1: `L1-L6-vitest.log` (Places, TopBar, place: 35 passed): `h1` `Settings` comes first, before Identity or Account, while loading and once loaded. AX: the builder's `ax-L1-settings.txt` has AXHeading level 1 `Settings` above Identity.
- L2: vitest `heroBack` and `pressHero` (on an initiative, the hero reads `← Initiatives` and calls `openInitiatives(id)`). AX: the builder's `ax-L2-initiative.txt` and `ax-L2-after-back.txt` (after AXPress, the Initiatives tab is current=page, `h1` Initiatives).
- L3: vitest over six Sync states. My own WKWebView render of my build's css (`styles-*.json`): Sync is `ghost` with a transparent background and border at compact, regular, fresh and stale; `stale` is rgb(217,70,239) = `--tone` and is the only magenta in the bar.
- L4: vitest over five screens: `?` has `aria-expanded="true"` and no `aria-current`, and there is exactly one page mark, the screen's. AX: the builder's `ax-L4-help-over-{home,settings,initiative}.txt` agree (expanded=1; the one current=page is Home, Settings or `init-a`).
- L5: my WKWebView render: the title is rgb(238,235,244) = `--fg`, 600, no decoration, no box-shadow, against the tabs' `--fg-muted` at 500. The builder's shot `L5-initiative-1280.png` agrees.
- L6: `L6-grep.txt`: empty, rc 1.
- X0: `X0-make-test.log` (16 go packages ok, 524 vitest), `X0-pnpm-build.log`, `X0-wails-build.log` all rc 0; `X0-git-status.txt` empty; no `package-lock.json`.
- Not rerun by me: the review-process halves of L1, L2, L4 and L5. The Mac's screen was locked from 02:35, so AX gave back only the app element (a scratch window of my own read the same) and `screencapture -l` could not make an image. Those halves rest on the builder's 02:25 dumps, which match the code. L5 as written ("computed style in the review process") cannot run: the review page exposes AX only. For the FSE.
