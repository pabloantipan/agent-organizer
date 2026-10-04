#!/usr/bin/env bash
# review-build.sh — turn a built Deltagos.app into Deltagos Review.app, a copy
# under its own bundle id (cl.antipan.organizer.review), so a reviewer's
# WebKit storage (~/Library/WebKit/<bundle id>) is never the lead's.
# docs/specs/leftovers-6.md FR-8.
#
#   scripts/review-build.sh build/bin/Deltagos.app
#
# Run by `make review-build` after `make build`. It copies the bundle, so the
# source stays as built; only the copy's Info.plist changes and is re-signed
# ad hoc, as the build signs the original. The templates in build/darwin/ and
# wails.json are never touched. Config and data paths are app constants, not
# the bundle id: reviewers still export the fixture's ORGANIZER_CONFIG and
# XDG_DATA_HOME (eval "$(scripts/fixture-home.sh)").
set -euo pipefail

SRC="${1:?usage: review-build.sh <path to Deltagos.app>}"
NAME="Deltagos Review"
ID="cl.antipan.organizer.review"
DST="$(dirname "$SRC")/$NAME.app"
PLIST="$DST/Contents/Info.plist"

[ -d "$SRC" ] || { echo "review-build: $SRC is not a bundle" >&2; exit 1; }

rm -rf "$DST"
cp -R "$SRC" "$DST"
plutil -replace CFBundleIdentifier -string "$ID" "$PLIST"
plutil -replace CFBundleName -string "$NAME" "$PLIST"
plutil -replace CFBundleDisplayName -string "$NAME" "$PLIST"
codesign --force --deep --sign - "$DST"
codesign --verify --strict "$DST"
echo "built $DST ($(plutil -extract CFBundleIdentifier raw "$PLIST"))"
