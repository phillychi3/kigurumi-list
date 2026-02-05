<script lang="ts">
	import { page } from '$app/state'
	import { getLocale } from '$lib/paraglide/runtime'

	interface Props {
		title: string
		description?: string
		image?: string
		type?: 'website' | 'profile' | 'article'
		jsonLd?: object
		noindex?: boolean
	}

	let {
		title,
		description = '',
		image = '',
		type = 'website',
		jsonLd,
		noindex = false
	}: Props = $props()

	const locale = $derived(getLocale())
	const siteUrl = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
	const canonicalUrl = $derived(`${siteUrl}${page.url.pathname}`)
	const imageUrl = $derived(image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : '')
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	{#if imageUrl}
		<meta property="og:image" content={imageUrl} />
	{/if}
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content={type} />
	<meta property="og:locale" content={locale} />

	<meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if imageUrl}
		<meta name="twitter:image" content={imageUrl} />
	{/if}

	{#if jsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
	{/if}
</svelte:head>
