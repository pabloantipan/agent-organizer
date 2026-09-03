#!/usr/bin/env bash
# sign-and-notarize.sh <App.app>
# Developer ID signing + notarization. Needs: MACOS_CERT_P12 (base64), MACOS_CERT_PASSWORD,
# APPLE_ID, APPLE_TEAM_ID, APPLE_APP_PASSWORD. Used by the release workflow when present.
set -euo pipefail
APP="$1"
KEYCHAIN=build.keychain
echo "$MACOS_CERT_P12" | base64 --decode > /tmp/cert.p12
security create-keychain -p "" $KEYCHAIN
security default-keychain -s $KEYCHAIN
security unlock-keychain -p "" $KEYCHAIN
security import /tmp/cert.p12 -k $KEYCHAIN -P "$MACOS_CERT_PASSWORD" -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple: -s -k "" $KEYCHAIN
IDENTITY=$(security find-identity -v -p codesigning $KEYCHAIN | awk -F'"' '/Developer ID Application/{print $2; exit}')
codesign --force --deep --options runtime --timestamp --sign "$IDENTITY" "$APP"
ditto -c -k --keepParent "$APP" /tmp/app.zip
xcrun notarytool submit /tmp/app.zip --apple-id "$APPLE_ID" --team-id "$APPLE_TEAM_ID" --password "$APPLE_APP_PASSWORD" --wait
xcrun stapler staple "$APP"
