# notion-templates — project guide

## Adding a new template

Follow these steps every time a new `.html` template is added:

1. **Create the template file** — place it in the repo root as `<name>.html`.

2. **Add a card in `index.html`** — find the most relevant `<section>` and append an `<article class="card">` block:

   ```html
   <article class="card">
     <h3>Template Name</h3>
     <p>Short Ukrainian description.</p>
     <div class="actions">
       <a class="btn primary" href="<name>.html">Відкрити</a>
       <a class="btn" href="https://github.com/BetaButterfly/notion-templates/blob/main/<name>.html">Код</a>
     </div>
   </article>
   ```

3. **Sections in `index.html`**:
   - Тайм-менеджмент — clocks, timers
   - Нотатки та письмо — notes, writing tools
   - Цілі та планування — goals, task boards
   - Методології та аналіз — frameworks, matrices, canvases

4. **Commit & push to `main`** — the `Deploy to GitHub Pages` workflow triggers automatically and deploys within ~30 seconds.

## CI / GitHub Pages

- Workflow file: `.github/workflows/pages.yml`
- Trigger: push to `main`
- Deploys the repo root directory as a static site
- Live URL: https://betabutterfly.github.io/notion-templates/

## Common issue: template file added but not visible on site

The CI deploys whatever is in the repo — if a template is missing from the gallery, the card was not added to `index.html`. CI success does not mean the card exists.
