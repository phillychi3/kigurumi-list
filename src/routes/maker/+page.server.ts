import type { PageServerLoad } from './$types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${API_BASE_URL}/makers`)
	if (!response.ok) {
		return { makers: [], error: 'Failed to load makers' }
	}
	const makers = await response.json()
	return { makers }
}
