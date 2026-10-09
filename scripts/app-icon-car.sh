#!/usr/bin/env bash
# app-icon-car.sh — compile Aglaea's Icon Composer document into
# build/darwin/Assets.car, the app icon macOS 26 draws without its grey plate
# (floating-icon Amendment 6, 0110). `make build` copies the committed car into
# the bundle beside iconfile.icns, so building needs no Xcode 26; run this only
# after export.sh regenerated Deltagos.icon, and commit the car it writes.
#
#   scripts/app-icon-car.sh
#
# actool also writes a Deltagos.icns from the .icon; it is thrown away:
# CFBundleIconFile stays on build/darwin/iconfile.icns, which carries the 16 and
# 32 px cuts. Never resave the .icon in Icon Composer.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ICON="$ROOT/docs/ux/inputs/deltagos-mark/app-icon/Deltagos.icon"
OUT="$ROOT/build/darwin/Assets.car"

ver="$(xcrun actool --version | sed -n '/short-bundle-version/{n;s/.*<string>\(.*\)<\/string>.*/\1/p;}')"
[ "${ver%%.*}" -ge 26 ] || { echo "app-icon-car: actool $ver cannot read a .icon; it needs Xcode 26" >&2; exit 1; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
xcrun actool "$ICON" --compile "$TMP" --app-icon Deltagos \
	--platform macosx --minimum-deployment-target 12.0 \
	--output-partial-info-plist "$TMP/partial.plist" --errors --warnings >/dev/null
cp "$TMP/Assets.car" "$OUT"
echo "wrote $OUT (actool $ver)"
