// Tiny, dependency-free Markdown + frontmatter parser.
// Supports: ## / ### headings, paragraphs, - and 1. lists, > quotes,
// ![images](src), ![placeholder: what goes here], [links](href), **bold**, *italic*, `code`, and ---.

export function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Wireframe box that holds a spot for an image still to come.
export function imagePlaceholder(hint = '') {
  return `<div class="img-placeholder"${hint ? ` role="img" aria-label="Image placeholder: ${escapeHtml(hint)}"` : ' aria-hidden="true"'}>
  <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 0L100 100M100 0L0 100" vector-effect="non-scaling-stroke"/></svg>
  <span class="img-placeholder-label">Image placeholder${hint ? `<small>${escapeHtml(hint)}</small>` : ''}</span>
</div>`;
}

function inline(text) {
  let s = escapeHtml(text);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) =>
    `<img src="${src}" alt="${alt}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:/.test(href);
    return `<a href="${href}"${external ? ' rel="noopener" target="_blank"' : ''}>${label}</a>`;
  });
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return s;
}

export function markdown(src = '') {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = null; // { type: 'ul'|'ol', items: [] }
  let quote = [];

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.type}>`);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
    quote = [];
  };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushAll(); continue; }
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      flushAll();
      const level = Math.min(Math.max(m[1].length, 2), 4);
      const id = level === 2 ? ` id="${m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}"` : '';
      out.push(`<h${level}${id}>${inline(m[2])}</h${level}>`);
      continue;
    }
    if (/^---+$/.test(line)) { flushAll(); out.push('<hr>'); continue; }
    if ((m = line.match(/^>\s?(.*)$/))) { flushPara(); flushList(); quote.push(m[1]); continue; }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      flushPara(); flushQuote();
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(m[1]);
      continue;
    }
    if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
      flushPara(); flushQuote();
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
      list.items.push(m[1]);
      continue;
    }
    if ((m = line.match(/^!\[placeholder:\s*([^\]]*)\]$/))) {
      flushAll();
      out.push(`<figure>${imagePlaceholder(m[1])}</figure>`);
      continue;
    }
    if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
      flushAll();
      out.push(`<figure><img src="${m[2]}" alt="${escapeHtml(m[1])}" loading="lazy">${m[1] ? `<figcaption>${escapeHtml(m[1])}</figcaption>` : ''}</figure>`);
      continue;
    }
    flushList(); flushQuote();
    para.push(line.trim());
  }
  flushAll();
  return out.join('\n');
}

// Frontmatter: simple "key: value" lines between --- fences.
// Values: "quoted", true/false, numbers, or [a, b, c] lists.
export function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let lastKey = null;
  for (const line of m[1].split('\n')) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && lastKey) {
      // Indented "- item" lines under an empty key become a list.
      if (!Array.isArray(data[lastKey])) data[lastKey] = [];
      data[lastKey].push(stripQuotes(item[1].trim()));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    lastKey = kv[1];
    data[kv[1]] = parseValue(kv[2].trim());
  }
  return { data, body: m[2] };
}

function parseValue(v) {
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (/^\[.*\]$/.test(v)) {
    return v.slice(1, -1).split(',').map((x) => x.trim()).filter(Boolean).map(stripQuotes);
  }
  return stripQuotes(v);
}

function stripQuotes(v) {
  return /^(["']).*\1$/.test(v) ? v.slice(1, -1) : v;
}
