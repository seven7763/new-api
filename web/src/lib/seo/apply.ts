/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import {
  DEFAULT_SEO_SITE_NAME,
  buildDocumentTitle,
  defaultSeoDescription,
  defaultSeoKeywords,
} from './defaults'
import {
  removeJsonLd,
  upsertJsonLd,
  upsertLinkRel,
  upsertMetaByName,
  upsertMetaByProperty,
} from './dom'
import type { SeoInput, StatusSeoFields } from './types'
import {
  resolveDocumentLang,
  resolveImageUrl,
  resolveOgLocale,
  resolvePageUrl,
  resolveSiteUrl,
} from './url'

const JSON_LD_ID = 'seo-jsonld'

/**
 * Indexable pages also opt into rich previews; Google caps snippets and image
 * previews conservatively unless told otherwise.
 */
const INDEX_ROBOTS =
  'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
const NOINDEX_ROBOTS = 'noindex,nofollow'

function normalizePath(path: string): string {
  return (path || '/').split('?')[0]?.split('#')[0] || '/'
}

/** Homepage only — long-tail SEO titles belong here, not on every public page. */
function isHomePath(path: string): boolean {
  const p = normalizePath(path)
  return p === '/' || p === '' || p === '/index.html'
}

/** Public marketing pages may be indexed with a short brand title (no long-tail). */
function isPublicMarketingPath(path: string): boolean {
  const p = normalizePath(path)
  if (isHomePath(p)) return true
  return (
    p === '/pricing' ||
    p.startsWith('/pricing/') ||
    p === '/about' ||
    p === '/rankings' ||
    p.startsWith('/rankings/')
  )
}

export function applyDocumentSeo(input: SeoInput): void {
  if (typeof document === 'undefined') return

  const lang =
    input.lang ||
    document.documentElement.lang ||
    (typeof navigator !== 'undefined' ? navigator.language : 'zh-CN')

  const path = normalizePath(
    input.path ||
      (typeof window !== 'undefined' ? window.location.pathname : '/')
  )
  const isHome = isHomePath(path)
  const title = buildDocumentTitle({
    fullTitle: isHome ? input.fullTitle : undefined,
    title: input.title,
    // Long-tail suffix only on homepage (even if caller passes a suffix).
    titleSuffix: isHome ? input.titleSuffix : undefined,
    lang,
    allowDefaultSuffix: isHome,
  })
  const description =
    (input.description || '').trim() || defaultSeoDescription(lang)
  const keywords = (input.keywords || '').trim() || defaultSeoKeywords(lang)
  const siteUrl = resolveSiteUrl(input.siteUrl)
  const pageUrl = resolvePageUrl(siteUrl, path)
  const ogImage = resolveImageUrl(input.ogImage || '/logo.png', siteUrl)
  const robotsIndex = input.robotsIndex !== false
  const siteName = (input.title || '').trim() || DEFAULT_SEO_SITE_NAME

  if (title) {
    document.title = title
    upsertMetaByName('title', title)
  }

  if (lang) {
    document.documentElement.lang = resolveDocumentLang(lang)
  }

  upsertMetaByName('description', description)
  upsertMetaByName('keywords', keywords)
  upsertMetaByName('robots', robotsIndex ? INDEX_ROBOTS : NOINDEX_ROBOTS)

  const ogTitle = title || document.title || DEFAULT_SEO_SITE_NAME
  upsertMetaByProperty('og:type', 'website')
  upsertMetaByProperty('og:title', ogTitle)
  upsertMetaByProperty('og:description', description)
  upsertMetaByProperty('og:url', pageUrl)
  upsertMetaByProperty('og:image', ogImage)
  upsertMetaByProperty('og:image:alt', ogImage ? ogTitle : '')
  upsertMetaByProperty('og:locale', resolveOgLocale(lang))
  // og:site_name should always be the short brand name, never the long-tail title
  upsertMetaByProperty('og:site_name', siteName)

  upsertMetaByName('twitter:card', ogImage ? 'summary_large_image' : 'summary')
  upsertMetaByName('twitter:title', ogTitle)
  upsertMetaByName('twitter:description', description)
  upsertMetaByName('twitter:image', ogImage)
  upsertMetaByName('twitter:image:alt', ogImage ? ogTitle : '')

  // A canonical URL on a noindex page is a contradictory signal, and pointing
  // every console route at the homepage would be worse than sending nothing.
  upsertLinkRel('canonical', robotsIndex ? pageUrl : '')

  if (input.jsonLd !== undefined) {
    upsertJsonLd(JSON_LD_ID, input.jsonLd)
  }
}

/** Map /api/status payload into SeoInput and apply. */
export function applySeoFromStatus(
  status: StatusSeoFields | Record<string, unknown> | null | undefined,
  extra?: Partial<SeoInput>
): void {
  if (!status && !extra) return
  const s = (status || {}) as StatusSeoFields
  const path = normalizePath(
    extra?.path ||
      (typeof window !== 'undefined' ? window.location.pathname : '/')
  )
  const home = isHomePath(path)

  applyDocumentSeo({
    title: s.system_name || DEFAULT_SEO_SITE_NAME,
    description: s.seo_description,
    keywords: s.seo_keywords,
    siteUrl: s.seo_site_url || s.server_address,
    ogImage: s.seo_og_image || s.logo || '/logo.png',
    // Long-tail full title / suffix: homepage only.
    fullTitle: home ? s.seo_title : undefined,
    titleSuffix: home ? s.seo_title_suffix : undefined,
    // Console/auth: noindex. Public pages follow the admin robots flag.
    robotsIndex: isPublicMarketingPath(path) && s.seo_robots_index !== false,
    ...extra,
    // `path` is authoritative: applyDocumentSeo re-derives the title mode,
    // canonical and og:url from it, so callers cannot leak a homepage
    // long-tail title onto a console route.
    path,
  })
}

export function clearSeoJsonLd(): void {
  removeJsonLd(JSON_LD_ID)
}
