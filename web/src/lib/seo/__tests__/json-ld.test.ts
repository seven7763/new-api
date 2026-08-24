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
import { describe, test } from 'vitest'
import assert from 'node:assert/strict'

import { serializeJsonLd } from '../dom'
import { buildHomeJsonLd } from '../json-ld'

describe('serializeJsonLd', () => {
  test('escapes a closing script tag so admin text cannot break out of the ld+json block', () => {
    const payload = serializeJsonLd({
      name: '</script><img src=x onerror=alert(1)>',
    })

    assert.equal(payload.includes('</script'), false)
    assert.equal(payload.includes('<'), false)
    assert.equal(payload.includes('>'), false)
    assert.deepEqual(JSON.parse(payload), {
      name: '</script><img src=x onerror=alert(1)>',
    })
  })

  test('escapes HTML comment delimiters that would otherwise open a comment in the parser', () => {
    const payload = serializeJsonLd({ name: '<!--', description: '-->' })

    assert.equal(payload.includes('<!--'), false)
    assert.equal(payload.includes('-->'), false)
    assert.deepEqual(JSON.parse(payload), { name: '<!--', description: '-->' })
  })

  test('escapes ampersands and line separators while preserving the parsed value', () => {
    const value = 'a & b\u2028c\u2029d'
    const payload = serializeJsonLd({ name: value })

    assert.equal(payload.includes('&'), false)
    assert.equal(payload.includes('\u2028'), false)
    assert.equal(payload.includes('\u2029'), false)
    assert.equal(JSON.parse(payload).name, value)
  })
})

describe('buildHomeJsonLd', () => {
  test('links WebSite to the Organization by @id when an origin is known', () => {
    const graph = buildHomeJsonLd({
      name: 'Acme AI',
      origin: 'https://acme.example',
      description: 'Unified gateway',
      inLanguage: 'zh-CN',
      logoUrl: 'https://acme.example/logo.png',
    })

    assert.equal(graph['@context'], 'https://schema.org')
    const nodes = graph['@graph'] as Record<string, unknown>[]
    const organization = nodes.find((n) => n['@type'] === 'Organization')
    const website = nodes.find((n) => n['@type'] === 'WebSite')

    assert.equal(organization?.['@id'], 'https://acme.example/#organization')
    assert.equal(organization?.url, 'https://acme.example/')
    assert.deepEqual(organization?.logo, {
      '@type': 'ImageObject',
      url: 'https://acme.example/logo.png',
    })
    assert.equal(website?.['@id'], 'https://acme.example/#website')
    assert.equal(website?.inLanguage, 'zh-CN')
    assert.deepEqual(website?.publisher, {
      '@id': 'https://acme.example/#organization',
    })
  })

  test('omits @id, url and publisher when no origin is available', () => {
    const graph = buildHomeJsonLd({ name: 'Acme AI', origin: '' })
    const serialized = JSON.parse(serializeJsonLd(graph))
    const nodes = serialized['@graph'] as Record<string, unknown>[]

    for (const node of nodes) {
      assert.equal('@id' in node, false)
      assert.equal('url' in node, false)
      assert.equal('publisher' in node, false)
    }
  })

  test('drops the logo node when no logo URL is resolved', () => {
    const graph = buildHomeJsonLd({
      name: 'Acme AI',
      origin: 'https://acme.example',
      logoUrl: '',
    })
    const nodes = graph['@graph'] as Record<string, unknown>[]
    const organization = nodes.find((n) => n['@type'] === 'Organization')

    assert.ok(organization)
    assert.equal('logo' in organization, false)
  })
})
