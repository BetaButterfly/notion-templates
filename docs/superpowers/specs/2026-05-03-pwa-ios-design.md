# PWA iOS Home Screen Installation — Design Spec

**Date:** 2026-05-03
**Repo:** BetaButterfly/notion-templates
**Live URL:** https://betabutterfly.github.io/notion-templates/
**Branch:** pwa-ios-support

---

## Goal

Convert the existing GitHub Pages static site into an installable PWA so iPhone/iOS users can add it to their Home Screen via Safari Share → Add to Home Screen, and open it in standalone (app-like) mode.

---

## Decisions Made

| Question | Decision |
|---|---|
| Icon style | Dark background `#0e1116` + checkmark in `#2f6feb` |
| App short name | `Шаблони UA` |
| App full name | `Україномовні шаблони для Notion` |
| Meta-tag injection | GitHub Actions CI step (Python) before artifact upload |
| Icon source | Pre-committed PNG files in `icons/` |
| SW strategy | Network-first for HTML, Cache-first for assets |

---

## File Structure

```
/
├── manifest.webmanifest
├── service-worker.js
├── icons/
│   ├── icon-192.png          (192×192)
│   ├── icon-512.png          (512×512, maskable)
│   └── apple-touch-icon.png  (180×180)
└── .github/workflows/pages.yml   (updated)
```

---

## manifest.webmanifest

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
    { "src": "/notion-templates/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/notion-templates/icons/icon-512.png",  "sizes": "512x512",  "type": "image/png", "purpose": "any maskable" },
    { "src": "/notion-templates/icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ]
}
```

---

## PWA Meta-Tag Block (injected into every `*.html`)

```html
<!-- PWA -->
<link rel="manifest" href="/notion-templates/manifest.webmanifest">
<meta name="theme-color" content="#2f6feb">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Шаблони UA">
<link rel="apple-touch-icon" href="/notion-templates/icons/apple-touch-icon.png">
<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/notion-templates/service-worker.js');</script>
<!-- /PWA -->
```

Injected immediately after `<head>`, idempotent (skips files that already contain `<!-- PWA -->`).

---

## GitHub Actions — Inject Step

Added between `Checkout` and `Upload artifact` in `.github/workflows/pages.yml`:

```yaml
- name: Inject PWA meta tags
  run: |
    python3 -c "
    import re, pathlib

    SNIPPET = chr(10) + '<!-- PWA -->' + chr(10) + '<link rel=\"manifest\" href=\"/notion-templates/manifest.webmanifest\">' + chr(10) + '<meta name=\"theme-color\" content=\"#2f6feb\">' + chr(10) + '<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">' + chr(10) + '<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">' + chr(10) + '<meta name=\"apple-mobile-web-app-title\" content=\"Шаблони UA\">' + chr(10) + '<link rel=\"apple-touch-icon\" href=\"/notion-templates/icons/apple-touch-icon.png\">' + chr(10) + '<script>if(chr(39)serviceWorker chr(39) in navigator) navigator.serviceWorker.register(chr(39)/notion-templates/service-worker.js chr(39));</script>' + chr(10) + '<!-- /PWA -->'

    for f in pathlib.Path('.').glob('*.html'):
        text = f.read_text(encoding='utf-8')
        if '<!-- PWA -->' not in text:
            text = re.sub(r'(<head[^>]*>)', r'\1' + SNIPPET, text, count=1, flags=re.IGNORECASE)
            f.write_text(text, encoding='utf-8')
            print('  injected:', f.name)
        else:
            print('  skipped:', f.name)
    "
```

---

## service-worker.js

Strategy: network-first for HTML documents, cache-first for all other assets.
Cache versioning via `CACHE` constant — bump to `v2`, `v3`, etc. on significant asset changes.

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

---

## Icons

Generated locally with Python + Pillow, committed as PNG:

- **Background:** `#0e1116` (rounded corners, radius ~20% of size)
- **Checkmark:** centered, color `#2f6feb`, stroke weight ~10% of icon size
- `icon-512.png` uses 10% padding (safe zone) for maskable compatibility
- Sizes: icon-192.png (192x192), icon-512.png (512x512), apple-touch-icon.png (180x180)

---

## README Addition

Added at end of `README.md`:

```markdown
## Встановлення на iPhone (PWA)

1. Відкрий <https://betabutterfly.github.io/notion-templates/> у **Safari**
2. Натисни кнопку **Поділитися** (квадрат зі стрілкою вгору)
3. Прокрути вниз і обери **«На екран «Додому»**
4. Натисни **«Додати»**

Сайт зʼявиться на головному екрані як окремий застосунок з іконкою «Шаблони UA».
```

---

## Acceptance Criteria

- [ ] GitHub Pages сайт відкривається без regressions
- [ ] Safari на iPhone: Share → Add to Home Screen → іконка і назва «Шаблони UA»
- [ ] Відкриття з Home Screen запускає в standalone режимі (не вкладка Safari)
- [ ] `/notion-templates/manifest.webmanifest` повертає 200, не 404
- [ ] `/notion-templates/icons/*.png` повертають 200, не 404
- [ ] Service worker реєструється без console errors
- [ ] README містить інструкцію для iPhone

---

## Out of Scope

- App Store / Xcode / native iOS app
- Push notifications
- Background sync
- Lighthouse CI gate (manual check recommended after deploy)
