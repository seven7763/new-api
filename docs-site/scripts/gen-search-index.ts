/**
 * Build-time search index generator. Renders every docs page (all four body
 * languages) to plain text via the same buildSearchIndex the app once ran on
 * the client, and writes one JSON file per language into public/search-index/.
 * The browser fetches these instead of loading react-dom/server + all content
 * registries just to search. Wired into `dev` and `build` (see package.json).
 * Run: bun run scripts/gen-search-index.ts
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Lang } from '../src/i18n-nav'
import { buildSearchIndex } from '../src/lib/search-build'

const LANGS: Lang[] = ['zh', 'en', 'ru', 'vi']
const outDir = join(import.meta.dir, '../public/search-index')

await mkdir(outDir, { recursive: true })

let total = 0
for (const lang of LANGS) {
  const docs = await buildSearchIndex(lang)
  // hay is derived on load (localized titles are recomputed), so it is stripped
  // from the serialized store to keep the payload small.
  const stored = docs.map(({ hay: _hay, ...rest }) => rest)
  const json = JSON.stringify(stored)
  const file = join(outDir, `${lang}.json`)
  await writeFile(file, json)
  total += json.length
  console.log(`  ${lang}.json — ${docs.length} pages, ${(json.length / 1024).toFixed(1)} kB`)
}

console.log(`search index generated: ${LANGS.length} files, ${(total / 1024).toFixed(1)} kB total`)
