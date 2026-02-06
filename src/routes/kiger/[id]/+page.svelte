<script lang="ts">
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import type { KigerDetail } from '$lib/api'
	import SEO from '$lib/components/SEO.svelte'
	import { buildKigerJsonLd } from '$lib/seo/jsonld'

	let { data } = $props<{ data: { kiger: KigerDetail } }>()

	const kigerId = $derived(page.params.id)
	const siteUrl = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
	const pageUrl = $derived(`${siteUrl}/kiger/${kigerId}`)
	const jsonLd = $derived(buildKigerJsonLd(data.kiger, pageUrl))
</script>

<SEO
	title="{data.kiger.name} | kiglist"
	description={data.kiger.bio?.substring(0, 160) || `${data.kiger.name} - Kigurumi performer`}
	image={data.kiger.profileImage}
	type="profile"
	{jsonLd}
/>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<a href="/kiger" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
		<a
			href="/kiger/{kigerId}/edit"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
		>
			{m.edit()}
		</a>
	</div>

	<div class="overflow-hidden rounded-lg bg-white shadow">
		<div class="grid md:grid-cols-3">
			<div class="aspect-square bg-gray-100 md:col-span-1">
				<img
					src={data.kiger.profileImage}
					alt={data.kiger.name}
					class="h-full w-full object-cover"
				/>
			</div>

			<div class="p-6 md:col-span-2">
				<h1 class="mb-4 text-3xl font-bold text-gray-900">{data.kiger.name}</h1>

				<div class="mb-4 flex gap-2">
					{#if data.kiger.position}
						<span class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
							{data.kiger.position}
						</span>
					{/if}
					{#if data.kiger.isActive}
						<span class="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
							{m.kiger_is_active()}
						</span>
					{/if}
				</div>

				<p class="mb-6 text-gray-700">{data.kiger.bio}</p>

				{#if data.kiger.socialMedia && Object.values(data.kiger.socialMedia).some((v) => v)}
					<div class="mb-6">
						<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.kiger_social_media()}</h2>
						<div class="flex flex-wrap gap-2">
							{#each Object.entries(data.kiger.socialMedia) as [platform, url]}
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

				{#if data.kiger.Characters && data.kiger.Characters.length > 0}
					<div>
						<h2 class="mb-3 text-lg font-semibold text-gray-900">{m.kiger_characters()}</h2>
						<div class="space-y-4">
							{#each data.kiger.Characters as char}
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
</div>
