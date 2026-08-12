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
export type HomeJsonLdInput = {
  name: string
  /** Absolute site origin (no trailing slash). May be empty. */
  origin: string
  description?: string
  /** BCP-47 tag, e.g. `zh-CN`. */
  inLanguage?: string
  /** Absolute logo URL. */
  logoUrl?: string
}

/**
 * Homepage structured data as a single `@graph` so `WebSite` can point at the
 * publishing `Organization` by `@id` instead of duplicating it.
 *
 * No `SearchAction` is emitted: Google retired the sitelinks search box in
 * late 2024, and the only search surface here (`/pricing?search=`) can be
 * disabled or auth-gated per deployment, so advertising it may describe a URL
 * that redirects.
 */
export function buildHomeJsonLd(
  input: HomeJsonLdInput
): Record<string, unknown> {
  const homeUrl = input.origin ? `${input.origin}/` : undefined
  const organizationId = input.origin
    ? `${input.origin}/#organization`
    : undefined

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': organizationId,
    name: input.name,
    url: homeUrl,
  }
  if (input.logoUrl) {
    organization.logo = { '@type': 'ImageObject', url: input.logoUrl }
  }

  const website: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': input.origin ? `${input.origin}/#website` : undefined,
    name: input.name,
    url: homeUrl,
    description: input.description || undefined,
    inLanguage: input.inLanguage || undefined,
  }
  if (organizationId) {
    website.publisher = { '@id': organizationId }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website],
  }
}
