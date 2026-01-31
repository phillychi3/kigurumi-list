<script lang="ts">
	import { isAuthenticated } from '$lib/auth'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'

	let { children }: { children: any } = $props()

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/admin/login')
		}
	})
</script>

{#if $isAuthenticated}
	{@render children()}
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="text-gray-600">重定向至登入頁面...</p>
		</div>
	</div>
{/if}
