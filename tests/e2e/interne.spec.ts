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
for (const path of ['/spa', '/eventi', '/piscina']) test(`axe ${path}`, async ({ page }) => {
  await page.goto(path);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
});
test('/eventi: form valida, non fa richieste, mostra conferma demo', async ({ page }) => {
  await page.goto('/eventi#preventivo');
  const posts: string[] = []; page.on('request', r => r.method() !== 'GET' && posts.push(r.url()));
  const f = page.locator('form#preventivo');
  await f.getByRole('button', { name: /invia/i }).click();
  await expect(page.getByRole('status')).toHaveCount(0);           // bloccato dalla validazione nativa
  await f.getByLabel(/tipo evento/i).selectOption('Diciottesimo');
  await f.getByLabel(/data/i).fill('2027-03-14');
  await f.getByLabel(/invitati/i).fill('80');
  await f.getByLabel(/nome/i).fill('Prova');
  await f.getByLabel(/telefono/i).fill('3330000000');
  await f.getByLabel(/email/i).fill('prova@example.com');
  await f.getByLabel(/privacy/i).check();
  await f.getByRole('button', { name: /invia/i }).click();
  await expect(page.getByRole('status')).toContainText('non viene inviato nulla');
  expect(posts).toEqual([]);
});
test.describe('/eventi senza JS', () => {
  test.use({ javaScriptEnabled: false });
  test('il submit non naviga e non mette i dati nell\'URL', async ({ page }) => {
    await page.goto('/eventi');
    const navs: string[] = []; page.on('framenavigated', f => f === page.mainFrame() && navs.push(f.url()));
    const f = page.locator('form#preventivo');
    await f.getByLabel(/tipo evento/i).selectOption('Diciottesimo');
    await f.getByLabel(/data/i).fill('2027-03-14');
    await f.getByLabel(/invitati/i).fill('80');
    await f.getByLabel(/nome/i).fill('Prova');
    await f.getByLabel(/telefono/i).fill('3330000000');
    await f.getByLabel(/email/i).fill('prova@example.com');
    await f.getByLabel(/privacy/i).check();
    await f.getByRole('button', { name: /invia/i }).click();
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain('?');
    expect(navs).toEqual([]);
  });
});

test('/piscina: prezzi, regola cibo, FAQ apribili, Info su WhatsApp', async ({ page }) => {
  await page.goto('/piscina');
  await expect(page.getByText(/€13/)).toBeVisible();
  await expect(page.getByText(/€18/)).toBeVisible();
  await expect(page.getByText(/cibo dall.esterno/i)).toBeVisible();
  const faq = page.locator('details');
  expect(await faq.count()).toBeGreaterThanOrEqual(5);
  await faq.first().locator('summary').click();
  await expect(faq.first()).toHaveAttribute('open', '');
  await expect(page.locator('main a[href^="https://wa.me/393496897941?text="]').first()).toBeVisible();
});
