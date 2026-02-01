<script lang="ts">
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import { getMaker, type Maker } from '$lib/api'
	import { onMount } from 'svelte'
	import Loading from '$lib/components/Loading.svelte'
	import Error from '$lib/components/Error.svelte'

	const makerId = $derived(page.params.id)
	let maker: Maker | null = $state(null)
	let loading = $state(true)
	let error = $state<string | null>(null)

	onMount(async () => {
		try {
			maker = await getMaker(Number(makerId))
		} catch (e) {
			error = e instanceof Error ? e.message : String(e)
		} finally {
			loading = false
		}
	})
</script>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<a href="/maker" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
		{#if maker}
			<a
				href="/maker/{makerId}/edit"
				class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
			>
				編輯
			</a>
		{/if}
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<Error message={error} />
	{:else if maker}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="grid md:grid-cols-3">
				<!-- Avatar -->
				<div class="aspect-square bg-gray-100 md:col-span-1">
					<img src={maker.Avatar} alt={maker.name} class="h-full w-full object-cover" />
				</div>

				<!-- Info -->
				<div class="p-6 md:col-span-2">
					<h1 class="mb-2 text-3xl font-bold text-gray-900">{maker.name}</h1>
					<p class="mb-6 text-lg text-gray-600">{maker.originalName}</p>

					<!-- Social Media -->
					{#if maker.socialMedia && Object.values(maker.socialMedia).some((v) => v)}
						<div>
							<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.maker_social_media()}</h2>
							<div class="flex flex-wrap gap-2">
								{#each Object.entries(maker.socialMedia) as [platform, url]}
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
	{/if}
</div>
