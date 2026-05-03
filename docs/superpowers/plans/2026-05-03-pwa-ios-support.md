# PWA iOS Home Screen Installation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PWA support to the BetaButterfly/notion-templates GitHub Pages site so iPhone users can install it from Safari to their Home Screen as a standalone app named "Шаблони UA".

**Architecture:** Pre-committed PNG icons (dark bg + blue checkmark) are generated once locally with Pillow; a new `manifest.webmanifest` and `service-worker.js` are added to the repo root; a Python inject step in GitHub Actions inserts the PWA `<head>` block into every `*.html` file before the Pages artifact is uploaded — so source HTML stays clean and new templates get PWA support automatically.

**Tech Stack:** Python 3 + Pillow (local icon generation), GitHub Actions (CI inject), vanilla JS service worker, Web App Manifest v1.

**Working directory:** The repository is already cloned at `C:/Users/bhbc2/AppData/Local/Temp/notion-templates` on branch `pwa-ios-support`. All git commands run from there. Remote: `https://github.com/BetaButterfly/notion-templates`.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `scripts/generate_icons.py` | One-time Pillow script to render PNG icons |
| Create | `icons/icon-192.png` | PWA icon 192×192 |
| Create | `icons/icon-512.png` | PWA icon 512×512 (maskable) |
| Create | `icons/apple-touch-icon.png` | iOS touch icon 180×180 |
| Create | `manifest.webmanifest` | Web App Manifest |
| Create | `service-worker.js` | Offline/cache service worker |
| Modify | `.github/workflows/pages.yml` | Add PWA meta-tag inject step |
| Modify | `README.md` | Add iPhone installation instructions |

Source HTML files (`*.html`) are **not** edited directly — the CI inject step handles them.

---

## Task 1: Install Pillow and generate icons

**Files:**
- Create: `scripts/generate_icons.py`
- Create: `icons/icon-192.png`
- Create: `icons/icon-512.png`
- Create: `icons/apple-touch-icon.png`

- [ ] **Step 1.1: Install Pillow**

```bash
pip install pillow
```

Expected output includes: `Successfully installed pillow-...`

- [ ] **Step 1.2: Create the icon generator script**

Create `scripts/generate_icons.py` with this exact content:

```python
"""Generate PWA icons: dark background #0e1116 + blue checkmark #2f6feb."""
from PIL import Image, ImageDraw
import os

BG   = (14, 17, 22, 255)    # #0e1116
TICK = (47, 111, 235, 255)  # #2f6feb

def make_icon(size: int, path: str, pad_pct: float = 0.0) -> None:
    img  = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    pad   = int(size * pad_pct)
    inner = size - 2 * pad
    cx    = size / 2
    cy    = size / 2
    s     = inner * 0.28
    sw    = max(int(size * 0.09), 3)

    p1 = (cx - s * 0.65, cy + s * 0.10)
    p2 = (cx - s * 0.05, cy + s * 0.70)
    p3 = (cx + s * 0.65, cy - s * 0.55)

    draw.line([p1, p2], fill=TICK, width=sw)
    draw.line([p2, p3], fill=TICK, width=sw)

    # Smooth the joint at p2
    r = sw // 2
    draw.ellipse([p2[0]-r, p2[1]-r, p2[0]+r, p2[1]+r], fill=TICK)

    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    img.save(path, "PNG")
    print(f"  {path} ({size}x{size})")

if __name__ == "__main__":
    make_icon(192, "icons/icon-192.png")
    make_icon(512, "icons/icon-512.png", pad_pct=0.10)
    make_icon(180, "icons/apple-touch-icon.png")
    print("Done.")
```

- [ ] **Step 1.3: Run the script from the repo root**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
python scripts/generate_icons.py
```

Expected output:
```
  icons/icon-192.png (192x192)
  icons/icon-512.png (512x512)
  icons/apple-touch-icon.png (180x180)
Done.
```

- [ ] **Step 1.4: Verify files exist and have non-zero size**

```bash
ls -lh "C:/Users/bhbc2/AppData/Local/Temp/notion-templates/icons/"
```

Expected: three PNG files, each > 1 KB.

- [ ] **Step 1.5: Commit icons and generator script**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
git add icons/ scripts/generate_icons.py
git commit -m "feat: add PWA icons (dark bg + blue checkmark)"
```

---

## Task 2: Create manifest.webmanifest

**Files:**
- Create: `manifest.webmanifest`

- [ ] **Step 2.1: Create the manifest file**

Create `manifest.webmanifest` at the repo root with this exact content (UTF-8):

```json
{
  "name": "Україномовні шаблони для Notion",
  "short_name": "Шаблони UA",
  "start_url": "/notion-templates/",
  "scope": "/notion-templates/",
  "display": "standalone",
  "background_color": "#0e1116",
  "theme_color": "#2f6feb",
  "lang": "uk",
  "icons": [
    {
      "src": "/notion-templates/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/notion-templates/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/notion-templates/icons/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2.2: Validate JSON**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
python -c "import json; d=json.load(open('manifest.webmanifest', encoding='utf-8')); print('JSON valid, name:', d['name'])"
```

Expected: `JSON valid, name: Україномовні шаблони для Notion`

- [ ] **Step 2.3: Commit**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
git add manifest.webmanifest
git commit -m "feat: add PWA web app manifest"
```

---

## Task 3: Create service-worker.js

**Files:**
- Create: `service-worker.js`

- [ ] **Step 3.1: Create the service worker**

Create `service-worker.js` at the repo root with this exact content:

```js
const CACHE = 'shablon-ua-v1';
const ASSETS = [
  '/notion-templates/',
  '/notion-templates/manifest.webmanifest',
  '/notion-templates/icons/icon-192.png',
  '/notion-templates/icons/icon-512.png',
  '/notion-templates/icons/apple-touch-icon.png',
];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
);

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
);

self.addEventListener('fetch', e => {
  const isHTML = e.request.destination === 'document';
  e.respondWith(
    isHTML
      ? fetch(e.request).catch(() => caches.match(e.request))
      : caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
```

- [ ] **Step 3.2: Verify JS syntax (if Node.js available)**

```bash
node --check "C:/Users/bhbc2/AppData/Local/Temp/notion-templates/service-worker.js" && echo "JS syntax OK"
```

If `node` is not available, skip — syntax will surface in browser DevTools after deploy.

- [ ] **Step 3.3: Commit**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
git add service-worker.js
git commit -m "feat: add service worker (network-first HTML, cache-first assets)"
```

---

## Task 4: Update GitHub Actions to inject PWA meta tags

**Files:**
- Modify: `.github/workflows/pages.yml`

The inject step uses `python3` (standard on GitHub Actions Ubuntu runners). It inserts the PWA block immediately after `<head>` in every `*.html` at deploy time. It is idempotent: files already containing `<!-- PWA -->` are skipped.

- [ ] **Step 4.1: Verify inject logic works locally (dry run, no file writes)**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
python -c "
import re, pathlib

SNIPPET = (
    '\n<!-- PWA -->\n'
    '<link rel=\"manifest\" href=\"/notion-templates/manifest.webmanifest\">\n'
    '<meta name=\"theme-color\" content=\"#2f6feb\">\n'
    '<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n'
    '<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">\n'
    '<meta name=\"apple-mobile-web-app-title\" content=\"Шаблони UA\">\n'
    '<link rel=\"apple-touch-icon\" href=\"/notion-templates/icons/apple-touch-icon.png\">\n'
    \"<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/notion-templates/service-worker.js');</script>\n\"
    '<!-- /PWA -->'
)

def inject(m):
    return m.group(0) + SNIPPET

text = pathlib.Path('index.html').read_text(encoding='utf-8')
result = re.sub(r'<head[^>]*>', inject, text, count=1, flags=re.IGNORECASE)
assert '<!-- PWA -->' in result, 'Injection FAILED'
assert result.count('<!-- PWA -->') == 1, 'Double inject!'
print('Inject logic OK')
"
```

Expected: `Inject logic OK`

- [ ] **Step 4.2: Edit pages.yml — add inject step**

Open `.github/workflows/pages.yml`. The current file looks like:

```yaml
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5
      ...
```

Insert the following block **after** the `- name: Checkout` step and **before** `- name: Setup Pages`. Use 6-space indentation for the `- name:` line to match the existing steps:

```yaml
      - name: Inject PWA meta tags
        run: |
          python3 -c "
          import re, pathlib

          SNIPPET = (
              '\n<!-- PWA -->\n'
              '<link rel=\"manifest\" href=\"/notion-templates/manifest.webmanifest\">\n'
              '<meta name=\"theme-color\" content=\"#2f6feb\">\n'
              '<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n'
              '<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">\n'
              '<meta name=\"apple-mobile-web-app-title\" content=\"Шаблони UA\">\n'
              '<link rel=\"apple-touch-icon\" href=\"/notion-templates/icons/apple-touch-icon.png\">\n'
              \"<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/notion-templates/service-worker.js');</script>\n\"
              '<!-- /PWA -->'
          )

          def inject(m):
              return m.group(0) + SNIPPET

          for f in pathlib.Path('.').glob('*.html'):
              text = f.read_text(encoding='utf-8')
              if '<!-- PWA -->' not in text:
                  text = re.sub(r'<head[^>]*>', inject, text, count=1, flags=re.IGNORECASE)
                  f.write_text(text, encoding='utf-8')
                  print('  injected:', f.name)
              else:
                  print('  skipped:', f.name)
          "
```

- [ ] **Step 4.3: Validate YAML syntax**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
python -c "import yaml; yaml.safe_load(open('.github/workflows/pages.yml')); print('YAML valid')"
```

If `yaml` is not installed: `pip install pyyaml` then retry. Expected: `YAML valid`.

- [ ] **Step 4.4: Commit**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
git add .github/workflows/pages.yml
git commit -m "ci: inject PWA meta tags into HTML before Pages deploy"
```

---

## Task 5: Update README with iPhone installation instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 5.1: Append iPhone section to end of README.md**

Open `README.md` and add the following at the very end (after the last existing line):

```
## Встановлення на iPhone (PWA)

1. Відкрий https://betabutterfly.github.io/notion-templates/ у Safari
2. Натисни кнопку Поділитися (квадрат зі стрілкою вгору)
3. Прокрути вниз і обери «На екран «Додому»
4. Натисни «Додати»

Сайт зʼявиться на головному екрані як окремий застосунок з іконкою «Шаблони UA».
```

- [ ] **Step 5.2: Verify section was added**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
grep -c "Встановлення на iPhone" README.md
```

Expected: `1`

- [ ] **Step 5.3: Commit**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
git add README.md
git commit -m "docs: add iPhone PWA installation instructions to README"
```

---

## Task 6: Push branch and create pull request

- [ ] **Step 6.1: Confirm all commits are on the branch**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
git log --oneline main..HEAD
```

Expected: 6 commits (spec + icons + manifest + SW + CI + README).

- [ ] **Step 6.2: Push the branch**

```bash
cd "C:/Users/bhbc2/AppData/Local/Temp/notion-templates"
git push -u origin pwa-ios-support
```

- [ ] **Step 6.3: Create the pull request**

```bash
"/c/Program Files/GitHub CLI/gh.exe" pr create \
  --repo BetaButterfly/notion-templates \
  --head pwa-ios-support \
  --base main \
  --title "Add PWA support for iOS Home Screen installation" \
  --body "## Summary

- Adds manifest.webmanifest with correct /notion-templates/ subpath, display: standalone, dark theme, and Шаблони UA branding
- Adds service-worker.js: network-first HTML, cache-first assets, cache versioning
- Adds pre-committed PNG icons (192x192, 512x512 maskable, 180x180 touch) — dark background with blue checkmark
- GitHub Actions inject step inserts PWA head block into every .html before deploy — new templates get PWA support automatically
- README updated with Ukrainian iPhone installation instructions

## Test plan

- [ ] Wait for GitHub Actions deploy after merge (~30s)
- [ ] curl -sI https://betabutterfly.github.io/notion-templates/manifest.webmanifest returns HTTP/2 200
- [ ] curl -sI https://betabutterfly.github.io/notion-templates/icons/icon-192.png returns HTTP/2 200
- [ ] Open site in Safari on iPhone, tap Share, Add to Home Screen, Add
- [ ] Icon and name Шаблони UA appear on Home Screen
- [ ] Opening from Home Screen launches in standalone mode (no Safari URL bar)
- [ ] Browser DevTools console shows no service worker errors
- [ ] Template pages (e.g. pomodoro.html) open without regressions

Generated with Claude Code"
```

- [ ] **Step 6.4: Save the PR URL from the output above**

---

## Post-merge verification (manual, after GitHub Actions completes ~30s)

```bash
curl -sI https://betabutterfly.github.io/notion-templates/manifest.webmanifest | head -1
curl -sI https://betabutterfly.github.io/notion-templates/icons/icon-192.png | head -1
curl -sI https://betabutterfly.github.io/notion-templates/service-worker.js | head -1
```

All three must return `HTTP/2 200`.
