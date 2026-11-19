# Prototipo hero (spike usa-e-getta)

Prototipi della fase di brainstorming, non il sito vero. Si buttano quando parte il build Astro.

- `prototipo-hero-v4.html`: ultima versione (notte + finestra piscina)
- `prototipo-hero-v3.html`: versione GSAP completa (sassi, pannelli, tabbar)
- `prototipo-hero-v2.html`, `home-direzioni-v3.html`: bozze precedenti

Avvio (serve http, il WebGL non carica le texture da file://):

    python3 -m http.server 8080 -d prototipo

Poi http://localhost:8080/prototipo-hero-v4.html (dal telefono: http://<IP-del-Mac>:8080/...).

`assets/` contiene foto del cliente prese da Instagram: è in .gitignore, mai nel repo.
