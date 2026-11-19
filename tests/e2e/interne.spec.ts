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
  // la CTA dell'hero (.pd-cta) ripete apposta il messaggio di «Prenota il percorso»; la card in fondo (.pd-next) va a Don Peppino
  const tutte = page.locator('main a[href^="https://wa.me/"]:not(.pd-next a)');
  expect(await tutte.evaluateAll(as => as.map(a => a.getAttribute('href')!.split('?')[0]))).toEqual(Array(await tutte.count()).fill('https://wa.me/393496897941'));
  const cta = page.locator('main a[href^="https://wa.me/"]:not(.pd-cta a):not(.pd-next a)');
  const testi = await cta.evaluateAll(as => as.map(a => new URL(a.getAttribute('href')!).searchParams.get('text')));
  expect(new Set(testi).size).toBe(testi.length); // ogni CTA ha il suo testo
});
test('/spa: "Resta ancora un po\'" porta al WhatsApp del ristorante', async ({ page }) => {
  await page.goto('/spa');
  await expect(page.getByRole('heading', { name: 'Resta ancora un po’.' })).toBeVisible();
  await expect(page.locator('.pd-next a')).toHaveAttribute('href', /^https:\/\/wa\.me\/393938564501\?text=/);
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
  await expect(page.locator('.pi-prezzi').getByText(/€13/)).toBeVisible(); // "Ingresso da €13*" è anche nell'hero
  await expect(page.locator('.pi-prezzi').getByText(/€18/)).toBeVisible();
  await expect(page.getByText(/cibo dall.esterno/i)).toBeVisible();
  const faq = page.locator('details');
  expect(await faq.count()).toBeGreaterThanOrEqual(5);
  await faq.first().locator('summary').click();
  await expect(faq.first()).toHaveAttribute('open', '');
  await expect(page.locator('.pi-sez a[href^="https://wa.me/393496897941?text="]').first()).toBeVisible(); // quello dell'hero è nascosto su mobile
});
test('/piscina desktop: con tutte le FAQ aperte il fondo pagina resta raggiungibile', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'ScrollSmoother solo con puntatore fine');
  await page.goto('/piscina');
  await page.waitForTimeout(1000);
  for (const s of await page.locator('details summary').all()) await s.click();
  await page.waitForTimeout(500);
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 1000); await page.waitForTimeout(100); }
  await page.waitForTimeout(1500);
  const last = page.locator('footer a').last();
  await expect(last).toBeInViewport();
  await last.click({ trial: true });
});
