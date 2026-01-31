<script lang="ts">
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import { getCharacter, type CharacterDetail } from '$lib/api'
	import { onMount } from 'svelte'
	import Loading from '$lib/components/Loading.svelte'
	import Error from '$lib/components/Error.svelte'

	const characterId = $derived(page.params.id)
	let character: CharacterDetail | null = $state(null)
	let loading = $state(true)
	let error = $state<string | null>(null)

	onMount(async () => {
		try {
			character = await getCharacter(Number(characterId))
		} catch (e) {
			error = e instanceof Error ? e.message : String(e)
		} finally {
			loading = false
		}
	})
</script>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<a href="/character" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<Error message={error} />
	{:else if character}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="grid md:grid-cols-3">
				<div class="aspect-[3/4] bg-gray-100 md:col-span-1">
					<img
						src={character.officialImage}
						alt={character.name}
						class="h-full w-full object-cover"
					/>
				</div>

				<div class="p-6 md:col-span-2">
					<h1 class="mb-2 text-3xl font-bold text-gray-900">{character.name}</h1>
					<p class="mb-4 text-lg text-gray-600">{character.originalName}</p>

					<div class="mb-6">
						<span class="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
							{character.type}
						</span>
					</div>

					<div class="mb-6 rounded-lg bg-gray-50 p-4">
						<h2 class="mb-2 text-sm font-semibold text-gray-700">作品資訊</h2>
						<p class="text-gray-900">{character.source.title}</p>
						<p class="text-sm text-gray-600">
							{character.source.company} • {character.source.releaseYear}
						</p>
					</div>

					{#if character.kigers}
						<div>
							<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.character_kigers()}</h2>
							<div class="space-y-2">
								{#each character.kigers as kiger}
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
	{/if}
</div>
