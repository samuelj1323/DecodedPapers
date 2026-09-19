<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.metadata.title ?? data.name} — Decoded Papers</title>
	<meta name="description" content={data.metadata.summary ?? ''} />
</svelte:head>

<article>
	<header>
		<h1>{data.metadata.title}</h1>
		{#if data.metadata.date}
			<time>{String(data.metadata.date).slice(0, 10)}</time>
		{/if}
		{#if data.metadata.summary}
			<p><em>{data.metadata.summary}</em></p>
		{/if}
		{#if data.metadata.tags}
			<ul>
				{#each Object.entries(data.metadata.tags) as [group, values]}
					<li><strong>{group}:</strong> {values.join(', ')}</li>
				{/each}
			</ul>
		{/if}
	</header>

	<hr />

	<!-- mdsvex-compiled markdown component -->
	<data.component />
</article>

<style>
	article {
		max-width: 720px;
		margin: 2rem auto;
		line-height: 1.6;
	}
</style>
