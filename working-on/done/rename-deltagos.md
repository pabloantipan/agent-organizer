---
title: The app is Deltagos - window, top bar, bundle and DMG; the CLI and identifiers stay organizer
status: done
repos: [organizer]
branch: main
updated: 2026-09-29
next: "merge rename-deltagos (reviewed, pass)"
depends_on: []
boundary: ["wails.json (name, productName; outputfilename stays organizer)", "main.go (the window Title only)", "frontend/index.html (title)", "frontend/src/components/TopBar.tsx (the brand only)", "frontend/src/components/ (visible product-name text only; CLI hints like `organizer crew` stay)", "internal/cli/cli.go (the version line only)", "Makefile (APP, install, uninstall)", "scripts/make-dmg.sh", ".github/workflows/release.yml (the .app and .dmg paths)", "README.md, CLAUDE.md (the product name; commands stay)", "tests"]
spec: "working-on/decisions/0066-the-app-is-deltagos.md (ruled: what you see plus the .app); the Gate section below is the acceptance"
gate: "the Gate section below"
stage:
seat: name-build
review: pass
---

## Goal
0066: the app reads "Deltagos" wherever a person sees its name, and ships as
`Deltagos.app`. The `organizer` CLI, the bundle id `cl.antipan.organizer`,
`~/.config/organizer`, `~/.local/share/organizer`, the keychain service, the
repos, the initiative id, the discuss project and the Firestore database
stay "organizer".

## Gate
- [x] G1: `wails build` produces `build/bin/Deltagos.app`, whose
  `Contents/Info.plist` has `CFBundleName` and `CFBundleDisplayName`
  Deltagos and `CFBundleIdentifier` `cl.antipan.organizer`, with the
  executable still `Contents/MacOS/organizer`. Evidence: `ls build/bin`,
  `plutil -p` of the plist.
- [x] G2: the running app's window title and top-bar brand read "Deltagos",
  and the brand's version title reads "Deltagos <version>". Evidence: a
  screenshot on `scripts/fixture-home.sh`.
- [x] G3: `grep -rn -i "organizer" frontend/src --include='*.tsx'` lists no
  product-name use: every remaining hit is a CLI command (`organizer crew`,
  `organizer run` …), a path, an identifier or a config key. Evidence: the
  grep, with each remaining line classed.
- [x] G4: `organizer version` prints "Deltagos <version>"; every other CLI
  output is unchanged (the status golden file passes without
  `UPDATE_GOLDEN`). Evidence: both outputs.
- [x] G5: `make install` into a scratch prefix (or a dry run of its lines)
  removes an existing `/Applications/organizer.app`, installs
  `/Applications/Deltagos.app`, and points `~/.local/bin/organizer` at
  `Deltagos.app/Contents/MacOS/organizer`; `make uninstall` removes both
  names. `scripts/make-dmg.sh` names the DMG `Deltagos-<version>.dmg`, and
  its text says Deltagos.app. Evidence: the Makefile diff and a dry run;
  nobody runs a real install (Pablo's).
- [x] G6: README and CLAUDE.md name the app Deltagos where they mean the
  product, and still name the CLI, repo and paths organizer. Evidence: the
  diff.
- [x] G7: `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run
  build`. Evidence: exit 0.

## Done
- 2026-09-29 cut from 0066 by the FSE
- 2026-09-29 sup22 seated name-build on branch rename-deltagos
- 2026-09-29 name-build: built on rename-deltagos, rebased on main d8591aa: 249622e (app), cc9ecc9 (cli), 1b437e7 (package), 71d922b (docs). Evidence under `/Users/pabloantipan/organizer/.wt-notes/name-build/`:
  G1 `g1-plist.txt`: `ls build/bin` → Deltagos.app; `Contents/MacOS/organizer`; plutil: CFBundleName and CFBundleDisplayName "Deltagos", CFBundleIdentifier "cl.antipan.organizer", CFBundleExecutable "organizer".
  G2 `g2-home.png`, `g2-topbar-crop.png`, `g2-dom.txt` (fixture-home, wails dev :34185, headless Chromium): brand "Deltagos", brand title "Deltagos v0.2.0-539-g87be2f3", document.title "Deltagos"; native window via CGWindowList: owner Deltagos, window "Deltagos" (main.go:35).
  G3 `g3-grep.txt`: 11 hits, 0 product-name uses (6 CLI commands, 1 path, 1 config default, 2 identifiers, 2 code comments), same after the rebase.
  G4 `g4-cli.txt`: `organizer version` → "Deltagos v0.2.0-535-gee9d279-dirty"; old vs new binary diff: only the version line; help, doctor, decisions identical; TestWriteStatusGolden passes without UPDATE_GOLDEN.
  G5 `g5-make-dryrun.txt`: `make -n install` → rm -rf /Applications/organizer.app /Applications/Deltagos.app; cp to /Applications/Deltagos.app; ln -sf /Applications/Deltagos.app/Contents/MacOS/organizer ~/.local/bin/organizer; `make -n uninstall` removes both names; `make -n dmg` → build/bin/Deltagos-<version>.dmg; make-dmg.sh run into scratch: volume Deltagos, Deltagos.app, READ ME says Deltagos.app. No real install.
  G6 `g6-docs.diff`: README title and install text Deltagos, commands/paths organizer; CLAUDE.md top paragraph and Packaging.
  G7 `g7-tests.txt`: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (vitest 40 passed) and `npm run build` exit 0, rerun after the rebase at 71d922b.

## Review
Pass: every gate item met at 71d922b, rerun by the reviewer (evidence under `/Users/pabloantipan/organizer/.wt-notes/name-review/`).
Unmet: none.
Reviewer: name-review, 2026-09-29.
Not covered by the gate: the plist templates in `build/darwin/` were edited outside the boundary, as G1 requires; `internal/service/rule.go` still signs rulings "in the organizer" (text a person reads, not in 0066); G3 greps `.tsx` only.

## Next
1. review: rename-deltagos, branch rename-deltagos (not merged)

## Blockers
none

## Notes
- Not in scope: the keychain service name, the bundle id, any data path, the
  CLI name, the Firestore database, docs/design-system.md (Aglaea's), the
  skills and factory docs (Hephaistos's).
- Risk, to note in the run record rather than solve: with a new .app path,
  macOS may ask again for keychain access on the first launch (the passcode
  item), and the Dock/Login items keep the old path until reinstalled.
- forecast (docs/estimating.md): 19–32 min of wave time over 1 wave; basis:
  26 cards in 13 single-wave tasks, this initiative. No UI reviewer: names,
  not layout.
- name-build: G1 needed `CFBundleDisplayName`, which Wails' plist template
  lacks, so `build/darwin/Info.plist` and `Info.dev.plist` gained it
  (`{{.Info.ProductName}}`); those files are outside the boundary as written.
- name-build, found: `internal/service/rule.go` signs rulings "in the organizer
  on <machine>" in decision records; outside the boundary and 0066, left.
