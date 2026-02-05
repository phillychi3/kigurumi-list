<script lang="ts">
	import { m } from '$lib/paraglide/messages.js'
	import SEO from '$lib/components/SEO.svelte'
	import { buildWebsiteJsonLd } from '$lib/seo/jsonld'

	const jsonLd = buildWebsiteJsonLd()
</script>

<SEO title="kiglist" description={m.home_description()} type="website" {jsonLd} />

<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<div class="mb-16 text-center">
		<h1 class="mb-4 text-6xl font-bold text-gray-900">kiglist</h1>
		<p class="text-xl text-gray-600">{m.home_description()}</p>
	</div>
</div>
