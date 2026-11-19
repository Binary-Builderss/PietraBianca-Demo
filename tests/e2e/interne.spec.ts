import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('/spa: Home → SPA → WhatsApp in 3 tocchi', async ({ page }) => {
  await page.goto('/');
  await page.locator('#anime a.panel[href="/spa"]').click();
  await expect(page).toHaveURL(/\/spa$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /KRONOS/i }).first()).toHaveAttribute('href', /text=.*KRONOS/);
});
test('/spa: prezzi con asterisco, listino massaggi da inserire, CTA verso WhatsApp SPA', async ({ page }) => {
  await page.goto('/spa');
  await expect(page.getByText('€35 di listino, in promo da €15 (kit escluso)*')).toBeVisible();
  await expect(page.getByText('[DA INSERIRE CON IL CLIENTE]').first()).toBeVisible();
  const cta = page.locator('main a[href^="https://wa.me/"]');
  expect(await cta.evaluateAll(as => as.map(a => a.getAttribute('href')!.split('?')[0]))).toEqual(Array(await cta.count()).fill('https://wa.me/393496897941'));
  const testi = await cta.evaluateAll(as => as.map(a => new URL(a.getAttribute('href')!).searchParams.get('text')));
  expect(new Set(testi).size).toBe(testi.length); // ogni CTA ha il suo testo
});
test('/spa: "Completa l\'esperienza" porta al ristorante', async ({ page }) => {
  await page.goto('/spa');
  await expect(page.getByRole('heading', { name: "Completa l'esperienza" })).toBeVisible();
  await expect(page.locator('.pd-next a')).toHaveAttribute('href', '/#ristorante');
});
for (const path of ['/spa']) test(`axe ${path}`, async ({ page }) => {
  await page.goto(path);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});
