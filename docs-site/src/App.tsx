import { useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { findNavByPath } from '@/config'
import {
  BreadcrumbBar,
  DocsFooter,
  DocsSidebar,
  PagerBar,
  PublicHeader,
} from '@/shell/PublicHeader'
import { ShellProvider, useShell } from '@/shell/ShellContext'
import { ArticleToc } from '@/components/ArticleToc'
import { DocsAssistant } from '@/components/DocsAssistant'
import { LangSuggest } from '@/components/LangSuggest'
import { TableScrollFix } from '@/components/TableScrollFix'
import { I18nProvider, useI18n } from '@/i18n'
import { navTitle, type Lang } from '@/i18n-nav'
import { recordRecentVisit } from '@/lib/recent'
import { applyDocumentSeo, buildSeoInput } from '@/lib/seo'
import { loadRegistries, peekRegistries, resolveRender, type Registry } from '@/lib/registry'
import { useEffect, useState } from 'react'

function Article() {
  const location = useLocation()
  const item = findNavByPath(location.pathname)
  const { brand } = useShell()
  const { lang, t } = useI18n()
  const id = item?.id || 'welcome'
  // Content registries are loaded per language on demand (the URL's language
  // plus its fallback chain). The fallback chain — target → en → zh — is
  // resolved by resolveRender, matching the previous inline
  // `registry[id] ?? contentEn[id] ?? content[id]` behavior. zh holds the
  // client guides + live-data pages, which render in the active language.
  // The initial value is the synchronous peek so a prerendered page hydrates
  // against the same markup it was rendered with instead of a spinner.
  const [chain, setChain] = useState<Registry[] | null>(() => peekRegistries(lang))
  useEffect(() => {
    let alive = true
    loadRegistries(lang).then((c) => {
      if (alive) setChain(c)
    })
    return () => {
      alive = false
    }
  }, [lang])

  const render = chain ? resolveRender(chain, id) : undefined
  const title = item ? navTitle(item.id, lang, item.title) : t('crumb.docs')

  useEffect(() => {
    const group = item ? navTitle(item.groupId, lang, item.groupTitle) : ''
    applyDocumentSeo(buildSeoInput({ item, title, group, brand, lang, t }))
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    if (item) recordRecentVisit(item.path)
  }, [location.pathname, title, brand, item, lang, t])

  return (
    <article className="article" key={location.pathname + lang}>
      <BreadcrumbBar />
      <TableScrollFix>
        {!chain ? (
          <div
            className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm"
            aria-live="polite"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('common.loading')}
          </div>
        ) : render ? (
          render()
        ) : (
          <p>Not found</p>
        )}
      </TableScrollFix>
      <PagerBar />
    </article>
  )
}

function Layout() {
  return (
    <>
      <div className="page-glow" aria-hidden />
      <PublicHeader />
      <div className="flex min-h-screen flex-col pt-16">
        <LangSuggest />
        <div className="mx-auto flex w-full max-w-[1500px] flex-1">
          <DocsSidebar />
          <div className="flex min-w-0 flex-1 gap-8 px-4 py-7 sm:px-6 lg:px-8">
            <main className="min-w-0 flex-1">
              <Article />
            </main>
            <ArticleToc />
          </div>
        </div>
        <DocsFooter />
      </div>
      <DocsAssistant />
    </>
  )
}

/** `lang` comes from the URL (see splitLangPath) — never from storage. */
export function App({ lang }: { lang: Lang }) {
  return (
    <I18nProvider lang={lang}>
      <ShellProvider>
        <Layout />
      </ShellProvider>
    </I18nProvider>
  )
}
