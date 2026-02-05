import type { PageServerLoad } from './$types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${API_BASE_URL}/characters`)
	if (!response.ok) {
		return { characters: [], error: 'Failed to load characters' }
	}
	const characters = await response.json()
	return { characters }
}
