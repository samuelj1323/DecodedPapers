<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Decoded Papers</title>
</svelte:head>

<main>
	<h1>{page.status}</h1>
	<p>{page.error?.message ?? 'Something went wrong.'}</p>
	<a href="/">← Home</a>
</main>

<style>
	main {
		max-width: 720px;
		margin: 4rem auto;
		padding: 0 1rem;
		line-height: 1.6;
	}
</style>
