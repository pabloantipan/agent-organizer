#!/usr/bin/env bash
# Regenerates the app icon's SVGs and PNGs from export.html (headless Chrome
# runs the mark's geometry; rsvg-convert rasterises each size from its own cut).
# Usage: docs/ux/inputs/deltagos-mark/app-icon/export.sh
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
dom="$(mktemp)"; trap 'rm -f "$dom"' EXIT
"$chrome" --headless=new --disable-gpu --dump-dom "file://$here/export.html" 2>/dev/null > "$dom"
python3 - "$dom" "$here" <<'PY'
import html, re, sys
dom, out = sys.argv[1], sys.argv[2]
for name, body in re.findall(r'<pre id="([^"]+)">(.*?)</pre>', open(dom).read(), re.S):
    import os; os.makedirs(os.path.dirname(f"{out}/{name}"), exist_ok=True)
    open(f"{out}/{name}", "w").write(html.unescape(body))
PY
set=$here/Deltagos.iconset; rm -rf "$set"; mkdir -p "$set"
png() { rsvg-convert -w "$2" -h "$2" "$here/deltagos-icon-$1.svg" -o "$3"; }
# Which cut each slot takes: 16 px is the D alone; 32 px (and 16@2x) is the D
# and the gears, still; 64 px and up is the whole still frame.
png 16   16   "$set/icon_16x16.png"
png 32   32   "$set/icon_16x16@2x.png"
png 32   32   "$set/icon_32x32.png"
png 1024 64   "$set/icon_32x32@2x.png"
png 1024 128  "$set/icon_128x128.png"
png 1024 256  "$set/icon_128x128@2x.png"
png 1024 256  "$set/icon_256x256.png"
png 1024 512  "$set/icon_256x256@2x.png"
png 1024 512  "$set/icon_512x512.png"
png 1024 1024 "$set/icon_512x512@2x.png"
cp "$set/icon_512x512@2x.png" "$here/appicon.png"
iconutil -c icns "$set" -o "$here/iconfile.icns"
# Icon Composer's renderer (CoreSVG) drops the masks that clip the gears and
# notch the D, so its layers are 1024 px PNGs rasterised here, not the SVGs.
mkdir -p "$here/Deltagos.icon/Assets"
for l in gears d; do rsvg-convert -w 1024 -h 1024 "$here/layers/$l.svg" -o "$here/Deltagos.icon/Assets/$l.png"; done
# The Icon Composer document: the ground as the fill, the gears behind, the D
# in front. macOS 26 draws it without the grey plate it puts round an icns.
cat > "$here/Deltagos.icon/icon.json" <<'JSON'
{
  "fill" : {
    "solid" : "srgb:0.10196,0.08235,0.13725,1.00000"
  },
  "groups" : [
    {
      "layers" : [
        {
          "image-name" : "d.png",
          "name" : "d"
        }
      ],
      "name" : "D",
      "shadow" : {
        "kind" : "neutral",
        "opacity" : 0.5
      },
      "translucency" : {
        "enabled" : false,
        "value" : 0.5
      }
    },
    {
      "layers" : [
        {
          "image-name" : "gears.png",
          "name" : "gears"
        }
      ],
      "name" : "Gears",
      "shadow" : {
        "kind" : "neutral",
        "opacity" : 0.5
      },
      "translucency" : {
        "enabled" : false,
        "value" : 0.5
      }
    }
  ],
  "supported-platforms" : {
    "squares" : [
      "macOS"
    ]
  }
}
JSON
echo "wrote $(ls "$here" | tr '\n' ' ')"
