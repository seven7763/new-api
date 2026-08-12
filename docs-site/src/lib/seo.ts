/**
 * Per-route document head for the SPA: title, description, canonical, Open
 * Graph / Twitter cards and a JSON-LD graph. index.html carries static
 * defaults for crawlers that do not execute JS; this refreshes them on
 * navigation for those that do (Googlebot renders, most social scrapers do not
 * — see README for the prerender caveat).
 */
import { docsUrl, siteConfig } from '@/config'

export type SeoCrumb = { name: string; url: string }

export type SeoInput = {
  title: string
  description: string
  path: string
  /** Home → group → page. Omitted on the docs index. */
  breadcrumbs: SeoCrumb[]
  /** BCP-47 tag for og:locale and the article language. */
  locale: string
}

const JSONLD_ID = 'dx-docs-jsonld'

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

function buildGraph(input: SeoInput, url: string): object[] {
  const origin = siteConfig.siteUrl.replace(/\/$/, '')
  const home = docsUrl('/')

  const website = {
    '@type': 'WebSite',
    '@id': `${home}#website`,
    url: home,
    name: `${siteConfig.brand} Docs`,
    description: siteConfig.description,
    inLanguage: input.locale,
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
      inLanguage: input.locale,
      isPartOf: { '@id': `${home}#website` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      publisher: { '@id': `${origin}#organization` },
    })
  }

  return graph
}

export function applyDocumentSeo(input: SeoInput) {
  const url = docsUrl(input.path)
  const fullTitle = `${input.title} · ${siteConfig.brand} Docs`

  document.title = fullTitle
  upsertMeta('meta[name="description"]', 'name', 'description', input.description)
  upsertCanonical(url)

  upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
  upsertMeta(
    'meta[property="og:description"]',
    'property',
    'og:description',
    input.description
  )
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url)
  upsertMeta(
    'meta[property="og:type"]',
    'property',
    'og:type',
    input.breadcrumbs.length > 1 ? 'article' : 'website'
  )
  upsertMeta(
    'meta[property="og:locale"]',
    'property',
    'og:locale',
    input.locale.replace('-', '_')
  )
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
  upsertMeta(
    'meta[name="twitter:description"]',
    'name',
    'twitter:description',
    input.description
  )

  let script = document.getElementById(JSONLD_ID)
  if (!script) {
    script = document.createElement('script')
    script.id = JSONLD_ID
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': buildGraph(input, url),
  })
}
