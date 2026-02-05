<script lang="ts">
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import type { Maker } from '$lib/api'
	import SEO from '$lib/components/SEO.svelte'
	import { buildMakerJsonLd } from '$lib/seo/jsonld'

	let { data } = $props<{ data: { maker: Maker } }>()

	const makerId = $derived(page.params.id)
	const siteUrl = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
	const pageUrl = $derived(`${siteUrl}/maker/${makerId}`)
	const jsonLd = $derived(buildMakerJsonLd(data.maker, pageUrl))
</script>

<SEO
	title="{data.maker.name} | kiglist"
	description="{data.maker.name} - Kigurumi maker"
	image={data.maker.Avatar}
	type="profile"
	{jsonLd}
/>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<a href="/maker" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
		<a
			href="/maker/{makerId}/edit"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
		>
			編輯
		</a>
	</div>

	<div class="overflow-hidden rounded-lg bg-white shadow">
		<div class="grid md:grid-cols-3">
			<div class="aspect-square bg-gray-100 md:col-span-1">
				<img src={data.maker.Avatar} alt={data.maker.name} class="h-full w-full object-cover" />
			</div>

			<div class="p-6 md:col-span-2">
				<h1 class="mb-2 text-3xl font-bold text-gray-900">{data.maker.name}</h1>
				<p class="mb-6 text-lg text-gray-600">{data.maker.originalName}</p>

				{#if data.maker.socialMedia && Object.values(data.maker.socialMedia).some((v) => v)}
					<div>
						<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.maker_social_media()}</h2>
						<div class="flex flex-wrap gap-2">
							{#each Object.entries(data.maker.socialMedia) as [platform, url]}
								{#if url}
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										class="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
									>
										{platform}
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
