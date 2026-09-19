<script lang="ts">
    import type { PageData } from "./$types";
    import ArticleCard from "$lib/components/ArticleCard.svelte";

    type PageProps = {
        data: PageData;
    };

    let { data }: PageProps = $props();
</script>

<h1>Decoded Papers</h1>
<section class="articlesContainer">
    {#each data.posts as article (article.slug)}
        <ArticleCard {article} />
    {/each}
</section>

<style>
    .articlesContainer {
        margin: 10px 20px 30px 20px;
    }
</style>
