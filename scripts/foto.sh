#!/bin/sh
# Copia le foto del cliente (mai nel repo) da PB_FOTO_SRC a src/assets/cliente e public/cliente.
set -e
SRC=${PB_FOTO_SRC:-prototipo/assets}
mkdir -p src/assets/cliente public/cliente
cp "$SRC/v4-hero.jpg" public/cliente/hero.jpg
cp "$SRC/v4-hero.jpg" src/assets/cliente/hero.jpg # sorgente di getImage per il WebP mobile (Hero.astro)
cp "$SRC/v4-hero-mask.png" public/cliente/hero-mask.png
for f in "$SRC"/*.jpg "$SRC"/*.png; do
  case "$(basename "$f")" in v4-hero.jpg|v4-hero-mask.png) continue;; esac
  cp "$f" src/assets/cliente/
done
