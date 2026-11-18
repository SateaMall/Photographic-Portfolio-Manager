#!/bin/sh
# Rebuilds preview.html with every image embedded, so it renders anywhere.
cd "$(dirname "$0")"
uri() { printf 'data:%s;base64,%s' "$1" "$(base64 -w0 "$2")"; }
CUR=$(uri image/png ../../frontend/public/letmelens.png)
A=$(uri image/svg+xml option-a-flat.svg)
B=$(uri image/svg+xml option-b-icon.svg)
C=$(uri image/svg+xml option-c-outlined.svg)
card() {
  printf '<div class="card"><h2>%s</h2><img class="big" src="%s" alt="" />' "$1" "$2"
  printf '<div class="sizes"><img src="%s" width="64" alt="" /><img src="%s" width="32" alt="" /><img src="%s" width="16" alt="" /></div>' "$2" "$2" "$2"
  printf '<div class="lockup"><img src="%s" alt="" />Let Me Lens</div></div>\n' "$2"
}
{
cat <<'HTML'
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Logo Options</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 24px; background: #fff; color: #1B2A4A; font-family: Inter, system-ui, sans-serif; }
    h1 { font-size: 18px; font-weight: 600; margin: 0 0 20px; }
    .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .card { border: 1px solid #e5ecf5; border-radius: 12px; padding: 16px; display: grid; gap: 12px; justify-items: center; }
    .card h2 { font-size: 13px; font-weight: 600; margin: 0; justify-self: start; }
    .big { width: 100%; max-width: 220px; height: auto; }
    .sizes { display: flex; align-items: end; gap: 12px; }
    .lockup { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 20px; letter-spacing: -0.01em; }
    .lockup img { width: 40px; height: 40px; }
  </style>
</head>
<body>
  <h1>Let Me Lens: logo options</h1>
  <div class="row">
HTML
card "Current" "$CUR"
card "A: Flat mascot" "$A"
card "B: Icon" "$B"
card "C: Outlined" "$C"
printf '  </div>\n</body>\n</html>\n'
} > preview.html
