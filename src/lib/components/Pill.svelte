<script lang="ts">
    type PillProps = { label: string };
    let { label }: PillProps = $props();
</script>

<span class="container">
    <p>{label}</p>
</span>

<style>
    .container {
        border: 1px solid var(--red);
        border-radius: 2em;
        padding: 0.5ch;
    }
</style>
