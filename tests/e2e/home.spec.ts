import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('4 pannelli in ordine con link', async ({ page }) => {
  await page.goto('/');
  const p = page.locator('#anime a.panel');
  await expect(p).toHaveCount(4);
  const href = await p.evaluateAll(as => as.map(a => a.getAttribute('href')!));
  expect(href.slice(0, 3)).toEqual(['/spa', '/eventi', '/piscina']);
  expect(href[3]).toMatch(/^https:\/\/wa\.me\/393938564501\?text=/); // ristorante: dritto al WhatsApp di Don Peppino
});
test('resize desktop→mobile: pannelli ancora cliccabili', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
  if (browserName === 'chromium') { // progetto desktop: il pin c'è davvero e lo si lascia a metà
    await expect(page.locator('#anime')).toHaveClass(/is-h/);
    const y = await page.evaluate(() => { const sp = document.getElementById('anime')!.parentElement!; return sp.getBoundingClientRect().top + scrollY + (sp.offsetHeight - innerHeight) / 2; });
    await page.evaluate(y => scrollTo(0, y), y);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.getElementById('track')!).transform)).not.toBe('none');
  } else {
    await page.locator('#anime').scrollIntoViewIfNeeded();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#anime')).not.toHaveClass(/is-h/);
  // pannelli di nuovo impilati, nessuno spostato di lato
  await expect.poll(() => page.locator('#anime a.panel').evaluateAll(as => as.map(a => Math.round(a.getBoundingClientRect().left)))).toEqual([16, 16, 16, 16]);
  await page.locator('#anime a.panel').nth(3).scrollIntoViewIfNeeded();
  await page.locator('#anime a.panel').nth(3).click({ trial: true });
});
test.describe('pin orizzontale: mouse e tastiera', () => {
  test.beforeEach(({ browserName }, info) => test.skip(info.project.name !== 'desktop' || browserName !== 'chromium', 'pin orizzontale solo su desktop'));
  const dentroIlPin = async (page: import('@playwright/test').Page, quota: number) => {
    await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
    await expect(page.locator('#anime')).toHaveClass(/is-h/);
    const y = await page.evaluate(q => { const sp = document.getElementById('anime')!.parentElement!; return sp.getBoundingClientRect().top + scrollY + (sp.offsetHeight - innerHeight) * q; }, quota);
    await page.evaluate(y => scrollTo(0, y), y);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.getElementById('track')!).transform)).not.toBe('none');
  };
  // regressione: il focus col mouse (Chrome lo mette al mousedown) faceva scorrere il pin sotto il click e il click andava perso
  test('click tenuto premuto sul pannello 2 non sposta il pin e apre /eventi', async ({ page }) => {
    await dentroIlPin(page, .15);
    await page.waitForTimeout(600); // lo scroll morbido si assesta
    const txt = page.locator('#anime a.panel .txt').nth(1);
    const b = (await txt.boundingBox())!;
    expect(b.x + b.width / 2).toBeLessThan(1440); // il pannello è in vista
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(120);
    await page.mouse.up();
    await expect(page).toHaveURL(/\/eventi$/);
  });
  test('Tab porta in vista il pannello successivo', async ({ page }) => {
    await dentroIlPin(page, 0);
    const ultimo = page.locator('#anime a.panel').nth(3);
    for (let i = 0; i < 40 && !(await ultimo.evaluate(a => a === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(ultimo).toBeFocused();
    await expect.poll(async () => (await ultimo.boundingBox())!.x + (await ultimo.boundingBox())!.width).toBeLessThanOrEqual(1440 + 1);
    await expect.poll(async () => (await ultimo.boundingBox())!.x).toBeGreaterThanOrEqual(0);
  });
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

// senza il tema per sezione la nav resta bianca: sulle sezioni chiare serve il fondo notte pieno
const fondoNav = (page: import('@playwright/test').Page) =>
  page.evaluate(() => { const c = getComputedStyle(document.getElementById('nav')!, '::before'); return [c.backgroundColor, c.top, c.bottom]; });
test.describe('nav leggibile senza JS', () => {
  test.use({ javaScriptEnabled: false });
  test('fondo notte pieno sul manifesto', async ({ page }) => {
    await page.goto('/');
    await page.locator('.manifesto').scrollIntoViewIfNeeded();
    expect(await fondoNav(page)).toEqual(['rgb(11, 31, 58)', '0px', '0px']);
  });
});
test('nav leggibile se motion.ts non arriva', async ({ page }) => {
  await page.route('**/_astro/*.js', r => r.abort());
  await page.goto('/');
  await page.locator('.manifesto').scrollIntoViewIfNeeded();
  await expect.poll(() => fondoNav(page), { timeout: 8000 }).toEqual(['rgb(11, 31, 58)', '0px', '0px']);
});
test('col JS la nav torna trasparente', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('data-motion', '', { timeout: 6000 });
  await page.waitForTimeout(6500); // oltre la scadenza della barra di riserva
  expect((await fondoNav(page))[0]).not.toBe('rgb(11, 31, 58)');
});
