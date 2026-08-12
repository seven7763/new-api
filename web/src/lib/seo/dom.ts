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
const JSON_LD_ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

/**
 * Serialize admin-configurable data for a `<script type="application/ld+json">`
 * block. `<`, `>` and `&` only ever occur inside string literals in
 * `JSON.stringify` output, so replacing them with their `\uXXXX` form keeps the
 * parsed value identical while making `</script>` and `<!--` impossible to
 * emit. U+2028/U+2029 are escaped because they are literal line terminators to
 * a JavaScript parser but legal raw characters in JSON.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replaceAll(
    /[<>&\u2028\u2029]/g,
    (char) => JSON_LD_ESCAPES[char]
  )
}

/** Escape a value for use inside a quoted CSS attribute selector. */
function quotedAttributeValue(value: string): string {
  return value.replaceAll(/["\\]/g, '\\$&')
}

function upsertMeta(
  attribute: 'name' | 'property',
  key: string,
  content: string
): void {
  if (typeof document === 'undefined') return
  const existing = document.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${quotedAttributeValue(key)}"]`
  )
  // An empty value means "this tag no longer applies". Removing it prevents a
  // stale value (from index.html or a previous route) from outliving the config.
  if (!content) {
    existing?.remove()
    return
  }
  const el = existing ?? document.createElement('meta')
  if (!existing) {
    el.setAttribute(attribute, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function upsertMetaByName(name: string, content: string) {
  upsertMeta('name', name, content)
}

export function upsertMetaByProperty(property: string, content: string) {
  upsertMeta('property', property, content)
}

export function upsertLinkRel(rel: string, href: string) {
  if (typeof document === 'undefined') return
  const existing = document.querySelector<HTMLLinkElement>(
    `link[rel="${quotedAttributeValue(rel)}"]`
  )
  if (!href) {
    existing?.remove()
    return
  }
  const el = existing ?? document.createElement('link')
  if (!existing) {
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function upsertJsonLd(id: string, data: unknown) {
  if (typeof document === 'undefined') return
  if (data == null) {
    removeJsonLd(id)
    return
  }
  let el = document.querySelector<HTMLScriptElement>(
    `script[id="${quotedAttributeValue(id)}"]`
  )
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = serializeJsonLd(data)
}

export function removeJsonLd(id: string) {
  if (typeof document === 'undefined') return
  document.querySelector(`script[id="${quotedAttributeValue(id)}"]`)?.remove()
}
