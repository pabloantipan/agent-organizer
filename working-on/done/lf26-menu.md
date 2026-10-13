---
title: "The group menu opens the right way"
status: done
repos: [organizer]
branch: lf26-menu
seat: mn-build
stage: one-window
updated: 2026-10-13
next: "done: merged to main (sup62)"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-menu"]
spec: "docs/specs/leftovers-26.md (FR-8)"
gate: "docs/specs/leftovers-26.md Acceptance, rows M1 and X0"
ui_review: true
review: pass
---

## Goal
The group menu opens the right way (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows M1 and X0.
- [x] M1: vitest `frontend/src/components/Rail.lf26.test.tsx` (4 tests, Rail* 40/40); harness case d (AXPress) at 1024x640: ⋯ 1077 when pressed, menu `up: false` 463-551 below the ⋯ 437-461, 179 px below; cases a, b, c, e as rl-ui found them. Evidence `.wt-notes/mn-build/m1.txt`, `m1.jsonl`, `progress.md`.
- [x] X0: clean clone of lf26-menu at f075b6d: make test (603 vitest, go ok), pnpm run build, wails build exit 0, `git status --porcelain` empty. Evidence `.wt-notes/mn-build/x0-*.log`, `x0-status.txt`; rebased on main after (docs only), head 6889465.

## Done
- `GroupActions` scrolls a ⋯ pressed out of view to the rail's middle before it measures (`placeInView`), so the AXPress case opens downward; in view nothing moves (mn-build, 2026-10-13).

## Notes
- FR-8 read literally (measure after the first item's focus) would still open up: that focus leaves the ⋯ at the rail's bottom edge. The fix centers the ⋯ first; progress.md says why.
- A fresh fixture has no rail groups; the harness steps press Group by client first (lf26-fixture owns the fixture).

## Review
Pass: M1 and X0 met at 6889465 (lf26-menu).
- M1: in a fresh clone at 6889465, `npx vitest run src/components/Rail.lf26.test.tsx` passes 4/4 (a ⋯ out of view below and above the rail is centred, then opens down; in view nothing scrolls). I ran the harness myself (`scripts/tab-harness/tabharness.swift`, `--links on --size 1024x640`, the builder's `m1.txt`) against my own `wails dev` on :34123, with the fixture and auth off. Case d (the AXPress press, rail at scrollTop 0, ⋯ at 1077): `up: false`, menu 463-551 below the ⋯ 437-461, inside the window. With main's `Rail.tsx` swapped in under the same server, the same case opened `up: true` (347-435), so the row fails on main. Cases a, b, c and e behave as before. Evidence: `.wt-notes/mn-review/m1.jsonl`, `m1-main.jsonl`.
- X0: same clone, `XDG_DATA_HOME=$(mktemp -d) make test` (go ok, vitest 603/603), `pnpm run build`, `wails build`, all exit 0, all under test-lease; `git status --porcelain` empty. Evidence: `.wt-notes/mn-review/x0-*.log`, `x0-status.txt`.
- Boundary: the diff touches only `Rail.tsx` and `Rail.lf26.test.tsx`.
- Unmet: none.
- The harness presses the ⋯ with `click()` as a stand-in for AXPress (no focus, no scroll), as rl-ui did; no real AXPress on a review build's pid was run.
- `## UI review` is missing, so status and place stay as they are.
- Reviewer mn-review, 2026-10-13, commit 68894652cc93ac82e9e49029fa167c18b9feb189.

## UI review
Pass: M1 gives the lead a group menu that opens downward when pressed out of view, in the real app. Checked on 68894652cc93ac82e9e49029fa167c18b9feb189 (the branch did not move). X0 is the code reviewer's row; I did not re-run it.
- How each state was checked:
  - Real AXPress, `Deltagos Review` built by `make review-build` in my worktree, fixture, auth off, read by my own pid. Rail grouped by an AXPress on Group by client. At 1440x900 the ccint ⋯ sat at y 1234, below the window (content 157-1057). AXPress moved it to 750; the menu opened below it (776-864), inside the window, and focus was on Rename. At 1024x640 (window resized by AX on that pid) the ⋯ went from 1164 to 490, with the menu at 516-604 below it. A ⋯ above the rail (acme at 73) came to 487 and opened down. A ⋯ already in view (personal at 231) did not move and opened down. Shots: `.wt-notes/mn-ui/wkwebview-1440x900-M1-{before-press,axpress-open}.png`, `wkwebview-1024x640-M1-{before-press,axpress-open,axpress-above-open}.png`.
  - Tab harness, offscreen WKWebView, own `wails dev` on :34124, `--links on --size 1024x640`, the builder's `m1.txt` plus my lines (`.wt-notes/mn-ui/steps2.txt`, `m1-final.jsonl`). Case d: ⋯ 1077 to 437, `up: false`, menu 463-551. Only `nav.rail` scrolled (0 to 640) and the document stayed at 0. An Escape dispatched in the page put focus back on the ⋯ ("Actions for ccint", ring drawn). Cases b, c and e match rl-ui (opens up at the bottom edge, so the in-view behaviour is unchanged) and the arrows cycle.
- Findings (none is sev 4 or 3):
  - U1 (sev 1, from code, not seen): someone can lose the ⋯ under the pointer. A pointer press on a ⋯ that is only partly cut by the rail's edge counts as out of view (`placeInView`: any part outside the port), so the rail scrolls and the ⋯ jumps to the middle before the menu opens. Where: `Rail.tsx` `placeInView`. Evidence: the rule in code. I could not press by pointer (0108). Proposal: scroll only when less than half the ⋯ is visible, or use `block: "nearest"` when it is partly visible. Ranked with the leftovers.
- Spec gaps (for the FSE):
  - FR-8's words ("measured after the first item's focus has scrolled the rail") are not what was built: an out-of-view ⋯ is centred in the rail before the place is measured (progress.md says why). Amend FR-8 to say what the press does to the rail.
  - M1's harness setup is fragile. `m1.txt` presses the rail toggle when `aria-expanded` is false, and in my runs that left the rail collapsed, so case a (keyboard focus on the lowest ⋯) never ran: groups were not in the DOM for 30 s. Cases b to e ran once the rail was open. A setup that waits for the rail's open state would fix it. Case a's result is the builder's and the code reviewer's.
- For aglaea: none.
- Not verified in WKWebView: case a in my harness run (setup, above). The focus ring in the review app's own window, which is never key because I do not activate it (the harness shows the ring). A pointer press (U1). Firebase is not relevant to this row. The Rail vitest was not re-run by me: the lease was held by memory pressure "warn" for over an hour. The code reviewer ran it, 4/4.
- UI reviewer mn-ui, 2026-10-13.
