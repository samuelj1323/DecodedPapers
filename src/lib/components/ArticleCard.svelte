<script lang="ts">
    import type { PostListItem } from "$lib/types/types";

    type ArticleCardProps = {
        article: PostListItem;
    };
    let { article }: ArticleCardProps = $props();
</script>

<a href="/posts/{article.slug}" class="cardContainer">
    <h4>{article.title}</h4>
    <p>{article.date}</p>
    <p>{article.summary}</p>
    <p>{JSON.stringify(article.tags)}</p>
    <p>{JSON.stringify(article.source)}</p>
</a>

<style>
    .cardContainer {
        display: flex;
        flex-direction: column;
        padding: var(--spacing-10);
        border-bottom: 1px solid var(--red);
        transition: background 0.15s ease;
        text-decoration: none;
        color: inherit;
    }
    .cardContainer:hover {
        background: var(--muted, #f5f5f5);
        cursor: pointer;
    }
</style>
