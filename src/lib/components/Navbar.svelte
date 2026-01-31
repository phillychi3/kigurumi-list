<script lang="ts">
	import Icon from '@iconify/svelte'
	import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js'

	const links = [
		{ href: '/kiger', label: 'Kiger' },
		{ href: '/character', label: 'Character' },
		{ href: '/maker', label: 'Maker' }
	]

	let currentLocale = $state(getLocale())
	let isDropdownOpen = $state(false)

	const localeNames: Record<string, string> = {
		en: 'English',
		'zh-tw': '繁體中文',
		'zh-cn': '简体中文'
	}

	function handleLocaleChange(locale: string) {
		setLocale(locale as any)
		currentLocale = locale
		isDropdownOpen = false
	}

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen
	}
</script>

<nav class="border-b border-gray-200 bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center gap-8">
				<a href="/" class="text-2xl font-bold text-blue-600">kiglist</a>
				<div class="flex gap-4">
					{#each links as link}
						<a
							href={link.href}
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
						>
							{link.label}
						</a>
					{/each}
				</div>
			</div>

			<div class="relative flex items-center gap-4">
				<div class="relative">
					<button
						type="button"
						onclick={toggleDropdown}
						class="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						<Icon icon="mdi:translate" class="h-4 w-4" />
						<span>{localeNames[currentLocale] || currentLocale}</span>
						<Icon
							icon="mdi:chevron-down"
							class="h-4 w-4 transition-transform {isDropdownOpen ? 'rotate-180' : ''}"
						/>
					</button>

					{#if isDropdownOpen}
						<div
							class="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black"
						>
							<div class="py-1">
								{#each locales as locale}
									<button
										type="button"
										onclick={() => handleLocaleChange(locale)}
										class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 {currentLocale ===
										locale
											? 'bg-blue-50 font-semibold text-blue-600'
											: ''}"
									>
										{localeNames[locale] || locale}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</nav>

{#if isDropdownOpen}
	<button
		type="button"
		onclick={() => (isDropdownOpen = false)}
		class="fixed inset-0 z-0"
		aria-label="Close dropdown"
	></button>
{/if}
