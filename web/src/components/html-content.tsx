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
import DOMPurify, { type Config } from 'dompurify'
import { useEffect, useMemo, useRef } from 'react'

import { cn } from '@/lib/utils'

export type HtmlContentVariant = 'inline' | 'isolated'

interface HtmlContentProps {
  content: string
  className?: string
  variant?: HtmlContentVariant
}

const isolatedContentSandbox =
  'allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation'

const isolatedContentBaseStyles = `
<style>
  :host {
    display: block;
    width: 100%;
    color: inherit;
    font: inherit;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  img,
  video,
  iframe {
    max-width: 100%;
  }

  iframe {
    border: 0;
  }
</style>
`

// Tags that can hijack the whole document (script execution, base-URL
// rewriting, meta refresh, plugin content) rather than just render markup.
// Every variant forbids them, so operator-authored HTML can never escalate
// into script execution in a visitor's session.
const forbiddenTags = ['base', 'embed', 'link', 'meta', 'object', 'script']

// DOMPurify drops `target`/`rel` by default, but operator-authored inline HTML
// (site footer, announcements) routinely links out in a new tab, so they are
// allowed back and then hardened in `hardenSanitizedHtml`.
const inlineSanitizeOptions = {
  ADD_ATTR: ['rel', 'target'],
  FORBID_ATTR: ['srcdoc'],
  // Inline HTML is a narrow slot for an ICP number, friend links, or a support
  // mailbox, none of which need a form. Allowing one leaves a phishing surface
  // the script blocking above does not cover: a plain
  // `<form action="https://evil.tld">` POSTs whatever a visitor types to an
  // attacker-chosen origin without a line of script.
  FORBID_TAGS: [
    ...forbiddenTags,
    'button',
    'form',
    'input',
    'select',
    'textarea',
  ],
} satisfies Config

const isolatedSanitizeOptions = {
  ADD_ATTR: [
    'allowfullscreen',
    'autoplay',
    'class',
    'controls',
    'default',
    'id',
    'kind',
    'label',
    'loading',
    'loop',
    'muted',
    'playsinline',
    'poster',
    'preload',
    'referrerpolicy',
    'rel',
    'srclang',
    'style',
    'target',
  ],
  ADD_TAGS: ['audio', 'iframe', 'picture', 'source', 'style', 'track', 'video'],
  FORBID_ATTR: ['srcdoc'],
  FORBID_TAGS: forbiddenTags,
  FORCE_BODY: true,
} satisfies Config

// Targets that reuse the current browsing context; an empty value behaves like
// `_self`. Every other target — `_blank` or any author-chosen frame name — opens
// a new context that inherits `window.opener`, which is all reverse tabnabbing
// needs, so `rel` hardening cannot key off `_blank` alone. The match is ASCII
// case-insensitive but otherwise literal, so the raw value must not be trimmed
// first: ` _self ` is a frame name rather than the keyword.
const sameContextLinkTargets = new Set(['', '_parent', '_self', '_top'])

function hardenSanitizedHtml(
  html: string,
  variant: HtmlContentVariant
): string {
  if (typeof document === 'undefined') {
    return html
  }

  const template = document.createElement('template')
  template.innerHTML = html

  // `<area>` follows the same hyperlink rules as `<a>` and carries the same
  // `target`/`rel` pair, so an image map hotspot opens an opener-linked context
  // exactly like a link does.
  template.content
    .querySelectorAll('a[target], area[target]')
    .forEach((link) => {
      const target = link.getAttribute('target')?.toLowerCase() ?? ''

      if (sameContextLinkTargets.has(target)) {
        return
      }

      const rel = new Set(
        link.getAttribute('rel')?.split(/\s+/).filter(Boolean) ?? []
      )

      rel.add('noopener')
      rel.add('noreferrer')
      link.setAttribute('rel', [...rel].join(' '))
    })

  if (variant === 'isolated') {
    template.content.querySelectorAll('iframe').forEach((frame) => {
      frame.removeAttribute('srcdoc')
      frame.setAttribute('sandbox', isolatedContentSandbox)
      frame.setAttribute('referrerpolicy', 'no-referrer')

      if (!frame.hasAttribute('loading')) {
        frame.setAttribute('loading', 'lazy')
      }
    })
  }

  return template.innerHTML
}

function sanitizeHtmlContent(
  content: string,
  variant: HtmlContentVariant
): string {
  const html = DOMPurify.sanitize(
    content,
    variant === 'isolated' ? isolatedSanitizeOptions : inlineSanitizeOptions
  )

  return hardenSanitizedHtml(html, variant)
}

function syncDarkClass(wrapper: HTMLElement): void {
  const isDark = document.documentElement.classList.contains('dark')
  wrapper.classList.toggle('dark', isDark)
}

function IsolatedHtmlContent(props: {
  className?: string
  html: string
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const shadowRoot =
      container.shadowRoot ?? container.attachShadow({ mode: 'open' })
    const applicationStyleNodes = [
      ...document.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
        'style, link[rel="stylesheet"]'
      ),
    ].map((node) => node.cloneNode(true))

    const wrapper = document.createElement('div')
    syncDarkClass(wrapper)
    wrapper.innerHTML = props.html

    const contentTemplate = document.createElement('template')
    contentTemplate.innerHTML = isolatedContentBaseStyles

    shadowRoot.replaceChildren(
      ...applicationStyleNodes,
      contentTemplate.content,
      wrapper
    )

    // Fragment navigation cannot reach into a shadow tree: the browser resolves
    // `#section` with `document.getElementById`, which by design never sees
    // shadow content, so the table of contents a long terms-of-service page
    // needs most only moves the address bar. Resolving the jump against the
    // shadow root restores what a reader expects from an anchor.
    //
    // The address bar is deliberately left alone. Writing the fragment would
    // look like a copyable deep link, but the rule that breaks the jump also
    // breaks the arrival: whoever opens that URL lands at the top, because the
    // fragment is resolved long before this content has been fetched. The
    // history entry would buy a promise the page cannot keep, and the link is
    // still one context menu away.
    const scrollToFragment = (event: Event) => {
      const click = event as MouseEvent

      // Only the plain primary click is the one the platform drops. A modified
      // or secondary click is a request for a new tab, window, or menu, and
      // stays with the browser.
      if (
        click.defaultPrevented ||
        click.button !== 0 ||
        click.altKey ||
        click.ctrlKey ||
        click.metaKey ||
        click.shiftKey
      ) {
        return
      }

      const clicked = click.target

      if (!(clicked instanceof Element)) {
        return
      }

      const fragment = clicked
        .closest('a[href^="#"], area[href^="#"]')
        ?.getAttribute('href')
        ?.slice(1)

      if (!fragment) {
        return
      }

      // Looked up as a literal id: a selector assembled from operator text
      // would be an injection, and plenty of valid ids are invalid selectors.
      // A typo, or the `#` and `#top` that mean the top of the document,
      // resolves to nothing and the browser keeps handling the click.
      // eslint-disable-next-line unicorn/prefer-query-selector -- an id from operator text must not become a selector
      let destination = shadowRoot.getElementById(fragment)

      // The browser tries the fragment verbatim and then percent-decoded, so a
      // heading id an editor escaped on the way in is still reachable. A
      // malformed escape throws and is no fragment the browser could resolve
      // either.
      if (!destination && fragment.includes('%')) {
        try {
          // eslint-disable-next-line unicorn/prefer-query-selector -- as above
          destination = shadowRoot.getElementById(decodeURIComponent(fragment))
        } catch {
          return
        }
      }

      if (!destination) {
        return
      }

      click.preventDefault()
      destination.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    }

    shadowRoot.addEventListener('click', scrollToFragment)

    const observer = new MutationObserver(() => syncDarkClass(wrapper))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      shadowRoot.removeEventListener('click', scrollToFragment)
      observer.disconnect()
    }
  }, [props.html])

  return (
    <div ref={containerRef} className={cn('block w-full', props.className)} />
  )
}

export function HtmlContent(props: HtmlContentProps) {
  const variant = props.variant ?? 'inline'
  const html = useMemo(
    () => sanitizeHtmlContent(props.content, variant),
    [props.content, variant]
  )

  if (variant === 'isolated') {
    return <IsolatedHtmlContent className={props.className} html={html} />
  }

  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        props.className
      )}
      // eslint-disable-next-line react/no-danger -- html is sanitized above
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
