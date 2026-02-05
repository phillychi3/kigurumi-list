<script lang="ts">
	import { m } from '$lib/paraglide/messages.js'
	import type { Character } from '$lib/api'
	import Error from '$lib/components/Error.svelte'
	import SEO from '$lib/components/SEO.svelte'

	let { data } = $props<{ data: { characters: Character[]; error?: string } }>()
</script>

<SEO
	title="{m.character_list()} | kiglist"
	description="Browse anime and game characters with kigurumi"
/>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">{m.character_list()}</h1>
		<a href="/character/new" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			{m.add_new()}
		</a>
	</div>

	{#if data.error}
		<Error message={data.error} />
	{:else if data.characters.length === 0}
		<div class="py-12 text-center">
			<p class="text-gray-500">{m.no_data()}</p>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each data.characters as character}
				<a
					href="/character/{character.id}"
					class="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
				>
					<div class="aspect-[3/4] overflow-hidden bg-gray-100">
						<img
							src={character.officialImage}
							alt={character.name}
							class="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
					<div class="p-4">
						<h2 class="mb-1 text-lg font-bold text-gray-900">{character.name}</h2>
						<p class="mb-2 text-sm text-gray-600">{character.originalName}</p>
						<div class="space-y-1 text-xs text-gray-500">
							<p>{character.source.title}</p>
							<p>{character.source.company} • {character.source.releaseYear}</p>
						</div>
						<span
							class="mt-2 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800"
						>
							{character.type}
						</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
