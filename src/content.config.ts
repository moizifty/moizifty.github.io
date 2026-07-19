import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
	loader: glob({
		pattern: '**/*.md',
		base: './src/content/docs',
		// Preserve folder/file names exactly (no lowercasing or punctuation
		// stripping) so a project's folder name can match its GitHub repo
		// name exactly, e.g. `moizifty.github.io/index.md`.
		generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/\/index$/, ''),
	}),
	schema: z.object({
		title: z.string(),
		order: z.number().optional(),
	}),
});

export const collections = { docs };
