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
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useSystemConfig } from '@/hooks/use-system-config'
import {
  DEFAULT_SEO_SITE_NAME,
  applySeoFromStatus,
  buildHomeJsonLd,
  clearSeoJsonLd,
  defaultSeoDescription,
  readCachedStatus,
  resolveDocumentLang,
  resolveImageUrl,
  resolveSiteUrl,
} from '@/lib/seo'

/**
 * Homepage-only SEO: long-tail title + Organization/WebSite structured data
 * while mounted. Reads status from localStorage (already populated by main.tsx
 * on boot). On unmount, drops the structured data and lets the root route
 * re-apply the short brand title for the destination route.
 */
export function useHomeSeo() {
  const { i18n } = useTranslation()
  const { systemName, logo } = useSystemConfig()

  useEffect(() => {
    const status = readCachedStatus()
    const name =
      systemName || String(status?.system_name || '') || DEFAULT_SEO_SITE_NAME
    const origin = resolveSiteUrl(
      String(status?.seo_site_url || status?.server_address || '')
    )
    const ogImage = String(status?.seo_og_image || status?.logo || logo || '')

    applySeoFromStatus(status || undefined, {
      title: name,
      path: '/',
      lang: i18n.language,
      siteUrl: origin,
      ogImage: ogImage || '/logo.png',
      jsonLd: buildHomeJsonLd({
        name,
        origin,
        description:
          String(status?.seo_description || '').trim() ||
          defaultSeoDescription(i18n.language),
        inLanguage: resolveDocumentLang(i18n.language),
        logoUrl: resolveImageUrl(String(status?.logo || logo || ''), origin),
      }),
    })

    return () => {
      clearSeoJsonLd()
    }
  }, [systemName, logo, i18n.language])
}
