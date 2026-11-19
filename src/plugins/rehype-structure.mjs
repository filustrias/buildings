// Estrutura o HTML do estudo:
// - remove o cabeçalho (h1, autoria, resumo), que é mostrado no hero;
// - agrupa cada h2 numa <section class="chapter">;
// - envolve tabelas para rolagem horizontal;
// - converte imagens isoladas em <figure> com legenda (texto alternativo).
const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const isEl = (n, tag) => n && n.type === 'element' && (!tag || n.tagName === tag);

export default function rehypeStructure() {
  return (tree) => {
    const kids = tree.children;
    const firstH2 = kids.findIndex((n) => isEl(n, 'h2'));
    const head = firstH2 === -1 ? kids : kids.slice(0, firstH2);
    const body = firstH2 === -1 ? [] : kids.slice(firstH2);

    const out = [];
    let current = null;
    let n = 0;
    for (const node of body) {
      if (isEl(node, 'h2')) {
        n += 1;
        current = el('section', { className: ['chapter'], dataChapter: String(n).padStart(2, '0') }, []);
        out.push(current);
      }
      current.children.push(transform(node));
    }
    tree.children = out.length ? out : head.map(transform);
  };
}

function transform(node) {
  if (isEl(node, 'table')) {
    return el('div', { className: ['table-wrap'] }, [node]);
  }
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
