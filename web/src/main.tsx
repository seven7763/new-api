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
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import i18next from 'i18next'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { toast } from 'sonner'

import { getStatus } from '@/lib/api'
import { installBuildMetadata } from '@/lib/build-metadata'
import { applyFaviconToDom } from '@/lib/dom-utils'
import '@/lib/dayjs'
import { initializeFrontendCache } from '@/lib/frontend-cache'
import { handleServerError } from '@/lib/handle-server-error'
import {
  applySeoFromStatus,
  readCachedStatus,
  writeCachedStatus,
} from '@/lib/seo'

import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
import './i18n/config'
// Generated Routes
import { routeTree } from './routeTree.gen'

// Styles
import './styles/index.css'

// Ensure VChart theme is initialized before any chart mounts (prevents white default theme flash)
// VChart theme is driven by our ThemeProvider (html.light/html.dark) via per-chart `theme` prop.
initializeFrontendCache()
installBuildMetadata()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      // Keep focused tabs from silently re-running heavy pages like logs.
      refetchOnWindowFocus: false,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error(i18next.t('Content not modified!'))
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 500) {
          toast.error(i18next.t('Internal Server Error!'))
          router.navigate({ to: '/500' })
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.querySelector<HTMLElement>('#root')
if (!rootElement) {
  throw new Error('Root element not found')
}
// Paint title/meta/favicon from the cached status before React mounts, then
// reconcile with the network. `applySeoFromStatus` owns document.title and the
// meta tags, so this only has to feed it the freshest payload it can get.
;(function initSystemBranding() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  // `./i18n/config` is imported above, so the detector has already resolved the
  // language. Passing it here avoids painting the zh-CN defaults baked into
  // index.html before the first React effect corrects them.
  const lang = i18next.language

  const cached = readCachedStatus()
  if (cached) {
    if (cached.logo) applyFaviconToDom(String(cached.logo))
    applySeoFromStatus(cached, { lang })
  }

  getStatus()
    .then((status) => {
      if (!status) return
      // Cache unconditionally: keying the write on `system_name` used to pin
      // every other field (SEO title, description, OG image) to a stale copy
      // whenever the admin left the system name empty.
      writeCachedStatus(status)
      if (status.logo) applyFaviconToDom(String(status.logo))
      applySeoFromStatus(status, { lang: i18next.language })
    })
    .catch(() => {
      /* empty */
    })
})()
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
