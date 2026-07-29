/**
 * Content audit: every nav id has a page renderer, every internal link points
 * to a real route, every referenced local image exists, and no page body is
 * suspiciously thin.
 * Run: bun run scripts/verify-content.ts
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { flatNav } from '../src/config'
import { buildSearchIndex } from '../src/lib/search-build'

const docs = await buildSearchIndex('zh')
const docsEn = await buildSearchIndex('en')
const docsRu = await buildSearchIndex('ru')
const docsVi = await buildSearchIndex('vi')
const routes = new Set(flatNav().map((i) => i.path))
let problems = 0

// 1. nav coverage
const { content } = await import('../src/content/pages')
for (const it of flatNav()) {
  if (!content[it.id]) {
    console.log(`MISSING PAGE: nav id "${it.id}" (${it.path}) has no content renderer`)
    problems++
  }
}
for (const id of Object.keys(content)) {
  if (!flatNav().some((i) => i.id === id)) {
    console.log(`ORPHAN PAGE: content id "${id}" is not in nav`)
  }
}

// 2. internal links + images from source
const src = await Bun.file(join(import.meta.dir, '../src/content/pages.tsx')).text()
const srcEn = await Bun.file(join(import.meta.dir, '../src/content/pages.en.tsx')).text()
const srcRu = await Bun.file(join(import.meta.dir, '../src/content/pages.ru.tsx')).text()
const srcVi = await Bun.file(join(import.meta.dir, '../src/content/pages.vi.tsx')).text()
const guides = await Bun.file(join(import.meta.dir, '../src/content/clientGuides.tsx')).text()
const docui = await Bun.file(join(import.meta.dir, '../src/components/DocUI.tsx')).text()
const all = src + srcEn + srcRu + srcVi + guides + docui

for (const m of all.matchAll(/to="(\/[^"]*)"/g)) {
  const p = m[1].replace(/\/$/, '') || '/'
  if (!routes.has(p)) {
    console.log(`BROKEN LINK: to="${m[1]}"`)
    problems++
  }
}
for (const m of all.matchAll(/["'](\/images\/[^"']+)["']/g)) {
  if (!existsSync(join(import.meta.dir, '../public', m[1]))) {
    console.log(`MISSING IMAGE: ${m[1]}`)
  }
}

// 3. thin pages (body text below threshold), audited for every language
for (const [lng, set] of [
  ['zh', docs],
  ['en', docsEn],
  ['ru', docsRu],
  ['vi', docsVi],
] as const) {
  for (const d of set) {
    if (d.text.length < 120) {
      console.log(`THIN PAGE [${lng}]: ${d.id} (${d.path}) — ${d.text.length} chars: ${d.text.slice(0, 80)}`)
    }
  }
}

console.log(problems ? `\n${problems} hard problem(s)` : '\nno hard problems (missing screenshots / thin pages listed above are advisories)')
process.exit(problems ? 1 : 0)
