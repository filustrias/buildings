import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada estudo é um .md na raiz do projeto. Para publicar um novo, acrescentar o nome do ficheiro aqui.
export const STUDY_FILES = [
  'estrutura_fisica_unidades_CSP_estudo_comparativo.md',
  'ventilação.md',
  'sanitation.md',
];

const toSlug = (entry: string) =>
  entry
    .replace(/\.md$/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const estudos = defineCollection({
  loader: glob({ pattern: STUDY_FILES, base: '.', generateId: ({ entry }) => toSlug(entry) }),
});

export const collections = { estudos };
