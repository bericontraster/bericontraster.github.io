// Original emerald contour bands, drawn locally without pointer input.
// Matching WebP posters keep the artwork available without JavaScript or canvas.
export function setupHeroRibbons(options = {}) {
  const layer = document.querySelector('.hero-ribbons');
  if (!layer) return;
  if (options.enabled === false) { layer.hidden = true; return; }
  const intensity = Math.max(0, Math.min(1, Number(options.intensity ?? .92)));
  const speed = Math.max(0, Math.min(2, Number(options.speed ?? .8)));
  layer.style.setProperty('--ribbon-intensity', intensity);
  const canvas = layer.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const surface = document.createElement('canvas');
  const artwork = surface.getContext('2d', { alpha: true });
  if (!artwork) return;
  const reflections = document.createElement('canvas');
  const reflectionContext = reflections.getContext('2d', { alpha: true });
  if (!reflectionContext) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, ratio = 1, contextAvailable = true;
  let frame = 0, elapsed = 0, previousTime = 0, lastDraw = -Infinity, inView = true;

  function curve(t, time) {
    // Two joined cubic curves form a continuous S, with no gaps or exposed ends.
    const portrait = Math.max(0, Math.min(1, (1 - width / height) / .65));
    const points = [
      [.40 - portrait * .08, -.25], [-.20, .05], [.02, .86], [.49, .43],
      [.94, .02], [1.17, .66], [.62 + portrait * .08, 1.18],
    ];
    const second = t > .5;
    const u = second ? (t - .5) * 2 : t * 2;
    const start = second ? 3 : 0;
    const a = points[start], b = points[start + 1], c = points[start + 2], d = points[start + 3];
    const v = 1 - u;
    const x = v*v*v*a[0] + 3*v*v*u*b[0] + 3*v*u*u*c[0] + u*u*u*d[0];
    const y = v*v*v*a[1] + 3*v*v*u*b[1] + 3*v*u*u*c[1] + u*u*u*d[1];
    const dx = 3*v*v*(b[0]-a[0]) + 6*v*u*(c[0]-b[0]) + 3*u*u*(d[0]-c[0]);
    const dy = 3*v*v*(b[1]-a[1]) + 6*v*u*(c[1]-b[1]) + 3*u*u*(d[1]-c[1]);
    const length = Math.hypot(dx * width, dy * height);
    const drift = Math.sin(t * Math.PI * 2 + time * .16) * width * .006;
    return { x: x * width + drift, y: y * height + Math.sin(time * .13) * height * .006,
      nx: -dy * height / length, ny: dx * width / length };
  }

  function createArtwork() {
    if (!contextAvailable || !width || !height) return;
    artwork.setTransform(ratio, 0, 0, ratio, 0, 0);
    artwork.clearRect(0, 0, width, height);
    const time = 0;
    const scale = Math.min(width / 1440, height / 1100);
    const spacing = Math.max(17, 36 * scale);
    const bandWidth = spacing * .94;
    const samples = Array.from({ length: 321 }, (_, i) => curve(i / 320, time));
    artwork.lineJoin = 'round';
    artwork.lineCap = 'round';
    artwork.globalAlpha = 1;
    for (let band = 0; band < 7; band++) {
      const offset = (band - 3) * spacing;
      const path = new Path2D();
      samples.forEach((p, index) => {
        const x = p.x + p.nx * offset, y = p.y + p.ny * offset;
        if (index) path.lineTo(x, y); else path.moveTo(x, y);
      });
      artwork.globalAlpha = 1;
      artwork.strokeStyle = '#84dba6';
      // One soft emerald hue, with depth from opacity rather than additional colors.
      for (let highlight = 0; highlight < 18; highlight++) {
        artwork.lineWidth = bandWidth * (1.3 - highlight * .067);
        artwork.save();
        artwork.globalAlpha *= .037;
        artwork.stroke(path);
        artwork.restore();
      }
    }
    artwork.globalAlpha = 1;
  }
  function draw() {
    if (!contextAvailable || !width || !height) return;
    const time = elapsed * speed;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.scale(ratio, ratio);
    // A quiet rolling sway stays visible within seconds, independently of input.
    context.translate(width * (.5 + Math.sin(time * .6) * .009), height * (.5 + Math.sin(time * .47) * .006));
    context.rotate(Math.sin(time * .52) * .005);
    context.translate(-width * .5, -height * .5);
    context.globalAlpha = intensity * (.94 + .06 * Math.sin(time * .8));
    // Cache the expensive highlights and leave a margin for the autonomous sway.
    context.drawImage(surface, -width * .025, -height * .025, width * 1.05, height * 1.05);

    // A matching emerald light layer lifts opacity along the curves without color shifts.
    reflectionContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    reflectionContext.globalCompositeOperation = 'source-over';
    reflectionContext.clearRect(0, 0, width, height);
    for (let reflection = 0; reflection < 2; reflection++) {
      const phase = (time * .105 + reflection * .5 + .16) % 1;
      const position = curve(phase, 0);
      const radius = Math.max(width * .19, height * .18);
      const glow = reflectionContext.createRadialGradient(position.x, position.y, 0, position.x, position.y, radius);
      glow.addColorStop(0, 'rgba(132,219,166,.5)');
      glow.addColorStop(.4, 'rgba(132,219,166,.25)');
      glow.addColorStop(1, 'rgba(132,219,166,0)');
      reflectionContext.globalAlpha = Math.min(1, phase * 12, (1 - phase) * 12);
      reflectionContext.fillStyle = glow;
      reflectionContext.fillRect(position.x - radius, position.y - radius, radius * 2, radius * 2);
    }
    reflectionContext.globalAlpha = 1;
    reflectionContext.globalCompositeOperation = 'destination-in';
    reflectionContext.drawImage(surface, 0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = intensity * .65;
    context.drawImage(reflections, -width * .025, -height * .025, width * 1.05, height * 1.05);
    context.restore();
  }
  function resize() {
    width = layer.clientWidth; height = layer.clientHeight;
    ratio = Math.min(devicePixelRatio || 1, 1.5, 1800 / Math.max(1, width));
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    surface.width = canvas.width; surface.height = canvas.height;
    reflections.width = canvas.width; reflections.height = canvas.height;
    createArtwork(); draw();
  }
  function canAnimate() {
    return contextAvailable && !document.hidden && !reducedMotion.matches && speed > 0 && inView
      && !document.documentElement.classList.contains('opening-dots-active');
  }
  function animate(time) {
    frame = 0;
    if (!canAnimate()) { previousTime = 0; return; }
    if (previousTime) elapsed += Math.min((time - previousTime) / 1000, .1);
    previousTime = time;
    if (time - lastDraw >= 1000 / 30) { draw(); lastDraw = time; }
    frame = requestAnimationFrame(animate);
  }
  function restart() {
    cancelAnimationFrame(frame); frame = 0; previousTime = 0;
    draw();
    if (canAnimate()) frame = requestAnimationFrame(animate);
  }
  new ResizeObserver(resize).observe(layer);
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; restart(); }).observe(layer);
  new MutationObserver(restart).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', restart);
  reducedMotion.addEventListener('change', restart);
  canvas.addEventListener('contextlost', event => {
    event.preventDefault(); contextAvailable = false; cancelAnimationFrame(frame); frame = 0;
    delete layer.dataset.renderer;
  });
  canvas.addEventListener('contextrestored', () => { contextAvailable = true; resize(); layer.dataset.renderer = 'canvas'; restart(); });
  resize(); layer.dataset.renderer = 'canvas'; restart();
}
