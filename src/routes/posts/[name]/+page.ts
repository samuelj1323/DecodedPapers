import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

type PostMetadata = {
	title: string;
	date: string;
	summary: string;
	tags: { topics: string[]; technologies: string[]; companies: string[] };
	source: { label: string; url: string };
};

export const load: PageLoad = async ({ params }) => {
	const { name } = params;

	// mdsvex compiles .md in src/posts to Svelte components with `metadata`
	const modules = import.meta.glob('/src/posts/*.md', { eager: true });

	// support /posts/understandingCloudflaresWorkerArchitecture -> understandingCloudflaresWorkerArchitecture.md
	const path = `/src/posts/${name}.md`;
	const mod = modules[path] as { default: import('svelte').Component; metadata: PostMetadata } | undefined;

	if (!mod) {
		throw error(404, `Post "${name}" not found`);
	}

	return {
		name,
		component: mod.default,
		metadata: mod.metadata
	};
};
