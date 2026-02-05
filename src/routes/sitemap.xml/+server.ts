import type { RequestHandler } from './$types'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

const LOCALES = ['en', 'zh-tw', 'zh-cn'] as const
const BASE_LOCALE = 'en'

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

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map((page) => generateUrlEntry(page)).join('\n')}
</urlset>`

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	})
}

function generateUrlEntry(path: string): string {
	const today = new Date().toISOString().split('T')[0]

	const hreflangLinks = LOCALES.map((locale) => {
		const localizedPath = locale === BASE_LOCALE ? path : `/${locale}${path}`
		return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${SITE_URL}${localizedPath}" />`
	}).join('\n')

	return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
${hreflangLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${path}" />
  </url>`
}
