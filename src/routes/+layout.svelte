<script lang="ts">
	import { page } from '$app/state'
	import { locales, localizeHref, getLocale, deLocalizeHref } from '$lib/paraglide/runtime'
	import Navbar from '$lib/components/Navbar.svelte'
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'

	let { children } = $props()

	const siteUrl = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
	const currentLocale = $derived(getLocale())
	const canonicalUrl = $derived(`${siteUrl}${page.url.pathname}`)
	const basePath = $derived(deLocalizeHref(page.url.pathname))
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={canonicalUrl} />

	{#each locales as locale}
		<link
			rel="alternate"
			hreflang={locale}
			href={`${siteUrl}${localizeHref(basePath, { locale })}`}
		/>
	{/each}
	<link rel="alternate" hreflang="x-default" href={canonicalUrl} />

	<meta property="og:site_name" content="kiglist" />
	<meta property="og:locale" content={currentLocale} />

	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

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
