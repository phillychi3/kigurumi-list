<script lang="ts">
	import { m } from '$lib/paraglide/messages.js'
	import {
		getPendingKigers,
		getPendingCharacters,
		getPendingMakers,
		reviewKiger,
		reviewCharacter,
		reviewMaker,
		type PendingKiger,
		type PendingCharacter,
		type PendingMaker
	} from '$lib/api'
	import { getToken, clearAuth, authUsername } from '$lib/auth'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import AdminGuard from '$lib/components/AdminGuard.svelte'
	import Loading from '$lib/components/Loading.svelte'
	import Error from '$lib/components/Error.svelte'

	let pendingKigers: PendingKiger[] = $state([])
	let pendingCharacters: PendingCharacter[] = $state([])
	let pendingMakers: PendingMaker[] = $state([])

	let loading = $state(true)
	let error = $state<string | null>(null)

	let processingId = $state<string | null>(null)

	async function loadData() {
		const token = getToken()
		if (!token) {
			goto('/admin/login')
			return
		}

		loading = true
		error = null

		try {
			;[pendingKigers, pendingCharacters, pendingMakers] = await Promise.all([
				getPendingKigers(token),
				getPendingCharacters(token),
				getPendingMakers(token)
			])
		} catch (e) {
			error = e instanceof Error ? e.message : String(e)
		} finally {
			loading = false
		}
	}

	onMount(() => {
		loadData()
	})

	async function handleReview(
		type: 'kiger' | 'character' | 'maker',
		id: string,
		action: 'approve' | 'reject'
	) {
		const token = getToken()
		if (!token) return

		processingId = id

		try {
			if (type === 'kiger') {
				await reviewKiger(token, id, action)
			} else if (type === 'character') {
				await reviewCharacter(token, id, action)
			} else {
				await reviewMaker(token, id, action)
			}

			await loadData()
		} catch (e) {
			error = e instanceof Error ? e.message : String(e)
		} finally {
			processingId = null
		}
	}

	function handleLogout() {
		clearAuth()
		goto('/admin/login')
	}
</script>

<AdminGuard>
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold text-gray-900">{m.admin_dashboard()}</h1>
			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-600">歡迎，{$authUsername}</span>
				<button
					onclick={handleLogout}
					class="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					{m.admin_logout()}
				</button>
			</div>
		</div>

		{#if loading}
			<Loading />
		{:else if error}
			<Error message={error} />
		{:else}
			<div class="space-y-8">
				<div>
					<h2 class="mb-4 text-2xl font-bold text-gray-900">{m.admin_pending_kigers()}</h2>
					{#if pendingKigers.length === 0}
						<p class="text-gray-500">{m.no_data()}</p>
					{:else}
						<div class="space-y-4">
							{#each pendingKigers as kiger}
								<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<h3 class="text-lg font-semibold text-gray-900">{kiger.name}</h3>
											<p class="text-sm text-gray-600">{kiger.bio || '無簡介'}</p>
											<div class="mt-2 flex gap-2 text-xs">
												<span class="rounded bg-gray-100 px-2 py-1">
													ID: {kiger.id}
												</span>
												<span class="rounded bg-blue-100 px-2 py-1 text-blue-800">
													{kiger.status}
												</span>
												{#if kiger.submitted_at}
													<span class="text-gray-500">
														{new Date(kiger.submitted_at).toLocaleString()}
													</span>
												{/if}
											</div>
										</div>
										<div class="flex gap-2">
											<button
												onclick={() => handleReview('kiger', kiger.id, 'approve')}
												disabled={processingId === kiger.id}
												class="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:bg-gray-300"
											>
												{m.admin_approve()}
											</button>
											<button
												onclick={() => handleReview('kiger', kiger.id, 'reject')}
												disabled={processingId === kiger.id}
												class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:bg-gray-300"
											>
												{m.admin_reject()}
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div>
					<h2 class="mb-4 text-2xl font-bold text-gray-900">{m.admin_pending_characters()}</h2>
					{#if pendingCharacters.length === 0}
						<p class="text-gray-500">{m.no_data()}</p>
					{:else}
						<div class="space-y-4">
							{#each pendingCharacters as character}
								<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<h3 class="text-lg font-semibold text-gray-900">{character.name}</h3>
											<p class="text-sm text-gray-600">{character.originalName}</p>
											<div class="mt-2 flex gap-2 text-xs">
												<span class="rounded bg-purple-100 px-2 py-1 text-purple-800">
													{character.type}
												</span>
												<span class="rounded bg-blue-100 px-2 py-1 text-blue-800">
													{character.status}
												</span>
												{#if character.submitted_at}
													<span class="text-gray-500">
														{new Date(character.submitted_at).toLocaleString()}
													</span>
												{/if}
											</div>
										</div>
										<div class="flex gap-2">
											<button
												onclick={() => handleReview('character', character.name, 'approve')}
												disabled={processingId === character.name}
												class="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:bg-gray-300"
											>
												{m.admin_approve()}
											</button>
											<button
												onclick={() => handleReview('character', character.name, 'reject')}
												disabled={processingId === character.name}
												class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:bg-gray-300"
											>
												{m.admin_reject()}
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div>
					<h2 class="mb-4 text-2xl font-bold text-gray-900">{m.admin_pending_makers()}</h2>
					{#if pendingMakers.length === 0}
						<p class="text-gray-500">{m.no_data()}</p>
					{:else}
						<div class="space-y-4">
							{#each pendingMakers as maker}
								<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<h3 class="text-lg font-semibold text-gray-900">{maker.name}</h3>
											<p class="text-sm text-gray-600">{maker.originalName}</p>
											<div class="mt-2 flex gap-2 text-xs">
												<span class="rounded bg-blue-100 px-2 py-1 text-blue-800">
													{maker.status}
												</span>
												{#if maker.submitted_at}
													<span class="text-gray-500">
														{new Date(maker.submitted_at).toLocaleString()}
													</span>
												{/if}
											</div>
										</div>
										<div class="flex gap-2">
											<button
												onclick={() => handleReview('maker', maker.name, 'approve')}
												disabled={processingId === maker.name}
												class="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:bg-gray-300"
											>
												{m.admin_approve()}
											</button>
											<button
												onclick={() => handleReview('maker', maker.name, 'reject')}
												disabled={processingId === maker.name}
												class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:bg-gray-300"
											>
												{m.admin_reject()}
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</AdminGuard>
