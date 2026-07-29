import type { ReactNode } from 'react'
import type { Lang } from '@/i18n-nav'

/** A page renderer registry keyed by nav id (zh is the source of truth). */
export type Registry = Record<string, () => ReactNode>

/**
 * Per-language dynamic imports. Both the app (App.tsx) and the search indexer
 * (search.ts) go through these SAME dynamic imports, so Rollup can move each
 * language registry into its own chunk instead of pinning all four into the
 * main bundle. Only the languages actually needed for the active UI language
 * (and its fallback chain) are ever fetched.
 */
const loaders: Record<Lang, () => Promise<Registry>> = {
  zh: () => import('@/content/pages').then((m) => m.content),
  en: () => import('@/content/pages.en').then((m) => m.contentEn),
  ru: () => import('@/content/pages.ru').then((m) => m.contentRu),
  vi: () => import('@/content/pages.vi').then((m) => m.contentVi),
}

const cache = new Map<Lang, Promise<Registry>>()

function loadOne(lang: Lang): Promise<Registry> {
  let p = cache.get(lang)
  if (!p) {
    p = loaders[lang]()
    cache.set(lang, p)
  }
  return p
}

/**
 * Registries to try, in order, for a UI language. Mirrors the original
 * `registry[id] ?? contentEn[id] ?? content[id]` fallback exactly:
 * every non-zh language falls back to en, then zh (the base registry that
 * holds the client guides + live-data pages, which render in the active
 * language internally). zh needs only itself — every nav id exists in it.
 */
function fallbackChain(lang: Lang): Lang[] {
  if (lang === 'zh') return ['zh']
  if (lang === 'en') return ['en', 'zh']
  return [lang, 'en', 'zh']
}

/** Load exactly the registries needed to render + fall back for `lang`. */
export function loadRegistries(lang: Lang): Promise<Registry[]> {
  return Promise.all(fallbackChain(lang).map(loadOne))
}

/** First registry in the fallback chain that has a renderer for `id`. */
export function resolveRender(chain: Registry[], id: string): (() => ReactNode) | undefined {
  for (const reg of chain) {
    const render = reg[id]
    if (render) return render
  }
  return undefined
}
