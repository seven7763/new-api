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
import assert from 'node:assert/strict'
import { after, beforeEach, describe, test } from 'node:test'

import { Window } from 'happy-dom'

const domWindow = new Window({ url: 'https://acme.example/' })
const domGlobals = [
  'window',
  'document',
  'navigator',
  'Node',
  'Element',
] as const

for (const key of domGlobals) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: domWindow[key],
  })
}

const { applyDocumentSeo, applySeoFromStatus, clearSeoJsonLd } =
  await import('../apply')

function metaContent(selector: string): string | null {
  return document.querySelector(selector)?.getAttribute('content') ?? null
}

function canonicalHref(): string | null {
  return (
    document.querySelector('link[rel="canonical"]')?.getAttribute('href') ??
    null
  )
}

beforeEach(() => {
  document.head.innerHTML = ''
  document.title = ''
  document.documentElement.lang = ''
})

after(() => {
  domWindow.close()
})

describe('applyDocumentSeo', () => {
  test('emits canonical and rich-preview robots directives on an indexable page', () => {
    applyDocumentSeo({
      title: 'Acme AI',
      path: '/',
      lang: 'en',
      siteUrl: 'https://acme.example',
      robotsIndex: true,
    })

    assert.equal(canonicalHref(), 'https://acme.example/')
    assert.equal(
      metaContent('meta[name="robots"]'),
      'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    )
    assert.equal(
      metaContent('meta[property="og:url"]'),
      'https://acme.example/'
    )
    assert.equal(metaContent('meta[property="og:locale"]'), 'en_US')
    assert.equal(metaContent('meta[property="og:site_name"]'), 'Acme AI')
    assert.equal(document.documentElement.lang, 'en')
  })

  test('omits canonical on a noindex page so it cannot contradict the robots tag', () => {
    applyDocumentSeo({
      title: 'Acme AI',
      path: '/dashboard',
      lang: 'en',
      siteUrl: 'https://acme.example',
      robotsIndex: false,
    })

    assert.equal(canonicalHref(), null)
    assert.equal(metaContent('meta[name="robots"]'), 'noindex,nofollow')
  })

  test('appends the long-tail suffix on the homepage only', () => {
    applyDocumentSeo({ title: 'Acme AI', path: '/', lang: 'en' })
    const homeTitle = document.title

    applyDocumentSeo({ title: 'Acme AI', path: '/dashboard', lang: 'en' })

    assert.equal(homeTitle.startsWith('Acme AI - '), true)
    assert.equal(document.title, 'Acme AI')
  })

  test('removes a previously written tag when its value becomes empty', () => {
    applyDocumentSeo({
      title: 'Acme AI',
      path: '/',
      siteUrl: 'https://acme.example',
      ogImage: '/logo.png',
      robotsIndex: true,
    })
    assert.equal(
      metaContent('meta[property="og:image"]'),
      'https://acme.example/logo.png'
    )

    applyDocumentSeo({
      title: 'Acme AI',
      path: '/',
      siteUrl: 'https://acme.example',
      ogImage: 'javascript:alert(1)',
      robotsIndex: true,
    })

    assert.equal(document.querySelector('meta[property="og:image"]'), null)
    assert.equal(metaContent('meta[name="twitter:card"]'), 'summary')
  })

  test('writes structured data as escaped text inside a single ld+json script', () => {
    applyDocumentSeo({
      title: 'Acme AI',
      path: '/',
      jsonLd: { '@type': 'WebSite', name: '</script><script>alert(1)' },
    })

    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    )
    assert.equal(scripts.length, 1)
    assert.equal(scripts[0].textContent?.includes('</script'), false)
    assert.equal(document.querySelectorAll('script').length, 1)

    clearSeoJsonLd()
    assert.equal(
      document.querySelector('script[type="application/ld+json"]'),
      null
    )
  })

  test('reuses the existing tags instead of appending duplicates on re-apply', () => {
    applyDocumentSeo({ title: 'Acme AI', path: '/', lang: 'en' })
    applyDocumentSeo({ title: 'Acme AI', path: '/', lang: 'en' })
    applyDocumentSeo({ title: 'Acme AI', path: '/', lang: 'zh' })

    assert.equal(
      document.querySelectorAll('meta[name="description"]').length,
      1
    )
    assert.equal(
      document.querySelectorAll('meta[property="og:title"]').length,
      1
    )
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1)
  })
})

describe('applySeoFromStatus', () => {
  test('keeps the admin long-tail title on the homepage', () => {
    applySeoFromStatus(
      {
        system_name: 'Acme AI',
        seo_title_suffix: 'Unified LLM Gateway',
        seo_site_url: 'https://acme.example',
        seo_robots_index: true,
      },
      { path: '/', lang: 'en' }
    )

    assert.equal(document.title, 'Acme AI - Unified LLM Gateway')
    assert.equal(canonicalHref(), 'https://acme.example/')
  })

  test('never leaks the homepage long-tail title or indexing onto a console route', () => {
    applySeoFromStatus(
      {
        system_name: 'Acme AI',
        seo_title: 'Acme AI - Unified LLM Gateway',
        seo_title_suffix: 'Unified LLM Gateway',
        seo_site_url: 'https://acme.example',
        seo_robots_index: true,
      },
      { path: '/dashboard', lang: 'en' }
    )

    assert.equal(document.title, 'Acme AI')
    assert.equal(metaContent('meta[name="robots"]'), 'noindex,nofollow')
    assert.equal(canonicalHref(), null)
  })

  test('honours the admin robots switch on public marketing pages', () => {
    applySeoFromStatus(
      {
        system_name: 'Acme AI',
        seo_site_url: 'https://acme.example',
        seo_robots_index: false,
      },
      { path: '/pricing', lang: 'en' }
    )

    assert.equal(metaContent('meta[name="robots"]'), 'noindex,nofollow')

    applySeoFromStatus(
      {
        system_name: 'Acme AI',
        seo_site_url: 'https://acme.example',
        seo_robots_index: true,
      },
      { path: '/pricing', lang: 'en' }
    )

    assert.equal(canonicalHref(), 'https://acme.example/pricing')
  })
})
