---
title: Roles on Home and in the rail, and a role's drawer - show only
stage: one-window
status: done
repos: [organizer]
branch: roles-ui
updated: 2026-10-04
next: "done: merged 1ae5997 (sup38); U1 (2), U2, U3, U4, U6 (1), the spec gaps and A1 (Needs me five then Show the other N, aglaea Amendment 1) are the FSE's"
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
- 2026-10-04 sup38 merged ed9b5bf to main as 1ae5997 (code pass, UI pass in Chromium and WKWebView, 8 configs); main green (go test ./internal/..., vitest 224); seats ended, threads closed
- 2026-10-04 ru-build: A2 re-fixed after the code review (ed9b5bf): .rd-inits out of the list grid rule, so the initiatives read inline on one line; measured in Chromium at 1512x945 and 1024x609; tests and build row green
- 2026-10-04 ru-build: Amendment 1 A3 (a session landing focuses the session's row by data-session and its name, 9a0b81c) and A2 (Initiatives as comma-separated text links, 582462b), rebased on main; R5 re-measured in Chromium at 1512x945 full and 1024x609 strip, overlay and classic; tests and build row green
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
- Verdict: pass. R1-R7 and the build row hold in code and checks, and Amendment 1's A2 and A3 are met. The WKWebView rows of R5 and R7 are the UI reviewer's.
- Commit reviewed: ed9b5bf (branch roles-ui, rebased on main). Supersedes the fail at 582462b.
- Unmet gate items: none
- A2: against 582462b, the only change under frontend/, scripts/ and testdata/ is `roles.css:82`, which drops `.rd-inits` from the grid rule. `.rd-inits` is a `<p>` of inline spans and `<a>` links, so the list reads `init-a, init-b, …` on one line, as plain links with no border. Checked in code; the rendering is the UI reviewer's.
- Evidence: clean clone of ed9b5bf. `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (go 13 packages ok, vitest 224). `npm install && npm test && npm run build` exit 0. `wails build` exit 0. The fixture roles (R1-R4) were checked at 582462b, and nothing under scripts/, testdata/ or the Go code changed since: Hephaistos live, 2 sessions, 61%. Aglaea live, 28%, one `[for aglaea]` mail. Ariadna never seen, no bitácora. Daedalus not running, last seen 2 Oct. Talos and Hermione are here: false.
- Code: as at 582462b. Nothing feeds queueOf/needsMeRows, and lib/queue.ts is untouched (T4, R3). The UI reads `agents.roles` only (T5). No Attach, Kill, Start, Stop or Message in rows, rail or drawer (R6). Escape closes through openBox, focus lands on the title, and it returns to the opener or its `data-role` (R5). A3's landing focuses the row by `data-session`, or the Crew `data-seat` row, never Attach. Dates go through lib/dates. The tests cover the States table.
- AgentList.tsx: only `data-session`, `tabIndex={-1}`, `aria-label` and the `rowName` helper for that name. Boundary: every changed path is inside it.
- Gate gap, for the FSE: the gate names only R1-R7, so A2 and A3, the merge conditions, have no gate row.
- Still not gated: `ageWords` copies Home's `age`; `sessionStarted` prints `up <ps etime>` raw (U2); the strip's accessible name is the bare name (U3).
- Reviewer: ru-review, 2026-10-04

## UI review
- Commit run: **ed9b5bf** (rebased on main; the only frontend change against 582462b is one line of roles.css, A2: `.rd-inits` out of the grid rule). Fresh detached worktree .wt/ru-ui and a fresh fixture shell. At ed9b5bf, A2's drawer was shot at 1512x945 full and 1024x609 strip and full, overlay and classic, and R5 was spot-checked at 1512 full and 1024 strip, overlay and classic (logs and shots in `.wt-notes/ru-ui/ed9b5bf/`). The R1-R4, R6 and R7 rows below were measured at 582462b (`.wt-notes/ru-ui/582462b/`); ed9b5bf changes nothing they read. The first pass ran on c6f39ce, and the badge baseline (14) on ee7658a.
- Verdict at ed9b5bf: **pass**, Chromium and WKWebView. No severity 4 or 3 against the spec; R1 to R7, A2 and A3 hold in both engines. Open, all below the fail line: U1 (2), U6, U2, U3, U4 (1).
- Chromium: headless Chrome for Testing 1234 against `wails dev -devserver localhost:34545`. Viewport = content, so 1024x609 stands for the 1024x640 window. Overlay = Chromium's hidden scrollbars; classic = 15 px `::-webkit-scrollbar` that take room. Shots and logs for this commit are in `.wt-notes/ru-ui/582462b/`; drivers are in `.wt-notes/ru-ui/` (`drive.cjs`, `s-home.cjs`, `s-r5.cjs`).
- WKWebView: `Deltagos Review.app` from `make review-build` at ed9b5bf, run from a fresh fixture shell. Window sizes 1512x945 and 1024x640, set through AX (content 913 and 608 px). Rail full and strip, each with overlay (`-AppleShowScrollBars WhenScrolling`) and classic (`-AppleShowScrollBars Always`), so 8 configurations. Driven through AX by `.wt-notes/ru-ui/wkax` (Swift): hit = `AXUIElementCopyElementAtPosition` at the element's centre is the element or inside it; clicks are HID events, refused unless the point is inside the app's frame, the topmost window there belongs to its pid and the app is frontmost (0 refusals). Shots via `screencapture -o -l <CGWindowID>`. Logs and shots are in `.wt-notes/ru-ui/ed9b5bf-wk/` (`log-<size>-<rail>-<scrollbars>.txt`, `webkit-<size>-<rail>-<scrollbars>-<state>.png`, `wkpass.sh`).

| row | Chromium at 582462b (size, rail, scrollbars: measured, hit-tested) | shot | WKWebView at ed9b5bf (all 8 configurations unless named) |
|---|---|---|---|
| R1 | 1512x945 full and 1024x609 strip, overlay and classic. Sections run needs, roles, list (1512: y 63/861/1093; 1024: 63/623/855). Four rows: Hephaistos `2 sessions · 61% context` (dot), Aglaea `live · 28% context` (dot), Ariadna `not running`, Daedalus `not running · last seen 2 Oct`. The last line is `Talos, Hermione · PLV infra, on odyssey`: a div in --fg-subtle, no control, no tabindex. Every row centre and the muted line hit their own element (`elementFromPoint`). | chromium-1512x945-R1-home-roles-full-*.png, chromium-1024x609-R1-home-roles-strip-*.png | **pass.** Headings in order NEEDS ME, ROLES, INITIATIVES. Four row buttons whose AX names carry the state words: Hephaistos `2 sessions · 61% context`, Aglaea `live · 28% context`, Ariadna `not running`, Daedalus `not running · last seen 3 Oct` (the date is this fixture run's runs.jsonl). The last line is `Talos, Hermione · PLV infra, on odyssey`, an AXStaticText with no control. Every row centre and the muted line hit their own element. At 1512x945 Roles sits below the 14 Needs me rows (A1, out of this card); brought into view by focus. webkit-*-home-roles.png |
| R2 | same runs: Hephaistos `hand-off 3 Oct · Forged the roles fixture…` (this machine `fixture`; `odyssey · 2 Oct` folded in the drawer); Ariadna `no bitácora yet`; Daedalus' `hand-off 24 Sep` in --fg-subtle (stale) | R1 shots | **pass**: same names and shots; Hephaistos `hand-off 3 Oct · Forged the roles fixture…`, Ariadna `no bitácora yet`, Daedalus `hand-off 24 Sep` dimmed and named `(older than a week)` |
| R3 | Aglaea `1 message waiting` (magenta, plus the word). Rail: full item count `1`, its aria-label carrying the mail; strip in the title only. Badge 14 = Needs me count 14, no row naming `[for `. Base ee7658a: 14. | R1 shots | **pass**: Aglaea's row carries `1 message waiting`. The full rail item's AX name is `Aglaea: live · 28% context; 1 message waiting`, with the count `1` drawn. The badge is `Needs me 14`, with 14 Needs me rows (base 14). |
| R4 | `2 sessions · 61% context`; the drawer lists probe-hefesto (init-a, running, 42%) and probe-hefesto-odd (outside every initiative, 61%, a static line) | chromium-*-R5-drawer-hephaistos-from-row-*.png | **pass**: `2 sessions · 61% context`; the drawer lists probe-hefesto (init-a, running, 42%) as a button and probe-hefesto-odd (outside every initiative, 61%) as a static group. webkit-*-R5-drawer-hephaistos-A2.png |
| R5 | 582462b: 1512x945 full, and 1024x609 strip and full, each overlay and classic. ed9b5bf spot-check, 1512 full and 1024 strip, overlay and classic: the same results (open with focus on the title, Escape back to the row or item, Enter reopens, the session lands on its row and the row hits its own element, the mail line opens Conversations). A pointer click at the row centre opens the drawer with focus on `h2` (hit own); Escape closes it and focus returns to the row. The rail item (full and strip) opens it with focus on the title; Escape returns focus to the item, and Enter reopens. Tab loops Close, session, mail, `Open init-a`. **A3 met:** the session line lands on init-a Agents with focus on the row `li` itself, named `probe-hefesto, running, 42% context`, marked `role-landed`, in view, its centre hitting its own element; no Attach is focused. The mail line opens init-a Conversations with the `[for aglaea]` thread targeted, but focus falls to body (U1). | chromium-*-R5-{drawer-*,session-landing,thread-landing}-*.png | **pass**, all 8. A click at the row centre opens the drawer with AX focus on the heading `Hephaistos`, and the title hits its own element. Escape closes it and focus returns to the Hephaistos row button. The rail item (full and strip) opens Aglaea with focus on its title; Escape returns focus to the item, and Enter reopens. **A3:** the session line lands on init-a Agents with focus on the row group `probe-hefesto, running, 42% context`, selected and in view (its centre hits it), and no Attach is focused. The mail line opens init-a Conversations with the `[for aglaea]` thread shown, but focus lands on the AXWebArea (U1). webkit-*-R5-{drawer-aglaea-from-rail,thread-landing,session-landing-A3}.png |
| R6 | 582462b, unchanged at ed9b5bf: drawer controls: Close, session line(s), a folded hand-off, mail line, `Open <initiative>` links; no Attach, Kill, Start, Stop or Message in rows, rail items or drawer | R5 shots | **pass**: no AX button, link or popup named Attach, Kill, Start, Stop or Message on Home rows, rail items or the drawer, in any configuration. The drawer holds Close, the session button, a disclosure `odyssey · 2 Oct`, and five links. |
| R7 | 1024x609 strip, overlay and classic: doc width = viewport (no horizontal page scroll, no document scroll). Strip items `H• A• Ar D` are unranked, with a separator and centres hitting their own buttons. All row columns fit beside the strip. The drawer is 720x513 with a scrolling body and a bottom edge (408/535). At 1024 full (from the R5 runs), where gives way on every row; the accessible name and title keep it. | chromium-1024x609-R1-*, chromium-1024x609-R5-drawer-hephaistos-bottom-*.png | **pass.** At 1024x640 the document's AXScrollArea has no horizontal scroll bar, overlay or classic. Rail full: where gives way on every row, doing now is cut with an ellipsis, the dot and context stay, and the AX names keep `in init-a, init-b, …` (`r7-names-1024x640-full-classic.txt`). Strip: `H• A• Ar D`, unranked, every centre hitting its own item. The drawer stays inside the window with its own scrolling body; classic shows its bar. **A2:** `init-a, init-b, init-many, init-define, init-drafted` are five AXLinks on one line (one top in every configuration), each centre hitting its own text. |

- Findings at ed9b5bf:
  - **U5, A2: met at ed9b5bf.** The drawer's initiatives are one inline comma list: `p.rd-inits`, display block, links without borders, all five on one line at y 562 (1512) and 527 (1024). Every link centre hits its own `a` (`elementFromPoint`). Probing the list at 180 px wide (this page only) wraps it to two lines after `init-many,`, with no line starting with a comma. Shots: chromium-{1512x945,1024x609}-A2-drawer-initiatives-*.png and the -wrap-probe-180px shots. At 582462b it had stacked one per line, each line starting with a comma.
  - **U1 (2, still open)**: After a mail line, focus falls to body in Conversations (all configurations). At ed9b5bf, Enter on an initiative link in the drawer also leaves focus on body on that initiative's Overview. Proposal: land focus on the targeted thread's divider, or on the composer that names it.
  - **U6 (1, new with A3)**: The landed row's accessible name says `running` while the row's visible word is `idle` (Agents' label for that state), against WCAG 2.5.3, label in name. Proposal: build the name from the row's own state label.
  - **U2 (1, was 2)**: A session's start reads `up 05:38` (elapsed mm:ss). This is Agents' own vocabulary (`up 05:42:44` there), so it is consistent but not "started" as the spec words it.
  - **U3 (1)**: On the strip, a role item's accessible name is the bare name; its state and mail are only in the hover title.
  - **U4 (1)**: At 1024 strip, the rows do not share doing-now and where tracks. Hephaistos' doing now is cut at 294 px beside about 130 px of empty mail track; Daedalus' gets 453 px.
- Design questions, for aglaea: A1 to A3 of the c6f39ce pass went into the spec's Amendment 1. A2 and A3 are met, and A1 is out of this card. None new.
- Spec gaps, for the FSE: a session line whose session sits outside every initiative (built static); the format of "started"; the mail line's `from` when the thread's messages are not loaded (fixture: none); the doing-now fold (second step) cannot be reached at the 1024 minimum with this fixture.
- Findings in WKWebView: U1 (focus on the AXWebArea after the mail line), U6 (the landed row named `running`, shown `idle`) and U3 (strip items named by name only) reproduce. After a pointer landing, WebKit draws the focus ring on the landed row; the design system leaves that to the engine, so it is not a finding.
- Not verified: the keyboard path in WKWebView rested on AX focus and posted Escape/Enter, not on Tab under macOS Keyboard navigation (whose setting was not changed). Native tooltips (hover titles) were read from AX names, not seen. In both engines: the working dot animating, mail unknown, the never-seen drawer text, and "older than a week" in a drawer.
- Reviewer: ru-ui, 2026-10-04

## Notes
- 2026-10-04 sup38: R1-R4 are checked "by fixture" and no fixture carried roles (its zellij is /usr/bin/true). Stand-ins with AGENT_SESSION, a roles config, bitácoras, runs.jsonl and a canned [for aglaea] thread make it; those live in scripts/fixture-home.sh and testdata/fixture-overlay/, so the boundary gained them (supervise precondition 10). The gate is unchanged; told the FSE.
- 2026-10-04 ru-build: Home's sections were not collapsible; Roles is the first (heading disclosure, `home.roles.open`). The drawer is mounted from Rail.tsx (App.tsx outside the boundary). A session landing focuses the session's Attach on Agents, found by its title `probe <session>`, since AgentList rows carry no data-session; a `session:` agentsLanding would be cleaner. The fixture's [for aglaea] thread is canned, so Conversations shows it "opening…" and the drawer names no sender. A Hephaistos session outside every initiative is a static line: no Agents to land on.
