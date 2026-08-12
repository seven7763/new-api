/**
 * Post-build audit of dist/: every page exists as a static file in every
 * language, its head describes itself (title / description / canonical /
 * og:url / JSON-LD), the body really contains the article rather than the
 * loading state, and the hreflang graph is reciprocal — every variant names
 * every other variant, each declaration points at that variant's own canonical,
 * and each of those URLs resolves to a file that was actually written.
 * Run after `bun run build`: bun run scripts/verify-prerender.ts
 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { docsUrl, flatNav, LANG_META, ROUTE_LANGS, siteConfig } from '../src/config'
import type { Lang } from '../src/i18n-nav'

const distDir = join(import.meta.dir, '../dist')
const docsRoot = `${siteConfig.siteUrl.replace(/\/$/, '')}${siteConfig.docsPath.replace(/\/$/, '')}`
const problems: string[] = []

function fail(msg: string) {
  problems.push(msg)
}

/** dist-relative file a public docs URL must be answered from. */
function fileForUrl(url: string) {
  if (!url.startsWith(docsRoot)) return null
  const rest = url.slice(docsRoot.length).replace(/^\//, '').replace(/\/$/, '')
  return join(distDir, rest, 'index.html')
}

function attr(html: string, re: RegExp) {
  return html.match(re)?.[1] ?? ''
}

function alternatesOf(html: string) {
  const out = new Map<string, string>()
  for (const m of html.matchAll(
    /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\s*\/?>/g
  )) {
    out.set(m[1], m[2])
  }
  return out
}

type Page = { lang: Lang; path: string; file: string; html: string; alternates: Map<string, string> }
const pages: Page[] = []

for (const lang of ROUTE_LANGS) {
  for (const item of flatNav()) {
    const url = docsUrl(item.path, lang)
    const file = fileForUrl(url)
    if (!file || !existsSync(file)) {
      fail(`MISSING FILE: ${lang} ${item.path} → ${url}`)
      continue
    }
    const html = await readFile(file, 'utf8')
    pages.push({ lang, path: item.path, file, html, alternates: alternatesOf(html) })

    if (!html.includes(`data-ssr="${lang}:${item.path}"`)) fail(`NOT PRERENDERED: ${url}`)
    if (!html.includes('<article')) fail(`NO ARTICLE: ${url}`)

    const body = html.slice(html.indexOf('<article'))
    const text = body
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length < 200) fail(`THIN BODY: ${url} — ${text.length} chars`)

    const htmlLang = attr(html, /<html lang="([^"]+)"/)
    if (htmlLang !== LANG_META[lang].html) {
      fail(`WRONG html lang: ${url} — got "${htmlLang}", want "${LANG_META[lang].html}"`)
    }

    const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/)
    if (canonical !== url) fail(`WRONG CANONICAL: ${url} — got "${canonical}"`)

    const ogUrl = attr(html, /<meta property="og:url" content="([^"]+)"/)
    if (ogUrl !== url) fail(`WRONG og:url: ${url} — got "${ogUrl}"`)

    const title = attr(html, /<title>([^<]*)<\/title>/)
    if (!title || title.startsWith('DaoXE Docs —')) fail(`GENERIC TITLE: ${url} — "${title}"`)

    const description = attr(html, /<meta name="description" content="([^"]*)"/)
    if (description.length < 40) fail(`WEAK DESCRIPTION: ${url} — "${description}"`)

    const ld = html.match(
      /<script id="dx-docs-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/
    )?.[1]
    if (!ld) {
      fail(`NO JSON-LD: ${url}`)
    } else {
      try {
        const graph = JSON.parse(ld.replace(/\\u003c/g, '<')) as {
          '@graph': Array<{ '@type': string; url?: string; inLanguage?: string }>
        }
        const article = graph['@graph'].find((n) => n['@type'] === 'TechArticle')
        if (article && article.url !== url) fail(`JSON-LD url mismatch: ${url} — ${article.url}`)
        if (article && article.inLanguage !== LANG_META[lang].html) {
          fail(`JSON-LD inLanguage mismatch: ${url} — ${article.inLanguage}`)
        }
      } catch (err) {
        fail(`BROKEN JSON-LD: ${url} — ${(err as Error).message}`)
      }
    }
  }
}

// hreflang reciprocity. Google discards annotations that are not confirmed from
// both sides, so it is not enough that page A links to B: B must link back, and
// both must use the exact URL the other one declares as its canonical.
const byKey = new Map(pages.map((p) => [`${p.lang} ${p.path}`, p]))
for (const page of pages) {
  const expected = new Set([...ROUTE_LANGS.map((l) => LANG_META[l].hreflang), 'x-default'])
  for (const code of expected) {
    if (!page.alternates.has(code)) {
      fail(`MISSING hreflang="${code}" on ${docsUrl(page.path, page.lang)}`)
    }
  }
  for (const [code, href] of page.alternates) {
    if (!expected.has(code)) fail(`UNEXPECTED hreflang="${code}" on ${docsUrl(page.path, page.lang)}`)
    const target = fileForUrl(href)
    if (!target || !existsSync(target)) {
      fail(`DEAD hreflang: ${docsUrl(page.path, page.lang)} → ${href} (no file)`)
    }
  }
  for (const other of ROUTE_LANGS) {
    const declared = page.alternates.get(LANG_META[other].hreflang)
    const otherUrl = docsUrl(page.path, other)
    if (declared !== otherUrl) {
      fail(`hreflang="${LANG_META[other].hreflang}" on ${docsUrl(page.path, page.lang)} points at ${declared}, want ${otherUrl}`)
      continue
    }
    // …and the other side has to name this page back.
    const back = byKey.get(`${other} ${page.path}`)?.alternates.get(LANG_META[page.lang].hreflang)
    if (back !== docsUrl(page.path, page.lang)) {
      fail(`NOT RECIPROCAL: ${otherUrl} does not declare ${docsUrl(page.path, page.lang)} (got ${back})`)
    }
  }
}

// The SPA shell must stay empty and unindexed, or the fallback would both
// duplicate the docs index and force React to discard the markup it hydrated.
const fallback = join(distDir, 'app.html')
if (!existsSync(fallback)) {
  fail('MISSING dist/app.html (SPA fallback)')
} else {
  const html = await readFile(fallback, 'utf8')
  if (!html.includes('<div id="root"></div>')) fail('app.html #root is not empty')
  if (!/<meta name="robots" content="noindex/.test(html)) fail('app.html is not noindex')
}

// Sitemap coverage: same URL set, and each entry is a real file.
const sitemap = await readFile(join(distDir, 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
const expectedLocs = new Set(
  ROUTE_LANGS.flatMap((lang) => flatNav().map((item) => docsUrl(item.path, lang)))
)
if (locs.length !== expectedLocs.size) {
  fail(`SITEMAP SIZE: ${locs.length} urls, expected ${expectedLocs.size}`)
}
for (const loc of locs) {
  if (!expectedLocs.has(loc)) fail(`SITEMAP EXTRA: ${loc}`)
  const target = fileForUrl(loc)
  if (!target || !existsSync(target)) fail(`SITEMAP DEAD: ${loc}`)
}

if (problems.length) {
  for (const p of problems) console.log(p)
  console.error(`\n${problems.length} problem(s)`)
  process.exit(1)
}
console.log(
  `prerender ok — ${pages.length} pages verified (${flatNav().length} routes x ${ROUTE_LANGS.length} langs), ` +
    `${locs.length} sitemap urls, hreflang reciprocal in both directions`
)
