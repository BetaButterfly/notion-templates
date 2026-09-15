const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

// Мапа: файл → ключ(і) localStorage, які він використовує
const storageMap = {
  'kaizen.html': ['kaizenData'],
  'kanban.html': ['kanban-tasks'],
  'lean_canvas.html': ['leanCanvasData'],
  'management_space.html': ['mgr_tasks', 'mgr_notes', 'mgr_chat'],
  'meeting_notes.html': ['__SKIP__'],   // складний, розберемо окремо
  'notes_pastel.html': ['dn_v2'],
  'notes.html': ['dn_v1'],
  'okr.html': ['okrData'],
  'pdca.html': ['pdca-data'],
  'piramida_franklin.html': ['franklin_pyramid'],
  'swot_analysis.html': ['swotAnalysisData'],
  'wish_tracker.html': ['wishlist_full_fixed'],
  'writer.html': ['writer-sections', 'writer-current'],
};

test.describe('localStorage: збереження даних', () => {
  for (const [file, keys] of Object.entries(storageMap)) {
    if (keys[0] === '__SKIP__') continue;

    test(`${file} зберігає дані після перезавантаження`, async ({ page }) => {
      await page.goto(BASE + '/' + file);

      // 1. Записуємо тестові дані в кожен ключ
      await page.evaluate((keys) => {
        for (const key of keys) {
          localStorage.setItem(key, JSON.stringify({ test: 'playwright', ts: Date.now() }));
        }
      }, keys);

      // 2. Перезавантажуємо
      await page.reload();

      // 3. Перевіряємо, що всі ключі на місці
      const saved = await page.evaluate((keys) => {
        const result = {};
        for (const key of keys) {
          result[key] = localStorage.getItem(key);
        }
        return result;
      }, keys);

      for (const key of keys) {
        expect(saved[key], `ключ "${key}" має бути збережений`).not.toBeNull();
      }

      // 4. Прибираємо за собою
      await page.evaluate((keys) => {
        for (const key of keys) localStorage.removeItem(key);
      }, keys);
    });
  }
});