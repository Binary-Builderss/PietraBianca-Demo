import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('4 pannelli in ordine con link', async ({ page }) => {
  await page.goto('/');
  const p = page.locator('#anime a.panel');
  await expect(p).toHaveCount(4);
  expect(await p.evaluateAll(as => as.map(a => a.getAttribute('href')))).toEqual(['/spa', '/eventi', '/piscina', '/#ristorante']);
});
test('resize desktop→mobile: pannelli ancora cliccabili', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/');
  await page.locator('#anime').scrollIntoViewIfNeeded();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#anime a.panel').nth(3).scrollIntoViewIfNeeded();
  await page.locator('#anime a.panel').nth(3).click({ trial: true });
});
test('nav diventa light sul manifesto', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
  await page.locator('.manifesto').scrollIntoViewIfNeeded();
  await expect(page.locator('header.nav')).toHaveAttribute('data-nav-theme', 'light');
});
test('nessun iframe mappa e asterisco prezzi presente', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByText('*Prezzi indicativi, da confermare')).toBeVisible();
});
test('accessibilità home', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(r.violations).toEqual([]);
});
