<script lang="ts">
    import { type RouteMapping } from "$lib/types/types";
    type HeaderProps = {
        routes: RouteMapping[];
    };
    let { routes }: HeaderProps = $props();

    // Expect single "home" route — render as centered DecodedPapers title
    const homeRoute = $derived(routes.find((r) => r.route === "/") ?? routes[0]);
</script>

<header id="header">
    {#if homeRoute}
        <a href={homeRoute.route} class="title">DecodedPapers</a>
    {/if}
</header>

<style>
    #header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.25rem 1rem;
        border-bottom: 1px solid color-mix(in srgb, var(--red) 18%, transparent);
    }
    .title {
        font-family: orbitron, sans-serif;
        color: var(--red);
        font-size: 1.75rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-align: center;
        text-decoration: none;
        background: transparent;
    }
    .title:hover {
        opacity: 0.85;
    }
</style>
