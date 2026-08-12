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
/**
 * The SEO values below are admin-configurable and end up in `href`/`content`
 * attributes, so every URL is parsed and scheme-checked before it is written to
 * the document. Anything that is not an absolute http(s) URL (or, for images, a
 * data URL) is dropped rather than passed through.
 */

function parseAbsolute(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

/**
 * Normalize the configured site URL to a scheme-checked origin + path prefix
 * with no trailing slash. Falls back to the current origin when the configured
 * value is missing or unusable.
 */
export function resolveSiteUrl(siteUrl?: string): string {
  const parsed = parseAbsolute((siteUrl || '').trim())
  if (parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
    return (parsed.origin + parsed.pathname).replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

/** Absolute page URL for canonical/og:url, or '' when no origin is known. */
export function resolvePageUrl(siteUrl: string, path: string): string {
  if (!siteUrl) return ''
  const normalized = path.split('?')[0]?.split('#')[0] || '/'
  return siteUrl + (normalized.startsWith('/') ? normalized : `/${normalized}`)
}

/**
 * Resolve an og:image/twitter:image reference to an absolute URL.
 * Returns '' for schemes that must never reach the document (`javascript:`,
 * `vbscript:`, …).
 */
export function resolveImageUrl(url: string, siteUrl: string): string {
  let raw = (url || '').trim()
  if (!raw) return ''
  if (raw.startsWith('//')) {
    raw = `https:${raw}`
  } else if (raw.startsWith('/')) {
    return siteUrl ? siteUrl + raw : ''
  }

  const parsed = parseAbsolute(raw)
  if (!parsed) return ''
  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
    return parsed.href
  }
  if (parsed.protocol === 'data:' && raw.startsWith('data:image/')) {
    return raw
  }
  return ''
}

/**
 * Keys cover both BCP-47 tags and the internal i18next codes used by
 * `src/i18n/config.ts`, which spells Chinese as `zhCN` / `zhTW`.
 */
const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  zhcn: 'zh_CN',
  'zh-cn': 'zh_CN',
  zhtw: 'zh_TW',
  'zh-tw': 'zh_TW',
  'zh-hk': 'zh_HK',
  fr: 'fr_FR',
  ja: 'ja_JP',
  ru: 'ru_RU',
  vi: 'vi_VN',
}

/** Map an i18next language tag to the `xx_YY` form Open Graph expects. */
export function resolveOgLocale(lang: string): string {
  const normalized = (lang || '').trim().toLowerCase()
  if (!normalized) return ''
  return OG_LOCALES[normalized] || OG_LOCALES[normalized.split('-')[0]] || ''
}

/** Map an i18next language tag to the BCP-47 tag used for `<html lang>`. */
export function resolveDocumentLang(lang: string): string {
  if (!lang) return ''
  if (!lang.toLowerCase().startsWith('zh')) return lang
  const lower = lang.toLowerCase()
  return lower.includes('tw') || lower.includes('hk') ? 'zh-TW' : 'zh-CN'
}
