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
export type SeoInput = {
  title?: string
  /** When title is a short brand name, append this long-tail suffix: "Name - suffix" */
  titleSuffix?: string
  /** Full document title override (wins over title + titleSuffix) */
  fullTitle?: string
  description?: string
  keywords?: string
  siteUrl?: string
  path?: string
  ogImage?: string
  robotsIndex?: boolean
  lang?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null
}

export type StatusSeoFields = {
  system_name?: string
  logo?: string
  server_address?: string
  seo_title?: string
  seo_title_suffix?: string
  seo_description?: string
  seo_keywords?: string
  seo_site_url?: string
  seo_og_image?: string
  seo_robots_index?: boolean
}
