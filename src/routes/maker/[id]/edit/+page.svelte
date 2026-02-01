<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { m } from '$lib/paraglide/messages.js'
	import { isAuthenticated, getToken } from '$lib/auth'
	import { getMaker, updateMaker, type Maker } from '$lib/api'
	import SocialMediaForm from '$lib/components/SocialMediaForm.svelte'
	import Loading from '$lib/components/Loading.svelte'
	import Error from '$lib/components/Error.svelte'
	import { onMount } from 'svelte'

	const makerId = $derived(Number(page.params.id))
	let originalMaker: Maker | null = $state(null)
	let formData: Maker = $state({
		id: 0,
		name: '',
		originalName: '',
		Avatar: '',
		socialMedia: {}
	})

	let submitting = $state(false)
	let submitError = $state<string | null>(null)
	let loading = $state(true)
	let loadError = $state<string | null>(null)

	onMount(async () => {
		try {
			originalMaker = await getMaker(makerId)
			formData = {
				id: originalMaker.id,
				name: originalMaker.name,
				originalName: originalMaker.originalName,
				Avatar: originalMaker.Avatar,
				socialMedia: originalMaker.socialMedia || {}
			}
		} catch (e) {
			loadError = e instanceof Error ? e.message : String(e)
		} finally {
			loading = false
		}
	})

	async function handleSubmit(event: Event) {
		event.preventDefault()
		submitting = true
		submitError = null

		try {
			const token = $isAuthenticated ? getToken() : null
			await updateMaker(makerId, formData, token || undefined)

			if ($isAuthenticated) {
				goto(`/maker/${makerId}`)
			} else {
				alert('修改已提交，等待審核')
				goto('/maker')
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
		<a href="/maker/{makerId}" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
	</div>

	{#if loading}
		<Loading />
	{:else if loadError}
		<Error message={loadError} />
	{:else}
		<h1 class="mb-8 text-3xl font-bold text-gray-900">編輯製作者</h1>

		{#if !$isAuthenticated}
			<div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
				<p class="text-sm text-yellow-800">您的修改將提交審核，管理員審核通過後才會生效。</p>
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="space-y-6 rounded-lg bg-white p-6 shadow">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
					{m.maker_name()} *
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
					{m.maker_original_name()} *
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
				<label for="avatar" class="mb-1 block text-sm font-medium text-gray-700">
					{m.maker_avatar()} *
				</label>
				<input
					type="url"
					id="avatar"
					bind:value={formData.Avatar}
					required
					placeholder="https://..."
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<SocialMediaForm bind:socialMedia={formData.socialMedia} label={m.maker_social_media()} />

			{#if submitError}
				<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
					{submitError}
				</div>
			{/if}

			<div class="flex justify-end gap-3">
				<a
					href="/maker/{makerId}"
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
