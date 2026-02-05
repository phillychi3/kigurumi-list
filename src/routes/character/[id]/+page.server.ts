import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export const load: PageServerLoad = async ({ params, fetch }) => {
	const response = await fetch(`${API_BASE_URL}/character/${params.id}`)
	if (!response.ok) {
		throw error(404, 'Character not found')
	}
	const character = await response.json()
	return { character }
}
