<script lang="ts">
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import { getKiger, type KigerDetail } from '$lib/api'
	import { onMount } from 'svelte'
	import Loading from '$lib/components/Loading.svelte'
	import Error from '$lib/components/Error.svelte'

	const kigerId = $derived(page.params.id)
	let kiger: KigerDetail | null = $state(null)
	let loading = $state(true)
	let error = $state<string | null>(null)

	onMount(async () => {
		try {
			kiger = await getKiger(kigerId)
		} catch (e) {
			error = e instanceof Error ? e.message : String(e)
		} finally {
			loading = false
		}
	})
</script>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<a href="/kiger" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
	</div>

	{#if loading}
		<Loading />
	{:else if error}
		<Error message={error} />
	{:else if kiger}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="grid md:grid-cols-3">
				<div class="aspect-square bg-gray-100 md:col-span-1">
					<img src={kiger.profileImage} alt={kiger.name} class="h-full w-full object-cover" />
				</div>

				<div class="p-6 md:col-span-2">
					<h1 class="mb-4 text-3xl font-bold text-gray-900">{kiger.name}</h1>

					<div class="mb-4 flex gap-2">
						{#if kiger.position}
							<span class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
								{kiger.position}
							</span>
						{/if}
						{#if kiger.isActive}
							<span class="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
								{m.kiger_is_active()}
							</span>
						{/if}
					</div>

					<p class="mb-6 text-gray-700">{kiger.bio}</p>

					{#if kiger.socialMedia && Object.values(kiger.socialMedia).some((v) => v)}
						<div class="mb-6">
							<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.kiger_social_media()}</h2>
							<div class="flex flex-wrap gap-2">
								{#each Object.entries(kiger.socialMedia) as [platform, url]}
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

					{#if kiger.Characters && kiger.Characters.length > 0}
						<div>
							<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.kiger_characters()}</h2>
							<div class="space-y-4">
								{#each kiger.Characters as char}
									<div class="rounded-lg border border-gray-200 p-4">
										<a href="/character/{char.characterId}" class="text-blue-600 hover:underline">
											{char.characterId}
										</a>
										{#if char.maker}
											<p class="text-sm text-gray-600">店家: {char.maker}</p>
										{/if}
										{#if char.images && char.images.length > 0}
											<div class="mt-2 flex gap-2">
												{#each char.images as img}
													<img src={img} alt="Character" class="h-20 w-20 rounded object-cover" />
												{/each}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
