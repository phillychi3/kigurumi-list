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
	import { Tabs, Collapsible } from 'bits-ui'

	let pendingKigers: PendingKiger[] = $state([])
	let pendingCharacters: PendingCharacter[] = $state([])
	let pendingMakers: PendingMaker[] = $state([])

	let loading = $state(true)
	let error = $state<string | null>(null)

	let processingId = $state<string | null>(null)

	let activeTab = $state('kigers')

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

	function formatDate(date: string | null | undefined): string {
		if (!date) return '-'
		return new Date(date).toLocaleString('zh-TW')
	}

	/** Get the full-size Twitter profile image URL */
	function fullProfileImage(url: string | null | undefined): string | null {
		if (!url) return null
		return url.replace(/_normal\./, '_400x400.')
	}

	const totalPending = $derived(
		pendingKigers.length + pendingCharacters.length + pendingMakers.length
	)

	const socialMediaLabels: Record<string, string> = {
		twitter: 'Twitter',
		instagram: 'Instagram',
		facebook: 'Facebook',
		tiktok: 'TikTok',
		pixiv: 'Pixiv',
		website: 'Website',
		taobao: 'Taobao',
		amazon: 'Amazon'
	}

</script>

<AdminGuard>
	<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div
			class="mb-8 flex items-center justify-between rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
		>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">{m.admin_dashboard()}</h1>
				<p class="mt-1 text-sm text-gray-500">
					歡迎，{$authUsername}
					{#if !loading}
						· 共 {totalPending} 筆待審核
					{/if}
				</p>
			</div>
			<button
				onclick={handleLogout}
				class="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
			>
				{m.admin_logout()}
			</button>
		</div>

		{#if loading}
			<Loading />
		{:else if error}
			<Error message={error} />
		{:else}
			<Tabs.Root bind:value={activeTab}>
				<Tabs.List class="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
					<Tabs.Trigger
						value="kigers"
						class="flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700"
					>
						{m.admin_pending_kigers()}
						{#if pendingKigers.length > 0}
							<span
								class="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-semibold text-blue-700"
							>
								{pendingKigers.length}
							</span>
						{/if}
					</Tabs.Trigger>
					<Tabs.Trigger
						value="characters"
						class="flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700"
					>
						{m.admin_pending_characters()}
						{#if pendingCharacters.length > 0}
							<span
								class="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-100 px-1.5 text-xs font-semibold text-purple-700"
							>
								{pendingCharacters.length}
							</span>
						{/if}
					</Tabs.Trigger>
					<Tabs.Trigger
						value="makers"
						class="flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700"
					>
						{m.admin_pending_makers()}
						{#if pendingMakers.length > 0}
							<span
								class="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-100 px-1.5 text-xs font-semibold text-orange-700"
							>
								{pendingMakers.length}
							</span>
						{/if}
					</Tabs.Trigger>
				</Tabs.List>

				<!-- Kigers Tab -->
				<Tabs.Content value="kigers">
					{#if pendingKigers.length === 0}
						<div
							class="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center"
						>
							<p class="text-gray-400">{m.no_data()}</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#each pendingKigers as kiger}
								<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
									<div class="flex items-start gap-4 p-5">
										<!-- Profile Image -->
										{#if kiger.profileImage}
											<img
												src={fullProfileImage(kiger.profileImage)}
												alt={kiger.name}
												class="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
											/>
										{:else}
											<div
												class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-400"
											>
												{kiger.name.charAt(0)}
											</div>
										{/if}

										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-3">
												<h3 class="truncate text-lg font-semibold text-gray-900">
													{kiger.name}
												</h3>
												<span
													class="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
												>
													{kiger.status}
												</span>
												{#if kiger.isActive !== undefined}
													<span
														class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 {kiger.isActive
															? 'bg-green-50 text-green-700 ring-green-200'
															: 'bg-gray-50 text-gray-500 ring-gray-200'}"
													>
														{kiger.isActive ? '活躍' : '非活躍'}
													</span>
												{/if}
											</div>
											<p class="mt-0.5 text-xs text-gray-400">ID: {kiger.id}</p>
											{#if kiger.position}
												<p class="mt-1 text-sm text-gray-500">{kiger.position}</p>
											{/if}
											{#if kiger.bio}
												<p class="mt-2 text-sm text-gray-600">{kiger.bio}</p>
											{/if}

											<!-- Social Media -->
											{#if kiger.socialMedia}
												{@const entries = Object.entries(kiger.socialMedia).filter(
													([, v]) => v
												)}
												{#if entries.length > 0}
													<div class="mt-3 flex flex-wrap gap-2">
														{#each entries as [platform, url]}
															<a
																href={String(url)}
																target="_blank"
																rel="noopener noreferrer"
																class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
															>
																{socialMediaLabels[platform] || platform}
															</a>
														{/each}
													</div>
												{/if}
											{/if}

											<!-- Characters -->
											{#if kiger.Characters && kiger.Characters.length > 0}
												<div class="mt-3">
													<p class="mb-2 text-xs font-medium text-gray-500">
														角色 ({kiger.Characters.length})
													</p>
													<div class="flex flex-wrap gap-3">
														{#each kiger.Characters as char}
															<div
																class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
															>
																<p class="text-xs font-medium text-gray-700">
																	{char.characterId}
																</p>
																{#if char.maker}
																	<p class="text-xs text-gray-400">
																		製作者：{char.maker}
																	</p>
																{/if}
																{#if char.images && char.images.length > 0}
																	<div class="mt-1.5 flex gap-1.5">
																		{#each char.images as img}
																			<a
																				href={img}
																				target="_blank"
																				rel="noopener noreferrer"
																			>
																				<img
																					src={img}
																					alt=""
																					class="h-12 w-12 rounded object-cover ring-1 ring-gray-200 transition hover:ring-blue-400"
																				/>
																			</a>
																		{/each}
																	</div>
																{/if}
															</div>
														{/each}
													</div>
												</div>
											{/if}

											{#if kiger.submitted_at}
												<p class="mt-3 text-xs text-gray-400">
													提交於 {formatDate(kiger.submitted_at)}
												</p>
											{/if}
										</div>

										<!-- Actions -->
										<div class="flex shrink-0 gap-2">
											<button
												onclick={() => handleReview('kiger', kiger.id, 'approve')}
												disabled={processingId === kiger.id}
												class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40"
											>
												{m.admin_approve()}
											</button>
											<button
												onclick={() => handleReview('kiger', kiger.id, 'reject')}
												disabled={processingId === kiger.id}
												class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-40"
											>
												{m.admin_reject()}
											</button>
										</div>
									</div>

									<!-- Collapsible raw data -->
									<Collapsible.Root>
										<div class="border-t border-gray-100 px-5 py-2">
											<Collapsible.Trigger
												class="flex w-full items-center gap-1 text-xs text-gray-400 transition hover:text-gray-600"
											>
												<svg
													class="h-3.5 w-3.5 transition-transform [[data-state=open]>&]:rotate-90"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path d="M9 5l7 7-7 7" />
												</svg>
												原始資料
											</Collapsible.Trigger>
										</div>
										<Collapsible.Content>
											<div class="border-t border-gray-100 bg-gray-50 px-5 py-4">
												<pre class="overflow-x-auto text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{JSON.stringify(kiger, null, 2)}</pre>
											</div>
										</Collapsible.Content>
									</Collapsible.Root>
								</div>
							{/each}
						</div>
					{/if}
				</Tabs.Content>

				<!-- Characters Tab -->
				<Tabs.Content value="characters">
					{#if pendingCharacters.length === 0}
						<div
							class="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center"
						>
							<p class="text-gray-400">{m.no_data()}</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#each pendingCharacters as character}
								<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
									<div class="flex items-start gap-4 p-5">
										<!-- Official Image -->
										{#if character.officialImage}
											<img
												src={character.officialImage}
												alt={character.name}
												class="h-16 w-16 shrink-0 rounded-lg object-cover ring-2 ring-gray-100"
											/>
										{:else}
											<div
												class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-xl font-bold text-purple-300"
											>
												{character.name.charAt(0)}
											</div>
										{/if}

										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-3">
												<h3 class="truncate text-lg font-semibold text-gray-900">
													{character.name}
												</h3>
												<span
													class="shrink-0 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200"
												>
													{character.type}
												</span>
												<span
													class="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
												>
													{character.status}
												</span>
											</div>
											<p class="mt-1 text-sm text-gray-500">
												原名：{character.originalName}
											</p>

											<!-- Source info -->
											{#if character.source}
												<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
													{#if character.source.title}
														<span>作品：{character.source.title}</span>
													{/if}
													{#if character.source.company}
														<span>公司：{character.source.company}</span>
													{/if}
													{#if character.source.releaseYear}
														<span>年份：{character.source.releaseYear}</span>
													{/if}
												</div>
											{/if}

											{#if character.submitted_at}
												<p class="mt-3 text-xs text-gray-400">
													提交於 {formatDate(character.submitted_at)}
												</p>
											{/if}
										</div>

										<div class="flex shrink-0 gap-2">
											<button
												onclick={() =>
													handleReview('character', character.name, 'approve')}
												disabled={processingId === character.name}
												class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40"
											>
												{m.admin_approve()}
											</button>
											<button
												onclick={() =>
													handleReview('character', character.name, 'reject')}
												disabled={processingId === character.name}
												class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-40"
											>
												{m.admin_reject()}
											</button>
										</div>
									</div>

									<Collapsible.Root>
										<div class="border-t border-gray-100 px-5 py-2">
											<Collapsible.Trigger
												class="flex w-full items-center gap-1 text-xs text-gray-400 transition hover:text-gray-600"
											>
												<svg
													class="h-3.5 w-3.5 transition-transform [[data-state=open]>&]:rotate-90"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path d="M9 5l7 7-7 7" />
												</svg>
												原始資料
											</Collapsible.Trigger>
										</div>
										<Collapsible.Content>
											<div class="border-t border-gray-100 bg-gray-50 px-5 py-4">
												<pre class="overflow-x-auto text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{JSON.stringify(character, null, 2)}</pre>
											</div>
										</Collapsible.Content>
									</Collapsible.Root>
								</div>
							{/each}
						</div>
					{/if}
				</Tabs.Content>

				<!-- Makers Tab -->
				<Tabs.Content value="makers">
					{#if pendingMakers.length === 0}
						<div
							class="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center"
						>
							<p class="text-gray-400">{m.no_data()}</p>
						</div>
					{:else}
						<div class="space-y-4">
							{#each pendingMakers as maker}
								<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
									<div class="flex items-start gap-4 p-5">
										<!-- Avatar -->
										{#if maker.Avatar}
											<img
												src={maker.Avatar}
												alt={maker.name}
												class="h-16 w-16 shrink-0 rounded-lg object-cover ring-2 ring-gray-100"
											/>
										{:else}
											<div
												class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xl font-bold text-orange-300"
											>
												{maker.name.charAt(0)}
											</div>
										{/if}

										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-3">
												<h3 class="truncate text-lg font-semibold text-gray-900">
													{maker.name}
												</h3>
												<span
													class="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
												>
													{maker.status}
												</span>
											</div>
											<p class="mt-1 text-sm text-gray-500">
												原名：{maker.originalName}
											</p>

											<!-- Social Media -->
											{#if maker.socialMedia}
												{@const entries = Object.entries(maker.socialMedia).filter(
													([, v]) => v
												)}
												{#if entries.length > 0}
													<div class="mt-3 flex flex-wrap gap-2">
														{#each entries as [platform, url]}
															<a
																href={String(url)}
																target="_blank"
																rel="noopener noreferrer"
																class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
															>
																{socialMediaLabels[platform] || platform}
															</a>
														{/each}
													</div>
												{/if}
											{/if}

											{#if maker.submitted_at}
												<p class="mt-3 text-xs text-gray-400">
													提交於 {formatDate(maker.submitted_at)}
												</p>
											{/if}
										</div>

										<div class="flex shrink-0 gap-2">
											<button
												onclick={() => handleReview('maker', maker.name, 'approve')}
												disabled={processingId === maker.name}
												class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40"
											>
												{m.admin_approve()}
											</button>
											<button
												onclick={() => handleReview('maker', maker.name, 'reject')}
												disabled={processingId === maker.name}
												class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-40"
											>
												{m.admin_reject()}
											</button>
										</div>
									</div>

									<Collapsible.Root>
										<div class="border-t border-gray-100 px-5 py-2">
											<Collapsible.Trigger
												class="flex w-full items-center gap-1 text-xs text-gray-400 transition hover:text-gray-600"
											>
												<svg
													class="h-3.5 w-3.5 transition-transform [[data-state=open]>&]:rotate-90"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													stroke-width="2"
												>
													<path d="M9 5l7 7-7 7" />
												</svg>
												原始資料
											</Collapsible.Trigger>
										</div>
										<Collapsible.Content>
											<div class="border-t border-gray-100 bg-gray-50 px-5 py-4">
												<pre class="overflow-x-auto text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{JSON.stringify(maker, null, 2)}</pre>
											</div>
										</Collapsible.Content>
									</Collapsible.Root>
								</div>
							{/each}
						</div>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	</div>
</AdminGuard>
