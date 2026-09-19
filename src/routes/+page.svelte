<script lang="ts">
    import type { PageData } from "./$types";
    import ArticleCard from "$lib/components/ArticleCard.svelte";

    type PageProps = {
        data: PageData;
    };

    let { data }: PageProps = $props();
</script>

<svelte:head>
    <title>Decoded Papers — Engineering Papers, Decoded</title>
    <meta name="description" content="Decoded Papers — deep dives decoding influential engineering papers." />
</svelte:head>

<div class="heroSection">
    <div class="patternStage" aria-hidden="true">
        <!-- layer 1: grid / dots / diagonal morph -->
        <div class="pattern layer1"></div>
        <!-- layer 2: offset, different timing, bg color -->
        <div class="pattern layer2"></div>
        <!-- layer 3: fine accent -->
        <div class="pattern layer3"></div>
        <div class="vignette"></div>
    </div>
    <h1>Decoded Papers</h1>
</div>

<section class="articlesContainer">
    {#each data.posts as article (article.slug)}
        <ArticleCard {article} />
    {/each}
</section>

<style>
    .heroSection {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 40vh;
        font-size: 3rem;
        overflow: hidden;
        isolation: isolate;
        background: transparent; /* override * { background: var(--bg) } which would hide patterns */
    }
    .heroSection h1 {
        position: relative;
        z-index: 2;
        text-align: center;
        text-wrap: balance;
        overflow-wrap: break-word;
        max-width: 100%;
        padding-inline: 1rem;
        line-height: 1.05;
        font-size: clamp(2rem, 8vw + 0.5rem, 4.5rem);
        background: transparent; /* let patterns show behind/around letterforms */
        /* subtle text shadow to pop off patterns */
        text-shadow: 0 1px 0 var(--bg), 0 0 24px color-mix(in srgb, var(--bg) 70%, transparent);
    }

    .patternStage {
        position: absolute;
        inset: -20%;
        z-index: 0;
        pointer-events: none;
        /* fade edges so patterns feel around the title, not a hard box */
        mask: radial-gradient(ellipse 70% 55% at 50% 50%, black 45%, transparent 82%);
        -webkit-mask: radial-gradient(ellipse 70% 55% at 50% 50%, black 45%, transparent 82%);
    }

    .pattern {
        position: absolute;
        inset: 0;
        --grid-c: var(--red);
        --bg-c: var(--bg);
        background-color: transparent; /* ensure * selector doesn't paint over pattern */
    }

    .layer1,
    .layer2,
    .layer3 {
        animation-duration: 4.2s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-play-state: paused;
        will-change: opacity, transform;
    }
    .layer1 {
        animation-name: seq1;
        background:
            linear-gradient(to right, color-mix(in srgb, var(--grid-c) 55%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--grid-c) 55%, transparent) 1px, transparent 1px);
        background-size: 32px 32px;
    }
    .layer2 {
        animation-name: seq2;
        background: radial-gradient(circle 1.15px, var(--grid-c) 98%, transparent 100%);
        background-size: 12px 12px;
    }
    .layer3 {
        animation-name: seq3;
        background: repeating-linear-gradient(
            38deg,
            color-mix(in srgb, var(--grid-c) 50%, transparent) 0 1px,
            transparent 1px 12px
        );
    }

    /* only animate on hover / focus — paused by default, resume together so they stay in sync */
    .heroSection:hover .layer1,
    .heroSection:hover .layer2,
    .heroSection:hover .layer3,
    .heroSection:focus-within .layer1,
    .heroSection:focus-within .layer2,
    .heroSection:focus-within .layer3 {
        animation-play-state: running;
    }

    .vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 55% 50% at 50% 50%, transparent 55%, var(--bg) 88%);
    }

    /* Smooth crossfades — 12% overlap so patterns dissolve into each other, not hard-cut.
       cubic in/out via keyframe easing; subtle scale+blur sells morph. */
    @keyframes seq1 {
        0% { opacity: 0.22; transform: scale(1) rotate(0deg); filter: blur(0px); }
        24% { opacity: 0.22; transform: scale(1.008) rotate(0.15deg); filter: blur(0px); }
        32% { opacity: 0; transform: scale(1.025) rotate(0.35deg); filter: blur(0.6px); }
        88% { opacity: 0; transform: scale(1.025); filter: blur(0.6px); }
        94% { opacity: 0.1; transform: scale(1.01); filter: blur(0.3px); }
        100% { opacity: 0.22; transform: scale(1) rotate(0deg); filter: blur(0px); }
    }
    @keyframes seq2 {
        0%, 26% { opacity: 0; transform: scale(0.985) rotate(-0.2deg); filter: blur(0.7px); }
        32% { opacity: 0.28; transform: scale(1) rotate(0deg); filter: blur(0px); }
        56% { opacity: 0.28; transform: scale(1.012) rotate(0.12deg); filter: blur(0px); }
        64% { opacity: 0; transform: scale(1.03) rotate(0.3deg); filter: blur(0.7px); }
        100% { opacity: 0; filter: blur(0.7px); }
    }
    @keyframes seq3 {
        0%, 58% { opacity: 0; transform: scale(0.985) rotate(0.2deg); filter: blur(0.7px); }
        64% { opacity: 0.18; transform: scale(1) rotate(0deg); filter: blur(0px); }
        88% { opacity: 0.18; transform: scale(1.01) rotate(-0.12deg); filter: blur(0px); }
        96% { opacity: 0; transform: scale(1.02) rotate(-0.25deg); filter: blur(0.6px); }
        100% { opacity: 0; filter: blur(0.6px); }
    }

    @media (prefers-reduced-motion: reduce) {
        .layer1, .layer2, .layer3 { animation: none; }
        .layer1 {
            background: radial-gradient(circle 1.15px, var(--grid-c) 98%, transparent 100%);
            background-size: 14px 14px;
            opacity: 0.14;
        }
        .layer2, .layer3 { display: none; }
    }
    .articlesContainer {
        margin: 10px 20px 30px 20px;
    }
</style>
