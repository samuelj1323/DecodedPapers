<script lang="ts">
    import type { PageData } from "./$types";
    import ArticleCard from "$lib/components/ArticleCard.svelte";

    type PageProps = {
        data: PageData;
    };

    let { data }: PageProps = $props();
</script>

<h1>Decoded Papers</h1>
{#each data.posts as article (article.slug)}
    <ArticleCard {article} />
{/each}
