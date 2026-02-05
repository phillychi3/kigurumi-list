<script lang="ts">
	import { m } from '$lib/paraglide/messages.js'
	import type { Maker } from '$lib/api'
	import Error from '$lib/components/Error.svelte'
	import SEO from '$lib/components/SEO.svelte'

	let { data } = $props<{ data: { makers: Maker[]; error?: string } }>()
</script>

<SEO title="{m.maker_list()} | kiglist" description="Browse kigurumi makers and craftsmen" />

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">{m.maker_list()}</h1>
		<a href="/maker/new" class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			{m.add_new()}
		</a>
	</div>

	{#if data.error}
		<Error message={data.error} />
	{:else if data.makers.length === 0}
		<div class="py-12 text-center">
			<p class="text-gray-500">{m.no_data()}</p>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.makers as maker}
				<a
					href="/maker/{maker.id}"
					class="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
				>
					<div class="aspect-square overflow-hidden bg-gray-100">
						<img
							src={maker.Avatar}
							alt={maker.name}
							class="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
					</div>
					<div class="p-4">
						<h2 class="mb-1 text-lg font-bold text-gray-900">{maker.name}</h2>
						<p class="text-sm text-gray-600">{maker.originalName}</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
