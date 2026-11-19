import { test, expect } from '@playwright/test';

test('intro completa senza errori, seconda visita senza loader', async ({ page }) => {
  const errs: string[] = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/Tre anime, una sola destinazione/);
  await page.reload();
  await expect(page.locator('#loader')).toBeHidden({ timeout: 500 });
  expect(errs).toEqual([]);
});
test('sessionStorage che lancia eccezioni', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } }));
  const errs: string[] = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
  expect(errs).toEqual([]);
});
test('senza WebGL la foto resta visibile', async ({ page }) => {
  await page.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, t: string, ...a: any[]) { return /webgl/.test(t) ? null : g.call(this, t, ...a); } as any; });
  await page.goto('/');
  await expect(page.locator('.hero img')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('.hero canvas')).toHaveCount(0);
});
test.describe('senza JS', () => {
  test.use({ javaScriptEnabled: false });
  test('hero e titolo visibili', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#loader')).toBeHidden();
  });
});
test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('niente loader, niente canvas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#loader')).toBeHidden({ timeout: 500 });
    await expect(page.locator('.hero canvas')).toHaveCount(0);
  });
});
test('desktop: canvas WebGL attivo; iPhone: nessun canvas', async ({ page }, info) => {
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
  await expect(page.locator('.hero canvas')).toHaveCount(info.project.name === 'desktop' ? 1 : 0);
});
