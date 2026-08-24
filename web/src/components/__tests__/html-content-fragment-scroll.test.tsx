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
import { afterAll, afterEach, beforeEach, describe, test } from 'vitest'
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

type ScrollRequest = {
  options: boolean | ScrollIntoViewOptions | undefined
  target: Element
}

// A long operator-authored document: a table of contents whose entries point at
// headings further down, alongside the links an operator mixes in around it and
// the fragments that resolve to nothing.
const legalDocument = `
  <nav>
    <a href="#data-retention"><span class="toc-number">2.</span> Data retention</a>
    <a href="#5.1">5.1 Reporting channel</a>
    <a href="#%E4%BA%89%E8%AE%AE%E8%A7%A3%E5%86%B3">Dispute resolution</a>
    <a href="#%E4%B8">Superseded clause</a>
    <a href="#renamed-in-a-later-revision">Governing law</a>
    <a href="#">Back to top</a>
    <a href="https://status.example/">Status page</a>
    <a href="/pricing">Pricing</a>
  </nav>
  <h2 id="scope">1. Scope</h2>
  <h2 id="data-retention">2. Data retention</h2>
  <h3 id="5.1">5.1 Reporting channel</h3>
  <h2 id="争议解决">Dispute resolution</h2>
`

// happy-dom has no layout, so `scrollIntoView` is a no-op and a scroll cannot be
// observed by reading `window.scrollY`. Recording the requests keeps the
// assertions on the decisions the component makes — which element to move, and
// how — while the scroll itself is covered against a real browser.
const scrollRequests: ScrollRequest[] = []
const listenerErrors: string[] = []
const originalScrollIntoView = Element.prototype.scrollIntoView
const originalMatchMedia = window.matchMedia

async function renderTree(tree: React.ReactNode): Promise<RenderedContent> {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(tree)
  })

  return { container, root }
}

async function renderIsolatedContent(content: string) {
  const rendered = await renderTree(
    <HtmlContent content={content} variant='isolated' />
  )
  const shadowRoot = rendered.container.firstElementChild?.shadowRoot

  assert.ok(shadowRoot, 'the isolated variant renders into a shadow root')

  return { ...rendered, shadowRoot }
}

async function unmountContent(rendered: RenderedContent) {
  await act(async () => rendered.root.unmount())
  rendered.container.remove()
}

function findLink(root: ParentNode, href: string): Element {
  const link = root.querySelector(`a[href="${href}"]`)

  assert.ok(link, `the fixture links to ${href}`)

  return link
}

/**
 * Dispatches the click a reader performs and reports whether the browser's own
 * handling of the link survived it, which is what separates "we took the
 * navigation over" from "we left it alone".
 */
function clickLink(link: Element, init: MouseEventInit = {}): boolean {
  return link.dispatchEvent(
    new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
      ...init,
    })
  )
}

// Each one is a browser affordance a reader reaches for deliberately: a new tab
// on Windows and Linux, a new tab on macOS, a new window, and a download.
const modifiedClicks: { init: MouseEventInit; name: string }[] = [
  { init: { ctrlKey: true }, name: 'Ctrl' },
  { init: { metaKey: true }, name: 'Cmd' },
  { init: { shiftKey: true }, name: 'Shift' },
  { init: { altKey: true }, name: 'Alt' },
]

// Fragments an operator can plausibly leave behind, none of which name an
// element the reader can be sent to.
const unresolvableFragments: { href: string; name: string }[] = [
  {
    href: '#renamed-in-a-later-revision',
    name: 'a heading renamed in a later revision',
  },
  { href: '#', name: 'a bare hash meaning the top of the document' },
]

// happy-dom reports a throw inside an event listener as a window `error` event
// rather than rethrowing it, so a handler that blows up on operator input would
// otherwise be indistinguishable from one that declined to act.
window.addEventListener('error', (event) => {
  listenerErrors.push(String(event.error?.message ?? event.message))
})

describe('HtmlContent isolated fragment links', () => {
  beforeEach(() => {
    scrollRequests.length = 0
    listenerErrors.length = 0
    Element.prototype.scrollIntoView = function (
      this: Element,
      options?: boolean | ScrollIntoViewOptions
    ) {
      scrollRequests.push({ options, target: this })
    }
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
    window.matchMedia = originalMatchMedia
  })

  afterAll(() => {
    domWindow.close()
  })

  test('scrolls to the heading a table of contents entry points at, instead of leaving the jump to a browser that cannot see it', async () => {
    const rendered = await renderIsolatedContent(legalDocument)

    const browserStillHandlesClick = clickLink(
      findLink(rendered.shadowRoot, '#data-retention')
    )

    assert.equal(browserStillHandlesClick, false)
    assert.equal(scrollRequests.length, 1)
    assert.equal(
      scrollRequests[0].target,
      rendered.shadowRoot.querySelector('#data-retention')
    )
    assert.deepEqual(scrollRequests[0].options, {
      behavior: 'smooth',
      block: 'start',
    })

    await unmountContent(rendered)
  })

  test('scrolls when the click lands on the numbering inside a table of contents entry', async () => {
    const rendered = await renderIsolatedContent(legalDocument)

    const browserStillHandlesClick = clickLink(
      findLink(rendered.shadowRoot, '#data-retention').querySelector(
        '.toc-number'
      ) as Element
    )

    assert.equal(browserStillHandlesClick, false)
    assert.equal(
      scrollRequests[0]?.target,
      rendered.shadowRoot.querySelector('#data-retention')
    )

    await unmountContent(rendered)
  })

  test('scrolls to a numbered section whose id is not a valid CSS selector', async () => {
    const rendered = await renderIsolatedContent(legalDocument)

    clickLink(findLink(rendered.shadowRoot, '#5.1'))

    assert.equal(scrollRequests.length, 1)
    assert.equal(
      scrollRequests[0].target.textContent,
      '5.1 Reporting channel',
      'the fragment has to be looked up as a literal id, not compiled as a selector'
    )

    await unmountContent(rendered)
  })

  test('scrolls to a heading whose id the author percent-escaped in the href', async () => {
    const rendered = await renderIsolatedContent(legalDocument)

    const browserStillHandlesClick = clickLink(
      findLink(rendered.shadowRoot, '#%E4%BA%89%E8%AE%AE%E8%A7%A3%E5%86%B3')
    )

    assert.equal(browserStillHandlesClick, false)
    assert.equal(
      scrollRequests[0]?.target.textContent,
      'Dispute resolution',
      'a browser resolves the fragment percent-decoded when the verbatim id misses'
    )

    await unmountContent(rendered)
  })

  test('leaves a fragment with a malformed escape to the browser without throwing', async () => {
    const rendered = await renderIsolatedContent(legalDocument)

    const browserStillHandlesClick = clickLink(
      findLink(rendered.shadowRoot, '#%E4%B8')
    )

    assert.deepEqual(listenerErrors, [])
    assert.equal(browserStillHandlesClick, true)
    assert.deepEqual(scrollRequests, [])

    await unmountContent(rendered)
  })

  for (const fragment of unresolvableFragments) {
    test(`leaves ${fragment.name} to the browser`, async () => {
      const rendered = await renderIsolatedContent(legalDocument)

      const browserStillHandlesClick = clickLink(
        findLink(rendered.shadowRoot, fragment.href)
      )

      assert.equal(browserStillHandlesClick, true)
      assert.deepEqual(scrollRequests, [])

      await unmountContent(rendered)
    })
  }

  for (const href of ['https://status.example/', '/pricing']) {
    test(`leaves a click on ${href} to the browser`, async () => {
      const rendered = await renderIsolatedContent(legalDocument)

      const browserStillHandlesClick = clickLink(
        findLink(rendered.shadowRoot, href)
      )

      assert.equal(browserStillHandlesClick, true)
      assert.deepEqual(scrollRequests, [])

      await unmountContent(rendered)
    })
  }

  for (const modifiedClick of modifiedClicks) {
    test(`leaves a ${modifiedClick.name}+click on a fragment link to the browser`, async () => {
      const rendered = await renderIsolatedContent(legalDocument)

      const browserStillHandlesClick = clickLink(
        findLink(rendered.shadowRoot, '#data-retention'),
        modifiedClick.init
      )

      assert.equal(browserStillHandlesClick, true)
      assert.deepEqual(scrollRequests, [])

      await unmountContent(rendered)
    })
  }

  test('jumps without animation when the reader asks for reduced motion', async () => {
    const rendered = await renderIsolatedContent(legalDocument)

    window.matchMedia = (query: string) =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
      }) as MediaQueryList

    clickLink(findLink(rendered.shadowRoot, '#data-retention'))

    assert.deepEqual(scrollRequests[0]?.options, {
      behavior: 'auto',
      block: 'start',
    })

    await unmountContent(rendered)
  })

  test('stops answering fragment clicks once the content unmounts', async () => {
    const rendered = await renderIsolatedContent(legalDocument)
    const link = findLink(rendered.shadowRoot, '#data-retention')

    await unmountContent(rendered)
    const browserStillHandlesClick = clickLink(link)

    assert.equal(browserStillHandlesClick, true)
    assert.deepEqual(
      scrollRequests,
      [],
      'a listener left on the shadow root keeps answering clicks for content nobody can see'
    )
  })

  // The pairing a visitor actually meets: operator HTML in a shadow root with
  // the inline footer HTML underneath it. A handler delegated on the document
  // instead of the shadow root would answer for both.
  test('leaves fragment links in the inline variant to the browser while isolated content is on the page', async () => {
    const rendered = await renderTree(
      <>
        <HtmlContent content={legalDocument} variant='isolated' />
        <HtmlContent content='<a href="#data-retention">Terms</a><h2 id="data-retention">Terms</h2>' />
      </>
    )

    const browserStillHandlesClick = clickLink(
      findLink(rendered.container, '#data-retention')
    )

    assert.equal(browserStillHandlesClick, true)
    assert.deepEqual(scrollRequests, [])

    await unmountContent(rendered)
  })
})
