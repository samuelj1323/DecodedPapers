<script lang="ts">
    import type { PostListItem } from "$lib/types/types";
    import CompanyLogo from "$lib/components/CompanyLogo.svelte";

    type ArticleCardProps = {
        article: PostListItem;
    };
    let { article }: ArticleCardProps = $props();

    function formatDate(date: string): string {
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const yyyy = d.getUTCFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }
</script>

<a href="/posts/{article.slug}" class="cardContainer">
    <div class="cardHeader">
        <span class="titleSpan">
            {#if article.tags.companies[0]}
                <CompanyLogo company={article.tags.companies[0]} size={28} />
            {/if}
            <h4>{article.title}</h4>
        </span>
        <p>{formatDate(article.date)}</p>
    </div>

    <p>{article.summary}</p>
    <p>{JSON.stringify(article.tags.topics)}</p>
    <p>{JSON.stringify(article.tags.technologies)}</p>

    <p>{JSON.stringify(article.source)}</p>
</a>

<style>
    .cardContainer {
        display: flex;
        flex-direction: column;
        padding: var(--spacing-10);
        border-bottom: 1px solid var(--red);
        gap: var(--gap);
        transition: background 0.15s ease;
        text-decoration: none;
        color: inherit;
    }

    .cardContainer .cardHeader {
        font-family: orbitron sans-serif;
        color: var(--red);
    }
    .cardContainer .cardHeader .titleSpan {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
</style>
