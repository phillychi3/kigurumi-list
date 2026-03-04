<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import type { KigerDetail, CharacterReference } from '$lib/api'
	import SEO from '$lib/components/SEO.svelte'
	import { buildKigerJsonLd } from '$lib/seo/jsonld'
	import { marked } from 'marked'
	import DOMPurify from 'dompurify'
	import Icon from '@iconify/svelte'
	import { onMount } from 'svelte'
	import { Swiper } from 'swiper'
	import { Pagination } from 'swiper/modules'
	import PhotoSwipeLightbox from 'photoswipe/lightbox'
	import type PhotoSwipe from 'photoswipe'
	import 'swiper/css'
	import 'swiper/css/pagination'
	import 'photoswipe/style.css'

	let { data } = $props<{ data: { kiger: KigerDetail } }>()

	const kigerId = $derived(page.params.id)
	const siteUrl = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
	const pageUrl = $derived(`${siteUrl}/kiger/${kigerId}`)
	const jsonLd = $derived(buildKigerJsonLd(data.kiger, pageUrl))

	const bioHtml = $derived(() => {
		if (!data.kiger.bio) return ''
		const raw = marked.parse(data.kiger.bio) as string
		return browser ? DOMPurify.sanitize(raw) : raw
	})

	const socialIcons: Record<string, string> = {
		instagram: 'mdi:instagram',
		twitter: 'mdi:twitter',
		facebook: 'mdi:facebook',
		tiktok: 'simple-icons:tiktok',
		pixiv: 'simple-icons:pixiv',
		website: 'mdi:web'
	}

	const socialLabels: Record<string, string> = {
		instagram: 'Instagram',
		twitter: 'Twitter / X',
		facebook: 'Facebook',
		tiktok: 'TikTok',
		pixiv: 'Pixiv',
		website: 'Website'
	}

	function swiperId(char: CharacterReference) {
		return `swiper-char-${char.characterId}`
	}

	onMount(() => {
		if (!data.kiger.Characters?.length) return

		const swipers: Swiper[] = []
		const lightboxes: PhotoSwipeLightbox[] = []

		for (const char of data.kiger.Characters) {
			if (!char.images?.length) continue

			const containerId = swiperId(char)
			const container = document.getElementById(containerId)
			if (!container) continue

			const sw = new Swiper(container, {
				modules: [Pagination],
				slidesPerView: 1,
				pagination: {
					el: container.querySelector<HTMLElement>('.swiper-pagination'),
					clickable: true,
					dynamicBullets: true
				}
			})
			swipers.push(sw)

			const lb = new PhotoSwipeLightbox({
				gallery: `#${containerId}`,
				children: '.swiper-slide a',
				pswpModule: () => import('photoswipe')
			})

			lb.addFilter('domItemData', (itemData, _el, linkEl) => {
				const thumb = linkEl?.querySelector('img')
				if (thumb?.naturalWidth) {
					itemData.width = thumb.naturalWidth
					itemData.height = thumb.naturalHeight
				} else {
					itemData.width = 0
					itemData.height = 0
				}
				return itemData
			})

			lb.on('contentLoad', (e) => {
				const { content } = e
				if (content.type !== 'image' || content.data.width !== 0) return
				e.preventDefault()

				const img = new Image()
				content.element = img

				img.onload = () => {
					img.onload = null
					img.onerror = null
					content.data.width = img.naturalWidth
					content.data.height = img.naturalHeight
					;(content.instance as PhotoSwipe).refreshSlideContent(content.index)
				}
				img.onerror = () => {
					img.onload = null
					img.onerror = null
					content.onError()
				}

				img.src = content.data.src as string
			})

			lb.init()
			lightboxes.push(lb)
		}

		return () => {
			for (const sw of swipers) sw.destroy()
			for (const lb of lightboxes) lb.destroy()
		}
	})
</script>

<SEO
	title="{data.kiger.name} | kiglist"
	description={data.kiger.bio?.substring(0, 160) || `${data.kiger.name} - Kigurumi performer`}
	image={data.kiger.profileImage}
	type="profile"
	{jsonLd}
/>

<div class="mx-auto max-w-5xl p-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<a href="/kiger" class="text-sm text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
		<a
			href="/kiger/{kigerId}/edit"
			class="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
		>
			{m.edit()}
		</a>
	</div>

	<div class="flex flex-col gap-8 md:flex-row md:items-start">
		<aside class="w-full md:w-64 md:shrink-0">
			<div class="mb-4 overflow-hidden rounded-full border-4 border-gray-200 shadow-sm">
				<img
					src={data.kiger.profileImage}
					alt={data.kiger.name}
					class="aspect-square w-full object-cover"
				/>
			</div>

			<h1 class="text-2xl font-bold text-gray-900">{data.kiger.name}</h1>

			<div class="mt-2 flex flex-wrap gap-2">
				{#if data.kiger.position}
					<span class="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
						{data.kiger.position}
					</span>
				{/if}
				{#if data.kiger.isActive}
					<span class="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
						{m.kiger_is_active()}
					</span>
				{/if}
			</div>

			{#if data.kiger.socialMedia && Object.values(data.kiger.socialMedia).some((v) => v)}
				<div class="mt-5 space-y-2">
					{#each Object.entries(data.kiger.socialMedia) as [platform, url]}
						{#if url}
							<a
								href={url as string}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
							>
								<Icon icon={socialIcons[platform] ?? 'mdi:link'} class="size-5 shrink-0" />
								<span class="truncate">{socialLabels[platform] ?? platform}</span>
							</a>
						{/if}
					{/each}
				</div>
			{/if}
		</aside>

		<main class="min-w-0 flex-1 space-y-8">
			{#if data.kiger.bio}
				<section>
					<h2 class="mb-3 border-b pb-2 text-lg font-semibold text-gray-900">{m.kiger_bio()}</h2>
					<div class="prose prose-sm max-w-none text-gray-700">
						{@html bioHtml()}
					</div>
				</section>
			{/if}

			{#if data.kiger.Characters && data.kiger.Characters.length > 0}
				<section>
					<h2 class="mb-4 border-b pb-2 text-lg font-semibold text-gray-900">
						{m.kiger_characters()}
					</h2>
					<div class="grid gap-4 sm:grid-cols-2">
						{#each data.kiger.Characters as char}
							<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
								<div class="px-4 pt-4 pb-3">
									<a
										href="/character/{char.characterId}"
										class="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
									>
										{char.characterName}
									</a>
									{#if char.makerName}
										<a
											href="/maker/{char.makerId}"
											class="mt-0.5 flex items-center gap-1 text-xs text-gray-500 hover:underline"
										>
											<Icon icon="mdi:store-outline" class="size-3.5" />
											{char.makerName}
										</a>
									{/if}
								</div>

								{#if char.images && char.images.length > 0}
									<div id={swiperId(char)} class="swiper pb-7">
										<div class="swiper-wrapper">
											{#each char.images as img, i}
												<div class="swiper-slide">
													<a href={img} target="_blank" rel="noopener noreferrer" class="block">
														<img
															src={img}
															alt="{char.characterName} #{i + 1}"
															class="aspect-square w-full cursor-zoom-in object-cover transition-opacity hover:opacity-80"
														/>
													</a>
												</div>
											{/each}
										</div>
										<div class="swiper-pagination"></div>
									</div>
								{:else}
									<div
										class="flex h-24 items-center justify-center bg-gray-50 text-sm text-gray-400"
									>
										{m.no_data()}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</main>
	</div>
</div>
