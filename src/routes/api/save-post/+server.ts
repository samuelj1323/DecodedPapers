// @ts-nocheck — node-only dev endpoint, never deployed
import { dev } from '$app/environment';
import { error, json } from '@sveltejs/kit';
import { writeFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET({ url }) {
	if (!dev) throw error(404, 'Not found');
	const dir = path.resolve('src/posts');
	const slug = url.searchParams.get('slug');
	if (slug) {
		if (!/^[A-Za-z0-9-]+$/.test(slug)) throw error(400, 'bad slug');
		const file = path.join(dir, `${slug}.md`);
		if (!file.startsWith(dir)) throw error(400, 'bad slug');
		const markdown = await readFile(file, 'utf-8').catch(() => null);
		if (markdown === null) throw error(404, 'not found');
		return json({ slug, markdown });
	}
	const entries = await readdir(dir).catch(() => []);
	const slugs = entries.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
	return json({ slugs });
}

function slugify(s: string) {
	return s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 80);
}

export async function POST({ request }) {
	// Never allow writes in production — local `vite dev` only.
	if (!dev) throw error(404, 'Not found');
	// Extra safety: only allow localhost origins.
	const origin = request.headers.get('origin') ?? '';
	if (origin && !/localhost|127\.0\.0\.1/.test(origin)) {
		throw error(403, 'Refused: local only');
	}

	const body = (await request.json()) as { slug?: string; title?: string; markdown?: string };
	if (!body.markdown || !body.title) {
		throw error(400, 'title and markdown required');
	}
	// If an exact existing slug is passed (editing), keep it verbatim so we
	// update the same file — including camelCase filenames. Otherwise slugify.
	let slug: string;
	if (body.slug && /^[A-Za-z0-9-]+$/.test(body.slug)) {
		slug = body.slug.slice(0, 80);
	} else {
		slug = slugify(body.slug || body.title);
	}
	if (!slug) throw error(400, 'could not derive slug');

	const dir = path.resolve('src/posts');
	const file = path.join(dir, `${slug}.md`);

	// Prevent path traversal
	const files = await readdir(dir).catch(() => []);
	void files;
	if (!file.startsWith(dir)) throw error(400, 'bad slug');

	await writeFile(file, body.markdown, 'utf-8');
	return json({ ok: true, slug, file: `src/posts/${slug}.md` });
}
