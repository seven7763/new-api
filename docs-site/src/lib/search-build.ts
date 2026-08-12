import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { flatNav } from '@/config'
import { navTitle, type Lang } from '@/i18n-nav'
import { I18nProvider } from '@/i18n'
import { ShellProvider } from '@/shell/ShellContext'
import { loadRegistries, resolveRender } from '@/lib/registry'
import { computeHay, type SearchDoc, type StoredDoc } from '@/lib/search'

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&nbsp;': ' ',
}

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&[a-z0-9#x]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Build the full-text index for a body language at build time (or in the verify
 * scripts). Every docs page is statically rendered inside the same
 * router/i18n/shell providers the app uses, then stripped to plain text so
 * search matches body content — error codes, env vars, hosts — not just titles.
 * Uses the shared per-language registry loader (target → en → zh fallback), so
 * pages that only live in zh (client guides, live-data pages) still render and
 * localize via the pinned provider language. This is the source of truth
 * serialized by scripts/gen-search-index.ts; the browser only fetches the JSON.
 */
export async function buildSearchIndex(lang: Lang = 'zh'): Promise<SearchDoc[]> {
  const bodyLang: Lang = lang
  const chain = await loadRegistries(bodyLang)

  return flatNav().map((it) => {
    let text = ''
    const render = resolveRender(chain, it.id)
    if (render) {
      try {
        const html = renderToStaticMarkup(
          createElement(
            MemoryRouter,
            null,
            createElement(
              I18nProvider,
              { lang: bodyLang },
              createElement(ShellProvider, null, render())
            )
          )
        )
        text = htmlToText(html)
      } catch {
        text = ''
      }
    }
    const stored: StoredDoc = {
      id: it.id,
      path: it.path,
      groupId: it.groupId,
      title: it.title,
      groupTitle: it.groupTitle,
      titleEn: navTitle(it.id, 'en', it.title),
      groupTitleEn: navTitle(it.groupId, 'en', it.groupTitle),
      text,
    }
    return { ...stored, hay: computeHay(stored, bodyLang) }
  })
}
