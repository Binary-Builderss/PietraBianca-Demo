/* Acqua: gocce che si propagano dal puntatore, solo sulla vasca (maschera). Porting della v4. */

const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}';
const FS = `precision highp float;varying vec2 v;uniform sampler2D t,mk;uniform vec2 r,ir,o;uniform float time;uniform vec4 drops[12];
vec2 cover(vec2 uv){float sa=r.x/r.y,ia=ir.x/ir.y;vec2 s=sa>ia?vec2(1.,ia/sa):vec2(sa/ia,1.);return (uv-o)*s+o;}
void main(){vec2 uv=vec2(v.x,1.-v.y);float asp=r.x/r.y;
  float water=texture2D(mk,cover(uv)).r;
  vec2 g=vec2(0.);
  for(int i=0;i<12;i++){vec4 d=drops[i];float age=time-d.z;if(age<0.||age>3.)continue;
    vec2 p=(uv-d.xy)*vec2(asp,1.);float rr=length(p),f=rr-.35*age;
    float env=exp(-f*f*120.)*exp(-age*1.6)*d.w;
    g+=cos(f*55.)*55.*env*p/max(rr,1e-3);}
  vec2 amb=vec2(sin(uv.y*38.+time*2.1),cos(uv.x*27.+time*2.9))*.0011;
  vec2 off=(g*.00008+amb)*water;
  vec3 col=texture2D(t,cover(uv+off)).rgb;
  col+=vec3(1.,.9,.78)*max(dot(g,vec2(-.5,-.85)),0.)*.0025*water;
  gl_FragColor=vec4(col,1.);}`;

const load = (src: string) => new Promise<HTMLImageElement>((ok, ko) => {
  const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src;
});

/**
 * Sostituisce la foto di `media` con un canvas WebGL. `origin` deve coincidere con l'object-position CSS.
 * Senza WebGL non fa nulla. Restituisce il cleanup (chiamato anche su webglcontextlost).
 */
export function initWater(media: HTMLElement, o: { img: string; mask: string; origin: [number, number] }): () => void {
  const cv = document.createElement('canvas');
  const gl = cv.getContext('webgl');
  if (!gl) return () => {};
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram()!;
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return () => {};
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const texture = (unit: number) => {
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
  };
  // maschera sull'unità 1: finché non arriva, nero = nessun effetto
  texture(1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
  gl.uniform1i(gl.getUniformLocation(pr, 't'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'mk'), 1);
  gl.uniform2f(gl.getUniformLocation(pr, 'o'), ...o.origin);
  const U = { r: gl.getUniformLocation(pr, 'r'), ir: gl.getUniformLocation(pr, 'ir'), time: gl.getUniformLocation(pr, 'time'), drops: gl.getUniformLocation(pr, 'drops') };

  const drops = new Float32Array(48);
  let k = 0, last: { x: number; y: number; t: number } | null = null, rect = cv.getBoundingClientRect();
  let raf = 0, rt = 0, visible = true, alive = true;
  const now = () => performance.now() / 1000;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio, 1.5);
    cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
    gl.viewport(0, 0, cv.width, cv.height); rect = cv.getBoundingClientRect();
  };
  const onResize = () => { clearTimeout(rt); rt = window.setTimeout(resize, 150); };
  const onScroll = () => { rect = cv.getBoundingClientRect(); };
  const onMove = (e: PointerEvent) => {
    const x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height, t = now();
    if (last) {
      const d = Math.hypot((x - last.x) * rect.width / rect.height, y - last.y);
      if (d < .02) return;
      const v = d / Math.max(t - last.t, .016);
      drops.set([x, y, t, Math.min(1, Math.max(.15, v * .6))], (k++ % 12) * 4);
    }
    last = { x, y, t };
  };
  const frame = () => {
    raf = 0;
    if (!visible) return;
    gl.uniform2f(U.r, cv.width, cv.height); gl.uniform1f(U.time, now()); gl.uniform4fv(U.drops, drops);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  };
  // pausa del render quando la hero esce dallo schermo
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf && alive) raf = requestAnimationFrame(frame); });

  const cleanup = () => {
    alive = false;
    cancelAnimationFrame(raf); clearTimeout(rt); io.disconnect();
    removeEventListener('resize', onResize); removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove);
    media.classList.remove('gl'); cv.remove();
  };
  cv.addEventListener('webglcontextlost', cleanup);

  load(o.img).then(photo => {
    if (!alive) return;
    texture(0); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
    gl.uniform2f(U.ir, photo.naturalWidth, photo.naturalHeight);
    media.querySelector('.layer')!.appendChild(cv); media.classList.add('gl');
    resize();
    addEventListener('resize', onResize);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('pointermove', onMove);
    io.observe(cv);
    load(o.mask).then(m => { if (alive) { texture(1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, m); } }, () => {});
  }, () => {});
  return cleanup;
}
