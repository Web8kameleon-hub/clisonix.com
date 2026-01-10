<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>ASI Terminal | Clisonix</title>
	<meta name="description" content="Clisonix ASI Terminal - Industrial Intelligence" />
</svelte:head>

<div class="beta-banner">
	<strong>BETA</strong> — Platform under development. All features coming soon. Thank you for your patience.
</div>

{@render children()}
