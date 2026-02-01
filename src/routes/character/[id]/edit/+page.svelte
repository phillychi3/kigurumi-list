<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import { isAuthenticated, getToken } from '$lib/auth'
	import {
		getCharacter,
		updateCharacter,
		crawlImage,
		crawlTwitterTweet,
		type Character,
		type CharacterSource,
		type CharacterDetail
	} from '$lib/api'
	import { onMount } from 'svelte'
	import Loading from '$lib/components/Loading.svelte'
	import Error from '$lib/components/Error.svelte'

	const characterId = $derived(Number(page.params.id))
	let originalCharacter: CharacterDetail | null = $state(null)
	let formData: Character = $state({
		id: 0,
		name: '',
		originalName: '',
		type: '',
		officialImage: '',
		source: {
			title: '',
			company: '',
			releaseYear: new Date().getFullYear()
		}
	})

	let crawlInput = $state('')
	let crawling = $state(false)
	let crawlError = $state<string | null>(null)
	let submitting = $state(false)
	let submitError = $state<string | null>(null)
	let loading = $state(true)
	let loadError = $state<string | null>(null)

	onMount(async () => {
		try {
			originalCharacter = await getCharacter(characterId)
			formData = {
				id: originalCharacter.id,
				name: originalCharacter.name,
				originalName: originalCharacter.originalName,
				type: originalCharacter.type,
				officialImage: originalCharacter.officialImage,
				source: originalCharacter.source || {
					title: '',
					company: '',
					releaseYear: new Date().getFullYear()
				}
			}
		} catch (e) {
			loadError = e instanceof Error ? e.message : String(e)
		} finally {
			loading = false
		}
	})

	async function handleCrawl() {
		if (!crawlInput.trim()) return

		crawling = true
		crawlError = null

		try {
			const input = crawlInput.trim()

			const tweetMatch = input.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/)

			if (tweetMatch) {
				const [, username, tweetId] = tweetMatch
				const result = await crawlTwitterTweet(username, tweetId)

				if (result.character) {
					if (!formData.name && result.character.name) formData.name = result.character.name
					if (!formData.originalName && result.character.originalName)
						formData.originalName = result.character.originalName
					if (!formData.type && result.character.type) formData.type = result.character.type
					if (!formData.officialImage && result.images && result.images.length > 0)
						formData.officialImage = result.images[0]
					if (result.character.source) {
						if (!formData.source.title && result.character.source.title)
							formData.source.title = result.character.source.title
						if (!formData.source.company && result.character.source.company)
							formData.source.company = result.character.source.company
						if (!formData.source.releaseYear && result.character.source.releaseYear)
							formData.source.releaseYear = result.character.source.releaseYear
					}
				}
			} else {
				const result = await crawlImage(input)

				if (!result.success) {
					crawlError = result.error || '圖片識別失敗'
					return
				}

				if (result.character) {
					if (!formData.name && result.character.name) formData.name = result.character.name
					if (!formData.originalName && result.character.originalName)
						formData.originalName = result.character.originalName
					if (!formData.type && result.character.type) formData.type = result.character.type
					if (!formData.officialImage) formData.officialImage = input
					if (result.character.source) {
						if (!formData.source.title && result.character.source.title)
							formData.source.title = result.character.source.title
						if (!formData.source.company && result.character.source.company)
							formData.source.company = result.character.source.company
						if (!formData.source.releaseYear && result.character.source.releaseYear)
							formData.source.releaseYear = result.character.source.releaseYear
					}
				}
			}
		} catch (e) {
			crawlError = e instanceof Error ? e.message : String(e)
		} finally {
			crawling = false
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault()
		submitting = true
		submitError = null

		try {
			const token = $isAuthenticated ? getToken() : null
			await updateCharacter(characterId, formData, token || undefined)

			if ($isAuthenticated) {
				goto(`/character/${characterId}`)
			} else {
				alert('修改已提交，等待審核')
				goto('/character')
			}
		} catch (e) {
			submitError = e instanceof Error ? e.message : String(e)
		} finally {
			submitting = false
		}
	}
</script>

<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<a href="/character/{characterId}" class="text-blue-600 hover:text-blue-800"
			>&larr; {m.back()}</a
		>
	</div>

	{#if loading}
		<Loading />
	{:else if loadError}
		<Error message={loadError} />
	{:else}
		<h1 class="mb-8 text-3xl font-bold text-gray-900">編輯角色</h1>

		{#if !$isAuthenticated}
			<div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<p class="text-sm text-yellow-800">您的修改將提交審核，管理員審核通過後才會生效。</p>
			</div>
		{/if}

		<div class="mb-8 rounded-lg border border-purple-200 bg-purple-50 p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">
				{m.character_image_crawl()} / {m.character_tweet_crawl()}
			</h2>
			<p class="mb-3 text-sm text-gray-600">
				{m.image_url_hint()} 或 {m.tweet_url_hint()}
			</p>
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={crawlInput}
					placeholder="Image URL or Tweet URL"
					class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
				/>
				<button
					type="button"
					onclick={handleCrawl}
					disabled={crawling || !crawlInput.trim()}
					class="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:bg-gray-300"
				>
					{crawling ? m.crawling() : m.crawl_button()}
				</button>
			</div>
			{#if crawlError}
				<p class="mt-2 text-sm text-red-600">{crawlError}</p>
			{/if}
		</div>

		<form onsubmit={handleSubmit} class="space-y-6 rounded-lg bg-white p-6 shadow">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
					{m.character_name()} *
				</label>
				<input
					type="text"
					id="name"
					bind:value={formData.name}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="originalName" class="mb-1 block text-sm font-medium text-gray-700">
					{m.character_original_name()} *
				</label>
				<input
					type="text"
					id="originalName"
					bind:value={formData.originalName}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="type" class="mb-1 block text-sm font-medium text-gray-700">
					{m.character_type()} *
				</label>
				<input
					type="text"
					id="type"
					bind:value={formData.type}
					required
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="officialImage" class="mb-1 block text-sm font-medium text-gray-700">
					{m.character_official_image()} *
				</label>
				<input
					type="url"
					id="officialImage"
					bind:value={formData.officialImage}
					required
					placeholder="https://..."
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div class="space-y-4 rounded-lg border border-gray-200 p-4">
				<h3 class="font-semibold text-gray-900">作品資訊</h3>

				<div>
					<label for="sourceTitle" class="mb-1 block text-sm font-medium text-gray-700">
						{m.character_source_title()} *
					</label>
					<input
						type="text"
						id="sourceTitle"
						bind:value={formData.source.title}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="sourceCompany" class="mb-1 block text-sm font-medium text-gray-700">
						{m.character_source_company()} *
					</label>
					<input
						type="text"
						id="sourceCompany"
						bind:value={formData.source.company}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="sourceYear" class="mb-1 block text-sm font-medium text-gray-700">
						{m.character_source_year()} *
					</label>
					<input
						type="number"
						id="sourceYear"
						bind:value={formData.source.releaseYear}
						required
						min="1900"
						max="2100"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>
			</div>

			{#if submitError}
				<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
					{submitError}
				</div>
			{/if}

			<div class="flex justify-end gap-3">
				<a
					href="/character/{characterId}"
					class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
				>
					{m.cancel()}
				</a>
				<button
					type="submit"
					disabled={submitting}
					class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
				>
					{submitting ? m.loading() : m.submit()}
				</button>
			</div>
		</form>
	{/if}
</div>
