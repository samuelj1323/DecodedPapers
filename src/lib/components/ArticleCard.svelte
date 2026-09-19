<script lang="ts">
    import type { PostListItem } from "$lib/types/types";
    import CompanyLogo from "$lib/components/CompanyLogo.svelte";
    import Pill from "./Pill.svelte";

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
            <div>
                <h2 class="articleTitle">{article.title}</h2>
                <p>{formatDate(article.date)}</p>
            </div>
        </span>
    </div>

    <p>{article.summary}</p>
    <div class="pillCotainer">
        {#each article.tags.technologies as techology}
            <Pill label={techology} />
        {/each}
        {#each article.tags.topics as topic}
            <Pill label={topic} />
        {/each}
    </div>
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
        margin-bottom: 10px;
    }
    .cardContainer .cardHeader .titleSpan {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .articleTitle {
        position: relative;
        display: inline-block;
        /* was h4 — now h2 for correct heading order (h1→h2), but keep h4 visual size via rem */
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.3;
    }
    .articleTitle::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -2px;
        width: 100%;
        height: 2px;
        background: var(--red);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.25s ease;
    }
    .cardContainer,
    .cardContainer :global(*) {
        background: transparent;
    }
    .cardContainer {
        background: var(--bg);
    }
    .cardContainer:hover {
        background: color-mix(in srgb, var(--bg) 92%, black);
    }
    .cardContainer:hover .articleTitle::after {
        transform: scaleX(1);
    }
    .cardContainer .pillCotainer {
        display: flex;
        gap: 5px;
        margin-top: 5px;
    }
</style>
