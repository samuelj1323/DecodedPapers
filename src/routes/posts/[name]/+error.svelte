<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Decoded Papers</title>
</svelte:head>

<main>
	<h1>{page.status}: {page.error?.message ?? 'Something went wrong'}</h1>

	{#if page.status === 404}
		<p>The page you're looking for doesn't exist.</p>
		<p>
			That post might have been moved, renamed, or never existed.
			Try browsing all posts or head back home.
		</p>
	{:else}
		<p>An unexpected error occurred. Please try again.</p>
		{#if page.error?.message}
			<pre>{page.error.message}</pre>
		{/if}
	{/if}

	<nav>
		<a href="/">← Home</a>
		<a href="/posts/understandingCloudflaresWorkerArchitecture">Example post</a>
	</nav>
</main>

<style>
	main {
		max-width: 720px;
		margin: 4rem auto;
		padding: 0 1rem;
		line-height: 1.6;
	}
	pre {
		background: #f4f4f4;
		padding: 1rem;
		overflow-x: auto;
		border-radius: 6px;
	}
	nav {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}
	a {
		text-decoration: underline;
	}
</style>
