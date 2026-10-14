---
title: "The crew list reads its result, starts only what was asked, closes"
status: done
repos: [organizer]
branch: lf29-crew-list
seat: cl-build
stage: one-window
updated: 2026-10-14
next: "done: reviewed pass (cl-review, cl-ui) at 8fd6dce; merged by sup66"
depends_on: []
boundary: ["docs/specs/leftovers-29.md Boundary, lf29-crew-list"]
spec: "docs/specs/leftovers-29.md (FR-1 to FR-4; launch-progress L8-L10)"
gate: "docs/specs/leftovers-29.md Acceptance, rows C1, C2, C3, C4 and X0"
ui_review: true
review: pass
---

## Goal
The crew list reads its result, starts only what was asked, closes (launch-progress Amendment 1, 8c1b167).

## Gate
docs/specs/leftovers-29.md, rows C1, C2, C3, C4 and X0.

- [x] C1: all succeed `Crew up · 3 of 3 running` (closed ~5 s on), one fails `Crew up · 2 of 3 running, 1 didn't start`, Stop starting during the second `Stopped · 2 of 3 running, 1 not started`; live region says each once — .wt-notes/cl-build/out/c1a.txt, c1b.txt, c1c.txt
- [x] C2: two running, `Bring 1 up`: one seat listed, `Starting 1 seat · 0 of 1 running` then `Seat up · 1 of 1 running` — .wt-notes/cl-build/out/c2.txt
- [x] C3: Tab to `Close the list`, Return: list gone, failed seat `off`, `Bring 1 up` present, no Needs me row (badge at the fixture's 15), no kill call in the stub log — .wt-notes/cl-build/out/c3.txt, c3-stub-calls.txt, c3-styles.jsonl; AX not taken: screen locked (.wt-notes/cl-build/out/c3-ax-locked.txt), rests on offscreen WebKit names and computed styles
- [x] C4: "fails alone" and "forecast:" match, "stops the rest" does not — .wt-notes/cl-build/out/c4.txt
- [x] X0: make test, pnpm run build, wails build pass, status empty, clean clone at 8fd6dce — .wt-notes/cl-build/out/x0.txt

## Done
- 2026-10-14 cl-build: heading reads the result, list holds only this press's seats, Close the list (SeenLaunch, kills nothing), CLAUDE.md Crew and Navigation; 35292e6, 5d30aad, 8fd6dce on lf29-crew-list.

## Notes
- C1's cell is the fixture's 3 seats (fse, po_ana, dev_bruno); all three listed via Reattach all. C3 fails fse, not dev_bruno: other seats' fixtures run organizer-fixture-probe-bruno stand-ins that join this crew by family, so dev_bruno cannot read off.
- Unnamed case: nothing running reads `Seat not up · 0 of 1 running, 1 didn't start` / `Crew not up · …`.
- CreateCrew (Go) still re-probes the running seats; the view hides them, a hidden seat that fails is listed. Starting only the off seats would be a crew.go change. See .wt-notes/cl-build/progress.md, Found, not asked.

## Review
Pass: C1, C2, C3, C4 and X0 met at 8fd6dce. Unmet: none.

Evidence is in .wt-notes/cl-review/out/. The fixture is a clean clone at 8fd6dce with auth off. Tab harness rows ran against my own `wails dev` on 34175, with `ORGANIZER_PROBE_BIN` set to the builder's stand-in wrapper over `scripts/probe-stub.sh`. In my temp fixture only, I renamed the cell's project to `clrfix`. Other seats' `organizer-fixture-probe-*` stand-ins were joining this crew by family; with the rename the fixture still has its 3 seats.
- C1: Reattach all of 3, then `Crew up · 3 of 3 running`; the list closed about 4 s later (c1a.txt). With `bruno` failing: `Crew up · 2 of 3 running, 1 didn't start` (c1b.txt). Stop starting by key while po_ana started: `Stopped · 2 of 3 running, 1 not started` (c1c.txt). The live region said each result once, joined to the last seat's word.
- C2: po_ana and dev_bruno running, fse off. `Bring 1 up` listed `fse` alone: `Starting 1 seat · 0 of 1 running`, then `Seat up · 1 of 1 running` (c2.txt).
- C3: fse fails, giving `Seat not up · 0 of 1 running, 1 didn't start`. One Tab from the heading lands on `Close the list`; Return hides the list. The rows read `fse, off` and focus is on `Bring 1 up`. Needs me has no `start:` row, and Home has no "didn't start". The stub log after the mark has no `-k` (c3.txt, c3-before.txt, c3-styles.txt, c3-stub-calls.txt).
  - c3-before also shows that the `start:` row was already gone before Close: showing the list calls `SeenLaunch`, as on main, and Close calls it again.
  - Close the list is `tiny-btn ghost`, like Copy the command.
  - No AX: the screen was locked (`CGSSessionScreenIsLocked` true, c3-ax-locked.txt), so this rests on offscreen WebKit names and computed styles.
- C4: in CLAUDE.md, "fails alone" matches 1 line (Crew), "forecast:" 1 (Navigation), "stops the rest" 0 (c4.txt).
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` passed (Go ok, vitest 664/664). The run was fresh, id a65b9ae9-39291, sha 8fd6dce; cl-ui reused it. `pnpm run build` and `wails build` passed through test-lease, and `git status --porcelain` was empty. The clone was then removed.

Not covered by the gate: `CreateCrew` still runs probe on the hidden running seats (stub log: ana and bruno after Bring 1 up). That keeps C2's `Seat up` on screen about 15 s instead of 5 s.

Reviewer cl-review, 2026-10-14, commit 8fd6dce7118f118755c0b6295fb165be966adf78.

## UI review

Reviewer cl-ui, 2026-10-14. Every row was checked on commit 8fd6dce7118f118755c0b6295fb165be966adf78 (detached worktree `.wt/cl-ui`). **Verdict: pass.** No severity 4 or 3. Evidence is under `.wt-notes/cl-ui/` (`out/*.txt`, `*.jsonl`, `wkwebview-*.png`).

How each row was checked: I ran the Tab harness on my own `wails dev` on port 34177 (fixture exported, auth off). `ORGANIZER_PROBE_BIN` was the builder's stand-in wrapper around `scripts/probe-stub.sh`, copied into my notes dir. Keys went through `[window sendEvent:]` only.
- C1, pass. Reattach all gives `Crew up · 3 of 3 running`, and the list closes 6 s later. With `PROBE_STUB_FAIL=bruno` the heading reads `Crew up · 2 of 3 running, 1 didn't start` and Close the list appears. Pressing Stop starting by key while po_ana starts gives `Stopped · 2 of 3 running, 1 not started`. The live region says each result once, joined to the last seat's line (`out/c1a.txt`, `c1b.txt`, `c1c.txt`).
- C2, pass. With fse off and two seats running, the button reads `Bring 1 up`. The list then holds fse alone: `Starting 1 seat · 0 of 1 running`, then `Seat up · 1 of 1 running`, said once (`out/c2.txt`).
- C3, pass. I killed my own fse stand-ins by saved pid, so fse failed alone and the heading read `Seat not up · 0 of 1 running, 1 didn't start`. One Tab from the heading reaches `Close the list`, with a visible 2 px accent ring. Return hides the list and moves focus to `Bring 1 up`. The rows read `fse, off`. Needs me shows 15 rows, which is the fixture's own count, with no `start:` row. The stub log has no `-k` (`out/c3.txt`, `out/c3-stub-calls.txt`). Close the list is `tiny-btn ghost`, which is quiet, 92×28 px, `#b5afc3` text on the panel (`out/c3-styles.jsonl`). WKWebView snapshots at 1440×900 and 1024×640 show the starting, failed, close-focused and closed states. **AX was not taken because the screen was locked** (`CGSSessionScreenIsLocked=Yes`). The review build I built and launched (`make review-build`, pid saved) returned only `AXApplication @0,0 0x0` (`out/c3-ax-locked.txt`). C3's AX therefore rests on offscreen WebKit names and computed styles, the same as the builder's.
- C4, pass. "fails alone" (Crew paragraph) and "forecast:" (Navigation paragraph) match. "stops the rest" has no match (`out/c4.txt`).
- X0: the shared test run was **reused**: run a65b9ae9-39291 of 8fd6dce, started by cl-review, exit 0, Go ok ×16, vitest 664/664 (`x0-maketest.txt`). `make review-build` passed through test-lease in my worktree. The worktree status was empty before the build.

Findings (none fails the card):
- **U1 (sev 2).** After a one-seat press, the lead sees a finished `Seat up · 1 of 1 running` list for about 15 s instead of the 5 s that `Crew up` gets. This happens in the Agents crew block (`out/c2.txt`, t=8 to 23 s). The stub log shows `CreateCrew` still probing the hidden running seats (ana, bruno) after fse settles, and the list closes only when the service's whole start is done. Proposal: start only the off seats in `crew.go`. That is Go, outside this boundary, so it is an FSE card.
- **U2 (sev 1).** After Close the list, a fresh page shows the list again with every seat: `Crew up · 2 of 3 running, 1 didn't start`, which lists seats nobody pressed. This happens on the Agents crew block after a webview reload (seen at the start of `out/c3-styles.jsonl`). The cause is that close and the press are module state while the service keeps the failed start. In the installed app nothing reloads the webview, so this matters only in `wails dev`. Proposal: none now. If it ever matters, let the service remember `SeenLaunch` for the list too.
- **U3 (sev 1).** The heading line's `role=status` still holds `fse didn't start. Seat not up …` after the list closes. It is not said again, so nothing is lost. Recorded only.

Spec gaps for the FSE:
- G1: Amendment 1 gives no words for a result with nothing running. As built, it reads `Seat not up · 0 of 1 running, 1 didn't start` (or `Crew not up · …`).
- G2: Amendment 1 does not say whether `Seat up` closes 5 s on as `Crew up` does (see U1).
- G3: the stub stand-in starts a new stand-in for each seat that is already running, every time a press re-probes it. After a few presses the Agents list fills with duplicate `ana` rows (`wkwebview-1024x640-C3-close-focused.png`). This is a fixture artifact, but it hides the real Agents layout from screen rows.
- G4: the builder's harness setup (`steps/common.txt`) selects init-a by `.rail-item` text, which does not exist at 1024 with the rail collapsed to the strip. I used `.strip-item[aria-label^="init-a,"]`. Width rows need a setup that works on both rails.

For aglaea:
- A1: as built, a hidden seat that fails is listed, so `m` can exceed "the number this press starts", because a failure is never hidden. Should Amendment 1 §2 say so?
- A2: confirm the words `Seat not up` and `Crew not up` (G1).

Not verified in WKWebView: the AX of the crew block and of Needs me (screen locked; see C3). VoiceOver speech was not checked; live-region text was read from the DOM.
