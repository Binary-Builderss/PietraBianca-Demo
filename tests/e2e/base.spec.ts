import { test, expect } from '@playwright/test';

test('noindex e lingua', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
});
test('robots.txt blocca tutto', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
});
test('nessun font da Google', async ({ page }) => {
  const esterni: string[] = [];
  page.on('request', r => { if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) esterni.push(r.url()); });
  await page.goto('/'); await page.waitForLoadState('networkidle');
  expect(esterni).toEqual([]);
});
