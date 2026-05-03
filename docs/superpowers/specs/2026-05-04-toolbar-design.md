# Template Toolbar — Design Spec

**Date:** 2026-05-04
**Repo:** BetaButterfly/notion-templates
**Branch:** feature/toolbar (to be created)

---

## Goal

Add a fixed bottom toolbar with 4 action buttons to every template page: Back, Download, Print, Share. Buttons are icon-only, compact, always visible.

---

## Decisions

| Question | Decision |
|---|---|
| Placement | Fixed bottom bar |
| Button style | Icon only (no text labels) |
| Implementation | Extend existing CI inject step in pages.yml |
| New templates | Automatically get toolbar via CI |

---

## Layout

```
┌────────────────────────────────────────┐
│  [template content, padded at bottom]  │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐  fixed, bottom:0, z-index:9999
│     ←        ⬇        🖨       ⬆      │  height: 44px
└────────────────────────────────────────┘
```

Body gets `padding-bottom: 52px` injected so content is not hidden behind the bar.

---

## Toolbar HTML (injected before `</body>`)

```html
<!-- TOOLBAR -->
<div id="pwa-toolbar">
  <button onclick="(history.length>1)?history.back():location.href='/notion-templates/'" title="Назад">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  </button>
  <a id="pwa-dl" download title="Завантажити">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  </a>
  <button onclick="window.print()" title="Друк">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
  </button>
  <button onclick="if(navigator.share){navigator.share({title:document.title,url:location.href})}else{navigator.clipboard.writeText(location.href).then(()=>alert('URL скопійовано'))}" title="Поділитись">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  </button>
</div>
<!-- /TOOLBAR -->
```

---

## Toolbar CSS + JS (injected in same block)

```html
<style>
#pwa-toolbar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 44px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0,0,0,0.10);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 9999;
  padding: 0 8px;
  box-sizing: border-box;
}
#pwa-toolbar button, #pwa-toolbar a {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 14px;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.15s;
  text-decoration: none;
}
#pwa-toolbar button:hover, #pwa-toolbar a:hover {
  background: rgba(0,0,0,0.07);
}
#pwa-toolbar svg {
  width: 20px;
  height: 20px;
}
@media (prefers-color-scheme: dark) {
  #pwa-toolbar {
    background: rgba(20,20,20,0.92);
    border-top-color: rgba(255,255,255,0.10);
  }
  #pwa-toolbar button, #pwa-toolbar a { color: #ddd; }
  #pwa-toolbar button:hover, #pwa-toolbar a:hover {
    background: rgba(255,255,255,0.10);
  }
}
@media print { #pwa-toolbar { display: none !important; } }
</style>
<script>
(function() {
  var a = document.getElementById('pwa-dl');
  if (a) {
    a.href = location.href;
    var m = location.pathname.match(/([^/]+)$/);
    a.download = m ? m[1] : 'template.html';
  }
  document.body.style.paddingBottom = '52px';
})();
</script>
```

---

## CI Inject Change

In `.github/workflows/pages.yml`, extend the existing `Inject PWA meta tags` step to also inject the toolbar before `</body>`. The idempotency marker is `<!-- TOOLBAR -->`.

Both injections happen in the same Python script run. Logic:

```python
# existing: inject PWA block after <head>
# new: inject TOOLBAR block before </body>
if '<!-- TOOLBAR -->' not in text:
    text = re.sub(r'</body>', TOOLBAR + '\n</body>', text, count=1, flags=re.IGNORECASE)
```

---

## Button Behaviour

| Button | Action | Fallback |
|--------|--------|---------|
| ← Back | `history.back()` | `location.href = '/notion-templates/'` if no history |
| ⬇ Download | `<a download href=currentURL>` | — |
| 🖨 Print | `window.print()` | — |
| ⬆ Share | `navigator.share({title, url})` | `navigator.clipboard.writeText(url)` → alert |

---

## Acceptance Criteria

- [ ] Toolbar visible on every `*.html` template (not index.html — it's the gallery)
- [ ] Toolbar hidden on `window.print()`
- [ ] Back button works from template opened via link
- [ ] Download triggers file save of the HTML page
- [ ] Share uses native share sheet on iPhone
- [ ] Dark mode: toolbar adapts automatically
- [ ] No regressions on existing template functionality
- [ ] `body` content not clipped behind toolbar (padding-bottom applied)

---

## Out of Scope

- Toolbar on `index.html` (it's the gallery, not a template)
- Custom per-template toolbar variants
- Animations / transitions on toolbar
