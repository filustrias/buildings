import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const estudos = defineCollection({
  loader: glob({ pattern: 'estrutura_fisica_unidades_CSP_estudo_comparativo.md', base: '.' }),
});

export const collections = { estudos };
