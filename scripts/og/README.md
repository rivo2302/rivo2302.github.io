Sources for `public/og.jpg` (1200×630, social preview) and `public/apple-touch-icon.png` (180×180).

Regenerate (macOS, Chrome installed), from the repo root:

```sh
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --hide-scrollbars --window-size=1200,630 --screenshot="$PWD/og.png" "file://$PWD/scripts/og/og.html"
sips -s format jpeg -s formatOptions 82 og.png --out public/og.jpg && rm og.png
"$CHROME" --headless=new --hide-scrollbars --window-size=180,180 --screenshot="$PWD/public/apple-touch-icon.png" "file://$PWD/scripts/og/icon.html"
```
