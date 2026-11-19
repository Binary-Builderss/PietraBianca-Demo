import { test, expect } from '@playwright/test';

// La tabbar esiste solo sotto gli 821 px: questi test girano solo sul progetto iphone (WebKit).
test.skip(({ browserName }) => browserName !== 'webkit', 'solo mobile');

test('tabbar /spa: WhatsApp SPA precompilato, Prenota = WhatsApp', async ({ page }) => {
  await page.goto('/spa');
  const bar = page.getByRole('navigation', { name: 'Contatti rapidi' });
  await expect(bar.getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', /^https:\/\/wa\.me\/393496897941\?text=/);
  await expect(bar.getByRole('link', { name: /chiama/i })).toHaveAttribute('href', 'tel:+393496897941');
});
test('tabbar /eventi: Preventivo porta al form', async ({ page }) => {
  await page.goto('/eventi');
  await expect(page.getByRole('navigation', { name: 'Contatti rapidi' }).getByRole('link', { name: 'Preventivo' }))
    .toHaveAttribute('href', '/eventi#preventivo');
});
test('home: Prenota apre il foglio con 4 divisioni in ordine, Esc chiude', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Contatti rapidi' }).getByRole('button', { name: 'Prenota' }).click();
  const d = page.locator('dialog#prenota');
  await expect(d).toBeVisible();
  await expect(d.getByRole('link')).toHaveText([/SPA/, /Eventi/, /Piscina/, /Ristorante/]);
  await page.keyboard.press('Escape'); await expect(d).toBeHidden();
});
test('iPhone SE: la tabbar non copre il footer', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('/'); await page.keyboard.press('End');
  await page.getByRole('contentinfo').getByRole('link').last().click({ trial: true }); // fallisce se intercettato
});

test('menu aperto su pagina light: Chiudi è bianco su fondo notte', async ({ page }) => {
  await page.goto('/spa');
  await page.getByRole('button', { name: 'Menu' }).click();
  const chiudi = page.getByRole('button', { name: 'Chiudi', exact: true }).first();
  await expect(chiudi).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(page.locator('#menu')).toHaveCSS('background-color', 'rgb(11, 31, 58)');
  await expect(page.locator('.wm.white:visible')).toHaveCSS('opacity', '1');
});
test('senza JS: i link delle divisioni restano visibili su mobile', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto('/spa');
  await expect(page.getByRole('navigation', { name: 'Principale' }).getByRole('link', { name: 'Eventi' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await ctx.close();
});
