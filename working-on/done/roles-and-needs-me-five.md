---
title: Needs me shows its oldest five then "Show the other N"; role landings focus what they name; role names and tracks
status: done
repos: [organizer]
branch: roles-and-needs-me-five
updated: 2026-10-05
next: ""
seat: rn5-build
depends_on: [drafts-per-chat]
boundary: ["frontend/src/components/Home.tsx, frontend/src/styles/home.css (Needs me's five, role rows' tracks)", "frontend/src/lib/queue.ts (a first-five helper only; needsMeRows unchanged) and lib/ tests", "the roles drawer and rail item components and their CSS; Rail.tsx (the role item's name)", "frontend/src/components/AgentsView.tsx and AgentList.tsx (the landed row's name only: rowName lives in AgentList.tsx, sup40), Conversation.tsx and SlackView.tsx (focus on a landing; the composer's default addressee and wake count, FR-6), InitiativeHeader.tsx (focus target only)", "testdata/ and scripts/fixture-home.sh (a 14-row Needs me fixture)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-11.md (FR-1 to FR-6); transversal-roles.md Amendment 1 (Aglaea, f3535e7)"
gate: "docs/specs/leftovers-11.md Acceptance, rows V1 to V5 and V0"
ui_review: true
review: pass
---

## Goal
Roles stay in view on Home with a long Needs me; the rest of roles-ui's leftovers.

## Gate
- [x] V1-V5: see `docs/specs/leftovers-11.md`, Acceptance
- [x] V0: see `docs/specs/leftovers-11.md`, Acceptance

## Done
- 2026-10-05 sup40: seats ended, tokens revoked, worktree removed, task threads closed; run record runs/2026-10-05-roles-and-needs-me-five.md (51 min, $12.44; forecast 40-80 min)
- 2026-10-05 sup40: code review pass and UI review pass (both engines) at eb2964e; merged to main as 042c7ee, go test and vitest (250) green; rn5-A1 (the default wake count in blocked red) and rn5-A2 (wake count beside Send?) sent to aglaea, answered in the design system (2203d7d: the wake count neutral, magenta when it wakes every seat, never red; beside Start or Send), for the next batch; rn5-U1, rn5-U2, G1-G4 for the FSE
- 2026-10-05 rn5-build: branch roles-and-needs-me-five, rebased on 6a5d6d4 (3eb4803 e6f31ff fb7d3d9 9f607cb 50a3c19 d9e03b5 71417d8 e52a1fd eb2964e); V1-V5 measured in Chromium and in Deltagos Review.app, overlay and classic, V0 green; measurements and choices in .wt-notes/rn5-build/progress.md
- 2026-10-05 sup40: worktree .wt/roles-and-needs-me-five from c147c6a, seat rn5-build; boundary names AgentList.tsx for FR-3 (rowName lives there), spec field says FR-6 as the boundary already did
- 2026-10-05 0085 ruled by pablo ("ok", f6e7aea); sup40 launched by the FSE
- 2026-10-04 cut from leftovers-11 by the FSE

## Review
- Verdict: pass (rn5-review, 2026-10-05)
- Commit reviewed: eb2964e (branch roles-and-needs-me-five)
- Unmet gate items: none
- V0: clean clone at eb2964e, `XDG_DATA_HOME=$(mktemp -d) make test` with no prior build green (Go, 250 vitest tests), `npm install && npm test && npm run build` green, `wails build` built Deltagos.app.
- V1-V5 from the diff and the builder's logs: needsMeShown with a vitest, needsMeRows unchanged, the button only off wide; landings focus `.tl-divider` and `.ihead-id`; rowName and the strip label read the visible state and mail; `--r-where` gives equal track starts (WKWebView: doing 372, where 776 on every row); every postToCell caller posts the `to` its select shows (shownSeats). Boundary: 11 paths, all inside.
- Not in the gate: the ReplyBox's wake count is still apart from Send; the focused divider has no name of its own; the drawer says `running` where the row says `idle`.

## UI review
- Commit run: **eb2964e**, the branch did not move during the run. It ran from a fresh detached worktree, .wt/rn5-ui (now removed), with a fresh fixture shell (`scripts/fixture-home.sh`, /private/tmp/organizer-fixture.Mvpetn). Shots, logs and drivers are in `.wt-notes/rn5-ui/`.
- Verdict: **pass**, in Chromium and WKWebView. V1 to V5 hold in both engines, with overlay and classic scrollbars. No finding is severity 4 or 3.
- Chromium: headless Chrome for Testing 1234 against `wails dev -devserver localhost:34565`. The viewport is the content area, so 1512×913 stands for the 1512×945 window and 1024×609 for 1024×640. Overlay means Chromium's hidden scrollbars; classic means 15 px `::-webkit-scrollbar` bars that take room. Drivers: `drive.cjs`, `s-v1.cjs`, `s-v4.cjs`, `s-v23.cjs` (click and Enter), `s-v5.cjs`. Hit tests use `elementFromPoint` at the element's centre.
- WKWebView: `Deltagos Review.app` from `make review-build` at eb2964e, run with the fixture's `ORGANIZER_CONFIG` and `XDG_DATA_HOME`. Overlay is `-AppleShowScrollBars WhenScrolling` and classic is `Always`. The window was sized through AX. Clicks are HID events, refused unless the point is inside my app's frame, the topmost window there is its pid and the app is frontmost (two refusals, both points out of view, so nothing was sent). Hit = `AXUIElementCopyElementAtPosition` at the centre; `wkax focushit` hit-tests the focused element. Shots via `screencapture -o -l <CGWindowID>`. For V4, column starts were measured from the shot's pixels (`cols.py`), since a row's AX button exposes no children.

| row | Chromium (window, rail, scrollbars: result, hit) | Chromium shot | WKWebView (window, rail, scrollbars: result, hit) | WKWebView shot |
|---|---|---|---|---|
| V1 | **pass**. Checked at 1512×945 rail expanded and at 1024×640 with the rail expanded and as the strip, each overlay and classic. The heading reads `Needs me · 14`, the badge 14. Five rows, then `Show the other 9`. At 1512, Roles' four rows and the Talos line sit at y 420–628 in a 913 viewport, so it is in view with no scrolling (1024: y 335–543 of 609). Every row centre, the button and each role row hit their own element. Pressing the button shows 14 rows, labelled `Show only the oldest 5`, with focus on the sixth row's verb `Rule init-many 0074`, in view; pressing again gives 5 with focus back on the button. Wide at 3440×1440 and 2200×1080 (content 1408 and 1048 tall), overlay and classic: 14 rows and no button. | chromium-{1512x913,1024x609}-V1-{five,all}-{full,strip}-{overlay,classic}.png; chromium-{3440x1408,2200x1048}-V1-five-full-*.png | **pass**, at the same three sizes × overlay/classic. The AX heading reads `NEEDS ME · 14 …`. There are five row verbs (`Rule init-a 0002` … `Rule init-a 0008`), each hitting itself, then the `Show the other 9` button, which hits itself. The four role rows (AXPopUpButton) and `Talos, Hermione · PLV infra, on odyssey` sit at y 515–683 in a 1512×945 window (bottom 976) and at y 430–598 in 1024×640 (bottom 671), all hitting themselves. The document has no scroll bars. Show gives 14 rows with focus on `Rule init-many 0074`; Show only gives 5 with focus on the button (pressed through AX where the button sat out of view). Wide: the screen allows at most a 3440×1305 window, overlay and classic: 14 rows, no button. | webkit-{1512x945,1024x640}-V1-{five,all}-{full,strip}-{overlay,classic}.png; webkit-3440x1305-V1-wide-full-*.png |
| V2 | **pass**, at 1512×945 rail expanded and 1024×640 strip, overlay and classic, followed by click and by Enter. Aglaea's mail line puts `activeElement` on `div.tl-divider` of `#thread-01FIXTUREFORAGLAEA…`, which is targeted, in view and hits itself. Hephaistos' `Open init-b` puts it on `h1.ihead-id[data-initiative=init-b]` on Overview, in view and hitting itself. | chromium-*-V2-{mail,init}-landed-{click,enter}-*.png | **pass**, at 1512×945 rail expanded and 1024×640 strip, overlay and classic, with HID clicks. After the mail line, AX focus is the divider group (738×38 at 1512, 718/704 at 1024), whose centre hits its subject text. After `Open init-b`, focus is the AXHeading `init-b personal`, which hits itself. At 1024×640 the links sit below the drawer body's visible part (y 617, clipped), so they were scrolled into view (AXScrollToVisible) before the click. | webkit-*-V2-{mail,init}-landed-*.png, webkit-1024x640-V2-drawer-*-strip-overlay.png |
| V3 | **pass**, at the same configurations. The landed row is `li.running.role-landed`, named `probe-hefesto, idle, 42% context`; it shows `idle`, sits in view and hits itself. Every Agents row's name carries its shown word. Strip items are named `Hephaistos, 2 sessions · 61% context`, `Aglaea, live · 28% context, 1 message waiting`, `Ariadna, not running` and `Daedalus, not running · last seen 3 Oct`, each hitting itself. Full rail items are named `Aglaea: live · 28% context; 1 message waiting`. | chromium-*-V3-landed-row-*.png | **pass**. The landed AXGroup is named `probe-hefesto, idle, 42% context`, its first child is the text `idle`, and its centre hits inside it. Strip AXPopUpButtons are named `Aglaea, live, 1 message waiting` and so on, each hitting itself. (Aglaea showed no context % in this run in both modes; the fixture's statusline record is not part of this card.) | webkit-*-V3-landed-row-*.png |
| V4 | **pass**. At 1024×609 strip, overlay, every role row's doing now starts at x 371, mail at 676 and where at 789 (classic: 371/661/774); `gridTemplateColumns` is identical on every row. The same holds at 1512 expanded (575/1164/1277) and 1024 expanded (where gives way on every row together). Measured with the fixture's four roles. | chromium-1024x609-V4-tracks-strip-{overlay,classic}.png | **pass**. At 1024×640 strip, the text column starts in the window shot are: doing now 372 on all four rows, mail 677 and where 790 in overlay; 372/663/776 in classic. | webkit-1024x640-V4-tracks-strip-{overlay,classic}.png |
| V5 | **pass**, at 1512×945 rail expanded and 1024×640 strip, overlay and classic. In channel the new-thread form opens with Recipient `everyone (wakes 3)` and body `Message to the channel`, and `wakes 3 seats` sits 8 px left of Start on one line, both hitting themselves. In po_ana and dev_bruno it opens with Recipient set to the seat, `Message to <seat>` and `wakes 1 seat`. Start was pressed with `PostToCell` stubbed in the page (it records the call and rejects): it posted `to: ""` from channel and `to: "po_ana"` / `"dev_bruno"` from the direct chats. Three stubbed calls, none sent. | chromium-*-V5-{channel,po_ana,dev_bruno}-new-thread-*.png | **pass** for the defaults: AXPopUpButton `Recipient` with value `everyone (wakes 3)` in channel and `po_ana` / `dev_bruno` in the direct chats, the matching textarea names, and `wakes` at x 847–855 beside Start at 926 (1024) or 1071–1079 beside 1150 (1512). Both hit themselves. **Start was not pressed** (no stub in WKWebView, and it would post to the fixture's real mailbox). | webkit-*-V5-{channel,po_ana,dev_bruno}-new-thread-*.png |

- Findings at eb2964e, none against the gate:
  - **rn5-U1 (2)**: After following a role's mail line, a screen-reader user hears no name for where they landed. Where: Conversations, the focused `div.tl-divider` (webkit-*-V2-mail-landed-*.png). Evidence: WKWebView AX focus is `AXGroup ""`, whose children are the subject, `1`, `/12`, and the Escalate and Close buttons; in Chromium it has no role and no aria-label. Severity 2: FR-2 holds (DOM focus is right), but the design system's Navigating ("focus lands on the thing named") is half met. Proposal: name the divider from its subject and status (`aria-labelledby` the `.tl-subj`, or `aria-label="Thread <subject>, open, 1 of 12"`).
  - **rn5-U2 (1)**: The drawer and the row it lands on use different words for one session. Where: role drawer, Sessions (`probe-hefesto in init-a: running, 42% context`), against the landed row's `idle`. Evidence: V3 logs, both engines. Proposal: the drawer's session word uses Agents' `STATE_LABEL`, as FR-3 did for the row.
- Design questions, for aglaea:
  - **rn5-A1 (1–2)**: The channel's new default now always reads in the blocked red. Where: the new-thread form in channel, `wakes 3 seats` in `--blocked` (`.wakes.hot`; chromium-*-V5-channel-*.png). Evidence: FR-6 made everyone the default, so the ruled default state is painted with red, which is reserved for blocked. Should the default wake count be a neutral or magenta tone, with red kept for something else?
  - **rn5-A2 (1)**: The reply composer's wake count sits after the recipient select, about 330 px from Send (webkit-1024x640-V2-mail-landed-strip-overlay.png). The design system's rule names Start only. Does "beside Start" also mean beside Send?
- Spec gaps, for the FSE:
  - G1: FR-1 does not say where focus goes after `Show the other N` or `Show only the oldest 5`. Built: the first revealed row's verb, then back to the toggle (Ruled's handover). It works in both engines; record it as accepted.
  - G2: FR-1 does not cover a landing (`openNeedsMe`) on a row past the five, or a kept Rule draft on a hidden row. Built: all rows show. Not gated and not verified here.
  - G3: V4 says three roles; the fixture has four. Measured with four.
  - G4: FR-6 says "a composer" but V5 checks the new-thread form only. The reply box (A2) and the Rule box are outside the gate.
- Not verified:
  - Start or Send pressed in WKWebView (Chromium covered it with the stub).
  - The keyboard path under macOS Keyboard navigation. WKWebView was driven by HID clicks and AX; Enter was used only in Chromium.
  - A Needs me landing on a hidden row, and a kept draft on a hidden row (G2).
  - A 3440×1440 window in WKWebView: the screen caps it at 3440×1305, so 2200 wide was not shot there.
- Reviewer: rn5-ui, 2026-10-05

## Next

## Blockers

## Notes
- 2026-10-05 rn5-build: the fixture already had 14 Needs me rows only while discuss runs (one is the live asking thread); without it fixture-home.sh now writes a card addressed to pablo in its place.
- 2026-10-05 rn5-build: V4 names three roles; the fixture has four that run here, measured with four.
- 2026-10-05 rn5-build: the mail landing's focus target (`div.tl-divider`) has no accessible name of its own; the drawer's session line says `running` where the Agents row says `idle` (each true to its own view); Crew seat rows have no accessible name. All outside this boundary.
- 2026-10-05 rn5-build: V5's "no post reaches a seat" is checked in Chromium with PostToCell stubbed; in WKWebView only the defaults were read (Start not pressed). HID clicks from the seat's session did not reach the Review app; AXPress did.
