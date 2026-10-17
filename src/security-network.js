// Decorative connection paths and traveling packets. No external data or tracking.
export function setupSecurityNetwork(options = {}) {
  const layer = document.querySelector('.security-network');
  if (!layer) return;
  if (options.enabled === false) { layer.hidden = true; return; }
  const canvas = layer.querySelector('canvas');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context) return;
  const color = /^#[\da-f]{6}$/i.test(options.color) ? options.color : '#7297c4';
  const signalColor = /^#[\da-f]{6}$/i.test(options.signalColor) ? options.signalColor : '#8cd6ca';
  const intensity = Math.max(0, Math.min(1, Number(options.intensity ?? .82)));
  const speed = Math.max(0, Math.min(2, Number(options.speed ?? .65)));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  layer.style.setProperty('--network-color', color);
  layer.style.setProperty('--network-intensity', intensity);
  layer.dataset.renderer = 'canvas';
  let width = 0, height = 0, paths = [];
  let frame = 0, elapsed = 0, previousTime = 0, lastDraw = -Infinity, inView = true;
  const rgba = (hex, alpha) => {
    const value = parseInt(hex.slice(1), 16);
    return `rgba(${value >> 16},${value >> 8 & 255},${value & 255},${alpha * intensity})`;
  };
  function point(controls, t) {
    const u = 1 - t;
    return {
      x: u ** 3 * controls[0][0] + 3 * u * u * t * controls[1][0] + 3 * u * t * t * controls[2][0] + t ** 3 * controls[3][0],
      y: u ** 3 * controls[0][1] + 3 * u * u * t * controls[1][1] + 3 * u * t * t * controls[2][1] + t ** 3 * controls[3][1],
    };
  }
  function makePath(controls, index, bridge = false) {
    const points = Array.from({ length: 161 }, (_, i) => point(controls, i / 160));
    const distances = [0];
    for (let i = 1; i < points.length; i++) distances.push(distances[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
    const shape = new Path2D();
    shape.moveTo(...controls[0]);
    shape.bezierCurveTo(...controls[1], ...controls[2], ...controls[3]);
    return { points, distances, length: distances.at(-1), shape, index, bridge };
  }
  function along(path, distance) {
    const target = ((distance % path.length) + path.length) % path.length;
    let low = 1, high = path.distances.length - 1;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (path.distances[middle] < target) low = middle + 1; else high = middle;
    }
    const a = path.points[low - 1], b = path.points[low];
    const fraction = (target - path.distances[low - 1]) / (path.distances[low] - path.distances[low - 1] || 1);
    return { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction, angle: Math.atan2(b.y - a.y, b.x - a.x) };
  }
  function draw() {
    const time = elapsed * speed;
    context.clearRect(0, 0, width, height);
    for (const path of paths) {
      context.lineWidth = path.bridge || path.index % 3 === 0 ? 1.15 : .85;
      context.strokeStyle = rgba(color, path.bridge ? .5 : path.index % 3 === 0 ? .46 : .26);
      context.stroke(path.shape);
      if (path.index % 2) continue;
      // Constant travel distance keeps packets moving evenly through the bends.
      const distance = time * 42 + path.index * 139;
      context.save();
      context.setLineDash([24, path.length]);
      context.lineDashOffset = -((distance % path.length + path.length) % path.length);
      context.lineWidth = 1.4;
      context.strokeStyle = rgba(signalColor, .65);
      context.stroke(path.shape);
      context.restore();
      const packet = along(path, distance + 24);
      context.save(); context.translate(packet.x, packet.y); context.rotate(packet.angle);
      context.shadowColor = signalColor; context.shadowBlur = 9;
      context.fillStyle = rgba(signalColor, .95); context.fillRect(-3, -1.5, 6, 3);
      context.restore();
    }
  }
  function resize() {
    width = layer.clientWidth; height = layer.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5, 2000 / Math.max(1, width));
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const narrow = width < 640;
    const count = narrow ? 5 : 8;
    const spacing = narrow ? 13 : 19;
    paths = [];
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < count; i++) {
        const shift = (i - (count - 1) / 2) * spacing;
        const controls = [[-.06 * width + shift, -.1 * height], [.45 * width + shift, .16 * height], [-.15 * width + shift, .54 * height], [.29 * width + shift, 1.06 * height]];
        paths.push(makePath(side ? controls.map(([x, y]) => [width - x, y]) : controls, paths.length));
      }
    }
    if (!narrow) {
      for (let i = 0; i < 4; i++) {
        paths.push(makePath([[-.05 * width, .65 * height + i * 15], [.12 * width, .07 * height + i * 15], [.65 * width, .08 * height + i * 15], [1.05 * width, .28 * height + i * 15]], paths.length, true));
      }
    }
    draw();
  }
  function animate(time) {
    frame = 0;
    if (document.hidden || reduce.matches || !speed || !inView) { previousTime = 0; return; }
    if (previousTime) elapsed += Math.min((time - previousTime) / 1000, .1);
    previousTime = time;
    if (time - lastDraw >= 1000 / 30) { draw(); lastDraw = time; }
    frame = requestAnimationFrame(animate);
  }
  function restart() {
    cancelAnimationFrame(frame); frame = 0; previousTime = 0;
    draw();
    if (!document.hidden && !reduce.matches && speed && inView) frame = requestAnimationFrame(animate);
  }
  new ResizeObserver(resize).observe(layer);
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; restart(); }).observe(layer);
  document.addEventListener('visibilitychange', restart);
  reduce.addEventListener('change', restart);
  resize(); restart();
}
