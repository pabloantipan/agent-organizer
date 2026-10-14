---
title: "A description says each fact with its noun"
status: done
repos: [organizer]
branch: lf26-words
seat: wd-build
stage: one-window
updated: 2026-10-14
next: "done: merged to main (sup62)"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-words"]
spec: "docs/specs/leftovers-26.md (FR-4 to FR-7; tab-reaches-links Amendment 3, T23)"
gate: "docs/specs/leftovers-26.md Acceptance, rows W1, W2 and X0"
ui_review: true
review: pass
---

## Goal
A description says each fact with its noun (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows W1, W2 and X0.
- [x] W1: `.wt-notes/wd-build/w1-ax-description.txt` (AX of the person rows), vitest `SlackView.words.test.tsx`, `AgentsView.words.test.tsx`, `Controls.test.tsx`
- [x] W2: `.wt-notes/wd-build/w2.jsonl`, `w2-focused-crop.png`, `w2-grep.txt`
- [x] X0: `.wt-notes/wd-build/x0-make-test.log`, `x0-pnpm-build.log`, `x0-wails-build.log`, `x0-status.txt` (empty), clean clone of 2df2892

## Done
- 2026-10-13 wd-build: F3 says `session <word>, mail <word>, owes <n> message(s), context <n>%` in one description; F1 and the toolbar count through `plural`; the search field's wrapper draws the ring; the dead `.cell-filters` selector is gone. Branch `lf26-words` (28ab5d5, 2ee4d25, 2df2892) on main fa15ec5; how to rerun each row in `.wt-notes/wd-build/progress.md`.

## Notes
- The row's `title` is what macOS reports as AXHelp; the description is in AXCustomContent (both read by VoiceOver). Left as is.

## Review
Pass: W1, W2 and X0 met on 2df2892 (clean clone at `.wt-notes/wd-review/clean`, removed after; evidence in `.wt-notes/wd-review/`).
- W1: vitest `SlackView.words.test.tsx`, `AgentsView.words.test.tsx`, `Controls.test.tsx` 17/17 (live/off, alive/stale/capped/deaf from `HEALTH`, owes 0/1/2, 1 and 25 agents, `1 agent`, never `1 agents`). AX of the review build's own pid (fixture, auth off), `AXCustomContent` of the person rows: `session off, mail alive, owes 2 messages`, `session live, mail alive`, `session live, mail deaf` (`w1-ax.txt`). F1's description (`countsOf`) and F5's (no count) read in the diff; `lib/health.ts` unchanged.
- W2: Tab harness (own `wails dev` on 34121), Tab #32 lands on the search input; `.cell-search` outline `solid 2px rgb(138, 63, 252)` offset 2px, input outline none, none when blurred (`w2.jsonl`, `w2-focused-crop.png`, `w2-blurred-crop.png`). `grep -rn cell-filters frontend/src`: no match.
- X0: `make test` (Go plus vitest 52 files, 609 tests), `pnpm run build`, `make review-build` (runs `wails build`), `wails build` again after the dev session; `git status --porcelain` empty.
- Unmet: none.
- Not seen in the build: the context fact (the fixture's seats have no statusline record); vitest covers it.
- No `## UI review` yet, so status and place stay.
- wd-review, 2026-10-14, 2df2892f2bc4eaeb789e63c1657d53436a6e1431.

## UI review
Pass, on 2df2892f2bc4eaeb789e63c1657d53436a6e1431 (every row; the branch did not move). wd-ui, 2026-10-14. Shots and logs in `.wt-notes/wd-ui/`.

How each state was checked:
- F3 (FR-4), WKWebView: `Deltagos Review` built by `make review-build` in my worktree, fixture, auth off, own pid; AX `AXCustomContent` of the three person rows reads `session off, mail alive, owes 2 messages`, `session live, mail alive`, `session live, mail deaf` (`w1-ax-desc.txt`); the shot `wkwebview-1440x900-W1-conversations-people.png` draws the same facts (grey dot, alive, owes 2; deaf in red). Context, capped, stale and `context unknown`: vitest 17/17 (fixture seats have no statusline record).
- F1 and the toolbar (FR-5), harness on my own `wails dev` (34122), the all-agents view reached through the dev store (setup only): drawn and described `1 agent · 0 live · 0 working` (init-asleep), `7 agents · … · 3 seats`, toolbar `8 agents, 7 live, 0 working` (`f1.jsonl`, `wkwebview-1440x900-W1-agents-all.png`).
- Search ring (FR-6), harness at 1440×900 and 1024×640: Tab lands on the input (#32 and #28); `.cell-search` outline `solid 2px rgb(138, 63, 252)` offset 2px, input none; Tab out and blur clear it; Shift-Tab back draws it again; not clipped at 1024 (`w2.jsonl`, `w2-1024.jsonl`, `wkwebview-*-W2-search-{focused,blurred}-crop.png`). Ring #8a3ffc on #1a1523 is about 3.6:1 (1.4.11 asks 3:1).
- FR-7: the live stylesheets hold no `.cell-filters` rule; `.counter.hot, .tiny-btn.hot` kept (`w2.jsonl`, last line).
- X0: not rerun by me beyond `make review-build` and `wails build` (both pass, tree clean); the code review's clean-clone run stands.

Findings (none 4 or 3):
- U1 (sev 2). What the person cannot do: hear how much mail waits for a seat whose badge draws it. Where: Conversations, People, a person row whose watcher is alive, stale or capped with undelivered mail (the badge reads `stale · 1 waiting`, `capped · 3 waiting`; in the fixture those seats show in Agents, `wkwebview-1440x900-W1-agents-all.png`). Evidence: `personFacts` (`SlackView.tsx`) says `mail <word>` only; on main the description pointed at the badge's span, so `· N waiting` was said; FR-4's form has no slot for it, so the builder followed the spec. Proposal: `mail stale, 1 message waiting` (through `messages` in `lib/health.ts`), after the mail word; a spec amendment, not a fix to this card.

Spec gaps for the FSE:
- FR-4's form drops the waiting count the row draws (U1); T23's "no count said without its noun" does not cover a count that is no longer said at all.

For aglaea:
- U1: confirm the form `mail <word>, <n> message(s) waiting`, and whether `deaf` (which draws no count) should say it too.

Not verified in WKWebView:
- The context fact and `context unknown` on a real row (no statusline record in the fixture); vitest only.
- A person row with `capped` or `stale` in People (the fixture's People seats are alive and deaf); vitest only.
- After the first AX read the review app's main window went off-screen (another Space, screen not locked); the rest ran in my offscreen harness, never by switching Spaces.
