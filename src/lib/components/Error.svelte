<script lang="ts">
	import Icon from '@iconify/svelte'

	let { message }: { message: string } = $props()
</script>

<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
	<div class="flex items-center gap-2">
		<Icon icon="mdi:alert-circle" class="h-5 w-5 flex-shrink-0" />
		<p class="font-medium">{message}</p>
	</div>
</div>
