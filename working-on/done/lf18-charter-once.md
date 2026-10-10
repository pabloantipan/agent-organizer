---
title: "A fact shows once: Charter omit, card hover on body, readOnly detail, header pills wrap"
status: done
repos: [organizer]
branch: lf18-charter-once
seat: co-build
stage: one-window
updated: 2026-10-10
next: "review: lf18-charter-once, H1-H5 and X0 met, e4757ef"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-charter-once"]
spec: "docs/specs/leftovers-18.md (FR-4 to FR-7b; initiatives-view Amendment 3, I25-I27)"
gate: "docs/specs/leftovers-18.md Acceptance, rows H1, H2, H3, H4, H5 and X0"
ui_review: true
review: pass
---

## Goal
lf17-initiative-card's review Q1, U2-U4 and the header at 1024 (Aglaea, 237db96).

## Gate
docs/specs/leftovers-18.md, rows H1, H2, H3, H4, H5 and X0.

- [x] H1: `frontend/src/components/CharterOnce.test.tsx` (H1); on screen `.wt-notes/co-build/chromium-1024x640-H2-init-asleep-open.png`, `.wt-notes/co-build/h2-h4-chromium-1024x640.json` (openCharterLabels)
- [x] H2: `CharterOnce.test.tsx` (H2); computed style `.wt-notes/co-build/h2-h4-chromium-1024x640.json` (H2)
- [x] H3: `CharterOnce.test.tsx` (H3); `.wt-notes/co-build/h3-chromium-1024x640.json`
- [x] H4: `CharterOnce.test.tsx` (H4); review app AX `.wt-notes/co-build/ax-h4-open.txt`, `.wt-notes/co-build/ax-h4-folded.txt`, `.wt-notes/co-build/review-1024x640-H4-*.png`; scrollWidth `.wt-notes/co-build/h2-h4-chromium-1024x640.json` (H4)
- [x] H5: `CharterOnce.test.tsx` (H5)
- [x] X0: clean clone of e4757ef on main 3bd5bde: `.wt-notes/co-build/x0-make-test.log`, `.wt-notes/co-build/x0-npm-build.log`, `.wt-notes/co-build/x0-wails-build.log` pass; `.wt-notes/co-build/x0-porcelain.txt` empty

## Done
- 2026-10-10 co-build: Charter `omit`, header omits target and stage, open card shows the goal once, raise on body only, `InitiativeDetail` `readOnly`, header pills wrap, sub-tabs `aria-current="true"` (5e32bd0, 9bae689, 0994bb5, d09d9ee, e4757ef, rebased on main after lf18-build-drift merged); how to reproduce in `.wt-notes/co-build/progress.md`

## Notes
- X0 first ran before lf18-build-drift merged (runtime mode flips and package-lock.json in porcelain); rerun after the rebase: empty.
- Before the fix the header ran to 1878 px at 1024 while the document's scrollWidth stayed 1024 (an ancestor clips): H4's header frame is what catches it, not scrollWidth alone.
- Home passes no `readOnly`: it lists only awake initiatives, so Home.tsx is unchanged.

## UI review
- 2026-10-10 co-ui, **pass**. Checked on 242dc0c (review build, WKWebView, fixture with init-asleep given every pill, copied from co-build's `app.sh`). The branch has since been rebased to e4757ef; its frontend differs from 242dc0c only by lf18-build-drift's `.usage-btn` removal, so every row stands there. Shots and AX under `.wt-notes/co-ui/`.
- How each row was checked:
  - H1: AX and shot of the review app. Open header Details show Goal, Measure, Scope, no Target or Stage (`wk-1024x640-H1-header-open.png`, `ax-H4-header-open.txt`). The open init-asleep card has no goal line in its head and one in the Charter, with every field (`wk-1024x640-H1-card-init-asleep-open.png`). On the open init-a card the goal text appears once (`ax-init-a-open.txt`).
  - H2: code read (`raisesOn` on `.ic-main`'s `onMouseOver`, cleared on leave; the details region sits outside `.ic-main`). vitest `CharterOnce.test.tsx` and `InitiativesView.test.tsx`: 23 passed. Computed styles from co-build's Chromium run (rest rgb(39,32,51), raised rgb(46,39,60) on the body only, open and closed, Sleep and Wake). Not verified in WKWebView, see below.
  - H3: AX. init-a's Workspace ends in Review with agent; init-asleep's ends in Copy review prompt. grep: the `.init-actions > button:last-of-type` rule is gone.
  - H4: 1024×640, rail open (250 px), on init-asleep, AX frames folded and open. The header is 774 wide (1250-2024). Every pill's right edge is at or below 2004, so pills wrap to a second line. No horizontal AXScrollBar (`wk-1024x640-H4-header-folded.png`).
  - H5: AX `AXARIACurrent` on the review app. Overview reads `true`, the other sub-tabs `false`, and the screen has one `page` (the top bar's).
- Findings (none severity 4 or 3):
  - U1 (1), for aglaea. What: the id link does not raise the card, although its press opens the initiative just as the body's does. Where: the Initiatives card head, `Open <id>`. Evidence: `raisesOn` treats the link as a control (`pressOf` CONTROLS includes `a`), as co-build chose and noted in progress.md. Amendment 3 §4 calls the body "the stretched link". Proposal: say whether the id is part of the body for the raise; if it is, raise over it too.
  - U2 (1). What: the header's Details button grows from 76×24 (`Details`) to 103×33 (`Hide details`), so the bar row is taller when open. Where: `.ihead-details`. Evidence: AX frames in the two `ax-H4-header*.txt` files. Proposal: one height for both labels. It may predate this card; not checked on main.
  - U3 (1). What: at 1024×640 the open header (compact, 40vh) scrolls inside itself, and the stage strip sits below the fold. Where: the open initiative header. Evidence: `wk-1024x640-H1-header-open.png`. The bar's stage button stays in view, so the fact stays on screen once. Proposal: none now; co-build noted it too.
- Not this card's, seen in passing: on an initiative the top bar still marks `Home` with `aria-current="page"` and shows `/ init-asleep`. That is lf18-current-mark's (K1, K2), not merged here. Overview's two columns side by side at 1024 belong to lf18-narrow.
- Spec gaps for the FSE: H2 asks for a "computed style on the review process", which needs a pointer hover that 0108 forbids on the review app (AXPress cannot hover). The row should name Chromium on wails dev, or vitest alone, as its screen evidence. Amendment 3 §4 does not say whether the id link counts as the body (U1).
- Design questions, for aglaea: U1 (does hovering the id raise the card?).
- Not verified in WKWebView: H2's hover (no pointer input allowed). Its evidence is vitest plus co-build's Chromium computed styles. Also not checked: the document's `scrollWidth` (AX cannot read it; the absence of a horizontal scroll bar and the pill frames stand in for it, and co-build's Chromium run gives 1024 = 1024).

## Review
- **pass.** Reviewer co-review, 2026-10-10, on 242dc0c. The branch was rebased to e4757ef during the review; `git diff main...e4757ef` is the same patch as `main...242dc0c` (index lines aside), so the verdict stands for e4757ef. Evidence under `.wt-notes/co-review/`.
- H1: diff read (`Charter` `omit`, `COLUMNS` plus one `Field` per name; `HEADER_OMITS` = target, stage; open card's `ic-goal` behind `!open`). vitest `CharterOnce.test.tsx` H1 passes. Review app AX at 1024×640, open header: Charter labels GOAL, MEASURE, SCOPE, no Target or Stage line; bar keeps `target 20 Nov` and the stage button (`ax-h4-open.txt`). Chromium: open init-asleep card shows the goal once.
- H2: diff read (`raisesOn` = `pressOf(...) === "open"` on `.ic-main`'s mouseover, cleared on leave; `.ic:not(.open):hover` replaced by `.ic.raised`). vitest H2 passes. Computed style rerun by me in headless Chromium on my own `wails dev` at 242dc0c (`h2-h4-chromium-1024x640.json`): rgb(46,39,60) and `.raised` on the body, closed and open, for init-a and init-asleep; rest rgb(39,32,51) over Details, Sleep, Wake and the open details.
- H3: diff read (`readOnly` through `InitiativeDetail` to `Actions`; `CardDetails` passes it). vitest H3 passes. grep of `frontend/src/styles` for `last-of-type`, `ic-ws.read-only`, `read-only.local`: nothing.
- H4: review app (own pid) AX-resized to 1024×640, rail open, on init-asleep with every pill: header 1250-2024, every pill's right edge ≤ 2004, folded and open, no AXScrollBar (`ax-h4-folded.txt`, `ax-h4-open.txt`, `review-1024x640-H4-folded.png`). Chromium: `scrollWidth` 1024 = `clientWidth` 1024, folded and open, no sideways scroller; with main's nowrap injected the header runs to 1878.
- H5: diff read (`aria-current` "true"). vitest H5 passes on all six sub-views; AX shows Overview `.on`.
- X0: fresh clone at 242dc0c: `make test` (Go ok, vitest 36 files / 496 tests), `npm install && npm run build`, `wails build` all exit 0. Porcelain at 242dc0c alone: the three `wailsjs/runtime` flips and `package-lock.json` (lf18-build-drift, not then on the branch). The same commit merged onto main (with lf18-build-drift), then `wails build`: porcelain empty (`x0-merged-porcelain.txt`); that is the state e4757ef carries.
- Unmet: none.
- Gate gaps: H2's "computed style on the review process" cannot run under 0108 (a hover needs pointer input); it was checked in Chromium, as the UI review also notes. H4's `scrollWidth` is not readable through AX either; Chromium gives it.
