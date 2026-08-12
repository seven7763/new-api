/**
 * Build-time prerenderer. Runs AFTER `vite build` (it needs the hashed asset
 * tags Vite stamps into dist/index.html) and writes one static HTML file per
 * page per language, so nginx answers `/docs/en/guide/keys` with real markup
 * and a correct <head> instead of an empty SPA shell.
 *
 * The renders themselves reuse what scripts/gen-search-index.ts already proved
 * works — the content registries import and render fine under Bun — except that
 * here the full <App/> is rendered (shell, sidebar, article) with react-dom's
 * hydratable renderToString instead of the article-only static markup that gets
 * thrown away after being reduced to search text.
 *
 * Wired into `build` (see package.json). Run: bun scripts/prerender.ts
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const distDir = join(import.meta.dir, '../dist')
const template = await readFile(join(distDir, 'index.html'), 'utf8')

// Vite stamps the deployment base into the emitted asset URLs, so reading it
// back out avoids repeating `base` from vite.config.ts. config.ts picks it up
// through BASE_URL (Bun aliases import.meta.env to process.env), which is why
// every app module below is imported dynamically — after this assignment.
if (template.includes('data-ssr')) {
  throw new Error('dist/index.html is already prerendered — run `vite build` before this script')
}

const entryTag = template.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)
if (!entryTag) throw new Error('dist/index.html has no module entry — run `vite build` first')
const base = entryTag[1].slice(0, entryTag[1].lastIndexOf('assets/'))
process.env.BASE_URL = base

const { DEFAULT_LANG, docsHref, flatNav, ROUTE_LANGS, routerBasename, siteConfig } = await import(
  '../src/config'
)
const { App } = await import('../src/App')
const { buildSeoHead, buildSeoInput, JSONLD_ID } = await import('../src/lib/seo')
const { navTitle } = await import('../src/i18n-nav')
const { translate } = await import('../src/i18n')
const { loadRegistries } = await import('../src/lib/registry')

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Replace exactly once, and fail loudly if index.html stopped matching. */
function swap(html: string, pattern: string | RegExp, replacement: string) {
  const found = typeof pattern === 'string' ? html.includes(pattern) : pattern.test(html)
  if (!found) throw new Error(`prerender: index.html no longer contains ${pattern}`)
  return html.replace(pattern, () => replacement)
}

const SEO_BLOCK = /<!-- seo:start[\s\S]*?seo:end -->/
const ROBOTS = '<meta name="robots" content="index, follow, max-image-preview:large" />'

let pages = 0
let bytes = 0
const started = Date.now()

for (const lang of ROUTE_LANGS) {
  await loadRegistries(lang)
  const t = (key: string) => translate(lang, key)

  for (const item of flatNav()) {
    const title = navTitle(item.id, lang, item.title)
    const group = navTitle(item.groupId, lang, item.groupTitle)
    const head = buildSeoHead(
      buildSeoInput({ item, title, group, brand: siteConfig.brand, lang, t })
    )

    const app = renderToString(
      createElement(
        MemoryRouter,
        { basename: routerBasename(lang), initialEntries: [docsHref(item.path, lang)] },
        createElement(App, { lang })
      )
    )
    if (!app.includes('<article')) {
      throw new Error(`prerender: ${lang} ${item.path} rendered no article — check the router basename`)
    }

    const headTags = [
      `<title>${esc(head.title)}</title>`,
      `<meta name="description" content="${esc(head.description)}" />`,
      `<link rel="canonical" href="${esc(head.canonical)}" />`,
      ...head.alternates.map(
        (a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`
      ),
      `<meta property="og:type" content="${head.ogType}" />`,
      `<meta property="og:title" content="${esc(head.title)}" />`,
      `<meta property="og:description" content="${esc(head.description)}" />`,
      `<meta property="og:url" content="${esc(head.canonical)}" />`,
      `<meta property="og:locale" content="${head.ogLocale}" />`,
      `<meta name="twitter:title" content="${esc(head.title)}" />`,
      `<meta name="twitter:description" content="${esc(head.description)}" />`,
      // `<` is escaped so a future description can never close the script early.
      `<script id="${JSONLD_ID}" type="application/ld+json">${head.jsonLd.replace(/</g, '\\u003c')}</script>`,
    ].join('\n    ')

    let html = swap(template, SEO_BLOCK, headTags)
    html = swap(html, '<html lang="zh-CN">', `<html lang="${head.htmlLang}">`)
    // data-ssr tells main.tsx to hydrate this markup instead of replacing it,
    // and names the route it was rendered for: a server that answers the wrong
    // URL with this file (a mis-ordered try_files, a stale CDN entry) is then
    // client-rendered instead of hydrated onto markup for another page.
    html = swap(
      html,
      '<div id="root"></div>',
      `<div id="root" data-ssr="${lang}:${item.path}">${app}</div>`
    )

    const segments = [
      lang === DEFAULT_LANG ? '' : lang,
      ...(item.path === '/' ? [] : item.path.split('/')),
    ].filter(Boolean)
    const file = join(distDir, ...segments, 'index.html')
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html)
    pages++
    bytes += Buffer.byteLength(html)
  }
}

// SPA fallback for URLs that have no prerendered file (typos, retired routes).
// It keeps an empty #root so React client-renders — hydrating a "not found"
// route against the docs index would be a guaranteed mismatch — and it is
// noindex because it is a shell, not a page.
await writeFile(
  join(distDir, 'app.html'),
  swap(template, ROBOTS, '<meta name="robots" content="noindex, follow" />')
)

console.log(
  `prerender: ${pages} pages (${ROUTE_LANGS.length} langs x ${pages / ROUTE_LANGS.length}) — ` +
    `${(bytes / 1024 / 1024).toFixed(1)} MB html in ${((Date.now() - started) / 1000).toFixed(1)}s; ` +
    `app.html written as the SPA fallback`
)
