import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve('dist');
const watch = process.argv.includes('--watch');
const drafts = process.argv.includes('--drafts');
const port = Number(process.env.PORT || 3000);
const clients = new Set();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
const reload = '<script>const events=new EventSource("/__dev/events");events.onmessage=()=>location.reload();</script>';
function build() {
  const result = spawnSync(process.execPath, ['scripts/build.mjs', ...(drafts ? ['--drafts'] : [])], { stdio: 'inherit' });
  if (result.status !== 0) { console.error('Build failed. Fix the content error and save again.'); return false; }
  for (const client of clients) client.write('data: reload\n\n');
  return true;
}
if (watch && !build() && !fs.existsSync(root)) process.exit(1);
if (!fs.existsSync(root)) { console.error('Run npm run build first, or npm run dev for a live preview.'); process.exit(1); }

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (watch && pathname === '/__dev/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    res.write(': connected\n\n'); clients.add(res);
    req.on('close', () => clients.delete(res)); return;
  }
  const requested = path.resolve(root, '.' + pathname);
  if (!requested.startsWith(root + path.sep) && requested !== root) { res.writeHead(403).end(); return; }
  try {
    const file = fs.statSync(requested).isDirectory() ? path.join(requested, 'index.html') : requested;
    const isHtml = path.extname(file) === '.html';
    let body = fs.readFileSync(file);
    if (watch && isHtml) body = body.toString('utf8').replace('</body>', reload + '</body>');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', ...(drafts && isHtml ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}) });
    res.end(body);
  } catch {
    const errorPage = fs.readFileSync(path.join(root, '404.html'));
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).end(errorPage);
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Portfolio: http://localhost:${port}${drafts ? ' (includes draft previews)' : ''}`));

const watchers = [];
let timer;
if (watch) {
  for (const folder of ['content', 'src', 'public', 'scripts']) {
    watchers.push(fs.watch(folder, { recursive: true }, () => {
      clearTimeout(timer); timer = setTimeout(build, 200);
    }));
  }
}
function stop() {
  clearTimeout(timer);
  watchers.forEach(watcher => watcher.close());
  clients.forEach(client => client.end());
  server.close();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
