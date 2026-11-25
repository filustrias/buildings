import { getCollection, type CollectionEntry } from 'astro:content';
import { STUDY_FILES } from '../content.config';

export const NUMBERED_H2 = /^(\d+)\.\s+/;

/** Estudos na ordem de STUDY_FILES. */
export async function getStudies() {
  const all = await getCollection('estudos');
  const order = (e: CollectionEntry<'estudos'>) => STUDY_FILES.findIndex((f) => e.filePath?.endsWith(f));
  return all.sort((a, b) => order(a) - order(b));
}

/** Cabeçalho do .md: "# Título", linha de autoria e resumo (antes do primeiro "## "). */
export function studyHeader(body = '') {
  const headBlock = body.split(/\n## /)[0];
  const paras = headBlock.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const title = (paras.find((p) => p.startsWith('# ')) ?? '# ').slice(2).trim();
  const rest = paras.filter((p) => !p.startsWith('# ') && !/^(-{3,}|\*{3,})$/.test(p));
  const [titleMain, titleSub] = title.split(/:\s*/);
  return { title, titleMain, titleSub, byline: rest[0] ?? '', lead: rest[1] ?? '' };
}

/** Números de capítulo: os do .md, se os títulos já forem numerados; senão 01, 02… */
export function chapterNumbers(body = '') {
  const h2 = body.split('\n').filter((l) => /^## /.test(l)).map((l) => l.slice(3).trim());
  const numbered = h2.some((t) => NUMBERED_H2.test(t));
  return h2.map((t, i) => {
    if (!numbered) return String(i + 1).padStart(2, '0');
    const m = t.match(NUMBERED_H2);
    return m ? m[1].padStart(2, '0') : '';
  });
}

/** Markdown inline mínimo (negrito, itálico, código) para textos do cabeçalho. */
export function inlineMd(s = '', { links = true } = {}) {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => (links ? `<a href="${u}">${t}</a>` : t))
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}
