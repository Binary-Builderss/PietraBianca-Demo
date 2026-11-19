import { test, expect, type Page } from '@playwright/test';

const PAGINE = ['/', '/spa', '/eventi', '/piscina'];

// le sezioni principali devono esserci e leggersi (opacità piena) anche senza movimento e senza JS
async function sezioniLeggibili(page: Page, path: string) {
  await page.goto(path);
  const sezioni = page.locator('main section');
  expect(await sezioni.count()).toBeGreaterThan(2);
  for (const s of await sezioni.all()) await expect(s).toBeVisible();
  const titoli = await page.locator('main :is(h1, h2, h3)').evaluateAll(hs => hs.map(h => {
    let o = 1; for (let e: Element | null = h; e; e = e.parentElement) o *= +getComputedStyle(e).opacity;
    return { t: h.textContent!.trim().slice(0, 30), o, w: h.getBoundingClientRect().width };
  }));
  for (const t of titoli) { expect(t.o, t.t).toBe(1); expect(t.w, t.t).toBeGreaterThan(0); }
  if (path === '/') {
    await expect(page.locator('#anime a.panel')).toHaveCount(4);
    for (const p of await page.locator('#anime a.panel').all()) { await expect(p).toBeVisible(); await expect(p.locator('.pic')).toHaveCSS('clip-path', 'none'); }
    await expect(page.locator('#natale')).toBeVisible();
    await expect(page.locator('#dove')).toBeVisible();
  }
}
for (const [nome, opzioni] of [['reduced motion', { reducedMotion: 'reduce' as const }], ['senza JS', { javaScriptEnabled: false }]] as const) {
  test.describe(nome, () => {
    test.use(opzioni);
    for (const path of PAGINE) test(`${path}: sezioni visibili`, ({ page }) => sezioniLeggibili(page, path));
  });
}

for (const path of PAGINE) test(`${path}: scroll fino in fondo senza errori`, async ({ page }) => {
  const errs: string[] = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-motion', '', { timeout: 8000 });
  for (let i = 0; i < 80; i++) {
    const fine = await page.evaluate(() => { scrollBy(0, innerHeight * .7); return scrollY + innerHeight >= document.documentElement.scrollHeight - 2; });
    if (fine) break;
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(300);
  expect(errs).toEqual([]);
});
