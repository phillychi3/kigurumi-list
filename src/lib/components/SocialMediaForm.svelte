<script lang="ts">
	import Icon from '@iconify/svelte'

	let {
		socialMedia = $bindable(),
		label = 'Social Media'
	}: {
		socialMedia: Record<string, string | null>
		label?: string
	} = $props()

	let isExpanded = $state(false)

	if (!socialMedia) {
		socialMedia = {}
	}

	const fields = [
		{ key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' },
		{ key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
		{ key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
		{ key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
		{ key: 'pixiv', label: 'Pixiv', placeholder: 'https://pixiv.net/users/...' },
		{ key: 'taobao', label: 'Taobao', placeholder: 'https://...' },
		{ key: 'amazon', label: 'Amazon', placeholder: 'https://amazon.com/...' },
		{ key: 'website', label: 'Website', placeholder: 'https://...' }
	]
</script>

<div class="space-y-2">
	<button
		type="button"
		onclick={() => (isExpanded = !isExpanded)}
		class="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-left hover:bg-gray-50"
	>
		<span class="font-medium">{label}</span>
		<Icon
			icon="mdi:chevron-down"
			class="h-5 w-5 transform transition-transform {isExpanded ? 'rotate-180' : ''}"
		/>
	</button>

	{#if isExpanded}
		<div class="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
			{#each fields as field}
				<div>
					<label for={field.key} class="mb-1 block text-sm font-medium text-gray-700">
						{field.label}
					</label>
					<input
						type="url"
						id={field.key}
						bind:value={socialMedia[field.key]}
						placeholder={field.placeholder}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>
