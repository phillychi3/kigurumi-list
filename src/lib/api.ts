const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`
	const response = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers
		}
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(error || `HTTP error! status: ${response.status}`)
	}

	return response.json()
}

export interface KigerSocialMedia {
	instagram?: string | null
	twitter?: string | null
	facebook?: string | null
	tiktok?: string | null
	pixiv?: string | null
	website?: string | null
}

export interface CharacterReference {
	characterId: string
	maker?: string | null
	images: string[]
}

export interface KigerListItem {
	id: string
	name: string
	bio: string
	profileImage: string
	position?: string
	isActive: boolean
	socialMedia: KigerSocialMedia
	createdAt: string
	updatedAt: string
}

export interface KigerDetail extends KigerListItem {
	Characters: CharacterReference[]
}

export interface KigerSubmit {
	name: string
	bio: string
	profileImage: string
	position?: string
	isActive: boolean
	socialMedia: KigerSocialMedia
	Characters: CharacterReference[]
}

export async function getKigers(): Promise<KigerListItem[]> {
	return fetchAPI('/kigers')
}

export async function getKiger(id: string): Promise<KigerDetail> {
	return fetchAPI(`/kiger/${id}`)
}

export async function submitKiger(data: KigerSubmit): Promise<{ message: string }> {
	return fetchAPI('/kiger', {
		method: 'POST',
		body: JSON.stringify(data)
	})
}

export async function updateKiger(
	id: string,
	data: KigerSubmit,
	token?: string
): Promise<{ message: string }> {
	if (token) {
		return fetchWithAuth(`/admin/kiger/${id}`, token, {
			method: 'PUT',
			body: JSON.stringify(data)
		})
	} else {
		return fetchAPI('/kiger', {
			method: 'POST',
			body: JSON.stringify(data)
		})
	}
}

export interface CharacterSource {
	title: string
	company: string
	releaseYear: number
}

export interface Character {
	id: number
	name: string
	originalName: string
	type: string
	officialImage: string
	source: CharacterSource | null
}

export interface CharacterDetail extends Character {
	[key: string]: any
}

export async function getCharacters(): Promise<Character[]> {
	return fetchAPI('/characters')
}

export async function getCharacter(id: number): Promise<CharacterDetail> {
	return fetchAPI(`/character/${id}`)
}

export async function submitCharacter(data: Character): Promise<{ message: string }> {
	return fetchAPI('/character', {
		method: 'POST',
		body: JSON.stringify(data)
	})
}

export async function updateCharacter(
	id: number,
	data: Character,
	token?: string
): Promise<{ message: string }> {
	if (token) {
		return fetchWithAuth(`/admin/character/${id}`, token, {
			method: 'PUT',
			body: JSON.stringify(data)
		})
	} else {
		return fetchAPI('/character', {
			method: 'POST',
			body: JSON.stringify(data)
		})
	}
}

export interface MakerSocialMedia {
	twitter?: string | null
	facebook?: string | null
	taobao?: string | null
	amazon?: string | null
	website?: string | null
}

export interface Maker {
	id: number
	name: string
	originalName: string
	Avatar: string
	socialMedia: MakerSocialMedia | null
}

export async function updateMaker(
	id: number,
	data: Maker,
	token?: string
): Promise<{ message: string }> {
	if (token) {
		return fetchWithAuth(`/admin/maker/${id}`, token, {
			method: 'PUT',
			body: JSON.stringify(data)
		})
	} else {
		return fetchAPI('/maker', {
			method: 'POST',
			body: JSON.stringify(data)
		})
	}
}

export async function getMakers(): Promise<Maker[]> {
	return fetchAPI('/makers')
}

export async function getMaker(id: number): Promise<Maker> {
	return fetchAPI(`/maker/${id}`)
}

export async function submitMaker(data: Maker): Promise<{ message: string }> {
	return fetchAPI('/maker', {
		method: 'POST',
		body: JSON.stringify(data)
	})
}

export interface TwitterUserCrawlResponse {
	id: string
	name: string
	bio: string
	profileImage: string
	position: string
	isActive: boolean
	socialMedia: Record<string, any>
	Characters: CharacterReference[]
	createdAt: string
	updatedAt: string
}

export async function crawlTwitterUser(username: string): Promise<TwitterUserCrawlResponse> {
	return fetchAPI('/crawl/twitter/user', {
		method: 'POST',
		body: JSON.stringify({ username })
	})
}

export interface TwitterTweetCrawlResponse {
	character: Record<string, any> | null
	images: string[]
}

export async function crawlTwitterTweet(
	username: string,
	tweetId: string
): Promise<TwitterTweetCrawlResponse> {
	return fetchAPI('/crawl/twitter/tweet', {
		method: 'POST',
		body: JSON.stringify({ username, tweet_id: tweetId })
	})
}

export interface ImageCharacterCrawlResponse {
	success: boolean
	character: Record<string, any> | null
	error?: string | null
}

export async function crawlImage(imageUrl: string): Promise<ImageCharacterCrawlResponse> {
	return fetchAPI('/crawl/image', {
		method: 'POST',
		body: JSON.stringify({ image_url: imageUrl })
	})
}

export interface LoginRequest {
	username: string
	password: string
}

export interface LoginResponse {
	access_token: string
	token_type: string
	username: string
}

export async function adminLogin(credentials: LoginRequest): Promise<LoginResponse> {
	return fetchAPI('/admin/login', {
		method: 'POST',
		body: JSON.stringify(credentials)
	})
}

async function fetchWithAuth<T>(
	endpoint: string,
	token: string,
	options: RequestInit = {}
): Promise<T> {
	return fetchAPI(endpoint, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`
		}
	})
}

export interface PendingKiger {
	id: string
	name: string
	bio?: string | null
	status: string
	submitted_at?: string | null
}

export interface PendingCharacter {
	originalName: string
	name: string
	type: string
	status: string
	submitted_at?: string | null
}

export interface PendingMaker {
	originalName: string
	name: string
	status: string
	submitted_at?: string | null
}

export async function getPendingKigers(token: string): Promise<PendingKiger[]> {
	return fetchWithAuth('/admin/pending/kigers', token)
}

export async function getPendingCharacters(token: string): Promise<PendingCharacter[]> {
	return fetchWithAuth('/admin/pending/characters', token)
}

export async function getPendingMakers(token: string): Promise<PendingMaker[]> {
	return fetchWithAuth('/admin/pending/makers', token)
}

export interface ReviewResponse {
	message: string
	status: string
}

export async function reviewKiger(
	token: string,
	kigerId: string,
	action: 'approve' | 'reject'
): Promise<ReviewResponse> {
	return fetchWithAuth(`/admin/review/kiger/${kigerId}`, token, {
		method: 'POST',
		body: JSON.stringify({ action })
	})
}

export async function reviewCharacter(
	token: string,
	characterId: string,
	action: 'approve' | 'reject'
): Promise<ReviewResponse> {
	return fetchWithAuth(`/admin/review/character/${characterId}`, token, {
		method: 'POST',
		body: JSON.stringify({ action })
	})
}

export async function reviewMaker(
	token: string,
	makerId: string,
	action: 'approve' | 'reject'
): Promise<ReviewResponse> {
	return fetchWithAuth(`/admin/review/maker/${makerId}`, token, {
		method: 'POST',
		body: JSON.stringify({ action })
	})
}
