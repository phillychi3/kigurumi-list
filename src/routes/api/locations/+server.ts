import type { RequestHandler } from './$types'
import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type')
	const countryCode = url.searchParams.get('countryCode')
	const stateCode = url.searchParams.get('stateCode')

	if (type === 'countries') {
		const countries = await getCountries()
		return json(countries)
	}

	if (type === 'states' && countryCode) {
		const states = await getStatesOfCountry(countryCode)
		return json(states)
	}

	if (type === 'cities' && countryCode && stateCode) {
		const cities = await getCitiesOfState(countryCode, stateCode)
		return json(cities)
	}

	return json({ error: 'Invalid request parameters' }, { status: 400 })
}
