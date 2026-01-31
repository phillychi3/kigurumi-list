import { writable } from 'svelte/store'
import { browser } from '$app/environment'

const TOKEN_KEY = 'admin_token'
const USERNAME_KEY = 'admin_username'

function getInitialToken(): string | null {
	if (browser) {
		return localStorage.getItem(TOKEN_KEY)
	}
	return null
}

function getInitialUsername(): string | null {
	if (browser) {
		return localStorage.getItem(USERNAME_KEY)
	}
	return null
}

export const authToken = writable<string | null>(getInitialToken())
export const authUsername = writable<string | null>(getInitialUsername())
export const isAuthenticated = writable<boolean>(!!getInitialToken())

export function setAuth(token: string, username: string) {
	if (browser) {
		localStorage.setItem(TOKEN_KEY, token)
		localStorage.setItem(USERNAME_KEY, username)
	}
	authToken.set(token)
	authUsername.set(username)
	isAuthenticated.set(true)
}

export function clearAuth() {
	if (browser) {
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(USERNAME_KEY)
	}
	authToken.set(null)
	authUsername.set(null)
	isAuthenticated.set(false)
}

export function getToken(): string | null {
	if (browser) {
		return localStorage.getItem(TOKEN_KEY)
	}
	return null
}
