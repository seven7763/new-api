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
import { afterEach, describe, test } from 'node:test'

import {
  resolveDocumentLang,
  resolveImageUrl,
  resolveOgLocale,
  resolvePageUrl,
  resolveSiteUrl,
} from '../url'

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')

function setBrowserOrigin(origin: string | null): void {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: origin === null ? undefined : { location: { origin } },
  })
}

describe('resolveSiteUrl', () => {
  afterEach(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow)
    } else {
      setBrowserOrigin(null)
    }
  })

  test('normalizes a configured https URL by stripping trailing slashes', () => {
    setBrowserOrigin(null)
    assert.equal(
      resolveSiteUrl('https://acme.example/'),
      'https://acme.example'
    )
    assert.equal(
      resolveSiteUrl('  https://acme.example/base//  '),
      'https://acme.example/base'
    )
  })

  test('falls back to the current origin rather than trusting a javascript: site URL', () => {
    setBrowserOrigin('https://fallback.example')
    assert.equal(
      resolveSiteUrl('javascript:alert(1)'),
      'https://fallback.example'
    )
  })

  test('yields no site URL when the config is unusable and no origin exists', () => {
    setBrowserOrigin(null)
    assert.equal(resolveSiteUrl('javascript:alert(1)'), '')
    assert.equal(resolveSiteUrl('acme.example'), '')
    assert.equal(resolveSiteUrl(''), '')
  })
})

describe('resolvePageUrl', () => {
  test('joins the site URL with the route path', () => {
    assert.equal(
      resolvePageUrl('https://acme.example', '/pricing'),
      'https://acme.example/pricing'
    )
  })

  test('drops query and hash so the canonical URL stays a single address', () => {
    assert.equal(
      resolvePageUrl('https://acme.example', '/pricing?search=gpt#top'),
      'https://acme.example/pricing'
    )
  })

  test('returns an empty string when no site URL is known', () => {
    assert.equal(resolvePageUrl('', '/pricing'), '')
  })
})

describe('resolveImageUrl', () => {
  test('absolutizes a root-relative image against the site URL', () => {
    assert.equal(
      resolveImageUrl('/logo.png', 'https://acme.example'),
      'https://acme.example/logo.png'
    )
  })

  test('upgrades a protocol-relative image to https', () => {
    assert.equal(
      resolveImageUrl('//cdn.example/logo.png', 'https://acme.example'),
      'https://cdn.example/logo.png'
    )
  })

  test('keeps inline data images but rejects non-image data URLs', () => {
    const png = 'data:image/png;base64,iVBORw0KGgo='
    assert.equal(resolveImageUrl(png, 'https://acme.example'), png)
    assert.equal(
      resolveImageUrl('data:text/html,<script>alert(1)</script>', ''),
      ''
    )
  })

  test('rejects script-bearing schemes configured by an admin', () => {
    assert.equal(
      resolveImageUrl('javascript:alert(1)', 'https://acme.example'),
      ''
    )
    assert.equal(
      resolveImageUrl('vbscript:msgbox(1)', 'https://acme.example'),
      ''
    )
  })

  test('returns an empty string for a relative image when no site URL is known', () => {
    assert.equal(resolveImageUrl('/logo.png', ''), '')
  })
})

describe('resolveOgLocale', () => {
  test('maps every supported UI language to an Open Graph locale', () => {
    assert.equal(resolveOgLocale('en'), 'en_US')
    assert.equal(resolveOgLocale('zh'), 'zh_CN')
    assert.equal(resolveOgLocale('zh-TW'), 'zh_TW')
    assert.equal(resolveOgLocale('fr'), 'fr_FR')
    assert.equal(resolveOgLocale('ja'), 'ja_JP')
    assert.equal(resolveOgLocale('ru'), 'ru_RU')
    assert.equal(resolveOgLocale('vi'), 'vi_VN')
  })

  test('maps the internal i18next Chinese codes used by src/i18n/config.ts', () => {
    assert.equal(resolveOgLocale('zhCN'), 'zh_CN')
    assert.equal(resolveOgLocale('zhTW'), 'zh_TW')
  })

  test('falls back to the base language for a regional tag', () => {
    assert.equal(resolveOgLocale('fr-CA'), 'fr_FR')
  })

  test('returns an empty string for an unknown language', () => {
    assert.equal(resolveOgLocale('xx-YY'), '')
    assert.equal(resolveOgLocale(''), '')
  })
})

describe('resolveDocumentLang', () => {
  test('splits Chinese into simplified and traditional BCP-47 tags', () => {
    assert.equal(resolveDocumentLang('zh'), 'zh-CN')
    assert.equal(resolveDocumentLang('zh-TW'), 'zh-TW')
    assert.equal(resolveDocumentLang('zh-HK'), 'zh-TW')
  })

  test('normalizes the internal zhCN/zhTW codes into valid html lang values', () => {
    assert.equal(resolveDocumentLang('zhCN'), 'zh-CN')
    assert.equal(resolveDocumentLang('zhTW'), 'zh-TW')
  })

  test('passes through non-Chinese tags unchanged', () => {
    assert.equal(resolveDocumentLang('en'), 'en')
    assert.equal(resolveDocumentLang(''), '')
  })
})
