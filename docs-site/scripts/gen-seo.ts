/**
 * Build-time sitemap + robots generator. Both files are derived from the nav
 * tree in src/config.ts so a new page cannot silently stay out of the sitemap.
 * Wired into `dev` and `build` (see package.json).
 * Run: bun run scripts/gen-seo.ts
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { docsUrl, flatNav, siteConfig } from '../src/config'

const outDir = join(import.meta.dir, '../public')
await mkdir(outDir, { recursive: true })

const urls = flatNav().map((item) => docsUrl(item.path))

// <loc> only: Google ignores <priority>/<changefreq>, and a build-stamped
// <lastmod> on every page would advertise edits that did not happen.
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((loc) => `  <url><loc>${loc}</loc></url>`),
  '</urlset>',
  '',
].join('\n')

await writeFile(join(outDir, 'sitemap.xml'), sitemap)

// Crawlers only read robots.txt from the origin root, so this copy is a
// fallback for root-mounted deployments. Under /docs the site owner still has
// to point https://<host>/robots.txt at the sitemap URL printed below.
const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${siteConfig.siteUrl.replace(/\/$/, '')}${siteConfig.docsPath}/sitemap.xml`,
  '',
].join('\n')

await writeFile(join(outDir, 'robots.txt'), robots)

console.log(`seo: sitemap.xml — ${urls.length} urls; robots.txt written`)
