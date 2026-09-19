<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import Header from "$lib/components/Header.svelte";
    import { activeRoutes } from "$lib/utils/constants";
    import { onNavigate } from "$app/navigation";
    import { page } from "$app/state";

    let { children } = $props();

    let showHeader = $derived(page.url.pathname.startsWith("/posts/"));

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;
        const to = navigation.to?.url.pathname ?? "";
        const isBack = to === "/" || to === "";
        document.documentElement.classList.add("view-transition");
        document.documentElement.dataset.direction = isBack ? "back" : "forward";
        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
                setTimeout(() => {
                    document.documentElement.classList.remove("view-transition");
                    delete document.documentElement.dataset.direction;
                }, 700);
            });
        });
    });
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
    <!-- non-blocking: media=print + onload swap avoids render-blocking -->
    <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&family=Schibsted+Grotesk:wght@400..900&family=Special+Elite&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
        rel="stylesheet"
        media="print"
        onload={(e) => ((e.currentTarget as HTMLLinkElement).media = "all")}
    />
    <noscript>
        <link
            href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&family=Schibsted+Grotesk:wght@400..900&family=Special+Elite&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
            rel="stylesheet"
        />
    </noscript>
</svelte:head>

 {#if showHeader}
    <Header routes={activeRoutes} />
{/if}
<main class="home">
    {@render children()}
</main>

<style>
    .home {
        background: var(--bg);
    }
</style>
