---
title: "Long bodies and code blocks scroll from the keyboard"
status: done
repos: [organizer]
branch: lf26-scroll-stops
seat: ss-build
stage: one-window
updated: 2026-10-14
next: "done: merged to main (sup62)"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-scroll-stops"]
spec: "docs/specs/leftovers-26.md (FR-1 to FR-3, FR-9, FR-10; tab-reaches-links Amendment 3, T22 and §1 names)"
gate: "docs/specs/leftovers-26.md Acceptance, rows S1, S2, S3, S4, D1 and X0"
ui_review: true
review: pass
---

## Goal
Long bodies and code blocks scroll from the keyboard (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows S1, S2, S3, S4, D1 and X0.

- [x] S1: body stop `<title>, details`, Down ×3 scrollTop 40/80/80 3/3 (Amendment 3, inactive-none); not a stop at 1440 — `.wt-notes/ss-build/s1-inactive-run1..3.jsonl`, `.wt-notes/ss-build/s1-long-1024.jsonl`, `.wt-notes/ss-build/s1-short-1440.jsonl`
- [x] S2: `Code, scrolls`, Right ×3 scrollLeft > 0 3/3; vitest of the hook over pre/table — `.wt-notes/ss-build/s2-settle-run1..3.jsonl`, `frontend/src/lib/useScrollEdges.test.ts`
- [x] S3: trap walks body, code block and table, never `body`, 5/5 — `.wt-notes/ss-build/s3-walk-1024-run1..5.jsonl`, `.wt-notes/ss-build/s3-walk-1024-amend1.jsonl`
- [x] S4: each region a stop while it overflows, named as FR-3 / by its heading (Amendment 1 roles kept) — harness `.wt-notes/ss-build/s4-{role,rule,float,header,help}.jsonl`, AX `.wt-notes/ss-build/s4-ax-{role,rule,float,header,help}.txt`, vitest `frontend/src/components/ScrollStops.test.tsx`
- [x] D1: `AXList` with 5 items; line 101 "an inline list" — `.wt-notes/ss-build/d1-ax-tree.txt`, `.wt-notes/ss-build/d1-roles-101.txt`
- [x] X0: clean clone of 052e17f, make test (621 vitest, go ok), pnpm build, wails build pass, porcelain empty — `.wt-notes/ss-build/x0-summary.txt`, `.wt-notes/ss-build/x0-*.log`

## Done
- ss-build, 2026-10-14: scroll regions are Tab stops only while they overflow (`scrollStop` in `lib/useScrollEdges.ts`), named per FR-2/FR-3; role drawer list and roles.css comment; rebased on main; gate met at 052e17f. Reproduce: `.wt-notes/ss-build/progress.md`.

## Notes
- Found: CardDrawer re-sets its markdown on a same-text refresh, so a focused link in the body loses focus (fixed for pre/table only, links outside this card). A region that stops overflowing while focused drops its tabindex and focus falls out. Carry: fold `inactiveSchedulingPolicy = .none` into `scripts/tab-harness/` (Amendment 3).

## UI review
ss-ui, 2026-10-14, every row on 052e17f (detached worktree, `Deltagos Review.app` built by `make review-build`; harness against my own `wails dev` on 34120; fixture, auth off). Verdict: **pass**. No sev 4 or 3. Shots and runs are in `.wt-notes/ss-ui/`.

How each row was checked:
- S1: harness at 1024×640 (`--inactive-none on`, Amendment 3), the long card `Cut the scan report…`. Tab 2 lands on the body, named `Cut the scan report to what is read, details`, `role=region`. Down ×3 gave scrollTop 80 and End gave 257, 3/3 (`s1-run1..3.jsonl`). The ring is drawn inside the body (`wkwebview-1024x640-S1-body-focused-run1.png`). At 1440×900 the short `Beta card` has no tabindex, role or label and is never reached in 10 Tabs (`s1-short.jsonl`).
- S2: the pre is `Code, scrolls`, role region. Right ×3 gave scrollLeft 40/40/80, 3/3 (`s2-run1..3.jsonl`, `wkwebview-1024x640-S2-code-focused-run1.png`). The table keeps its own role (none set) and is labelled `Table, scrolls`; Right ×3 gave 80/0/80, a harness timing flake like the builder's. Vitest: `useScrollEdges.test.ts`, `ScrollStops.test.tsx` and `RoleDrawer.inits.test.tsx` pass 23/23.
- S3: 14 Tabs then 6 Shift+Tabs (`s3-walk.jsonl`). The walk goes Close, body, comment, code, table, the side actions, then wraps to Close. It is never BODY.
- S4: the harness reads name and stop for each region, and I shot each one focused:
  - header: `Details of init-a`
  - role drawer: `Hephaistos, details` (it overflows by 4 px and is still a stop)
  - rule box: `Record 0008, The organizer's roadmap, as it was proposed`
  - Help: labelled by its h1 `Help`; its code blocks don't overflow at 1024, so none is a stop
  - floating list: at 360×420 it is `Initiatives list`, keeps `listbox`, and is in the panel's Tab loop. At 1024 it does not overflow and is not a stop.
  - AX of the real float panel in the review build: `AXList "Initiatives list"`.
- D1: AX by the review build's pid: `AXList .rd-inits` with 5 `Open init-*` links (`ax-role.txt`, `wkwebview-1024x640-D1-role-drawer.png`). roles.css:101 reads "an inline list".
- X0: read from the builder's evidence (`.wt-notes/ss-build/x0-summary.txt`: all four zero, porcelain empty). My own `make review-build` at 052e17f passed. I did not rerun make test.

Findings (none fails):
- **U1 (sev 2) The floating list's focus ring falls outside the panel.**
  - What the lead cannot do: tell that the list has focus. Only a line at its top can show, under the search field.
  - Where: the floating panel, `.fl-body` (`wkwebview-360x480-S4-float-list-panel.png`, `ax-float.txt`).
  - Evidence: in the review build the list spans the whole 360 px of the panel and ends at its bottom edge (AX `@3056,785 360x432` in a `360x480` window). Its computed `outline-offset` is 2px (the global rule), and two ancestors are `overflow: hidden`. So the ring falls outside the window on the left, right and bottom.
  - Proposal: `.fl-body:focus-visible { outline-offset: -2px }`, like the other regions. `float.css` was outside this card's boundary.
  - Not seen focused in the real panel (no keys there); the harness snapshot of float mode came out blank.
- **U2 (sev 2) The inset ring covers the edge of the text in the rule box's record and the header's open area.**
  - What the lead cannot do: read the first column of glyphs cleanly while the region has focus.
  - Where: `wkwebview-1024x640-S4-rule-focused.png`, where the `0029` and `roadmap` line starts sit under the ring; `wkwebview-1024x640-S4-header-focused.png`, where `GOAL` touches it.
  - Evidence: `outline-offset: -2px` on a box with no inline padding.
  - Proposal: give the region the inline padding the ring needs, so the ring clears the text by 2 px (the design-system rule "ring clears the neighbour by 2 px").
- **U3 (sev 2) A wide code block in a role's hand-off is not a stop.**
  - What the lead cannot do: scroll it sideways from the keyboard.
  - Where: `RoleDrawer.tsx`, `.rd-handoff` (markdown set by innerHTML, `roles.css:115` `overflow-x: auto`).
  - Evidence: from code. `useMarkdownEdges` is not called on the hand-off, so it does not watch it. FR-3 says code inside the role drawer keeps `Code, scrolls`.
  - Proposal: call `useMarkdownEdges` on the hand-off body.
  - Not verified in WKWebView: the fixture's hand-off has no code block.
- U4 (sev 1) The comment textarea shows no ring on Tab: computed `outline: none 0px` in every walk. It predates this card and is outside its boundary.

Spec gaps (for the FSE):
- U1: the boundary left out `float.css`, so FR-1's ring could not be met for the floating list.
- U3: FR-2 lists "what `useMarkdownEdges` watches" while FR-3 promises names for code inside every region. The role drawer's hand-off falls between the two.
- When a focused region stops overflowing, focus falls out (the builder's note). No FR says where focus goes.

For aglaea: whether the inset ring is wanted over unpadded text (U2), or the region should take padding.

Not verified in WKWebView:
- Down and Right in the real app: no keys there; the harness only.
- The floating list's ring when focused in the real panel.
- A decision record's code or table in Decisions; the same `watchMarkdown` covers it.
- Resize from overflowing to not while focused.
- auth: firebase: not run, per rules.

## Review
Pass: S1, S2, S3, S4, D1 and X0 met at 052e17f (fresh clone, fixture, auth off; harness `--inactive-none on` per Amendment 3, own `wails dev` on 34119; evidence `.wt-notes/ss-review/`).
- S1: harness 1024×640, Tab ×2 lands on the body `Cut the scan report to what is read, details` (role region, tabindex 0, ring 2px −2px); Down ×3 scrollTop 80 in 3/3 (`s1-run1..3.jsonl`); Beta card at 1440×900 sh=ch, no tabindex, never reached in 10 Tabs (`s1-short.jsonl`). AX in the review build: `AXLandmarkRegion "Cut the scan report to what is read, details"` (`s1-ax-cardback.txt`).
- S2: Tab ×4 to the pre `Code, scrolls` (region), Right ×3 scrollLeft 120/120/120/0/80, 4 of 5 runs > 0 (`s2-tab4-run1..5.jsonl`; the zero is the harness's frame timing, Amendment 3); vitest `watchMarkdown` puts the stop on an overflowing pre/table and takes it off when it fits (passes in X0). AX: `Code, scrolls` region, `AXTable "Table, scrolls"`.
- S3: 30 Tabs + 12 Shift+Tabs in the card back, body, pre and table each a stop, never BODY, never outside the panel, 5/5 (`s3-run1..5.jsonl`).
- S4: harness 1024×640: role drawer `Hephaistos, details`, rule box `Record 0008, The organizer's roadmap, as it was proposed`, header `Details of init-a`, Help region labelled by its h1 (`s4-*.jsonl`); floating list a stop `Initiatives list` keeping listbox at 360×480, its own window's size (at 1024×640 it does not overflow and is correctly no stop, `s4-float.jsonl`). AX on the review build's pid: each `AXLandmarkRegion` with that name, the list `AXList "Initiatives list"` (`s4-ax-{role,rule,header,help,float}.txt`). vitest of the names passes.
- D1: AX `AXList .rd-inits` with 5 items (`d1-ax-tree.txt`); `sed -n 101p` "an inline list" (`d1-roles-101.txt`).
- X0: clean clone at 052e17f: make test (621 vitest, every go package ok), pnpm run build, wails build pass; porcelain empty (`x0-summary.txt`).
Unmet: none. Not in the gate: the floating list drops its own name "Initiatives" while it does not overflow (scrollStop removes aria-label; seen in `s4-float.jsonl`, label null).
Reviewer ss-review, 2026-10-14, commit 052e17ff7e66e70e61c7ed1577a469f47b7754ca. UI review missing: status and place left.
