/**
 * i18n parity check: every UI key present in zh must exist in en/ru/vi, and
 * vice versa, so no language falls back mid-sentence.
 * Run: bun run scripts/verify-i18n.ts
 */
import { I18N_DICTS, LANGS } from '../src/i18n'

const zhKeys = Object.keys(I18N_DICTS.zh).sort()
let failed = 0

for (const { id } of LANGS) {
  const keys = new Set(Object.keys(I18N_DICTS[id]))
  const missing = zhKeys.filter((k) => !keys.has(k))
  const extra = Object.keys(I18N_DICTS[id]).filter((k) => !zhKeys.includes(k))
  if (missing.length || extra.length) {
    failed++
    if (missing.length) console.log(`[${id}] missing: ${missing.join(', ')}`)
    if (extra.length) console.log(`[${id}] extra: ${extra.join(', ')}`)
  } else {
    console.log(`[${id}] ok — ${keys.size} keys`)
  }
}

if (failed) {
  console.error(`\n${failed} language(s) out of sync`)
  process.exit(1)
}
console.log('\nall languages in sync')
