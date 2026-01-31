<script lang="ts">
	import { goto } from '$app/navigation'
	import { m } from '$lib/paraglide/messages.js'
	import {
		submitKiger,
		crawlTwitterUser,
		getCharacters,
		getMakers,
		type KigerSubmit,
		type Character,
		type Maker
	} from '$lib/api'
	import SocialMediaForm from '$lib/components/SocialMediaForm.svelte'
	import SearchSelect from '$lib/components/SearchSelect.svelte'
	import { onMount } from 'svelte'

	let formData: KigerSubmit = $state({
		name: '',
		bio: '',
		profileImage: '',
		position: '',
		isActive: true,
		socialMedia: {},
		Characters: []
	})

	let characters: Character[] = $state([])
	let makers: Maker[] = $state([])
	let twitterInput = $state('')
	let crawling = $state(false)
	let crawlError = $state<string | null>(null)
	let submitting = $state(false)
	let submitError = $state<string | null>(null)

	onMount(async () => {
		try {
			const [charList, makerList] = await Promise.all([getCharacters(), getMakers()])
			characters = charList
			makers = makerList
		} catch (e) {
			console.error('Failed to load options:', e)
		}
	})

	async function handleCrawl() {
		if (!twitterInput.trim()) return

		crawling = true
		crawlError = null

		try {
			let username = twitterInput.trim()
			const twitterUrlMatch = twitterInput.match(/(?:twitter\.com|x\.com)\/([^/?]+)/)
			if (twitterUrlMatch) {
				username = twitterUrlMatch[1]
			}

			const result = await crawlTwitterUser(username)

			if (!formData.name) formData.name = result.name
			if (!formData.bio) formData.bio = result.bio
			if (!formData.profileImage) formData.profileImage = result.profileImage
			if (!formData.position) formData.position = result.position

			for (const [key, value] of Object.entries(result.socialMedia)) {
				if (value && !formData.socialMedia[key]) {
					formData.socialMedia[key] = value
				}
			}

			if (formData.Characters.length === 0 && result.Characters.length > 0) {
				formData.Characters = result.Characters
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
			await submitKiger(formData)
			goto('/kiger')
		} catch (e) {
			submitError = e instanceof Error ? e.message : String(e)
		} finally {
			submitting = false
		}
	}
</script>

<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<a href="/kiger" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
	</div>

	<h1 class="mb-8 text-3xl font-bold text-gray-900">{m.kiger_new()}</h1>

	<div class="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
		<h2 class="mb-4 text-lg font-semibold text-gray-900">{m.kiger_twitter_crawl()}</h2>
		<p class="mb-3 text-sm text-gray-600">{m.twitter_url_hint()}</p>
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={twitterInput}
				placeholder="username or URL"
				class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
			<button
				type="button"
				onclick={handleCrawl}
				disabled={crawling || !twitterInput.trim()}
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
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
				{m.kiger_name()} *
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
			<label for="bio" class="mb-1 block text-sm font-medium text-gray-700">
				{m.kiger_bio()} *
			</label>
			<textarea
				id="bio"
				bind:value={formData.bio}
				required
				rows="4"
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			></textarea>
		</div>

		<div>
			<label for="profileImage" class="mb-1 block text-sm font-medium text-gray-700">
				{m.kiger_profile_image()} *
			</label>
			<input
				type="url"
				id="profileImage"
				bind:value={formData.profileImage}
				required
				placeholder="https://..."
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div>
			<label for="position" class="mb-1 block text-sm font-medium text-gray-700">
				{m.kiger_position()}
			</label>
			<input
				type="text"
				id="position"
				bind:value={formData.position}
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div class="flex items-center gap-2">
			<input
				type="checkbox"
				id="isActive"
				bind:checked={formData.isActive}
				class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			/>
			<label for="isActive" class="text-sm font-medium text-gray-700">
				{m.kiger_is_active()}
			</label>
		</div>

		<SocialMediaForm bind:socialMedia={formData.socialMedia} label={m.kiger_social_media()} />

		<div>
			<div class="mb-3 flex items-center justify-between">
				<label class="block text-sm font-medium text-gray-700">
					{m.kiger_characters()}
				</label>
				<button
					type="button"
					onclick={() => {
						formData.Characters = [
							...formData.Characters,
							{ characterId: '', maker: '', images: [] }
						]
					}}
					class="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
				>
					+ {m.kiger_add_character()}
				</button>
			</div>

			<div class="space-y-4">
				{#each formData.Characters as character, index}
					<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
						<div class="mb-3 flex items-center justify-between">
							<h3 class="text-sm font-semibold text-gray-700">
								{m.kiger_add_character()} #{index + 1}
							</h3>
							<button
								type="button"
								onclick={() => {
									formData.Characters = formData.Characters.filter((_, i) => i !== index)
								}}
								class="text-sm text-red-600 hover:text-red-800"
							>
								{m.kiger_remove_character()}
							</button>
						</div>

						<div class="space-y-3">
							<SearchSelect
								options={characters.map((c) => ({
									id: c.id,
									name: c.name,
									secondaryText: c.originalName
								}))}
								bind:value={character.characterId}
								onselect={(id) => (character.characterId = id.toString())}
								placeholder={m.search()}
								required={true}
								label={m.kiger_character_id()}
							/>

							<SearchSelect
								options={makers.map((m) => ({
									id: m.id,
									name: m.name,
									secondaryText: m.originalName
								}))}
								bind:value={character.maker}
								onselect={(id) => (character.maker = id.toString())}
								placeholder={m.search()}
								required={false}
								label={m.kiger_character_maker()}
							/>

							<div>
								<label for="images-{index}" class="mb-1 block text-sm font-medium text-gray-700">
									{m.kiger_character_images()}
								</label>
								<textarea
									id="images-{index}"
									bind:value={character.images}
									placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
									rows="3"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								></textarea>
								<p class="mt-1 text-xs text-gray-500">每行一個圖片網址</p>
							</div>
						</div>
					</div>
				{/each}

				{#if formData.Characters.length === 0}
					<p class="py-4 text-center text-sm text-gray-500">尚未新增角色，點擊上方按鈕新增</p>
				{/if}
			</div>
		</div>

		{#if submitError}
			<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
				{submitError}
			</div>
		{/if}

		<div class="flex justify-end gap-3">
			<a
				href="/kiger"
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
</div>
