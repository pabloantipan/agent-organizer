---
title: Roles on Home and in the rail, and a role's drawer - show only
status: next
repos: [organizer]
branch: roles-ui
updated: 2026-10-04
next: "ru-build: A3 (land on the session row by its name, sev 2, R5) and A2 (drawer initiatives as text links, sev 1), transversal-roles.md Amendment 1 (f3535e7); then both reviews rerun on the new SHA, WKWebView when the Mac is unlocked (sup38)"
seat: ru-build
depends_on: [roles-feed, drafts-and-slack]
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, a new RoleDrawer.tsx", "frontend/src/styles/home.css, shell.css (the rail group only), a roles stylesheet", "frontend/src/lib/ (a roles view helper) and its tests", "frontend/src/stores/board.store.ts (the drawer's open state and the rail group's collapse only)", "scripts/fixture-home.sh and testdata/fixture-overlay/ (the roles fixture R1-R4 read; added by sup38)", "frontend/src/components/AgentList.tsx (the row's data-session, tabIndex -1 and accessible name only, for A3; added by sup38)", "not: Go, docs/design-system.md"]
spec: "docs/ux/specs/transversal-roles.md (Aglaea, 299b221) and its Technical note T5; ruling 0082"
gate: "docs/ux/specs/transversal-roles.md Acceptance R1-R7, plus the build row below"
ui_review: true
review: pass
---

## Goal
He sees on Home and in the rail which roles are live, what each is on, its
mail and its initiatives, and opens a role without starting anything.

## Gate
- [ ] R1-R7: see `docs/ux/specs/transversal-roles.md`, Acceptance (met in Chromium; R5, R7 not verified in WKWebView)
- [x] `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build`

## Done
- 2026-10-04 sup38: aglaea's calls (f3535e7): A3 a defect against R5 (sev 2) and A2 (sev 1) go in before the merge; A1 is the next batch, for the FSE and Pablo
- 2026-10-04 sup38: code review pass and UI review pass in Chromium at c6f39ce; merge held for the WKWebView columns (the screen was locked at 16:58); A1-A3 to aglaea, U1-U4 and gaps to the FSE
- 2026-10-04 sup38 launched ru-review and ru-ui pinned at c6f39ce
- 2026-10-04 ru-build: built on roles-ui (49f8256..c6f39ce), unmerged and rebased on main; R1-R7 measured in Chromium at 1024x609 (strip and full, overlay and classic), 1512x945, 1920x1080, 3440x1440; build row green; WKWebView not driveable from the seat (no AX windows, no screen capture); rows in .wt-notes/ru-build/progress.md
- 2026-10-04 sup38 launched ru-build in .wt/roles-ui from 1f0cb4a
- 2026-10-04 sup38 launched by the FSE
- 2026-10-04 0083 ruled by pablo ("Ok", accept as written)
- 2026-10-04 cut by the FSE from Aglaea's design (299b221) and 0082

## Next

## Blockers

## Review
- Verdict: pass (code and checks; the WKWebView rows of R5 and R7 are the UI reviewer's)
- Commit reviewed: c6f39ce (branch roles-ui, base ee7658a)
- Unmet gate items: none
- Evidence: clean clone of c6f39ce, `XDG_DATA_HOME=$(mktemp -d) make test` 0 (vitest 224); `npm install && npm test && npm run build` 0; `wails build` 0. Fixture `go run . roles --json`: Hephaistos live, 2 sessions (42, 61), hand-off 3 Oct; Aglaea live 28%, one `[for aglaea]` mail; Ariadna never seen, no bitácora; Daedalus not running, last seen 2 Oct; Talos, Hermione here: false. Code: roles.ts feeds nothing to queueOf/needsMeRows, lib/queue.ts untouched (T4); UI reads `agents.roles` only (T5); drawer and rows hold no Attach, Kill, Start or Message (R6); Escape through boxStack, focus on the title and back to the opener or its `data-role` (R5); dates through lib/dates; tests cover the States table. Boundary: every changed path inside it. R5, R7 layout taken from ru-build's Chromium measurements in .wt-notes/ru-build.
- Not gated, worth a card: `ageWords` copies Home's private `age` instead of sharing it; `sessionStarted` prints the feed's `created` string raw; the strip carries a role's mail only in its hover title; `kill $FIXTURE_AGENT_PIDS` does not word-split in zsh, so the documented cleanup leaves the eight stand-ins running (killed by pid here).
- Reviewer: ru-review, 2026-10-04

## UI review
- Commit run: c6f39ce (detached worktree .wt/ru-ui, fixture from `scripts/fixture-home.sh` in a fresh shell; badge baseline on ee7658a, the branch's base, with its own fixture). The branch did not move.
- Verdict: **pass**: no severity 4 or 3 against the spec. **Every WKWebView column is not verified** (see Not verified), so R5 and R7 still rest on Chromium alone. The supervisor decides whether that is enough.
- Chromium: headless Chrome for Testing 1234 against `wails dev -devserver localhost:34545`. Viewport = content, so 1024x609 stands for the 1024x640 window. Overlay = Chromium's hidden scrollbars; classic = 15 px `::-webkit-scrollbar` that take room. Shots, logs and drivers are in `.wt-notes/ru-ui/` (`drive.cjs`, `s-home.cjs`, `s-r5.cjs`, `s-around.cjs`, `wk.swift`).

| row | Chromium (size, rail, scrollbars: measured, hit-tested) | shot | WKWebView |
|---|---|---|---|
| R1 | 1512x945 full; 1024x609 full and strip; 1920x1080, 3440x1440 full. Overlay and classic at 1512 and 1024. Sections run needs, roles, list (1512: y 63/861/1093). At 3440 wide, Roles heads the list column and Needs me is on the right. Four rows: Hephaistos `2 sessions · 61% context` (dot), Aglaea `live · 28% context` (dot), Ariadna `not running`, Daedalus `not running · last seen 2 Oct`. The last line is `Talos, Hermione · PLV infra, on odyssey`: a div in --fg-subtle with no button, no tabindex and cursor auto. Every row centre and the muted line hit their own element (`elementFromPoint`). | chromium-{1512x945,1024x609,1920x1080,3440x1440}-R1-home-roles-{full,strip}-{overlay,classic}.png | not verified |
| R2 | same runs: Hephaistos `hand-off 3 Oct · Forged the roles fixture…` (this machine `fixture`; odyssey's folded in the drawer as `odyssey · 2 Oct`); Ariadna `no bitácora yet` (--fg-subtle, italic); Daedalus' `hand-off 24 Sep` in --fg-subtle (stale) | R1 shots | not verified |
| R3 | Aglaea row `1 message waiting` (magenta, plus the word). Rail: full item count `1`, aria-label `…; 1 message waiting`; strip in title only. Needs me badge 14 = section count 14, no row naming `[for `. Base ee7658a with its own fixture: badge 14, so unchanged. | R1 shots; chromium-1512x945-R3-base-ee7658a-badge-full-overlay.png | not verified |
| R4 | `2 sessions · 61% context`. The drawer lists probe-hefesto (init-a, running, 42%) and probe-hefesto-odd (outside every initiative, 61%, a static line) | chromium-*-R5-drawer-hephaistos-from-row-*.png | not verified |
| R5 | 1512x945 full overlay; 1024x609 strip and full, overlay and classic. A pointer click at the row centre opens the drawer with focus on `h2` (hit own). Escape closes it and focus returns to the row. The rail item (full and strip) opens it with focus on the title, and Escape returns focus to the item. Enter reopens. Tab loops inside the drawer. The session line lands on init-a Agents with focus on that session's Attach; the row is marked `role-landed`, in view, and hits its own element. The mail line opens init-a Conversations with the `[for aglaea]` thread targeted (focus: see U1). The drawer sits over Work with focus on its title. | chromium-*-R5-{drawer-*,session-landing,thread-landing,drawer-over-work}-*.png | not verified |
| R6 | drawer buttons: Close, session line(s), a folded hand-off, mail line, Open <initiative>; no Attach/Kill/Start/Stop/Message in rows, rail items or drawer (only "1 message waiting" matches the word) | R5 shots | not verified |
| R7 | 1024x609 strip and full, overlay and classic: doc width = viewport (no horizontal page scroll, no document scroll). Rail full: where gives way on every row; doing now is cut with an ellipsis; the dot and context stay; the accessible name and title carry `in init-a, …`. Strip: all columns fit. Strip items `H• A• Ar D` are unranked, each with a separator and its name in the title; their centres hit their own buttons. Drawer: 720x513 at 1024, with a scrolling body and a bottom edge. | chromium-1024x609-R1-home-roles-*, chromium-1024x609-R5-* | not verified |

- Findings:
  - **U1 (2)**: After a mail line, the lead has no keyboard place in Conversations. Where: drawer › Mail waiting › line, at 1512 and 1024, all four configurations. Evidence: `log-r5-*.txt`, "after mail line … focus: body". Design system Focus and names, Navigating: "Never on the page body". Proposal: land focus on the targeted thread's divider, or on the composer that names it.
  - **U2 (2)**: The started column reads as a clock time. Where: drawer › Sessions. Evidence: `up 05:38`, then `up 07:28` four minutes later, so it is ps elapsed mm:ss. The spec says "started", and Principles say dates read as words. Proposal: `started 16:40` or `up 6 min`.
  - **U3 (1)**: On the strip, a role's accessible name is the bare name. Its state and `1 message waiting` live only in the hover title, while the full rail item carries both. Evidence: `log-home-1024-strip-*`. Proposal: give the strip item the full item's aria-label.
  - **U4 (1)**: Role rows do not share their doing-now and where tracks, and a doing-now cell is cut while room beside it stays unused. Where: 1024x609 strip. Hephaistos' doing now is cut at 294 px (`two …`), Daedalus' gets 453 px, and about 130 px of empty mail track sits beside Hephaistos' cut text. Evidence: `chromium-1024x609-R1-home-roles-strip-overlay.png`. Proposal: one shared track per column across the rows.
- Design questions, for aglaea:
  - **A1**: With 14 Needs me rows, Roles starts at y 861 of 945 at 1512x945 and at 1920x1080. The lead sees no role without scrolling past the whole queue (the spec placed it there; 0082 says "above the initiatives"). Should a long Needs me cap or fold before Roles?
  - **A2**: The drawer's Initiatives are bordered mono buttons that read as chips (CLAUDE.md: never chips for initiative selection).
  - **A3**: The session landing focuses `Attach`, whose name does not carry its session (AgentList, pre-existing). Enter there starts an attach, one key from a show-only drawer.
- Spec gaps, for the FSE: what a session line is when its session sits outside every initiative (built as a static line, no landing); the format of "started"; the mail line's `from` when the thread's messages are not loaded (fixture: none shown); the doing-now fold, the second step, cannot be reached at the 1024 minimum with this fixture, so no row exercises it.
- Not verified:
  - **Every WKWebView column (R1 to R7).** The review app was built (`make review-build`) and ran from the fixture shell, pid 8451, window 1296x840, and was quit by pid. `screencapture -o -l <id>` refused ("could not create image from window"). A full-screen capture came back black. ScreenCaptureKit returned -3811. CGWindowListCreateImage from a trusted Swift tool returned a 1296x840 image with every pixel RGBA 0 (`webkit-1296x840-probe-capture-blank.png`). AX is trusted, but the app answers its own element as its window and element-at-position returns -25208 (not implemented); System Events sees no windows. So there was no shot, no hit test and no resize, and nothing was driven blind.
  - In Chromium too: the working dot animating (no working stand-in), mail unknown, the never-seen drawer text, and "older than a week" in a drawer.
- Reviewer: ru-ui, 2026-10-04

## Notes
- 2026-10-04 sup38: R1-R4 are checked "by fixture" and no fixture carried roles (its zellij is /usr/bin/true). Stand-ins with AGENT_SESSION, a roles config, bitácoras, runs.jsonl and a canned [for aglaea] thread make it; those live in scripts/fixture-home.sh and testdata/fixture-overlay/, so the boundary gained them (supervise precondition 10). The gate is unchanged; told the FSE.
- 2026-10-04 ru-build: Home's sections were not collapsible; Roles is the first (heading disclosure, `home.roles.open`). The drawer is mounted from Rail.tsx (App.tsx outside the boundary). A session landing focuses the session's Attach on Agents, found by its title `probe <session>`, since AgentList rows carry no data-session; a `session:` agentsLanding would be cleaner. The fixture's [for aglaea] thread is canned, so Conversations shows it "opening…" and the drawer names no sender. A Hephaistos session outside every initiative is a static line: no Agents to land on.
