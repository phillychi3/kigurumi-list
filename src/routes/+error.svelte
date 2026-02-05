<script lang="ts">
	import { page } from '$app/state'
	import Icon from '@iconify/svelte'
</script>

<div class="flex min-h-[70vh] items-center justify-center px-4">
	<div class="text-center">
		<p class="text-6xl font-bold text-gray-300">{page.status}</p>

		{#if page.status === 404}
			<div class="mt-4 flex justify-center">
				<Icon icon="mdi:file-search-outline" class="h-16 w-16 text-gray-400" />
			</div>
			<h1 class="mt-4 text-2xl font-bold text-gray-900">找不到頁面</h1>
			<p class="mt-2 text-gray-600">你所尋找的頁面不存在或已被移除。</p>
		{:else}
			<div class="mt-4 flex justify-center">
				<Icon icon="mdi:server-off" class="h-16 w-16 text-red-400" />
			</div>
			<h1 class="mt-4 text-2xl font-bold text-gray-900">伺服器錯誤</h1>
			<p class="mt-2 text-gray-600">發生了意外錯誤，請稍後再試。</p>
		{/if}

		<div class="mt-8">
			<a
				href="/"
				class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			>
				<Icon icon="mdi:home" class="h-4 w-4" />
				回到首頁
			</a>
		</div>
	</div>
</div>
