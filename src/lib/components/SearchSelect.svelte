<script lang="ts">
	interface Option {
		id: number
		name: string
		secondaryText?: string
	}

	interface Props {
		options: Option[]
		value: string | number
		onselect: (id: number) => void
		placeholder?: string
		required?: boolean
		label: string
	}

	let {
		options,
		value = $bindable(),
		onselect,
		placeholder = '',
		required = false,
		label
	}: Props = $props()

	let isOpen = $state(false)
	let searchQuery = $state('')
	let filteredOptions = $derived(
		options.filter(
			(opt) =>
				opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				opt.secondaryText?.toLowerCase().includes(searchQuery.toLowerCase())
		)
	)

	let selectedOption = $derived(options.find((opt) => opt.id === Number(value)))
	let displayText = $derived(selectedOption ? `${selectedOption.name}` : '')

	function selectOption(option: Option) {
		value = option.id.toString()
		onselect(option.id)
		searchQuery = ''
		isOpen = false
	}

	function handleFocus() {
		isOpen = true
		searchQuery = ''
	}

	function handleBlur() {
		setTimeout(() => {
			isOpen = false
			searchQuery = ''
		}, 200)
	}
</script>

<div class="relative">
	<label class="mb-1 block text-sm font-medium text-gray-700">
		{label}
		{#if required}<span class="text-red-500">*</span>{/if}
	</label>

	<input
		type="text"
		value={isOpen ? searchQuery : displayText}
		oninput={(e) => (searchQuery = e.currentTarget.value)}
		onfocus={handleFocus}
		onblur={handleBlur}
		{placeholder}
		{required}
		class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
	/>

	{#if isOpen && filteredOptions.length > 0}
		<div
			class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg"
		>
			{#each filteredOptions as option}
				<button
					type="button"
					onmousedown={() => selectOption(option)}
					class="block w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
				>
					<div class="font-medium text-gray-900">{option.name}</div>
					{#if option.secondaryText}
						<div class="text-sm text-gray-500">{option.secondaryText}</div>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if isOpen && searchQuery && filteredOptions.length === 0}
		<div class="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white p-3 shadow-lg">
			<p class="text-sm text-gray-500">找不到符合的項目</p>
		</div>
	{/if}
</div>
