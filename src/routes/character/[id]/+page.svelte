<script lang="ts">
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import type { CharacterDetail } from '$lib/api'
	import SEO from '$lib/components/SEO.svelte'
	import { buildCharacterJsonLd } from '$lib/seo/jsonld'

	let { data } = $props<{ data: { character: CharacterDetail } }>()

	const characterId = $derived(page.params.id)
	const siteUrl = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
	const pageUrl = $derived(`${siteUrl}/character/${characterId}`)
	const jsonLd = $derived(buildCharacterJsonLd(data.character, pageUrl))

	const description = $derived(
		data.character.source
			? `${data.character.name} from ${data.character.source.title}`
			: data.character.name
	)
</script>

<SEO
	title="{data.character.name} | kiglist"
	{description}
	image={data.character.officialImage}
	type="article"
	{jsonLd}
/>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<a href="/character" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
		<a
			href="/character/{characterId}/edit"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
		>
			{m.edit()}
		</a>
	</div>

	<div class="overflow-hidden rounded-lg bg-white shadow">
		<div class="grid md:grid-cols-3">
			<div class="aspect-[3/4] bg-gray-100 md:col-span-1">
				<img
					src={data.character.officialImage}
					alt={data.character.name}
					class="h-full w-full object-cover"
				/>
			</div>

			<div class="p-6 md:col-span-2">
				<h1 class="mb-2 text-3xl font-bold text-gray-900">{data.character.name}</h1>
				<p class="mb-4 text-lg text-gray-600">{data.character.originalName}</p>

				<div class="mb-6">
					<span class="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
						{data.character.type}
					</span>
				</div>

				<div class="mb-6 rounded-lg bg-gray-50 p-4">
					<h2 class="mb-2 text-sm font-semibold text-gray-700">{m.character_source_info()}</h2>
					<p class="text-gray-900">{data.character.source.title}</p>
					<p class="text-sm text-gray-600">
						{data.character.source.company} • {data.character.source.releaseYear}
					</p>
				</div>

				{#if data.character.kigers}
					<div>
						<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.character_kigers()}</h2>
						<div class="space-y-2">
							{#each data.character.kigers as kiger}
								<a
									href="/kiger/{kiger.id}"
									class="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
								>
									<p class="font-medium text-blue-600">{kiger.name}</p>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
