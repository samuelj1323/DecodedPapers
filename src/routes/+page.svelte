<script lang="ts">
    import type { PageData } from "./$types";

    type PageProps = {
        data: PageData;
    };

    let { data }: PageProps = $props();
</script>

<h1>Decoded Papers</h1>
{#each data.posts as post (post.slug)}
    <article>
        <h5>{post.title}</h5>
    </article>
{/each}

<style>
</style>
