/**
 * Build-time sitemap + robots generator. Both files are derived from the nav
 * tree in src/config.ts so a new page cannot silently stay out of the sitemap.
 * Wired into `dev` and `build` (see package.json).
 * Run: bun run scripts/gen-seo.ts
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { docsUrl, flatNav, langAlternates, ROUTE_LANGS, siteConfig } from '../src/config'

const outDir = join(import.meta.dir, '../public')
await mkdir(outDir, { recursive: true })

// Every language variant is its own <url>, and each one repeats the full
// hreflang set (itself included). Search engines drop hreflang annotations that
// are not reciprocal, so listing the alternates on only one variant would
// silently disable the whole thing.
const entries = flatNav().flatMap((item) =>
  ROUTE_LANGS.map((lang) => ({
    loc: docsUrl(item.path, lang),
    alternates: langAlternates(item.path),
  }))
)

// <loc> + <xhtml:link> only: Google ignores <priority>/<changefreq>, and a
// build-stamped <lastmod> on every page would advertise edits that did not
// happen.
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...entries.map((entry) =>
    [
      '  <url>',
      `    <loc>${entry.loc}</loc>`,
      ...entry.alternates.map(
        (alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>`
      ),
      '  </url>',
    ].join('\n')
  ),
  '</urlset>',
  '',
].join('\n')

await writeFile(join(outDir, 'sitemap.xml'), sitemap)

// Crawlers only read robots.txt from the origin root, so this copy is a
// fallback for root-mounted deployments. Under /docs the site owner still has
// to point https://<host>/robots.txt at the sitemap URL printed below.
const docsRoot = `${siteConfig.siteUrl.replace(/\/$/, '')}${siteConfig.docsPath}`
const robots = [
  'User-agent: *',
  'Allow: /',
  // The SPA shell behind the history fallback. It renders nothing without JS
  // and duplicates no page; keeping it out of the index costs nothing.
  `Disallow: ${siteConfig.docsPath}/app.html`,
  '',
  `Sitemap: ${docsRoot}/sitemap.xml`,
  '',
].join('\n')

await writeFile(join(outDir, 'robots.txt'), robots)

console.log(
  `seo: sitemap.xml — ${entries.length} urls (${flatNav().length} pages x ${ROUTE_LANGS.length} langs); robots.txt written`
)
