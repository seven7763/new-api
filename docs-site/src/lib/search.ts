import { navTitle, type Lang } from '@/i18n-nav'

export type SearchDoc = {
  id: string
  path: string
  groupId: string
  /** zh title (source of truth) */
  title: string
  groupTitle: string
  /** en title for cross-language matching */
  titleEn: string
  groupTitleEn: string
  /** plain body text extracted from the rendered page */
  text: string
  /** lowercased haystack used for matching */
  hay: string
}

/** What gets serialized to the pre-built index (hay is derived on load). */
export type StoredDoc = Omit<SearchDoc, 'hay'>

export type SearchHit = {
  id: string
  path: string
  title: string
  groupTitle: string
  snippet: string
  score: number
}

/**
 * Lowercased match haystack for a doc under a given UI language. Kept here so
 * the build-time indexer and the runtime hydrator produce byte-identical
 * haystacks (localized titles are recomputed instead of stored).
 */
export function computeHay(d: StoredDoc, lang: Lang): string {
  const titleLoc = navTitle(d.id, lang, d.title)
  const groupTitleLoc = navTitle(d.groupId, lang, d.groupTitle)
  return `${d.id} ${d.path} ${d.title} ${d.groupTitle} ${d.titleEn} ${d.groupTitleEn} ${titleLoc} ${groupTitleLoc} ${d.text}`.toLowerCase()
}

/** Rebuild full SearchDocs (with hay) from the serialized store. */
export function hydrateDocs(raw: StoredDoc[], lang: Lang): SearchDoc[] {
  return raw.map((d) => ({ ...d, hay: computeHay(d, lang) }))
}

const indexPromises = new Map<Lang, Promise<SearchDoc[]>>()

/**
 * Load the pre-built full-text index for a body language and hydrate it.
 * The index is generated at build time (scripts/gen-search-index.ts) via the
 * same code path the verify scripts exercise, so search hits are identical to
 * rendering every page on the client — without shipping react-dom/server or the
 * content registries to the browser just to search. Each UI language searches
 * its own bodies (built with the en→zh fallback, exactly like the app). Fetched
 * once per language, lazily, when the palette first opens.
 */
export function loadSearchIndex(lang: Lang = 'zh'): Promise<SearchDoc[]> {
  const cached = indexPromises.get(lang)
  if (cached) return cached
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const promise = fetch(`${base}/search-index/${lang}.json`, {
    headers: { Accept: 'application/json' },
  })
    .then((r) => {
      if (!r.ok) throw new Error(`search index ${lang}: ${r.status}`)
      return r.json() as Promise<StoredDoc[]>
    })
    .then((raw) => hydrateDocs(raw, lang))
    .catch((err) => {
      indexPromises.delete(lang)
      throw err
    })
  indexPromises.set(lang, promise)
  return promise
}

function makeSnippet(doc: SearchDoc, tokens: string[]) {
  const lower = doc.text.toLowerCase()
  let pos = -1
  for (const tk of tokens) {
    const p = lower.indexOf(tk)
    if (p >= 0 && (pos < 0 || p < pos)) pos = p
  }
  if (pos < 0) return doc.text.slice(0, 90)
  let start = Math.max(0, pos - 30)
  const end = Math.min(doc.text.length, pos + 70)
  // avoid cutting an ASCII word in half at the left edge
  if (start > 0) {
    const sp = doc.text.indexOf(' ', start)
    if (sp >= 0 && sp < pos) start = sp + 1
  }
  return `${start > 0 ? '…' : ''}${doc.text.slice(start, end)}${end < doc.text.length ? '…' : ''}`
}

function countOccurrences(hay: string, needle: string) {
  let n = 0
  let i = hay.indexOf(needle)
  while (i >= 0 && n < 20) {
    n++
    i = hay.indexOf(needle, i + needle.length)
  }
  return n
}

export function searchDocs(docs: SearchDoc[], query: string, lang: Lang): SearchHit[] {
  const q = query.trim().toLowerCase()
  const localized = (d: SearchDoc) => ({
    title: navTitle(d.id, lang, d.title),
    groupTitle: navTitle(d.groupId, lang, d.groupTitle),
  })

  if (!q) {
    return docs.slice(0, 8).map((d, i) => ({
      id: d.id,
      path: d.path,
      ...localized(d),
      snippet: d.text.slice(0, 90),
      score: 100 - i,
    }))
  }

  const tokens = q.split(/\s+/).filter(Boolean)
  return docs
    .map((d) => {
      let score = 0
      let matchedAll = true
      for (const tk of tokens) {
        let tokenScore = 0
        if (d.title.toLowerCase().includes(tk) || d.titleEn.toLowerCase().includes(tk)) {
          tokenScore += 10
        }
        if (
          d.groupTitle.toLowerCase().includes(tk) ||
          d.groupTitleEn.toLowerCase().includes(tk)
        ) {
          tokenScore += 3
        }
        if (d.id === tk) tokenScore += 12
        const bodyHits = countOccurrences(d.hay, tk)
        if (bodyHits > 0) tokenScore += 1 + Math.min(bodyHits, 8) * 0.5
        if (tokenScore === 0) matchedAll = false
        score += tokenScore
      }
      // require every token to match somewhere, so multi-word queries narrow down
      if (!matchedAll) score = 0
      return { d, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.d.path.localeCompare(b.d.path))
    .slice(0, 12)
    .map(({ d, score }) => ({
      id: d.id,
      path: d.path,
      ...localized(d),
      snippet: makeSnippet(d, tokens),
      score,
    }))
}
