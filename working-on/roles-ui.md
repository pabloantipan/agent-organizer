---
title: Roles on Home and in the rail, and a role's drawer - show only
status: next
repos: [organizer]
branch: roles-ui
updated: 2026-10-04
next: "ru-build: A2, the drawer's initiatives stack one per line with a leading comma (.rd-inits is still display: grid, roles.css:82); make them one inline comma list"
seat: ru-build
depends_on: [roles-feed, drafts-and-slack]
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, a new RoleDrawer.tsx", "frontend/src/styles/home.css, shell.css (the rail group only), a roles stylesheet", "frontend/src/lib/ (a roles view helper) and its tests", "frontend/src/stores/board.store.ts (the drawer's open state and the rail group's collapse only)", "scripts/fixture-home.sh and testdata/fixture-overlay/ (the roles fixture R1-R4 read; added by sup38)", "frontend/src/components/AgentList.tsx (the row's data-session, tabIndex -1 and accessible name only, for A3; added by sup38)", "not: Go, docs/design-system.md"]
spec: "docs/ux/specs/transversal-roles.md (Aglaea, 299b221) and its Technical note T5; ruling 0082"
gate: "docs/ux/specs/transversal-roles.md Acceptance R1-R7, plus the build row below"
ui_review: true
review: fail
---

## Goal
He sees on Home and in the rail which roles are live, what each is on, its
mail and its initiatives, and opens a role without starting anything.

## Gate
- [ ] R1-R7: see `docs/ux/specs/transversal-roles.md`, Acceptance (met in Chromium; R5, R7 not verified in WKWebView)
- [x] `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build`

## Done
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
- Verdict: fail. R1-R7 and the build row hold in code and checks, but A2, the fix 582462b exists for, is not met as built. The WKWebView rows of R5 and R7 are the UI reviewer's.
- Commit reviewed: 582462b (branch roles-ui, base 382271c). Supersedes the pass at c6f39ce.
- Unmet: A2 (Amendment 1). It is not an R row, but sup38 made A2 and A3 conditions of the merge. `.rd-inits` is still in `roles.css:82`'s `display: grid` rule, so each `<span>` is a grid row. The list renders one initiative per line with a leading comma (`init-a` / `, init-b` / `, init-many` …). The builder's own `chromium-1512x945-A2-drawer-initiatives-full-overlay.png` shows it. The links themselves are plain text, not bordered.
- Evidence: clean clone of 582462b. `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (go 13 packages ok, vitest 224). `npm install && npm test && npm run build` exit 0. `wails build` exit 0. Fixture `go run . roles --json` in a fresh shell: Hephaistos live, 2 sessions, 61%. Aglaea live, 28%, one `[for aglaea]` mail. Ariadna never seen, no bitácora. Daedalus not running, last seen 2 Oct. Talos and Hermione are here: false. Stand-ins killed from bash.
- Code: roles.ts and the drawer feed nothing to queueOf/needsMeRows, and lib/queue.ts is untouched (T4, R3). The UI reads `agents.roles` only (T5). Rows, rail items and the drawer hold no Attach, Kill, Start, Stop or Message (R6). A3's landing only reads Attach's title, to find a crew row. Escape closes the drawer through openBox, focus lands on the title, and it returns to the opener or its `data-role` (R5). A3: the landing focuses the `li[data-session]` row or the Crew `li[data-seat]`, never Attach. Dates go through lib/dates. The tests cover the States table; "no roles configured" lives in the components, not the helper.
- AgentList.tsx: only `data-session`, `tabIndex={-1}`, `aria-label` and the `rowName` helper that builds that name. Boundary: every changed path is inside it. board.store.ts adds only `roleOpen`/`openRole`.
- Gate gap, for the FSE: the gate reads "Acceptance R1-R7" and carries none of Amendment 1. A2 and A3 are merge conditions with no gate row.
- Still not gated, as at c6f39ce: `ageWords` copies Home's `age`; `sessionStarted` prints `up <ps etime>` raw (U2); the strip's accessible name is the bare name (U3).
- Reviewer: ru-review, 2026-10-04

## UI review
- Commit run: **582462b** (rebased on main; A3 9a0b81c, A2 582462b; spec Amendment 1 f3535e7). Fresh detached worktree .wt/ru-ui and a fresh fixture shell (`scripts/fixture-home.sh`, which now has Hephaistos runs in four initiatives). The first pass ran on c6f39ce; Home and the rail measured the same here. The badge baseline (14) was taken on ee7658a with its own fixture during the c6f39ce pass.
- Verdict, Chromium at 582462b: **pass**: no severity 4 or 3 against the spec. A3 is met. A2 is not: links but still stacked (U5, sev 1; sup38 has the branch moving for it). **WKWebView: waiting.** The Mac's screen is locked (`CGSSessionScreenIsLocked` true at the end of this pass), which is why the c6f39ce captures came back blank.
- Chromium: headless Chrome for Testing 1234 against `wails dev -devserver localhost:34545`. Viewport = content, so 1024x609 stands for the 1024x640 window. Overlay = Chromium's hidden scrollbars; classic = 15 px `::-webkit-scrollbar` that take room. Shots and logs for this commit are in `.wt-notes/ru-ui/582462b/`; drivers are in `.wt-notes/ru-ui/` (`drive.cjs`, `s-home.cjs`, `s-r5.cjs`).

| row | Chromium at 582462b (size, rail, scrollbars: measured, hit-tested) | shot | WKWebView |
|---|---|---|---|
| R1 | 1512x945 full and 1024x609 strip, overlay and classic. Sections run needs, roles, list (1512: y 63/861/1093; 1024: 63/623/855). Four rows: Hephaistos `2 sessions · 61% context` (dot), Aglaea `live · 28% context` (dot), Ariadna `not running`, Daedalus `not running · last seen 2 Oct`. The last line is `Talos, Hermione · PLV infra, on odyssey`: a div in --fg-subtle, no control, no tabindex. Every row centre and the muted line hit their own element (`elementFromPoint`). | chromium-1512x945-R1-home-roles-full-*.png, chromium-1024x609-R1-home-roles-strip-*.png | waiting (locked) |
| R2 | same runs: Hephaistos `hand-off 3 Oct · Forged the roles fixture…` (this machine `fixture`; `odyssey · 2 Oct` folded in the drawer); Ariadna `no bitácora yet`; Daedalus' `hand-off 24 Sep` in --fg-subtle (stale) | R1 shots | waiting |
| R3 | Aglaea `1 message waiting` (magenta, plus the word). Rail: full item count `1`, its aria-label carrying the mail; strip in the title only. Badge 14 = Needs me count 14, no row naming `[for `. Base ee7658a: 14. | R1 shots | waiting |
| R4 | `2 sessions · 61% context`; the drawer lists probe-hefesto (init-a, running, 42%) and probe-hefesto-odd (outside every initiative, 61%, a static line) | chromium-*-R5-drawer-hephaistos-from-row-*.png | waiting |
| R5 | 1512x945 full, and 1024x609 strip and full, each overlay and classic. A pointer click at the row centre opens the drawer with focus on `h2` (hit own); Escape closes it and focus returns to the row. The rail item (full and strip) opens it with focus on the title; Escape returns focus to the item, and Enter reopens. Tab loops Close, session, mail, `Open init-a`. **A3 met:** the session line lands on init-a Agents with focus on the row `li` itself, named `probe-hefesto, running, 42% context`, marked `role-landed`, in view, its centre hitting its own element; no Attach is focused. The mail line opens init-a Conversations with the `[for aglaea]` thread targeted, but focus falls to body (U1). | chromium-*-R5-{drawer-*,session-landing,thread-landing}-*.png | waiting |
| R6 | drawer controls: Close, session line(s), a folded hand-off, mail line, `Open <initiative>` links; no Attach, Kill, Start, Stop or Message in rows, rail items or drawer | R5 shots | waiting |
| R7 | 1024x609 strip, overlay and classic: doc width = viewport (no horizontal page scroll, no document scroll). Strip items `H• A• Ar D` are unranked, with a separator and centres hitting their own buttons. All row columns fit beside the strip. The drawer is 720x513 with a scrolling body and a bottom edge (408/535). At 1024 full (from the R5 runs), where gives way on every row; the accessible name and title keep it. | chromium-1024x609-R1-*, chromium-1024x609-R5-drawer-hephaistos-bottom-*.png | waiting |

- Findings at 582462b:
  - **U5 (1, A2 not met)**: The drawer's initiatives read as a column of links, not one comma list. Where: drawer › Initiatives, every size. Evidence: `log-r5-*`. `a` elements have no border, but they stack at x 175, 181, 181… and y 554, 577, 600, 623, 646, and each comma starts its own line. Shot: chromium-1024x609-R5-drawer-hephaistos-bottom-strip-overlay.png. Proposal: make `.rd-inits` inline (the grid rule sup38 named, roles.css:82).
  - **U1 (2, still open)**: After a mail line, focus falls to body in Conversations (all configurations). Proposal: land focus on the targeted thread's divider, or on the composer that names it.
  - **U6 (1, new with A3)**: The landed row's accessible name says `running` while the row's visible word is `idle` (Agents' label for that state), against WCAG 2.5.3, label in name. Proposal: build the name from the row's own state label.
  - **U2 (1, was 2)**: A session's start reads `up 05:38` (elapsed mm:ss). This is Agents' own vocabulary (`up 05:42:44` there), so it is consistent but not "started" as the spec words it.
  - **U3 (1)**: On the strip, a role item's accessible name is the bare name; its state and mail are only in the hover title.
  - **U4 (1)**: At 1024 strip, the rows do not share doing-now and where tracks. Hephaistos' doing now is cut at 294 px beside about 130 px of empty mail track; Daedalus' gets 453 px.
- Design questions, for aglaea: A1 to A3 of the c6f39ce pass went into the spec's Amendment 1. A3 is met, A2 is U5, and A1 is out of this card. None new.
- Spec gaps, for the FSE: a session line whose session sits outside every initiative (built static); the format of "started"; the mail line's `from` when the thread's messages are not loaded (fixture: none); the doing-now fold (second step) cannot be reached at the 1024 minimum with this fixture.
- Not verified: every WKWebView column, waiting on the screen to unlock. In Chromium: the working dot animating, mail unknown, the never-seen drawer text, and "older than a week" in a drawer.
- Reviewer: ru-ui, 2026-10-04

## Notes
- 2026-10-04 sup38: R1-R4 are checked "by fixture" and no fixture carried roles (its zellij is /usr/bin/true). Stand-ins with AGENT_SESSION, a roles config, bitácoras, runs.jsonl and a canned [for aglaea] thread make it; those live in scripts/fixture-home.sh and testdata/fixture-overlay/, so the boundary gained them (supervise precondition 10). The gate is unchanged; told the FSE.
- 2026-10-04 ru-build: Home's sections were not collapsible; Roles is the first (heading disclosure, `home.roles.open`). The drawer is mounted from Rail.tsx (App.tsx outside the boundary). A session landing focuses the session's Attach on Agents, found by its title `probe <session>`, since AgentList rows carry no data-session; a `session:` agentsLanding would be cleaner. The fixture's [for aglaea] thread is canned, so Conversations shows it "opening…" and the drawer names no sender. A Hephaistos session outside every initiative is a static line: no Agents to land on.
