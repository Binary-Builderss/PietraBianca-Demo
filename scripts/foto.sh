#!/bin/sh
# Copia le foto del cliente (mai nel repo) da PB_FOTO_SRC a src/assets/cliente e public/cliente.
# Solo l'elenco esplicito di ciò che il sito usa: src/assets/cliente/ è letta con import.meta.glob,
# ogni file in più finirebbe in dist/. Un file nuovo usato dal sito va aggiunto qui.
set -e
SRC=${PB_FOTO_SRC:-prototipo/assets}
mkdir -p src/assets/cliente public/cliente
cp "$SRC/v4-hero.jpg" public/cliente/hero.jpg
cp "$SRC/v4-hero.jpg" src/assets/cliente/hero.jpg # sorgente di getImage per il WebP mobile (Hero.astro)
cp "$SRC/v4-hero-mask.png" public/cliente/hero-mask.png
for f in \
  v3-spa-hydromassage.jpg v3-event-pink-mise-en-place.jpg pool-parasol-sunbed.jpg v3-food-risotto.jpg \
  pool-building-palm.jpg xmas-gift-card.jpg spa-face-massage.jpg pool-sunset-lounge.jpg \
  logo-white.png logo-blue.png wordmark-white.png wordmark-blue.png; do
  cp "$SRC/$f" src/assets/cliente/
done
