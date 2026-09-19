<script lang="ts">
    import favicon from "$lib/assets/favicon.svg";
    import Header from "$lib/components/Header.svelte";
    import { activeRoutes } from "$lib/utils/constants";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<Header routes={activeRoutes} />
{@render children()}
