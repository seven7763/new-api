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
const settled = new Map<Lang, Registry>()
const chains = new Map<Lang, Registry[]>()

function loadOne(lang: Lang): Promise<Registry> {
  let p = cache.get(lang)
  if (!p) {
    p = loaders[lang]().then((reg) => {
      settled.set(lang, reg)
      return reg
    })
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

/**
 * The already-resolved chain for `lang`, or null while a chunk is still in
 * flight. Lets the first render draw real content instead of a spinner, which
 * is what makes the prerendered HTML and the hydrating client agree — the entry
 * awaits `loadRegistries` before mounting (see main.tsx). The array identity is
 * stable per language so adopting it again is a no-op re-render.
 */
export function peekRegistries(lang: Lang): Registry[] | null {
  const cached = chains.get(lang)
  if (cached) return cached
  const parts = fallbackChain(lang).map((l) => settled.get(l))
  if (parts.some((p) => !p)) return null
  const chain = parts as Registry[]
  chains.set(lang, chain)
  return chain
}

/** Load exactly the registries needed to render + fall back for `lang`. */
export async function loadRegistries(lang: Lang): Promise<Registry[]> {
  await Promise.all(fallbackChain(lang).map(loadOne))
  return peekRegistries(lang) as Registry[]
}

/** First registry in the fallback chain that has a renderer for `id`. */
export function resolveRender(chain: Registry[], id: string): (() => ReactNode) | undefined {
  for (const reg of chain) {
    const render = reg[id]
    if (render) return render
  }
  return undefined
}
