---
title: "Plain Tab reaches links, with a skip link first"
status: now
repos: [organizer]
branch: lf22-tab-links
seat: tl-build
stage: one-window
updated: 2026-10-13
next: "review: lf22-tab-links, gate met (K1-K4, X0), d9cd76f"
depends_on: []
boundary: ["docs/specs/leftovers-22.md Boundary, lf22-tab-links"]
spec: "docs/specs/leftovers-22.md (FR-1 to FR-4; tab-reaches-links, T1, T2, T4, T5)"
gate: "docs/specs/leftovers-22.md Acceptance, rows K1, K2, K3, K4 and X0"
ui_review: true
review: pass
---

## Goal
Plain Tab reaches every link; Skip to content comes first (0117; Aglaea, 3ce6af1).

## Gate
docs/specs/leftovers-22.md, rows K1, K2, K3, K4 and X0.
- [x] K1: `main_test.go` TestMacOptionsTabFocusesLinks; harness on: Tab lands on `Open init-a` (Initiatives #11) and the Hephaistos drawer's `Open init-a`..`Open init-drafted`; off: never a link (/Users/pabloantipan/organizer/.wt-notes/tl-build/evidence/k1-on.jsonl, k1-off.jsonl)
- [x] K2: first Tab on Home, Initiatives, init-a and Settings is `Skip to content`, focus-visible, on screen with the ring; Return lands in main (h2/h1); vitest SkipLink.test.tsx 6 pass (/Users/pabloantipan/organizer/.wt-notes/tl-build/evidence/k2-on.jsonl)
- [x] K3: every link kind `solid 2px #8a3ffc` under focus-visible; `Open <id>` card raised to rgb(46,39,60) = hovered (`--surface-hover`) (/Users/pabloantipan/organizer/.wt-notes/tl-build/evidence/k3-on.jsonl, k1-on.jsonl)
- [x] K4: inventory and the four Tab orders before (off) and after (on) below; five click-navigating non-controls listed as findings (/Users/pabloantipan/organizer/.wt-notes/tl-build/evidence/k4-inventory.md, k4-orders.md)
- [x] X0: clean clone of 347152e: make test (Go ok, vitest 556), pnpm run build, wails build pass; porcelain empty (/Users/pabloantipan/organizer/.wt-notes/tl-build/x0-*.log, x0-status.txt)

## Done
- 2026-10-13 tl-build: TabFocusesLinks on (3c53f4e), skip link first on every screen (dbca94e), offscreen WKWebView Tab harness in scripts/tab-harness (d9cd76f); link ring already reached links, global.css untouched; rebased on main (X0 ran on 347152e, the same code tree before the last rebase over card-only commits).

## Notes
- Harness: the offscreen window says isKeyWindow to its own WKWebView only (WebKitTestRunner's way); without it WebKit matches no :focus. Never ordered in, never activates, keys via sendEvent: only. How to run: /Users/pabloantipan/organizer/.wt-notes/tl-build/progress.md.
- This Mac has macOS Keyboard navigation off: with the flag off WKWebView tabs to text fields only, buttons skipped too, so "before" lists are near empty. With the flag on WebKit also tabs to all form controls.
- Findings for the FSE (No-gos, not fixed): F1-F5 below.

### Inventory (K4)
Branch lf22-tab-links on main 5642453 (after lf22-rail-roving). Static read of
frontend/src/components (grep of onClick and href), checked live with the harness.

## Links (<a href>)
| Where | Element | Navigates to |
|---|---|---|
| App.tsx via SkipLink.tsx | `a.skip-link` href `#main`, "Skip to content" | focus into main (new, FR-2) |
| InitiativesView.tsx:242 | `a.ic-id` href `#<id>`, "Open <id>" | the initiative's Overview |
| RoleDrawer.tsx:148 | `a.rd-init` href `#`, "Open <id>" | the initiative's Overview |

## Buttons that navigate (keyboard reachable already)
TopBar place tabs (Home, Initiatives, Usage), Settings ⚙, Needs me badge; Rail
role rows, strip items, `Back to Initiatives`, `Initiatives ›`; Home's
initiative rows, Rule rows, role rows (`r-row`), `Initiatives ›`; the
initiative header's sub-view tabs, stage and decision buttons; Overview's
decision rows. Rail initiative rows are a `div role="button"` from
@hello-pangea/dnd with a roving tabindex (lf22-rail-roving); CardItem.tsx:85
is a `div role="button"`: both are buttons by role and keyboard operable.

## Navigates on click without being a link or a button (findings, not fixed: No-gos)
| # | Where | Element | What the click does | Keyboard path today |
|---|---|---|---|---|
| F1 | AgentsView.tsx:88 | `span.agent-group-title` | `setSelectedInitiative(g.id)`, "Show only this initiative" | none |
| F2 | SlackView.tsx:47 | `li.cell-row` | `setSelectedInitiative(g.id)` (opens that cell's chats) | none |
| F3 | SlackView.tsx:117 | `li.person` | focuses the chat with that seat | none |
| F4 | Conversation.tsx:320 | `div.hit` (search result) | `goTo(thread)` | none |
| F5 | Conversation.tsx:842 | `div.q-ruling` | opens the thread ("open the thread") | none |
| — | InitiativesView.tsx:238 | `div.ic-main` (card body) | opens the initiative | the card's `Open <id>` link (one link per card, A2 §1): by design, not a finding |

Backdrops (`modal-backdrop`, `rb-scrim`) close, they do not navigate.

### Tab order, 1440x900, fixture (K4)
#### home, before, flag off (1 stops)
1. rail: div role=button "1 init-a acme 1 1 7"
2. (nothing: focus on body)

#### home, after, flag on (54 stops)
1. skip: link "Skip to content"
2. topbar: button "Home"
3. topbar: button "Initiatives"
4. topbar: button "Usage"
5. topbar: button "Memory: high, 3.7 GB free of 24 GB"
6. topbar: button "Needs me 15"
7. topbar: button "Rescan"
8. topbar: button "Compact to icon"
9. topbar: button "Help"
10. topbar: button "Settings"
11. rail: button "Initiatives rail"
12. rail: button "Collapse Roles"
13. rail: button "Hephaistos: 2 sessions · 61% context"
14. rail: button "Aglaea: live · 28% context; 1 message waiting"
15. rail: button "Ariadna: not running"
16. rail: button "Daedalus: not running · last seen 11 Oct"
17. rail: button "Group by client"
18. rail: button "New group"
19. rail: div role=button "1 init-a acme 1 1 7"
20. rail: button "Expand Asleep"
21. rail: button "Initiatives ›"
22. rail: button "Expand Archived"
23. main: button "Rule init-a 0002"
24. main: button "Rule init-a 0003"
25. main: button "Rule init-b 0001"
26. main: button "Rule init-a 0008"
27. main: button "Rule init-many 0074"
28. main: button "Show the other 10"
29. main: button "ROLES"
30. main: button "Hephaistos; 2 sessions · 61% context; doing now: hand-off 12"
31. main: button "Aglaea; live · 28% context; doing now: 12 Oct · waiting on t"
32. main: button "Ariadna; not running; doing now: no bitácora yet; no mail wa"
33. main: button "Daedalus; not running · last seen 11 Oct; doing now: hand-of"
34. main: button "init-a"
35. main: button "Details for init-a: goal, next date, repos"
36. main: button "init-many"
37. main: button "Details for init-many: goal, next date, repos"
38. main: button "init-b"
39. main: button "Details for init-b: goal, next date, repos"
40. main: button "init-blind"
41. main: button "Details for init-blind: goal, next date, repos"
42. main: button "init-define"
43. main: button "Details for init-define: goal, next date, repos"
44. main: button "init-draftable"
45. main: button "Details for init-draftable: goal, next date, repos"
46. main: button "init-drafted"
47. main: button "Details for init-drafted: goal, next date, repos"
48. main: button "init-nopeople"
49. main: button "Details for init-nopeople: goal, next date, repos"
50. main: button "init-ready"
51. main: button "Details for init-ready: goal, next date, repos"
52. main: button "init-c"
53. main: button "Details for init-c: goal, next date, repos"
54. main: button "Initiatives ›"
55. (nothing: focus on body)

#### initiatives, before, flag off (0 stops)
1. (nothing: focus on body)

#### initiatives, after, flag on (43 stops)
1. skip: link "Skip to content"
2. topbar: button "Home"
3. topbar: button "Initiatives"
4. topbar: button "Usage"
5. topbar: button "Memory: high, 3.7 GB free of 24 GB"
6. topbar: button "Needs me 15"
7. topbar: button "Rescan"
8. topbar: button "Compact to icon"
9. topbar: button "Help"
10. topbar: button "Settings"
11. main: link "Open init-a"
12. main: button "Details of init-a"
13. main: button "Sleep init-a"
14. main: link "Open init-many"
15. main: button "Details of init-many"
16. main: button "Sleep init-many"
17. main: link "Open init-b"
18. main: button "Details of init-b"
19. main: button "Sleep init-b"
20. main: link "Open init-blind"
21. main: button "Details of init-blind"
22. main: link "Open init-define"
23. main: button "Details of init-define"
24. main: button "Sleep init-define"
25. main: link "Open init-draftable"
26. main: button "Details of init-draftable"
27. main: button "Sleep init-draftable"
28. main: link "Open init-drafted"
29. main: button "Details of init-drafted"
30. main: button "Sleep init-drafted"
31. main: link "Open init-nopeople"
32. main: button "Details of init-nopeople"
33. main: button "Sleep init-nopeople"
34. main: link "Open init-ready"
35. main: button "Details of init-ready"
36. main: button "Sleep init-ready"
37. main: link "Open init-c"
38. main: button "Details of init-c"
39. main: button "Sleep init-c"
40. main: link "Open init-asleep"
41. main: button "Details of init-asleep"
42. main: button "Wake init-asleep"
43. main: button "ARCHIVED · 1"
44. (nothing: focus on body)

#### overview, before, flag off (1 stops)
1. rail: div role=button "1 init-a acme 1 1 7"
2. (nothing: focus on body)

#### overview, after, flag on (41 stops)
1. skip: link "Skip to content"
2. topbar: button "Home"
3. topbar: button "Initiatives"
4. topbar: button "Usage"
5. topbar: button "Memory: high, 3.9 GB free of 24 GB"
6. topbar: button "Needs me 15"
7. topbar: button "Rescan"
8. topbar: button "Compact to icon"
9. topbar: button "Help"
10. topbar: button "Settings"
11. rail: button "Initiatives rail"
12. rail: button "Back to Initiatives"
13. rail: button "Collapse Roles"
14. rail: button "Hephaistos: 2 sessions · 61% context"
15. rail: button "Aglaea: live · 28% context; 1 message waiting"
16. rail: button "Ariadna: not running"
17. rail: button "Daedalus: not running · last seen 11 Oct"
18. rail: button "Group by client"
19. rail: button "New group"
20. rail: div role=button "1 init-a acme 1 1 7"
21. rail: button "Expand Asleep"
22. rail: button "Initiatives ›"
23. rail: button "Expand Archived"
24. main: button "Roadmap, stage 2 of 4: The joins. Open it in Roadmap"
25. main: button "6 decisions waiting"
26. main: button "1 file Deltagos can't read"
27. main: button "Details"
28. main: button "Overview"
29. main: button "Work"
30. main: button "Roadmap"
31. main: button "Decisions"
32. main: button "Conversations"
33. main: button "Agents"
34. main: button "0001 The fixture initiative plans in stages ruled 5 Aug"
35. main: button "0002 The fixture runs on one machine or two waiting 23d"
36. main: button "fse off waiting on you: 6"
37. main: button "0002 The fixture runs on one machine or two rule 23d"
38. main: button "0003 Who reviews the fixture wave rule 19d"
39. main: button "0008 The organizer's roadmap, as it was proposed rule 16d"
40. main: button "0009 Which machine runs the fixture's nightly scan, and who "
41. main: button "0010 How wide the scan report may be rule 9d"
42. (nothing: focus on body)

#### settings, before, flag off (11 stops)
1. main: input ""
2. main: input ""
3. main: input ""
4. main: input "organizer"
5. main: input "fixture"
6. main: textarea "/private/tmp/organizer-fixture.TSuOKe/home"
7. main: input "3"
8. main: textarea "node_modules Library"
9. main: input "15"
10. main: input "claude"
11. main: input "code"
12. (nothing: focus on body)

#### settings, after, flag on (22 stops)
1. skip: link "Skip to content"
2. topbar: button "Home"
3. topbar: button "Initiatives"
4. topbar: button "Usage"
5. topbar: button "Memory: high, 3.6 GB free of 24 GB"
6. topbar: button "Needs me 15"
7. topbar: button "Rescan"
8. topbar: button "Compact to icon"
9. topbar: button "Help"
10. topbar: button "Settings"
11. main: input ""
12. main: input ""
13. main: input ""
14. main: input "organizer"
15. main: input "fixture"
16. main: textarea "/private/tmp/organizer-fixture.TSuOKe/home"
17. main: input "3"
18. main: textarea "node_modules Library"
19. main: input "15"
20. main: input "claude"
21. main: input "code"
22. main: button "Save"
23. (nothing: focus on body)

## Review
Verdict: pass. Checked 347152e (pinned; head d9cd76f differs only in this card), clean clone, fixture, auth off, own wails dev on :34117, harness built from the branch's tabharness.swift.
- K1: `go test -run TestMacOptionsTabFocusesLinks` pass (flag + AST check that options.App carries `Mac: macOptions`). Harness on: Initiatives Tab #11 `Open init-a`, then every card's link; Hephaistos drawer Tab #4-#8 `Open init-a`..`Open init-drafted`. Off: Initiatives body on all 30 presses; drawer cycles SUMMARY/body/rail row, never a link. Met.
- K2: harness on, first Tab on Home, Initiatives, init-a, Settings = `Skip to content`, focus-visible, solid 2px rgb(138,63,252), rect 8,8 118x28 on screen; Return lands on main's h2 (Needs me) / h1 Initiatives / h1 init-a / h1 Settings. Vitest in make test: 44 files, 556 pass, SkipLink.test.tsx included. Met.
- K3: skip link, `Open <id>` (all cards) and `rd-init` each solid 2px #8a3ffc offset 2px under focus-visible (global.css:39 reaches links, as claimed); focused `Open <id>` card `.raised`, rgb(46,39,60) = `--surface-hover`, the hovered raise; rest rgb(39,32,51). Met.
- K4: my four orders, both flags, match the card's lists line for line (only a live context % differs). Inventory checked by grep: the three `<a>` and the non-button onClick elements are exactly the card's; F1-F5 listed as findings. Met.
- X0: clean clone: make test (Go ok, vitest 556) pass, pnpm run build pass, wails build pass, porcelain empty. Met.
Unmet rows: none. Reviewer: tl-review, 2026-10-13, commit 347152e. Evidence: /Users/pabloantipan/organizer/.wt-notes/tl-review/ (ev/*.jsonl, my-orders.md, x0-*.log).
