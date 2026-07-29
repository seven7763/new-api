/**
 * Search smoke test: builds the real full-text index (same code path the UI
 * uses) and asserts representative queries return the expected page.
 * Run: bun run scripts/verify-search.ts
 */
import { searchDocs } from '../src/lib/search'
import { buildSearchIndex } from '../src/lib/search-build'

const cases: { q: string; expectId: string; desc: string }[] = [
  { q: '密钥', expectId: 'keys', desc: '中文标题匹配' },
  { q: 'API 密钥', expectId: 'keys', desc: '多词(空格)中文查询' },
  { q: 'CLAUDE CODE', expectId: 'claude-code', desc: '大小写不敏感' },
  { q: '429', expectId: 'rate-limit', desc: '正文全文匹配（错误码）' },
  { q: 'ANTHROPIC_BASE_URL', expectId: 'claude-code', desc: '正文环境变量匹配' },
  { q: 'embeddings', expectId: 'openai-embeddings', desc: '英文标题匹配' },
  { q: '充值', expectId: 'topup', desc: '中文正文/标题匹配' },
  { q: 'quick start', expectId: 'quickstart', desc: '英文多词查询' },
  { q: '术语', expectId: 'glossary', desc: '中文部分词匹配' },
]

const enCases: { q: string; expectId: string; desc: string }[] = [
  { q: 'create a key', expectId: 'keys', desc: 'en body/title match' },
  { q: '429', expectId: 'rate-limit', desc: 'en body error-code match' },
  { q: 'ANTHROPIC_BASE_URL', expectId: 'claude-code', desc: 'en body env var match' },
  { q: 'built-in provider', expectId: 'deepchat', desc: 'en client guide body' },
  { q: 'rate limit exceeded', expectId: 'rate-limit', desc: 'en multi-word body' },
]

const ruCases: { q: string; expectId: string; desc: string }[] = [
  { q: 'ANTHROPIC_BASE_URL', expectId: 'claude-code', desc: 'ru body env var match' },
  { q: '429', expectId: 'rate-limit', desc: 'ru body error-code match' },
  { q: 'глоссарий', expectId: 'glossary', desc: 'ru title match' },
  { q: 'встроенный', expectId: 'deepchat', desc: 'ru client guide body' },
]

const viCases: { q: string; expectId: string; desc: string }[] = [
  { q: 'ANTHROPIC_BASE_URL', expectId: 'claude-code', desc: 'vi body env var match' },
  { q: '429', expectId: 'rate-limit', desc: 'vi body error-code match' },
  { q: 'thuật ngữ', expectId: 'glossary', desc: 'vi title match' },
  { q: 'tích hợp sẵn', expectId: 'deepchat', desc: 'vi client guide body' },
]

const docs = await buildSearchIndex('zh')
console.log(`zh index built: ${docs.length} pages, sample text (${docs[0].id}):`)
console.log('  ' + docs[0].text.slice(0, 120) + '…\n')

let failed = 0
for (const c of cases) {
  const hits = searchDocs(docs, c.q, 'zh')
  const top3 = hits.slice(0, 3).map((h) => h.id)
  const ok = top3.includes(c.expectId)
  if (!ok) failed++
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  "${c.q}" (${c.desc}) → [${top3.join(', ')}]  expect: ${c.expectId}`
  )
}

const docsEn = await buildSearchIndex('en')
console.log(`\nen index built: ${docsEn.length} pages, sample text (${docsEn[0].id}):`)
console.log('  ' + docsEn[0].text.slice(0, 120) + '…\n')
for (const c of enCases) {
  const hits = searchDocs(docsEn, c.q, 'en')
  const top3 = hits.slice(0, 3).map((h) => h.id)
  const ok = top3.includes(c.expectId)
  if (!ok) failed++
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  "${c.q}" (${c.desc}) → [${top3.join(', ')}]  expect: ${c.expectId}`
  )
}

const docsRu = await buildSearchIndex('ru')
console.log(`\nru index built: ${docsRu.length} pages, sample text (${docsRu[0].id}):`)
console.log('  ' + docsRu[0].text.slice(0, 120) + '…\n')
for (const c of ruCases) {
  const hits = searchDocs(docsRu, c.q, 'ru')
  const top3 = hits.slice(0, 3).map((h) => h.id)
  const ok = top3.includes(c.expectId)
  if (!ok) failed++
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  "${c.q}" (${c.desc}) → [${top3.join(', ')}]  expect: ${c.expectId}`
  )
}

const docsVi = await buildSearchIndex('vi')
console.log(`\nvi index built: ${docsVi.length} pages, sample text (${docsVi[0].id}):`)
console.log('  ' + docsVi[0].text.slice(0, 120) + '…\n')
for (const c of viCases) {
  const hits = searchDocs(docsVi, c.q, 'vi')
  const top3 = hits.slice(0, 3).map((h) => h.id)
  const ok = top3.includes(c.expectId)
  if (!ok) failed++
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  "${c.q}" (${c.desc}) → [${top3.join(', ')}]  expect: ${c.expectId}`
  )
}

const empty = searchDocs(docs, '', 'zh')
console.log(`\nempty query returns ${empty.length} default entries (expect 8)`)
if (empty.length !== 8) failed++

const noise = searchDocs(docs, 'zzzz-not-exist-防抖动', 'zh')
console.log(`nonsense query returns ${noise.length} hits (expect 0)`)
if (noise.length !== 0) failed++

if (failed) {
  console.error(`\n${failed} case(s) failed`)
  process.exit(1)
}
console.log('\nall search cases passed')
