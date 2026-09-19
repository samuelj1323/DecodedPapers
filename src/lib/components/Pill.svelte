<script lang="ts">
    type PillProps = { label: string };
    let { label }: PillProps = $props();
</script>

<span class="container">{label}</span>

<style>
    .container {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--red);
        border-radius: 2em;
        padding: 0.25em 0.9em;
        font-size: 0.8rem;
        line-height: 1.2;
        white-space: nowrap;
    }
</style>
