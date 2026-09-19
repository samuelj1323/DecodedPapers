<script lang="ts">
    import { type RouteMapping } from "$lib/types/types";
    type HeaderProps = {
        routes: RouteMapping[];
    };
    let { routes }: HeaderProps = $props();
</script>

<div id="header">
    {#each routes as route}
        <a href={route.route}>{route.name}</a>
    {/each}
</div>
