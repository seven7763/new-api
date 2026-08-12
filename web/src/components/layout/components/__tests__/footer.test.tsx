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
import { after, describe, test } from 'node:test'

import { installBrowserEnvironment } from '@/components/__tests__/browser-environment'

const domWindow = installBrowserEnvironment('https://gateway.example/')

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { QueryClient, QueryClientProvider } =
  await import('@tanstack/react-query')
const i18next = (await import('i18next')).default
const { initReactI18next } = await import('react-i18next')
await i18next.use(initReactI18next).init({ lng: 'en', resources: {} })
const { useSystemConfigStore } = await import('@/stores/system-config-store')
const { Footer } = await import('../footer')

type RenderedFooter = {
  container: HTMLDivElement
  root: ReturnType<typeof createRoot>
}

async function renderFooter(footerHtml: string): Promise<RenderedFooter> {
  useSystemConfigStore.getState().setConfig({ footerHtml })

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  // Seeding `/api/status` keeps the footer's legal-links query fresh so the
  // render never reaches the network.
  queryClient.setQueryData(['status'], {
    user_agreement_enabled: false,
    privacy_policy_enabled: false,
  })

  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <Footer />
      </QueryClientProvider>
    )
  })

  return { container, root }
}

async function unmountFooter(rendered: RenderedFooter) {
  await act(async () => rendered.root.unmount())
  rendered.container.remove()
}

describe('Footer custom HTML', () => {
  after(() => {
    domWindow.close()
  })

  test('drops script and event handlers from operator-configured footer HTML', async () => {
    const rendered = await renderFooter(
      '<p><script>window.__xss = true</script><img src="x" onerror="window.__xss = true"><a href="javascript:window.__xss=true">tap</a></p>'
    )
    const customFooter = rendered.container.querySelector('.custom-footer')

    assert.ok(customFooter)
    assert.equal(customFooter.querySelector('script'), null)
    assert.equal(customFooter.querySelector('[onerror]'), null)
    assert.equal(customFooter.querySelector('a')?.getAttribute('href'), null)

    await unmountFooter(rendered)
  })

  test('renders operator footer links with markup and new-tab hardening intact', async () => {
    const rendered = await renderFooter(
      '<p><strong>Acme</strong><br><a href="https://beian.miit.gov.cn/" target="_blank">ICP 12345678</a></p>'
    )
    const customFooter = rendered.container.querySelector('.custom-footer')

    assert.ok(customFooter)
    assert.ok(customFooter.querySelector('strong'))
    assert.ok(customFooter.querySelector('br'))

    const link = customFooter.querySelector('a')
    assert.ok(link)
    assert.equal(link.getAttribute('href'), 'https://beian.miit.gov.cn/')
    assert.equal(link.getAttribute('rel'), 'noopener noreferrer')

    await unmountFooter(rendered)
  })
})
