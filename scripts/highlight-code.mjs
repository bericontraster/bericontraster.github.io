import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Prism = require('./vendor/prism/core.cjs');
require('./vendor/prism/clike.cjs');
require('./vendor/prism/c.cjs');
require('./vendor/prism/nasm.cjs');
require('./vendor/prism/bash.cjs');
require('./vendor/prism/shell-session.cjs');
require('./vendor/prism/http.cjs');

const decode = value => value.replace(/&(?:amp|lt|gt|quot|apos);|&#(?:x[0-9a-f]+|\d+);/gi, entity => {
  const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const number = entity.slice(2, -1);
  return String.fromCodePoint(number[0].toLowerCase() === 'x' ? parseInt(number.slice(1), 16) : parseInt(number, 10));
});

// Highlight only explicitly labelled block code. Preserve whitespace and inline code.
export function highlightCodeBlocks(html) {
  return html.replace(/(<pre\b[^>]*>\s*<code\b[^>]*class="[^"]*\blanguage-([\w-]+)\b[^"]*"[^>]*>)([\s\S]*?)(<\/code>\s*<\/pre>)/g, (block, open, language, code, close) => {
    const grammar = Prism.languages[language];
    if (!grammar) return block;
    return open + Prism.highlight(decode(code), grammar, language) + close;
  });
}
