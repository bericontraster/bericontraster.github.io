import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function createContent(kind, title, { root = process.cwd(), today = new Date().toISOString().slice(0, 10) } = {}) {
  if (!['post', 'project'].includes(kind) || !title?.trim()) throw new Error('Usage: npm run new:post -- "Your article title" (or new:project)');
  const slug = title.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) throw new Error('Include at least one English letter or number in the title.');
  const folder = kind === 'post' ? 'posts' : 'projects';
  const target = path.join(root, 'content', folder, slug + '.md');
  const template = fs.readFileSync(path.join(root, 'content', folder, '_template.md'), 'utf8');
  const source = template.replace('title: "Your title"', () => 'title: ' + JSON.stringify(title.trim())).replace('slug: "your-slug"', () => 'slug: ' + JSON.stringify(slug)).replace('date: "2026-01-01"', () => 'date: ' + JSON.stringify(today));
  fs.writeFileSync(target, source, { flag: 'wx' });
  return target;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log('Created draft: ' + createContent(process.argv[2], process.argv.slice(3).join(' '))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
