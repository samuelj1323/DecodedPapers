<script lang="ts">
	import { onMount, tick } from 'svelte';

	let title = $state('My New Decoded Paper');
	let date = $state(new Date().toISOString().slice(0, 10));
	let draft = $state(true);
	let summary = $state('');
	let topics = $state('');
	let technologies = $state('');
	let companies = $state('');
	let sourceLabel = $state('');
	let sourceUrl = $state('');
	let body = $state(`One-sentence hook here. Delete this and start writing…`);
	let status = $state('');
	let ltResults = $state<{ message: string; replacements: string[] }[]>([]);
	let ltLoading = $state(false);
	let saving = $state(false);
	let dirty = $state(false);
	let existingSlugs = $state<string[]>([]);
	let selectedSlug = $state<string>('');
	let mode = $state<'write' | 'preview' | 'split'>('split');
	let showSettings = $state(false);
	let bodyEl = $state<HTMLTextAreaElement | null>(null);

	const KEY = 'decodedpapers.studio.draft.v1';

	const slug = $derived(
		title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) ||
			'untitled'
	);

	const fullMarkdown = $derived(`---
title: ${JSON.stringify(title)}
date: ${JSON.stringify(date)}
draft: ${draft ? 'true' : 'false'}
summary: ${JSON.stringify(summary)}
tags:
  topics: ${JSON.stringify(topics.split(',').map((s) => s.trim()).filter(Boolean))}
  technologies: ${JSON.stringify(technologies.split(',').map((s) => s.trim()).filter(Boolean))}
  companies: ${JSON.stringify(companies.split(',').map((s) => s.trim()).filter(Boolean))}
source:
  label: ${JSON.stringify(sourceLabel)}
  url: ${JSON.stringify(sourceUrl)}
---

${body}`);

	const words = $derived(body.trim() ? body.trim().split(/\s+/).length : 0);
	const minutes = $derived(Math.max(1, Math.round(words / 200)));
	const previewHtml = $derived(renderPreview(body));

	function escapeHtml(s: string) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function renderPreview(md: string): string {
		let html = escapeHtml(md);
		html = html
			.replace(/^### (.*)$/gm, '<h3>$1</h3>')
			.replace(/^## (.*)$/gm, '<h2>$1</h2>')
			.replace(/^# (.*)$/gm, '<h1>$1</h1>')
			.replace(/^&gt; (.*)$/gm, '<blockquote>$1</blockquote>')
			.replace(/^---$/gm, '<hr/>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/(^|\W)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '$1<em>$2</em>')
			.replace(/`(.+?)`/g, '<code>$1</code>')
			.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2"/>')
			.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
			.replace(/^\d+\. (.*)$/gm, '<li class="ol">$1</li>')
			.replace(/^- (.*)$/gm, '<li>$1</li>')
			.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
		const paras = html.split(/\n{2,}/).map((chunk) => {
			const t = chunk.trim();
			if (!t) return '';
			if (/^<(h1|h2|h3|ul|blockquote|hr)/.test(t)) return chunk;
			return `<p>${t.replace(/\n/g, '<br/>')}</p>`;
		});
		return paras.join('\n');
	}

	/** Insert markdown around the textarea selection (toolbar). */
	async function format(before: string, after = '', placeholder = 'text', linePrefix = '') {
		const el = bodyEl;
		if (!el) return;
		const { selectionStart: s, selectionEnd: e, value } = el;
		const sel = value.slice(s, e) || placeholder;
		let insert: string;
		if (linePrefix) {
			const lineStart = value.lastIndexOf('\n', s - 1) + 1;
			const lineEnd = value.indexOf('\n', e);
			const end = lineEnd === -1 ? value.length : lineEnd;
			const lines = value.slice(lineStart, end).split('\n');
			const prefixed = lines.map((l) => (l.startsWith(linePrefix) ? l.slice(linePrefix.length) : linePrefix + l)).join('\n');
			body = value.slice(0, lineStart) + prefixed + value.slice(end);
			dirty = true;
			await tick();
			el.focus();
			return;
		}
		insert = before + sel + after;
		body = value.slice(0, s) + insert + value.slice(e);
		dirty = true;
		await tick();
		el.focus();
		el.setSelectionRange(s + before.length, s + before.length + sel.length);
	}

	function markDirty() { dirty = true; }

	onMount(() => {
		fetch('/api/save-post').then((r) => r.json()).then((d) => { existingSlugs = d.slugs ?? []; }).catch(() => {});
		try {
			const raw = localStorage.getItem(KEY);
			if (raw) {
				const d = JSON.parse(raw);
				title = d.title ?? title;
				body = d.body ?? body;
				draft = d.draft ?? draft;
				summary = d.summary ?? summary;
				topics = d.topics ?? topics;
				technologies = d.technologies ?? technologies;
				companies = d.companies ?? companies;
				sourceLabel = d.sourceLabel ?? sourceLabel;
				sourceUrl = d.sourceUrl ?? sourceUrl;
				date = d.date ?? date;
			}
		} catch { /* ignore */ }
		$effect.root(() => {
			$effect(() => {
				const snapshot = { title, date, draft, summary, topics, technologies, companies, sourceLabel, sourceUrl, body };
				void snapshot;
				localStorage.setItem(KEY, JSON.stringify(snapshot));
			});
		});
	});

	async function checkGrammar() {
		ltLoading = true;
		ltResults = [];
		status = 'Checking grammar…';
		try {
			const res = await fetch('https://api.languagetool.org/v2/check', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ text: `${title}\n\n${summary}\n\n${body}`, language: 'en-US' })
			});
			const data = await res.json();
			ltResults = (data.matches ?? []).slice(0, 25).map((m: any) => ({
				message: m.message,
				replacements: (m.replacements ?? []).slice(0, 3).map((r: any) => r.value)
			}));
			status = ltResults.length ? `${ltResults.length} suggestion(s)` : 'Looks clean ✓';
		} catch {
			status = 'Grammar check failed (offline?). Browser spellcheck still works.';
		} finally {
			ltLoading = false;
		}
	}

	async function saveLocal() {
		saving = true;
		status = 'Publishing…';
		try {
			const res = await fetch('/api/save-post', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug: selectedSlug || slug, title, markdown: fullMarkdown })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? 'save failed');
			if (!existingSlugs.includes(data.slug)) existingSlugs = [...existingSlugs, data.slug];
			selectedSlug = data.slug;
			dirty = false;
			status = `Saved → ${data.file} ✓`;
		} catch (e) {
			status = `Save failed: ${e instanceof Error ? e.message : e}. Use Download instead.`;
		} finally {
			saving = false;
		}
	}

	function download() {
		const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `${slug}.md`;
		a.click();
		URL.revokeObjectURL(a.href);
		status = `Downloaded ${slug}.md → move it into src/posts/`;
	}

	function parseFrontmatter(md: string) {
		const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
		if (!m) { body = md; return; }
		const fm = m[1], rest = m[2];
		const get = (key: string) => m[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim().replace(/^"|"$/g, '') ?? '';
		const listAfter = (key: string) => {
			const mm = fm.match(new RegExp(`^\\s*${key}:\\s*(.*)$`, 'm'));
			if (!mm) return '';
			try {
				const arr = JSON.parse(mm[1].replace(/'/g, '"'));
				return Array.isArray(arr) ? arr.join(', ') : mm[1];
			} catch { return mm[1].replace(/[\[\]"]/g, ''); }
		};
		title = get('title') || title;
		date = get('date') || date;
		draft = /^\s*draft:\s*true/m.test(fm);
		summary = get('summary') || '';
		topics = listAfter('topics');
		technologies = listAfter('technologies');
		companies = listAfter('companies');
		const label = fm.match(/^\s*label:\s*(.*)$/m)?.[1]?.trim().replace(/^"|"$/g, '') ?? '';
		const surl = fm.match(/^\s*url:\s*(.*)$/m)?.[1]?.trim().replace(/^"|"$/g, '') ?? '';
		sourceLabel = label; sourceUrl = surl;
		body = rest.trimStart();
	}

	async function loadPost(s: string) {
		selectedSlug = s;
		if (!s) return;
		status = `Loading ${s}…`;
		try {
			const res = await fetch(`/api/save-post?slug=${encodeURIComponent(s)}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.message ?? 'load failed');
			parseFrontmatter(data.markdown);
			dirty = false;
			status = `Loaded ${s} ✓ — saving updates that file.`;
		} catch (e) {
			status = `Load failed: ${e instanceof Error ? e.message : e}`;
		}
	}

	function newPost() {
		selectedSlug = '';
		title = '';
		date = new Date().toISOString().slice(0, 10);
		draft = true;
		summary = '';
		topics = '';
		technologies = '';
		companies = '';
		sourceLabel = '';
		sourceUrl = '';
		body = '';
		ltResults = [];
		dirty = false;
		status = 'New story — publishing creates a file from the title.';
	}
</script>

<svelte:head>
	<title>Studio (local only) — Decoded Papers</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<!-- top bar, Medium-style -->
<div class="topbar">
	<div class="topbar-inner">
		<span class="brand">Decoded Papers <em>studio</em></span>
		<span class="draft-state">{saving ? 'Saving…' : dirty ? 'Draft · unsaved changes' : selectedSlug ? 'Draft · saved' : 'Draft · new story'}</span>
		<div class="topbar-actions">
			<select class="story-pick" value={selectedSlug} onchange={(e) => e.currentTarget.value ? loadPost(e.currentTarget.value) : newPost()} aria-label="Open story">
				<option value="">New story…</option>
				{#each existingSlugs as s}
					<option value={s} selected={s === selectedSlug}>{s}</option>
				{/each}
			</select>
			<div class="seg" role="tablist" aria-label="View">
				<button class:active={mode === 'write'} onclick={() => (mode = 'write')}>Write</button>
				<button class:active={mode === 'split'} onclick={() => (mode = 'split')}>Split</button>
				<button class:active={mode === 'preview'} onclick={() => (mode = 'preview')}>Preview</button>
			</div>
			<button class="publish" onclick={saveLocal} disabled={saving}>{saving ? 'Publishing…' : 'Publish'}</button>
		</div>
	</div>
</div>

{#if status}<p class="statusline" role="status">{status}</p>{/if}

<main class="canvas" class:split={mode === 'split'}>
	<!-- editor column -->
	{#if mode !== 'preview'}
		<div class="col editor-col">
			<input
				class="m-title"
				bind:value={title}
				oninput={markDirty}
				spellcheck="true"
				placeholder="Title"
				aria-label="Title"
			/>
			<input
				class="m-sub"
				bind:value={summary}
				oninput={markDirty}
				spellcheck="true"
				placeholder="Subtitle — one line that pulls the reader in…"
				aria-label="Subtitle"
			/>
			<div class="meta-row">
				<span>{words} words · ~{minutes} min</span>
				<span aria-hidden="true">·</span>
				<span>{date}</span>
				<button class="textbtn" onclick={() => (showSettings = !showSettings)}>
					{showSettings ? 'Hide story settings' : 'Story settings'}
				</button>
			</div>

			{#if showSettings}
				<div class="settings">
					<label class="draft-toggle"><input type="checkbox" bind:checked={draft} oninput={markDirty} /> Draft — hidden from the home page until unchecked</label>
					<div class="row">
						<label>Date<input type="date" bind:value={date} oninput={markDirty} /></label>
						<label>Topics<input bind:value={topics} oninput={markDirty} placeholder="video streaming, distributed systems" spellcheck="true" /></label>
					</div>
					<div class="row">
						<label>Technologies<input bind:value={technologies} oninput={markDirty} placeholder="AV1, Open Connect" spellcheck="true" /></label>
						<label>Companies<input bind:value={companies} oninput={markDirty} placeholder="Netflix" spellcheck="true" /></label>
					</div>
					<div class="row">
						<label>Source label<input bind:value={sourceLabel} oninput={markDirty} placeholder="Netflix Tech Blog — …" spellcheck="true" /></label>
						<label>Source URL<input bind:value={sourceUrl} oninput={markDirty} placeholder="https://" inputmode="url" /></label>
					</div>
					<div class="settings-actions">
						<button class="textbtn" onclick={checkGrammar} disabled={ltLoading}>{ltLoading ? 'Checking…' : 'Check grammar'}</button>
						<button class="textbtn" onclick={download}>Download .md</button>
						{#if selectedSlug}<button class="textbtn" onclick={newPost}>Start new story</button>{/if}
					</div>
					{#if ltResults.length}
						<ul class="lt">
							{#each ltResults as r}
								<li><strong>{r.message}</strong>{#if r.replacements.length}<span> → try: {r.replacements.join(', ')}</span>{/if}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			<!-- inline formatting toolbar -->
			<div class="fmt" role="toolbar" aria-label="Formatting">
				<button title="Heading" onclick={() => format('', '', '', '## ')}>H</button>
				<button title="Bold" onclick={() => format('**', '**', 'bold')}><strong>B</strong></button>
				<button title="Italic" onclick={() => format('*', '*', 'italic')}><em>i</em></button>
				<button title="Quote" onclick={() => format('', '', '', '> ')}>❝</button>
				<button title="Code" onclick={() => format('`', '`', 'code')}>&lt;&gt;</button>
				<button title="Bullet list" onclick={() => format('', '', '', '- ')}>•—</button>
				<button title="Numbered list" onclick={() => format('', '', '', '1. ')}>1.</button>
				<button title="Link" onclick={() => format('[', '](https://)', 'link text')}>🔗</button>
			</div>

			<textarea
				class="m-body"
				bind:this={bodyEl}
				bind:value={body}
				oninput={markDirty}
				spellcheck="true"
				autocapitalize="sentences"
				wrap="soft"
				lang="en-US"
				placeholder="Tell your story…"
				aria-label="Story body"
			></textarea>
		</div>
	{/if}

	<!-- preview column -->
	{#if mode !== 'write'}
		<div class="col preview-col">
			<article class="prose">
				{#if companies}<p class="prose-kicker">{companies}</p>{/if}
				<h1>{title || 'Untitled'}</h1>
				{#if summary}<p class="standfirst">{summary}</p>{/if}
				<p class="byline">{date} · ~{minutes} min read</p>
				<hr />
				{@html previewHtml}
			</article>
		</div>
	{/if}
</main>

<style>
	:global(body) { background: #fff; }
	.topbar {
		position: sticky;
		top: 0;
		z-index: 10;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid #e6e2dc;
	}
	.topbar-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0.6rem 1.25rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		background: transparent;
	}
	.brand { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; font-size: 1.05rem; white-space: nowrap; }
	.brand em { font-style: normal; font-weight: 400; opacity: 0.5; font-size: 0.9rem; }
	.draft-state { font-size: 0.82rem; opacity: 0.55; white-space: nowrap; }
	.topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 0.6rem; background: transparent; }
	.story-pick {
		font-size: 0.82rem;
		border: 1px solid #e6e2dc;
		border-radius: 999px;
		padding: 0.35rem 0.7rem;
		background: #fff;
		max-width: 190px;
	}
	.seg { display: flex; border: 1px solid #e6e2dc; border-radius: 999px; overflow: hidden; }
	.seg button { border: none; background: #fff; font-size: 0.8rem; padding: 0.4rem 0.8rem; cursor: pointer; opacity: 0.6; }
	.seg button.active { background: #1a1a1a; color: #fff; opacity: 1; }
	.publish {
		background: #1a8917;
		color: #fff;
		border: none;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.45rem 1.1rem;
		cursor: pointer;
	}
	.publish:hover { background: #157a14; }
	.publish:disabled { opacity: 0.6; cursor: wait; }

	.statusline {
		max-width: 680px;
		margin: 0.6rem auto 0;
		padding: 0 1.25rem;
		font-size: 0.82rem;
		opacity: 0.65;
	}

	.canvas { max-width: 1280px; margin: 0 auto; padding: 2.5rem 1.25rem 6rem; background: #fff; }
	.canvas.split { display: grid; grid-template-columns: minmax(0, 680px) minmax(0, 1fr); gap: 3rem; justify-content: center; }
	.canvas:not(.split) { display: flex; justify-content: center; }
	.canvas:not(.split) .col { width: 100%; max-width: 680px; }
	@media (max-width: 1000px) { .canvas.split { grid-template-columns: 1fr; } }

	.col { min-width: 0; background: #fff; }

	.m-title, .m-sub, .m-body { background: #fff; border: none; outline: none; width: 100%; padding: 0; }
	.m-title {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(2rem, 5vw, 2.9rem);
		line-height: 1.15;
		font-weight: 700;
		margin: 0 0 0.4rem;
		color: #111;
	}
	.m-title::placeholder, .m-sub::placeholder, .m-body::placeholder { color: #b3b3b1; }
	.m-sub { font-size: 1.25rem; line-height: 1.5; color: #6e6e6e; margin: 0 0 0.9rem; font-family: Georgia, serif; }
	.meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #6e6e6e; margin-bottom: 0.5rem; flex-wrap: wrap; }
	.textbtn { background: none; border: none; color: #1a8917; font-size: 0.82rem; cursor: pointer; padding: 0; }
	.textbtn:hover { text-decoration: underline; }
	.textbtn:disabled { opacity: 0.55; }

	.settings { border-top: 1px solid #e6e2dc; border-bottom: 1px solid #e6e2dc; padding: 0.75rem 0; margin-bottom: 0.5rem; background: #fff; }
	.settings .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
	@media (max-width: 560px) { .settings .row { grid-template-columns: 1fr; } }
	.settings label { display: grid; gap: 0.25rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6e6e6e; margin: 0.4rem 0; }
	.settings input { border: 1px solid #e6e2dc; border-radius: 8px; padding: 0.5rem 0.65rem; font-size: 0.9rem; background: #fff; }
	.settings input:focus { outline: 2px solid rgba(26, 137, 23, 0.25); border-color: #1a8917; }
	.draft-toggle { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; text-transform: none; letter-spacing: normal; color: #242424; background: #f7f5f1; border: 1px dashed #d8d2c8; border-radius: 8px; padding: 0.55rem 0.7rem; margin: 0.4rem 0 0.6rem; cursor: pointer; }
	.draft-toggle input { width: 1rem; height: 1rem; accent-color: #b91f05; }
	.settings-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
	.lt { margin: 0.6rem 0 0; padding: 0; list-style: none; font-size: 0.85rem; }
	.lt li { padding: 0.4rem 0; border-top: 1px solid #f0ede8; }

	.fmt {
		position: sticky;
		top: 57px;
		z-index: 5;
		display: flex;
		gap: 0.15rem;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid #e6e2dc;
		border-radius: 999px;
		padding: 0.25rem 0.5rem;
		margin: 0.75rem 0;
		width: fit-content;
		box-shadow: 0 4px 14px -8px rgba(0, 0, 0, 0.25);
	}
	.fmt button { border: none; background: none; font-size: 0.85rem; min-width: 2rem; height: 2rem; border-radius: 50%; cursor: pointer; color: #333; }
	.fmt button:hover { background: #f2f0eb; }

	.m-body {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.22rem;
		line-height: 1.8;
		color: #242424;
		min-height: 60vh;
		resize: none;
		overflow: hidden;
	}
	.m-body { field-sizing: content; }

	.preview-col { border-left: 1px solid #e6e2dc; padding-left: 3rem; }
	@media (max-width: 1000px) { .preview-col { border-left: none; padding-left: 0; border-top: 1px solid #e6e2dc; padding-top: 2rem; } }
	.prose { font-family: Georgia, serif; font-size: 1.18rem; line-height: 1.8; color: #242424; background: #fff; }
	.prose-kicker { font-family: -apple-system, sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #1a8917; margin: 0 0 0.5rem; }
	.prose h1 { font-size: clamp(1.8rem, 4vw, 2.5rem); line-height: 1.2; margin: 0 0 0.6rem; color: #111; }
	.standfirst { font-size: 1.25rem; line-height: 1.55; color: #6e6e6e; margin: 0 0 0.75rem; }
	.byline { font-family: -apple-system, sans-serif; font-size: 0.82rem; color: #6e6e6e; margin: 0; }
	.prose hr { border: none; border-top: 1px solid #e6e2dc; margin: 1.5rem 0; }
	.prose :global(h2) { font-size: 1.6rem; margin: 1.8em 0 0.4em; color: #111; line-height: 1.3; }
	.prose :global(h3) { font-size: 1.3rem; margin: 1.6em 0 0.4em; color: #111; }
	.prose :global(p) { margin: 1em 0; }
	.prose :global(blockquote) { border-left: 3px solid #111; padding-left: 1rem; margin: 1.5em 0; font-style: italic; }
	.prose :global(code) { font-family: ui-monospace, monospace; font-size: 0.82em; background: #f2f0eb; padding: 0.15em 0.4em; border-radius: 4px; }
	.prose :global(a) { color: inherit; text-decoration: underline; text-decoration-color: #1a8917; }
	.prose :global(ul) { padding-left: 1.4rem; }
	.prose :global(li) { margin: 0.4em 0; }
	.prose :global(img) { max-width: 100%; border-radius: 4px; }
</style>
