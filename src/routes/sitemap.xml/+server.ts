import type { RequestHandler } from './$types'
import { locales, baseLocale } from '$lib/paraglide/runtime'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export const GET: RequestHandler = async ({ fetch }) => {
	const staticPages = ['/', '/kiger', '/character', '/maker']

	const [kigers, characters, makers] = await Promise.all([
		fetch(`${API_BASE_URL}/kigers`)
			.then((r) => r.json())
			.catch(() => []),
		fetch(`${API_BASE_URL}/characters`)
			.then((r) => r.json())
			.catch(() => []),
		fetch(`${API_BASE_URL}/makers`)
			.then((r) => r.json())
			.catch(() => [])
	])

	const dynamicPages = [
		...kigers.map((k: { id: string }) => `/kiger/${k.id}`),
		...characters.map((c: { id: number }) => `/character/${c.id}`),
		...makers.map((m: { id: number }) => `/maker/${m.id}`)
	]

	const allPages = [...staticPages, ...dynamicPages]

	const urlEntries: string[] = []
	for (const page of allPages) {
		for (const locale of locales) {
			urlEntries.push(generateUrlEntry(page, locale))
		}
	}

	const sitemap = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...urlEntries,
		'</urlset>'
	].join('\n')

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=3600'
		}
	})
}

function getLocalizedPath(path: string, locale: string): string {
	return locale === baseLocale ? path : `/${locale}${path}`
}

function generateUrlEntry(path: string, currentLocale: string): string {
	const today = new Date().toISOString().split('T')[0]
	const currentPath = getLocalizedPath(path, currentLocale)

	const hreflangLinks = locales
		.map((locale) => {
			const localizedPath = getLocalizedPath(path, locale)
			return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${SITE_URL}${localizedPath}" />`
		})
		.join('\n')

	const xDefaultPath = getLocalizedPath(path, baseLocale)

	return `  <url>
    <loc>${SITE_URL}${currentPath}</loc>
    <lastmod>${today}</lastmod>
${hreflangLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${xDefaultPath}" />
  </url>`
}
