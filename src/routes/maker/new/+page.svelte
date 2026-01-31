<script lang="ts">
	import { goto } from '$app/navigation'
	import { m } from '$lib/paraglide/messages.js'
	import { submitMaker, type Maker, type MakerSocialMedia } from '$lib/api'
	import SocialMediaForm from '$lib/components/SocialMediaForm.svelte'

	let formData: Maker = $state({
		name: '',
		originalName: '',
		Avatar: '',
		socialMedia: {}
	})

	let submitting = $state(false)
	let submitError = $state<string | null>(null)

	async function handleSubmit(event: Event) {
		event.preventDefault()
		submitting = true
		submitError = null

		try {
			await submitMaker(formData)
			goto('/maker')
		} catch (e) {
			submitError = e instanceof Error ? e.message : String(e)
		} finally {
			submitting = false
		}
	}
</script>

<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-6">
		<a href="/maker" class="text-blue-600 hover:text-blue-800">&larr; {m.back()}</a>
	</div>

	<h1 class="mb-8 text-3xl font-bold text-gray-900">{m.maker_new()}</h1>

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
				href="/maker"
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
