<script lang="ts">
	import { m } from '$lib/paraglide/messages.js'
	import type { KigerListItem } from '$lib/api'
	import Error from '$lib/components/Error.svelte'
	import SEO from '$lib/components/SEO.svelte'

	let { data } = $props<{ data: { kigers: KigerListItem[]; error?: string } }>()
</script>

<SEO title="{m.kiger_list()} | kiglist" description="Browse kigurumi performers in the community" />

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">{m.kiger_list()}</h1>
		<a href="/kiger/new" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			{m.add_new()}
		</a>
	</div>

	{#if data.error}
		<Error message={data.error} />
	{:else if data.kigers.length === 0}
		<div class="py-12 text-center">
			<p class="text-gray-500">{m.no_data()}</p>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.kigers as kiger}
				<a
					href="/kiger/{kiger.id}"
					class="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
				>
					<div class="aspect-square overflow-hidden bg-gray-100">
						<img
							src={kiger.profileImage}
							alt={kiger.name}
							class="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
					<div class="p-4">
						<h2 class="mb-2 text-xl font-bold text-gray-900">{kiger.name}</h2>
						<p class="mb-2 line-clamp-2 text-sm text-gray-600">{kiger.bio}</p>
						{#if kiger.position}
							<span class="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
								{kiger.position}
							</span>
						{/if}
						{#if kiger.isActive}
							<span class="inline-block rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
								{m.kiger_is_active()}
							</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
