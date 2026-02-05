import type { PageServerLoad } from './$types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${API_BASE_URL}/kigers`)
	if (!response.ok) {
		return { kigers: [], error: 'Failed to load kigers' }
	}
	const kigers = await response.json()
	return { kigers }
}
