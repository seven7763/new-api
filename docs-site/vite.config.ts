import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import path from 'node:path'
// Plugin is excluded from the browser tsconfig; Vite still loads it at runtime.
// @ts-expect-error — Node middleware plugin, not part of the client typecheck graph
import { docsAssistantProxyPlugin } from './src/vite-plugin-assistant-proxy.ts'

/**
 * `vite preview` otherwise answers every unknown path with dist/index.html,
 * which since prerendering is the zh docs index — so previewing /docs/en/… would
 * show the wrong page and hydrate mismatched markup. nginx resolves these from
 * <route>/index.html (see deploy/daoxe-docs.conf); this makes preview agree.
 */
function prerenderedRoutesPlugin(): Plugin {
  const dist = path.resolve(__dirname, 'dist')
  return {
    name: 'docs-prerendered-routes',
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname] = (req.url || '/').split('?')
        const rel = pathname.replace(/^\/docs\//, '').replace(/\/+$/, '')
        if (rel && existsSync(path.join(dist, rel, 'index.html'))) {
          req.url = `/docs/${rel}/index.html`
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load server-only vars (no VITE_ prefix) into process.env for the proxy plugin.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] == null || process.env[k] === '') process.env[k] = v
  }
  // Back-compat: older local files used VITE_DOCS_ASSISTANT_KEY (would leak to client).
  // Prefer DOCS_ASSISTANT_KEY; map legacy name server-side only.
  if (!process.env.DOCS_ASSISTANT_KEY && process.env.VITE_DOCS_ASSISTANT_KEY) {
    process.env.DOCS_ASSISTANT_KEY = process.env.VITE_DOCS_ASSISTANT_KEY
  }
  if (!process.env.DOCS_ASSISTANT_BASE && process.env.VITE_DOCS_ASSISTANT_BASE) {
    process.env.DOCS_ASSISTANT_BASE = process.env.VITE_DOCS_ASSISTANT_BASE
  }
  if (!process.env.DOCS_ASSISTANT_MODEL && process.env.VITE_DOCS_ASSISTANT_MODEL) {
    process.env.DOCS_ASSISTANT_MODEL = process.env.VITE_DOCS_ASSISTANT_MODEL
  }

  return {
    plugins: [react(), tailwindcss(), docsAssistantProxyPlugin(), prerenderedRoutesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5177,
      host: true,
    },
    preview: {
      port: 5177,
      host: true,
    },
    // served under daoxe.com/docs/ (and www./jp./api. same-domain /docs)
    base: '/docs/',
    // Ensure accidental VITE_DOCS_ASSISTANT_KEY is never baked into the client bundle.
    define: {
      'import.meta.env.VITE_DOCS_ASSISTANT_KEY': '""',
    },
  }
})
