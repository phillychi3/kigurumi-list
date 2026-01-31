<script lang="ts">
	let { size = 'md' }: { size?: 'sm' | 'md' | 'lg' } = $props()

	const sizes = {
		sm: 'w-6 h-6',
		md: 'w-12 h-12',
		lg: 'w-16 h-16'
	}
</script>

<div class="flex items-center justify-center p-8">
	<div
		class="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 {sizes[size]}"
	></div>
</div>
