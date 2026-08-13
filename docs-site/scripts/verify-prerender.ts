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
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import {
  DEFAULT_LANG,
  docsUrl,
  flatNav,
  groupEntryPath,
  LANG_META,
  nav,
  ROUTE_LANGS,
  siteConfig,
} from '../src/config'
import { translate } from '../src/i18n'
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

    // Slice to the *end* of the article. Slicing to the end of the file instead
    // folded the sidebar tail, TOC, footer and inline scripts into the count:
    // its floor across all four languages was 372 chars, so a 200-char
    // threshold could never fire and this check asserted nothing. Real article
    // text runs 133 (zh /features/notice) to ~2000 chars, hence a floor of 100.
    const start = html.indexOf('<article')
    const end = html.indexOf('</article>', start)
    if (end < 0) {
      fail(`UNCLOSED ARTICLE: ${url}`)
      continue
    }
    const text = html
      .slice(start, end)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length < 100) fail(`THIN BODY: ${url} — ${text.length} chars`)
    // Length alone would not catch the failure this check exists for: a page
    // whose registry chunk was not awaited renders the spinner plus a full
    // breadcrumb and pager, which clears any length floor.
    const loading = translate(lang, 'common.loading')
    if (text.includes(loading)) fail(`LOADING BODY: ${url} — contains "${loading}"`)

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
  // x-default names the variant served to visitors no hreflang matched. Only
  // its existence used to be checked, so it could have pointed at any language.
  const xDefault = page.alternates.get('x-default')
  const wantDefault = docsUrl(page.path, DEFAULT_LANG)
  if (xDefault !== wantDefault) {
    fail(`x-default on ${docsUrl(page.path, page.lang)} points at ${xDefault}, want ${wantDefault}`)
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

// Nothing in dist/ may answer a docs URL the nav tree does not know about. The
// expectation set above comes from flatNav(), the same source prerender.ts
// renders from, so on its own it can only ever report missing files — a page
// left behind by a renamed or deleted route would survive every deploy,
// outrank its replacement and never be noticed.
const expectedFiles = new Set(pages.map((p) => p.file))
for (const entry of await readdir(distDir, { recursive: true })) {
  const name = String(entry)
  if (!name.endsWith('index.html')) continue
  const file = join(distDir, name)
  if (!expectedFiles.has(file)) fail(`ORPHAN PAGE: dist/${relative(distDir, file)} matches no route`)
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
  // nginx answers every unmatched /docs/… URL from this one file. A canonical
  // or hreflang here would attach the docs index's identity to every typo,
  // group prefix and retired asset path, and Google treats noindex plus
  // canonical as contradictory — worst case the noindex propagates to the
  // canonical target and takes the docs index out of the index with it.
  if (/rel="canonical"/.test(html)) fail('app.html declares a canonical (noindex + canonical)')
  if (/rel="alternate"/.test(html)) fail('app.html declares hreflang alternates')
}

// Sidebar group prefixes (/docs/guide) are not routes. Without a redirect the
// history fallback answers them 200 with the SPA shell, so nginx has to send
// them to the group's first page — which is groupEntryPath, in src/config.ts.
// Checking the rule text here is what keeps the hand-written conf from drifting
// when a group is renamed or its first item changes.
const conf = await readFile(join(import.meta.dir, '../deploy/daoxe-docs.conf'), 'utf8')
const confRules = conf.replace(/[ \t]+/g, ' ')
const mount = siteConfig.docsPath.replace(/\/$/, '')
const prefixLangs = ROUTE_LANGS.filter((l) => l !== DEFAULT_LANG).join('|')
const routePaths = new Set(flatNav().map((i) => i.path))
for (const group of nav) {
  const head = `rewrite ^${mount}/((?:${prefixLangs})/)?${group.id}/?$`
  if (routePaths.has(`/${group.id}`)) {
    // `changelog` is both a group id and a real page. Redirecting it would
    // bounce a canonical URL that every hreflang set already points at.
    if (confRules.includes(head)) fail(`nginx: ${mount}/${group.id} is a route but is redirected`)
    continue
  }
  const rule = `${head} ${mount}/$1${groupEntryPath(group.id).replace(/^\//, '')} permanent;`
  if (!confRules.includes(rule)) fail(`nginx: deploy/daoxe-docs.conf is missing \`${rule}\``)
}

// Both file paths in that location are written against `alias`, and nginx
// applies opposite rules to them. try_files strips the location prefix only
// from parameters built out of variables, so the literal /docs/app.html that
// used to sit in the list was appended to the alias whole — it looked for
// /var/www/daoxe-docs/docs/app.html, the mount twice, and every unknown URL
// fell through to `=404` and nginx's own error page. Dropping the prefix does
// resolve, but a matched file test is a 200, i.e. a soft 404 on every typo. So
// the shell comes from `error_page 404`, whose internal redirect re-enters this
// location and IS resolved through $uri — that one needs the prefix back, and
// an `=code` on it would replace the 404 with the file's own 200. `nginx -t`
// accepts all four spellings, which is why they are pinned here.
const docsLocation = `location ^~ ${mount}/ {`
const blockStart = conf.indexOf(docsLocation)
let blockEnd = -1
for (
  let i = blockStart + docsLocation.length - 1, depth = 0;
  blockStart >= 0 && i < conf.length;
  i++
) {
  if (conf[i] === '{') depth++
  else if (conf[i] === '}' && --depth === 0) {
    blockEnd = i
    break
  }
}
if (blockEnd < 0) {
  fail(`nginx: deploy/daoxe-docs.conf has no closed \`${docsLocation}\` block`)
} else {
  // Comment-stripped: the block documents these very spellings in prose.
  const block = conf.slice(blockStart, blockEnd).replace(/^[ \t]*#.*$/gm, '')
  const tryFiles = block.match(/\btry_files\s+([^;]+);/)?.[1].trim().split(/\s+/) ?? []
  if (tryFiles.length < 2) {
    fail(`nginx: no try_files in \`${docsLocation}\``)
  } else {
    for (const param of tryFiles.slice(0, -1)) {
      if (!param.startsWith('$')) {
        fail(
          `nginx: try_files file test \`${param}\` is a literal — under alias it tests ` +
            `/var/www/daoxe-docs${param}, and a match would be a 200 soft 404`
        )
      }
    }
    if (tryFiles.at(-1) !== '=404') {
      fail(`nginx: try_files must end in \`=404\` for error_page to fire, got \`${tryFiles.at(-1)}\``)
    }
  }

  const errorPage = block.match(/\berror_page\s+404\s+([^;]+);/)?.[1].trim()
  const shellUri = `${mount}/${relative(distDir, fallback)}`
  if (!errorPage) {
    fail(`nginx: no \`error_page 404 ${shellUri};\` — unknown URLs get nginx's own 404 page`)
  } else if (errorPage !== shellUri) {
    fail(
      `nginx: \`error_page 404 ${errorPage};\` must be \`error_page 404 ${shellUri};\` — ` +
        `an =code replaces the 404 with the shell's own 200, and without the ${mount} ` +
        `prefix the internal redirect leaves this location`
    )
  }
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
