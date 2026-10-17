import fs from 'node:fs';

// The mark consists only of outlined >, ! and < characters, arranged as a B.
// Outlined glyphs keep the SVG independent of installed fonts.
const full = [
  '11111111111000',
  '11111111111110',
  '11110000001111',
  '11110000000111',
  '11110000000111',
  '11110000000111',
  '11110000001111',
  '11111111111110',
  '11111111111100',
  '11111111111110',
  '11110000001111',
  '11110000000111',
  '11110000000111',
  '11110000000111',
  '11110000001111',
  '11111111111110',
  '11111111111000',
];
const compact = [
  '1111100',
  '1100110',
  '1100011',
  '1100110',
  '1111110',
  '1100011',
  '1100011',
  '1100110',
  '1111100',
];
const characters = ['>', '!', '<'];
const glyph = (x, y) => (x * 5 + y * 7) % characters.length;

function makeSvg(grid, { tile = false, small = false } = {}) {
  const cell = small ? 25 : 12;
  const left = (256 - grid[0].length * cell) / 2;
  const top = (256 - grid.length * cell) / 2;
  const symbols = [];
  grid.forEach((row, y) => [...row].forEach((filled, x) => {
    if (filled !== '1') return;
    const color = small ? '#64c994' : ((x + y) % 5 === 0 ? '#37b979' : '#097441');
    symbols.push(`<use href="#glyph-${glyph(x, y)}" x="${left + x * cell}" y="${top + y * cell}" width="${cell}" height="${cell}" stroke="${color}"/>`);
  }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="brand-title brand-description">
<title id="brand-title">BeriContraster ASCII B</title>
<desc id="brand-description">An uppercase B made entirely from greater-than, exclamation, and less-than characters.</desc>
<defs>
<symbol id="glyph-0" viewBox="0 0 12 12"><path d="m3 2 6 4-6 4"/></symbol>
<symbol id="glyph-1" viewBox="0 0 12 12"><path d="M6 1.5v5.3M6 10v.1"/></symbol>
<symbol id="glyph-2" viewBox="0 0 12 12"><path d="m9 2-6 4 6 4"/></symbol>
</defs>
${tile ? '<rect width="256" height="256" rx="40" fill="#080809"/>' : ''}
<g fill="none" stroke-width="${small ? 2.3 : 1.6}" stroke-linecap="round" stroke-linejoin="round">
${symbols.join('\n')}
</g>
</svg>\n`;
}

fs.mkdirSync('public/assets/brand', { recursive: true });
fs.writeFileSync('public/assets/brand/bericontraster-ascii-b.svg', makeSvg(full));
fs.writeFileSync('public/assets/brand/bericontraster-ascii-b-icon.svg', makeSvg(compact, { small: true }));
fs.writeFileSync('public/assets/brand/favicon-ascii-b.svg', makeSvg(compact, { small: true, tile: true }));
fs.writeFileSync('public/assets/brand/bericontraster-ascii-b.txt', full.map((row, y) => [...row].map((filled, x) => filled === '1' ? characters[glyph(x, y)] : ' ').join('').trimEnd()).join('\n') + '\n');
console.log('Created ASCII B logo, compact mark, favicon SVG, and plain-text artwork.');
