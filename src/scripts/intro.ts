import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(Flip, SplitText);

/* pietre: geometria misurata sul logo (unità del logo, box 135×108 con origine in 200,20) — [cx, w, y, h, colore] */
const S: [number, number, number, number, string][] = [
  [262, 26, 22, 8, '#C3DAEE'], [272, 30, 32, 8, '#9BC0DF'], [290, 38, 44, 9, '#73A3CF'], [304, 44, 54, 9, '#4E86BE'],
  [286, 48, 70, 10, '#2A66A6'], [274, 56, 86, 11, '#0E4A8A'], [252, 82, 104, 16, '#06366D'],
];
const SAFETY_MS = 4500; // uguale alla rete CSS in Loader.astro

/**
 * Loader della home: i sassi si impilano, atterrano in #navMark (Flip) e la hero si apre.
 * Si risolve a hero rivelata, oppure subito se il loader è saltato (seconda visita o reduce).
 */
export function initIntro({ reduce }: { reduce: boolean }): Promise<void> {
  const root = document.documentElement;
  const loader = document.getElementById('loader')!;
  const cairn = document.getElementById('cairn')!;
  const img = document.getElementById('heroImg') as HTMLImageElement;
  const mobile = !matchMedia('(min-width: 821px)').matches;
  const stones = S.map(([cx, w, y, h, c]) => {
    const i = document.createElement('i');
    i.style.cssText = `left:${(cx - w / 2 - 200) / 1.35}%;width:${w / 1.35}%;top:${(y - 20) / 1.08}%;height:${h / 1.08}%;--c:${c}`;
    return cairn.appendChild(i);
  });
  // cairn è position:fixed come la nav: niente `absolute`, così resta agganciato anche con lo scroll nativo
  const dock = (duration = 0) => Flip.fit(cairn, '#navMark', { duration, ease: 'expo.inOut' }) as gsap.core.Tween;
  let tl: gsap.core.Timeline | undefined;
  let finished = false;
  addEventListener('resize', () => { if (finished) dock(); });

  return new Promise(resolve => {
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      loader.remove();
      if (!tl) dock();
      cairn.classList.add('on-dark', 'docked');
      try { sessionStorage.setItem('pb-intro', '1'); } catch { /* Safari privato: l'intro si ripete, pazienza */ }
      root.dataset.intro = 'done';
      resolve();
    };
    // rete di sicurezza: mai una pagina coperta dal loader oltre 4,5 s dall'apertura (a sipario aperto non serve)
    const safety = setTimeout(() => { if (loader.isConnected) tl ? tl.progress(1) : finish(); }, Math.max(0, SAFETY_MS - performance.now()));

    if (reduce || root.classList.contains('no-intro')) return finish();

    // foto decodificata e font pronti, così il reveal non salta
    Promise.all([img.decode().catch(() => {}), document.fonts.ready]).then(() => {
      if (finished) return;
      let title: SplitText | undefined;
      try {
        title = SplitText.create('#title', { type: 'lines,chars', mask: 'lines', linesClass: 'line', aria: 'auto' });
        tl = timeline(title, stones, cairn, loader, mobile, dock, finish);
        const fast = () => { tl!.timeScale(4); ['wheel', 'touchstart', 'keydown'].forEach(e => removeEventListener(e, fast)); };
        ['wheel', 'touchstart', 'keydown'].forEach(e => addEventListener(e, fast, { passive: true }));
      } catch (e) {
        console.error(e);
        tl?.revert(); title?.revert(); tl = undefined;
        finish();
      }
    });
  });
}

function timeline(title: SplitText, stones: HTMLElement[], cairn: HTMLElement, loader: HTMLElement, mobile: boolean,
  dock: (d: number) => gsap.core.Tween, finish: () => void) {
  const k = mobile ? .6 : 1; // sotto gli 821 px il loader (sassi + sipario) sta entro 1,8 s
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { title.revert(); finish(); } });
  [...stones].reverse().forEach((s, i) => {
    const at = i * .11 * k;
    tl.from(s, { y: -40, opacity: 0, duration: .3 * k, ease: 'power2.in' }, at)
      .fromTo(s, { scaleY: .75 }, { scaleY: 1, duration: .35 * k, ease: 'back.out(3)' }, at + .3 * k);
  });
  tl.addLabel('open', `+=${.15 * k}`)
    .add(() => cairn.classList.add('on-dark'), 'open')
    .add(dock(1), 'open')
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: mobile ? .7 : 1, ease: 'expo.inOut', onComplete: () => loader.remove() }, 'open')
    .fromTo('#heroMedia', { clipPath: 'inset(47% 0% 53% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' }, 'open')
    .fromTo('#heroLayer', { scale: 1.12 }, { scale: 1, duration: 1.8 }, 'open')
    .from(title.chars, { yPercent: 105, duration: 1.2, stagger: { amount: .5 } }, 'open+=.45')
    .from(['#kicker', '#ctas'], { y: 20, opacity: 0, duration: .9, stagger: .1 }, '-=.6')
    .from('.nav ul, .menu-btn', { opacity: 0, duration: .8 }, '<');
  if (mobile) tl.from('.tabbar', { yPercent: 160, duration: .9 }, '-=.6');
  return tl;
}
