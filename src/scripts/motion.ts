import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

/**
 * Movimento della home allo scroll, dopo l'intro: tema della nav per `[data-theme]` sempre;
 * senza reduce anche ScrollSmoother (solo puntatore fine), pin orizzontale di #anime (≥ 821 px)
 * e comparsa di manifesto, pannelli e `[data-reveal]`.
 */
export function initMotion({ reduce, desktop }: { reduce: boolean; desktop: boolean }): void {
  void document.fonts.ready.then(() => {
    // una sola matchMedia raccoglie tutto (dentro un gsap.context ricorre all'infinito al cambio di breakpoint)
    const mm = gsap.matchMedia();
    try {
      start(mm, reduce, desktop);
    } catch (e) {
      console.error(e);
      mm.revert(); // niente stati nascosti a metà: la pagina torna statica e leggibile
    }
  });
}

function start(mm: gsap.MatchMedia, reduce: boolean, desktop: boolean) {
  // anime e track esistono solo in home: le pagine interne usano solo tema nav, scroll morbido e [data-reveal]
  const anime = document.getElementById('anime');
  const track = document.getElementById('track');
  const articles = gsap.utils.toArray<HTMLElement>('#track > article');
  // y di scroll che porta in vista un pannello del binario orizzontale (null = non siamo in modalità pin)
  let pinY: (el: Element) => number | null = () => null;

  // tema della nav (e dei sassi del marchio, via CSS): vince la sezione che sta davvero sotto la nav.
  // Le posizioni a schermo includono già pin e smoother (un ScrollTrigger sulla sezione pinnata finirebbe prima del pin).
  const nav = document.getElementById('nav')!;
  const sezioni = [...document.querySelectorAll<HTMLElement>('[data-theme]')];
  const tema = () => {
    const s = sezioni.find(x => { const r = x.getBoundingClientRect(); return r.top <= 50 && r.bottom > 50; });
    if (s) nav.dataset.navTheme = s.dataset.theme;
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: tema, onRefresh: tema });
  tema();
  document.documentElement.dataset.motion = ''; // il tema è vivo: spegne la barra di riserva della nav (global.css)

  if (!reduce) {
    // prima dei ScrollTrigger che misurano posizioni (il tema sopra legge solo i rect); nav, tabbar e cairn sono fuori da #smooth-wrapper.
    // Fuori dalla matchMedia: in GSAP 3.13 uno smoother ucciso lascia il body alto quanto la pagina desktop.
    // un desktop rimpicciolito sotto gli 821 px tiene lo scroll morbido, va bene
    if (desktop) {
      const sm = ScrollSmoother.create({ smooth: .8, effects: false, onFocusIn: (_, e) => !track?.contains(e.target as Node) });
      // il wrapper fisso ha overflow:hidden e il browser (ancore, scrollIntoView, cerca nella pagina) scrolla lui:
      // si riporta a 0 e lo spostamento passa allo smoother
      const w = sm.wrapper();
      w.addEventListener('scroll', () => { const d = w.scrollTop; if (d) { w.scrollTop = 0; sm.scrollTo(sm.scrollTop() + d, false); } });
    }
    if (anime && track) mm.add('(min-width: 821px)', () => {
      gsap.to('#heroMedia', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

      anime.classList.add('is-h');
      const dist = () => track.scrollWidth - innerWidth;
      const pips = anime.querySelectorAll('.pips i');
      const h = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: anime, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: true, invalidateOnRefresh: true,
          onUpdate: s => { const n = Math.min(pips.length - 1, Math.floor(s.progress * pips.length)); pips.forEach((p, i) => p.classList.toggle('on', i <= n)); },
        },
      });
      articles.forEach(a => {
        reveal(a, { trigger: a, containerAnimation: h, start: 'left 88%', end: 'left 40%', scrub: true },
          { trigger: a, containerAnimation: h, start: 'left 70%', toggleActions: 'play none none reverse' });
        gsap.fromTo(a.querySelector('img'), { xPercent: -4 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: a, containerAnimation: h, start: 'left right', end: 'right left', scrub: true } });
      });
      pinY = el => {
        const a = articles.find(x => x.contains(el));
        const st = h.scrollTrigger;
        if (!a || !st) return null;
        return st.start + gsap.utils.clamp(0, dist(), a.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft));
      };
      return () => { anime.classList.remove('is-h'); pinY = () => null; };
    });
    if (anime && track) mm.add('(max-width: 820px)', () => {
      articles.forEach(a => reveal(a, { trigger: a, start: 'top 88%', end: 'top 35%', scrub: true }, { trigger: a, start: 'top 62%' }));
    });

    if (desktop && anime) magnetic(document.getElementById('primaryCta')!);
    mm.add('all', () => {
      if (anime) {
        gsap.to('.hero-txt', { yPercent: -25, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: '45% top', end: 'bottom top', scrub: true } });

        const lines = SplitText.create('#manifesto', { type: 'lines', mask: 'lines', aria: 'none' });
        gsap.from(lines.lines, { yPercent: 100, duration: 1, ease: 'power3.out', stagger: .15, onComplete: () => lines.revert(), scrollTrigger: { trigger: '#manifesto', start: 'top 78%' } });
      }
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el =>
        gsap.from(el, { y: 24, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
    });
  }

  // ancore (/#ristorante) e tastiera: col pin il pannello sta di lato, lo scroll nativo non lo porta in vista
  const goTo = (el: Element | null, smooth: boolean) => {
    const y = el && pinY(el);
    if (y == null) return;
    const sm = ScrollSmoother.get();
    sm ? sm.scrollTo(y, smooth) : scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
  };
  const byHash = () => location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
  addEventListener('hashchange', () => goTo(byHash(), true));
  track?.addEventListener('focusin', e => goTo(e.target as Element, true));
  if (byHash()) goTo(byHash(), false);
}

function reveal(a: HTMLElement, clip: ScrollTrigger.Vars, txt: ScrollTrigger.Vars) {
  gsap.fromTo(a.querySelector('.pic'), { clipPath: 'inset(10% 10% 10% 10% round 6px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'power2.out', scrollTrigger: clip });
  gsap.from(a.querySelectorAll('.tag, h3, p, .price'), { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, scrollTrigger: txt });
}

/* magnetico solo sulla CTA principale (v4) */
function magnetic(el: HTMLElement) {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    gsap.to(el, { x: gsap.utils.clamp(-14, 14, (e.clientX - r.left - r.width / 2) * .25), y: gsap.utils.clamp(-10, 10, (e.clientY - r.top - r.height / 2) * .35), duration: .4, ease: 'power3', overwrite: 'auto' });
  });
  el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.75)', overwrite: 'auto' }));
}
