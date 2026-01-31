<script lang="ts">
	import { page } from '$app/state'
	import { locales, localizeHref } from '$lib/paraglide/runtime'
	import Navbar from '$lib/components/Navbar.svelte'
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'

	let { children } = $props()
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Navbar />
<main class="min-h-screen bg-gray-50">
	{@render children()}
</main>
<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
