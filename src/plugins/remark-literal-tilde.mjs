import { visit, SKIP } from 'unist-util-visit';

// Mantém "~~" como texto literal em vez de riscado (o .md usa "~" como "aproximadamente").
export default function remarkLiteralTilde() {
  return (tree) => {
    visit(tree, 'delete', (node, index, parent) => {
      if (!parent || index == null) return;
      parent.children.splice(index, 1, { type: 'text', value: '~~' }, ...node.children, { type: 'text', value: '~~' });
      return [SKIP, index];
    });
  };
}
