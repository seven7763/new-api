/**
 * Allowlist sanitizer for HTML that arrives from the gateway API
 * (`/api/notice`, `status.footer_html`). That content is operator-authored but
 * still crosses a trust boundary before it reaches `dangerouslySetInnerHTML`,
 * so it is parsed into an inert document and rebuilt from an allowlist rather
 * than pattern-matched.
 */

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'div', 'dl', 'dt',
  'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i',
  'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul',
])

/** Elements whose text content must not survive unwrapping. */
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button',
  'select', 'textarea', 'link', 'meta', 'base', 'noscript', 'template', 'svg',
  'math', 'audio', 'video', 'source', 'track', 'canvas', 'portal',
])

const GLOBAL_ATTRS = new Set(['title', 'dir', 'lang'])
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan', 'scope']),
  ol: new Set(['start', 'type']),
}

const SAFE_URL = /^(?:https?:|mailto:|tel:|#|\/(?!\/)|[^:/?#]*(?:[/?#]|$))/i

function safeUrl(value: string): boolean {
  // Strip control characters first: `java\tscript:` parses as a javascript: URL.
  return SAFE_URL.test(value.replace(/[\u0000-\u0020]/g, '').toLowerCase())
}

/**
 * Returns HTML containing only allowlisted tags and attributes. Disallowed
 * wrappers are unwrapped so their text survives; script-bearing elements are
 * dropped whole. Returns `''` outside the browser (no DOMParser available).
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return ''

  const doc = new DOMParser().parseFromString(`<div>${dirty}</div>`, 'text/html')
  const root = doc.body.firstElementChild
  if (!root) return ''

  // Snapshot before mutating: the live tree shifts as nodes are replaced.
  for (const el of Array.from(root.querySelectorAll('*'))) {
    if (!el.isConnected) continue
    const tag = el.tagName.toLowerCase()

    if (DROP_WITH_CONTENT.has(tag)) {
      el.remove()
      continue
    }

    if (!ALLOWED_TAGS.has(tag)) {
      el.replaceWith(...Array.from(el.childNodes))
      continue
    }

    const allowed = TAG_ATTRS[tag]
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      const ok = GLOBAL_ATTRS.has(name) || allowed?.has(name)
      if (!ok || ((name === 'href' || name === 'src') && !safeUrl(attr.value))) {
        el.removeAttribute(attr.name)
      }
    }

    if (tag === 'a' && el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer')
    }
  }

  return root.innerHTML
}
