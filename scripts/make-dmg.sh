#!/usr/bin/env bash
# make-dmg.sh <path/to/App.app> <out.dmg>
# A plain drag-to-Applications disk image built with hdiutil, so it works on a
# stock macOS runner with nothing installed.
set -euo pipefail
APP="$1"; OUT="$2"
[ -d "$APP" ] || { echo "no app at $APP" >&2; exit 1; }
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
cat > "$STAGE/READ ME.txt" <<'TXT'
organizer

1. Drag organizer.app onto the Applications folder.
2. Unsigned build: the first launch is blocked by Gatekeeper. Either
   right-click the app and choose Open, or run once:
     xattr -d com.apple.quarantine /Applications/organizer.app
3. Optional CLI:
     ln -sf /Applications/organizer.app/Contents/MacOS/organizer ~/.local/bin/organizer
TXT
rm -f "$OUT"
hdiutil create -quiet -volname "organizer" -srcfolder "$STAGE" -ov -format UDZO "$OUT"
shasum -a 256 "$OUT" > "$OUT.sha256"
echo "wrote $OUT"
