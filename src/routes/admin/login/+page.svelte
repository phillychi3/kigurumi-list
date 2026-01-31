<script lang="ts">
	import { goto } from '$app/navigation'
	import { m } from '$lib/paraglide/messages.js'
	import { adminLogin } from '$lib/api'
	import { setAuth } from '$lib/auth'

	let username = $state('')
	let password = $state('')
	let submitting = $state(false)
	let error = $state<string | null>(null)

	async function handleSubmit(event: Event) {
		event.preventDefault()
		submitting = true
		error = null

		try {
			const result = await adminLogin({ username, password })
			setAuth(result.access_token, result.username)
			goto('/admin')
		} catch (e) {
			error = e instanceof Error ? e.message : String(e)
		} finally {
			submitting = false
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-white p-8 shadow-lg">
			<h1 class="mb-6 text-center text-3xl font-bold text-gray-900">{m.admin_login()}</h1>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label for="username" class="mb-1 block text-sm font-medium text-gray-700">
						{m.admin_username()}
					</label>
					<input
						type="text"
						id="username"
						bind:value={username}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
						{m.admin_password()}
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				{#if error}
					<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
						{error}
					</div>
				{/if}

				<button
					type="submit"
					disabled={submitting}
					class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
				>
					{submitting ? m.loading() : m.admin_login_button()}
				</button>
			</form>

			<div class="mt-6 text-center">
				<a href="/" class="text-sm text-gray-600 hover:text-gray-900">&larr; {m.back()}</a>
			</div>
		</div>
	</div>
</div>
