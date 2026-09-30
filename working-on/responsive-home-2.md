---
title: Responsive Home, second pass - compact to 1439, the sheet's scrim, one draft per record, one-line signals, names
status: now
repos: [organizer]
branch: main
updated: 2026-09-30
next: "review: responsive-home-2, branch responsive-home-2, gate G9 G10 G11 G12 G8 met, d6d8804 d48101b 780163f 79176a4 ca0ed80 b3c9975 10f2966 33b0fd9"
depends_on: ["responsive-home", "rule-box-finish"]
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Rail.tsx, App.tsx (the shell layout)", "frontend/src/stores/board.store.ts (the width class; drafts per record)", "frontend/src/lib/ and its tests", "frontend/src/styles/shell.css, home.css, rule-box.css"]
spec: "docs/specs/responsive-home.md (FR-7 to FR-12, amendment 2); the design: docs/ux/specs/responsive-home.md, Amendment 1 (Aglaea, 836866a)"
gate: "docs/specs/responsive-home.md Acceptance, rows G9 to G12 and G8; the Gate section below"
stage: twenty-at-a-glance
seat: resp2-build
ui_review: true
---

## Goal
responsive-home's UI review (U1–U9) answered by Aglaea's design Amendment 1:
FR-7 to FR-12 of `docs/specs/responsive-home.md`.

## Gate
- [x] G9: see `docs/specs/responsive-home.md`, Acceptance
- [x] G10: see `docs/specs/responsive-home.md`, Acceptance
- [x] G11: see `docs/specs/responsive-home.md`, Acceptance
- [x] G12: see `docs/specs/responsive-home.md`, Acceptance
- [x] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-09-29 cut from responsive-home amendment 2 by the FSE
- 2026-09-30 resp2-build: FR-7 d6d8804, FR-9 d48101b, FR-11 780163f, FR-10 79176a4, FR-8 ca0ed80 + 33b0fd9, FR-12 b3c9975, and 10f2966 (the wide list at 1920, see Notes); rebased on main 445b11e; progress in `.wt-notes/resp2-build/progress.md`
- G9: fresh storage per size, `node drive.cjs <w> <h> s-g9.cjs` → `.wt-notes/resp2-build/g9.log`, `.wt-notes/resp2-build/1280x800-g9.png`, `1439x900-g9.png`, `1440x900-g9.png`, `1512x945-g9.png`, `1720x1000-g9.png`: "1280x800: class=home compact rail=strip stored=null initiative rows one line=true … needs-me rows one line=true"; 1439 the same; 1440, 1512 and 1720 "class=home regular … rail=expanded"
- G10: `s-g10.cjs` at 1024x640, 1512x945 and 1920x1080 → focus log `.wt-notes/resp2-build/g10-focus.log` (the compact one again after the rebase, `g10-focus-compact-rebased.log`), `.wt-notes/resp2-build/<size>-g10-open.png`, `-second.png`, `-restored.png`: compact "scrim: 1024x640 … at the centre of Rule vendor-audit 0001 the top element is div.rb-scrim"; in every class "focus left the box 0 times in 16 presses", Escape and Cancel put focus back on "Rule claims-portal 0002", "reopened Rule claims-portal 0002 words: "g10: words typed in the first record"", after Cancel the words are "" and the other record's are kept. Nothing was ruled
- G11: `s-g11.cjs` at 1024x640 with the rail expanded, unchanged `--twenty` → `.wt-notes/resp2-build/g11.log`, `.wt-notes/resp2-build/1024x640-g11-expanded.png`: "rows in view: 7; rows whose signals take more than one line: 0"; "auth-gateway: … shown=["1 now","+1"] title="and 1 more: wave 2 · 1 building" srName="and 1 more: wave 2 · 1 building""
- G12: `s-g12.cjs` at 1920x1080 → names log `.wt-notes/resp2-build/g12-names.log`, `.wt-notes/resp2-build/1920x1080-g12-before.png`, `1920x1080-g12-rule-last.png`: "rail toggle: name="Initiatives rail" aria-expanded=true" (false once collapsed), "chevron: name="Details for auth-gateway: goal, next date, repos" title="Details for auth-gateway: goal, next date, repos"", every wide Needs me row "title==context:true", "Needs me rows: 8", "Rule on the last row (Rule vendor-audit 0005): … whole box in the column's view: true; page scrolled: 0". To get eight rows, the throwaway `$FIXTURE_HOME/vendor-audit/working-on/decisions/` got copies of 0002 as 0003–0005 (new titles and raised dates), removed after G12
- G8, after the rebase: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, 13 Go packages ok, "Tests 52 passed (52)" (`.wt-notes/resp2-build/g8-make-test.log`); `cd frontend && npm run build` exit 0, "built in 1.05s" (`.wt-notes/resp2-build/g8-build.log`); G18 grep `main...responsive-home-2` empty (`.wt-notes/resp2-build/g8-g18.log`, 0 lines); `wails build` exit 0

## Next
1. resp2-review (code) and resp2-ui (UI) review branch responsive-home-2

## Blockers
none

## Notes
- 2026-09-30 sup24 runs this card, spawned by the FSE after rule-box-finish landed (8450cac)
- The frontend uses pnpm; add no dependency. No Go change.
- 2026-09-30 resp2-build: wide at 1920x1080 with the rail expanded (responsive-home FR-4's fixed columns) overflowed the ~1,080 px list: the goal column went to 0 and the chevrons spilled into the Needs me column. Fixed in 10f2966: the goal keeps 160 px, stage and signals give way down to 120 px, and wide's signals use compact's one-line "+N". Nothing changes at 3440
- 2026-09-30 resp2-build: no scrim token exists, so the scrim is `--bg-sunken` at opacity 0.7; Aglaea may want a token for it. Escape closes the box and keeps the draft; only Cancel discards it (FR-9's reading)
