/**
 * Per-route document head: title, description, canonical, hreflang, Open Graph
 * / Twitter cards and a JSON-LD graph.
 *
 * `buildSeoHead` is pure and DOM-free so the same values are produced twice:
 * `scripts/prerender.ts` serializes them into the static HTML every crawler
 * sees on the first byte, and `applyDocumentSeo` writes them into the live
 * document when client-side navigation changes the route.
 */
import { docsUrl, findNavByPath, groupEntryPath, langAlternates, LANG_META, siteConfig } from '@/config'
import type { Lang } from '@/i18n-nav'

export type SeoCrumb = { name: string; url: string }

export type SeoInput = {
  title: string
  description: string
  /** In-app route, without the mount point or language prefix. */
  path: string
  /** Home → group → page. Omitted on the docs index. */
  breadcrumbs: SeoCrumb[]
  lang: Lang
  /** Localized site-level description for the WebSite node. */
  siteDescription: string
}

export type SeoHead = {
  title: string
  description: string
  canonical: string
  htmlLang: string
  ogLocale: string
  ogType: 'article' | 'website'
  alternates: { hreflang: string; href: string }[]
  /** Serialized JSON-LD graph. */
  jsonLd: string
}

export const JSONLD_ID = 'dx-docs-jsonld'

/**
 * Head values for one docs route, in that route's language. Called from the
 * running app (App.tsx) and from scripts/prerender.ts with the same arguments,
 * so the static HTML and the runtime update cannot describe a page differently.
 */
export function buildSeoInput({
  item,
  title,
  group,
  brand,
  lang,
  t,
}: {
  item: ReturnType<typeof findNavByPath>
  title: string
  group: string
  brand: string
  lang: Lang
  t: (key: string) => string
}): SeoInput {
  const fill = (template: string, values: Record<string, string>) =>
    template.replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m)
  const siteDescription = fill(t('seo.siteDescription'), { brand })
  return {
    title,
    // Unique per page and derived from data we already have, so no page ships
    // the generic site-wide description — in the page's own language.
    description: group ? fill(t('seo.pageDescription'), { title, brand, group }) : siteDescription,
    path: item?.path || '/',
    breadcrumbs: item
      ? [
          { name: t('crumb.docs'), url: docsUrl('/', lang) },
          { name: group, url: docsUrl(groupEntryPath(item.groupId), lang) },
          { name: title, url: docsUrl(item.path, lang) },
        ]
      : [],
    lang,
    siteDescription,
  }
}

function buildGraph(input: SeoInput, url: string, inLanguage: string): object[] {
  const origin = siteConfig.siteUrl.replace(/\/$/, '')
  const home = docsUrl('/', input.lang)

  const website = {
    '@type': 'WebSite',
    '@id': `${home}#website`,
    url: home,
    name: `${siteConfig.brand} Docs`,
    description: input.siteDescription,
    inLanguage,
    publisher: { '@id': `${origin}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${home}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const organization = {
    '@type': 'Organization',
    '@id': `${origin}#organization`,
    name: siteConfig.brand,
    url: origin,
    logo: siteConfig.logo,
  }

  const graph: object[] = [organization, website]

  if (input.breadcrumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: input.breadcrumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    })
    graph.push({
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: input.title,
      description: input.description,
      url,
      inLanguage,
      isPartOf: { '@id': `${home}#website` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      publisher: { '@id': `${origin}#organization` },
    })
  }

  return graph
}

export function buildSeoHead(input: SeoInput): SeoHead {
  const meta = LANG_META[input.lang]
  // Canonical points at this language's own URL. Pointing every variant at the
  // zh one would tell search engines the other three are duplicates and drop
  // them from the index, which is exactly what the language URLs exist to fix.
  const canonical = docsUrl(input.path, input.lang)
  return {
    title: `${input.title} · ${siteConfig.brand} Docs`,
    description: input.description,
    canonical,
    htmlLang: meta.html,
    ogLocale: meta.ogLocale,
    ogType: input.breadcrumbs.length > 1 ? 'article' : 'website',
    alternates: langAlternates(input.path),
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': buildGraph(input, canonical, meta.html),
    }),
  }
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

function replaceAlternates(alternates: { hreflang: string; href: string }[]) {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove())
  for (const alt of alternates) {
    const el = document.createElement('link')
    el.rel = 'alternate'
    el.hreflang = alt.hreflang
    el.href = alt.href
    document.head.appendChild(el)
  }
}

export function applyDocumentSeo(input: SeoInput) {
  const head = buildSeoHead(input)

  document.title = head.title
  upsertMeta('meta[name="description"]', 'name', 'description', head.description)
  upsertCanonical(head.canonical)
  replaceAlternates(head.alternates)

  upsertMeta('meta[property="og:title"]', 'property', 'og:title', head.title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', head.description)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', head.canonical)
  upsertMeta('meta[property="og:type"]', 'property', 'og:type', head.ogType)
  upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', head.ogLocale)
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', head.title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', head.description)

  let script = document.getElementById(JSONLD_ID)
  if (!script) {
    script = document.createElement('script')
    script.id = JSONLD_ID
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  script.textContent = head.jsonLd
}
