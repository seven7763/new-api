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
 * Last-resort site name when neither the admin config nor the cached
 * `/api/status` payload provides one.
 */
export const DEFAULT_SEO_SITE_NAME = 'DaoXE'

export function defaultSeoDescription(lang?: string): string {
  const l = (lang || '').toLowerCase()
  if (l.startsWith('zh')) {
    return '统一的 AI 模型网关与管理平台，支持 OpenAI / Claude / Gemini 兼容接口，集中管理多模型 API 密钥、渠道分发与用量计费。'
  }
  return 'Unified AI API gateway and admin dashboard with OpenAI / Claude / Gemini compatible APIs, multi-channel routing, key management and usage billing.'
}

export function defaultSeoKeywords(lang?: string): string {
  const l = (lang || '').toLowerCase()
  if (l.startsWith('zh')) {
    return 'AI API,大模型API,LLM网关,OpenAI兼容接口,Claude API,Gemini API,API聚合分发,模型管理,DaoXE'
  }
  return 'AI API, LLM API Gateway, OpenAI Compatible API, Claude API, Gemini API, model aggregation, API distribution, DaoXE'
}

export function defaultSeoTitleSuffix(lang?: string): string {
  const l = (lang || '').toLowerCase()
  if (l.startsWith('zh')) {
    return 'AI大模型API网关|OpenAI/Claude/Gemini兼容|统一接口管理与分发平台'
  }
  return 'AI LLM API Gateway | OpenAI Claude Gemini Compatible | Unified Model Hub'
}

/**
 * Build final document title.
 * Long-tail default suffix is ONLY applied when allowDefaultSuffix is true
 * (homepage). Other routes keep a short brand title.
 */
export function buildDocumentTitle(input: {
  fullTitle?: string
  title?: string
  titleSuffix?: string
  lang?: string
  /** When true and no fullTitle/suffix set, append language long-tail. Homepage only. */
  allowDefaultSuffix?: boolean
}): string {
  const full = (input.fullTitle || '').trim()
  if (full) return full
  const name = (input.title || '').trim() || DEFAULT_SEO_SITE_NAME
  let suffix = (input.titleSuffix || '').trim()
  if (!suffix && input.allowDefaultSuffix) {
    suffix = defaultSeoTitleSuffix(input.lang)
  }
  if (!suffix) return name
  // Avoid double-appending if title already contains the suffix
  if (name.includes(suffix) || suffix.includes(name)) return name
  return `${name} - ${suffix}`
}
