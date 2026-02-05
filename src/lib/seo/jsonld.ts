import type { KigerDetail, Character, CharacterDetail, Maker } from '$lib/api'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://kiglist.com'

export function buildWebsiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'kiglist',
		url: SITE_URL,
		description: 'Browse kigurumi performers, characters and makers',
		inLanguage: ['en', 'zh-TW', 'zh-CN']
	}
}

export function buildKigerJsonLd(kiger: KigerDetail, url: string) {
	const socialLinks = kiger.socialMedia
		? Object.values(kiger.socialMedia).filter((v): v is string => !!v)
		: []

	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': url,
		name: kiger.name,
		description: kiger.bio,
		image: kiger.profileImage,
		url: url,
		...(socialLinks.length > 0 && { sameAs: socialLinks })
	}
}

export function buildCharacterJsonLd(character: CharacterDetail | Character, url: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Thing',
		'@id': url,
		name: character.name,
		alternateName: character.originalName,
		image: character.officialImage,
		description: character.source
			? `${character.name} from ${character.source.title}`
			: character.name,
		...(character.source && {
			isPartOf: {
				'@type': 'CreativeWork',
				name: character.source.title,
				creator: {
					'@type': 'Organization',
					name: character.source.company
				},
				datePublished: String(character.source.releaseYear)
			}
		})
	}
}

export function buildMakerJsonLd(maker: Maker, url: string) {
	const socialLinks = maker.socialMedia
		? Object.values(maker.socialMedia).filter((v): v is string => !!v)
		: []

	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': url,
		name: maker.name,
		alternateName: maker.originalName,
		image: maker.Avatar,
		url: url,
		...(socialLinks.length > 0 && { sameAs: socialLinks })
	}
}
