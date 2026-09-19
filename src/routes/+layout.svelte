<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import Header from "$lib/components/Header.svelte";
    import { activeRoutes } from "$lib/utils/constants";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&family=Schibsted+Grotesk:wght@400..900&family=Special+Elite&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&family=Schibsted+Grotesk:wght@400..900&family=Special+Elite&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<Header routes={activeRoutes} />
<main class="home">
    {@render children()}
</main>

<style>
    .home {
        background: var(--bg);
    }
</style>
