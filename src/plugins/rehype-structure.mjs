// Estrutura o HTML de cada estudo:
// - remove o cabeçalho (h1, autoria, resumo), que é mostrado na abertura;
//   parágrafos extra do cabeçalho (ex.: notas) ficam num bloco .preface antes do 1.º capítulo;
// - agrupa cada h2 numa <section class="chapter">; se o .md já numera os h2 ("1. …"),
//   o número sai do título e passa a ser o número do capítulo;
// - envolve tabelas para rolagem horizontal;
// - converte imagens isoladas em <figure> com legenda (texto alternativo).
const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const isEl = (n, tag) => n && n.type === 'element' && (!tag || n.tagName === tag);
const NUM = /^(\d+)\.\s+/;
const firstText = (node) => (node.children || []).find((c) => c.type === 'text');

export default function rehypeStructure() {
  return (tree) => {
    const kids = tree.children;
    const firstH2 = kids.findIndex((n) => isEl(n, 'h2'));
    if (firstH2 === -1) { tree.children = kids.map(transform); return; }

    const head = kids.slice(0, firstH2).filter((n) => n.type === 'element');
    const body = kids.slice(firstH2);
    const h2s = body.filter((n) => isEl(n, 'h2'));
    const numbered = h2s.some((h) => NUM.test(firstText(h)?.value ?? ''));

    const out = [];
    // h1, autoria e resumo vão para a abertura; o resto (exceto <hr>) fica no prefácio.
    const extra = head.filter((n) => !isEl(n, 'h1') && !isEl(n, 'hr')).slice(2);
    if (extra.length) out.push(el('div', { className: ['preface'] }, extra.map(transform)));

    let current = null;
    let n = 0;
    for (const node of body) {
      if (isEl(node, 'h2')) {
        n += 1;
        let num = numbered ? '' : String(n).padStart(2, '0');
        const t = firstText(node);
        const m = t?.value.match(NUM);
        if (numbered && m) {
          num = m[1].padStart(2, '0');
          t.value = t.value.slice(m[0].length);
        }
        current = el('section', { className: ['chapter'], dataChapter: num }, []);
        out.push(current);
      }
      current.children.push(transform(node));
    }
    tree.children = out;
  };
}

function transform(node) {
  if (isEl(node, 'table')) return el('div', { className: ['table-wrap'] }, [node]);
  if (isEl(node, 'p')) {
    const real = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()));
    if (real.length === 1 && isEl(real[0], 'img')) {
      const img = real[0];
      const alt = img.properties?.alt;
      return el('figure', { className: ['figure'] }, [img, ...(alt ? [el('figcaption', {}, [{ type: 'text', value: alt }])] : [])]);
    }
  }
  if (node.children) node.children = node.children.map(transform);
  return node;
}
