const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3000';

// Усі 18 шаблонів
const templates = [
  'clock.html',
  'kaizen.html',
  'kanban.html',
  'lean_canvas.html',
  'management_space.html',
  'meeting_notes.html',
  'notes.html',
  'notes_pastel.html',
  'okr.html',
  'pdca.html',
  'piramida_franklin.html',
  'pomodoro.html',
  'raci.html',
  'smart.html',
  'status_zvit.html',
  'swot_analysis.html',
  'wish_tracker.html',
  'writer.html',
];

test.describe('Головна сторінка', () => {
  test('відкривається з правильним заголовком', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page).toHaveTitle(/шаблони/i);
  });
});

test.describe('Smoke test: усі шаблони', () => {
  for (const template of templates) {
    test(`${template} відкривається без помилок`, async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(BASE + '/' + template);
      await expect(page.locator('body')).not.toBeEmpty();
      expect(errors).toEqual([]);
    });
  }
});