# Pietrabianca Resort: demo del sito

Demo privata (Astro 6, sito statico). Le foto e il logo del cliente non stanno nel repo.

## Avvio

```sh
npm i
npm run foto      # copia foto e logo del cliente da prototipo/assets (non versionati)
npm run dev       # http://localhost:4321
```

Dopo ogni pull rilancia `npm run foto`: copia solo le foto che il sito usa (l'elenco sta in `scripts/foto.sh`).

Da un worktree o da un'altra cartella: `PB_FOTO_SRC=/percorso/a/prototipo/assets npm run foto`.

## Build e anteprima

```sh
npm run build
npm run preview -- --port 4321
```

## Test

```sh
npm test          # Vitest
npm run e2e       # Playwright (desktop e iPhone/WebKit), con controlli axe
npm run lh        # Lighthouse mobile sulla home (serve l'anteprima su :4321), scrive lh.json
```

## Vedere il sito dal telefono (stessa rete Wi-Fi)

Lancia a mano `npm run dev -- --host` e apri dal telefono l'indirizzo `Network` che Astro stampa.

## Privacy e pubblicazione

- Le foto del cliente vivono in `src/assets/cliente/` e `public/cliente/`, entrambe in `.gitignore`: non vanno mai committate.
- Ogni pagina è `noindex`, con `public/robots.txt` e `public/_headers` (`X-Robots-Tag: noindex`).
- Il deploy privato (Cloudflare Pages protetto da Cloudflare Access) lo fa l'utente con un account intestato al cliente.
