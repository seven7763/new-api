import { Link, useLocation } from 'react-router-dom'
import { Loader2, RotateCw, Search, TriangleAlert } from 'lucide-react'
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
import { SEARCH_OPEN_EVENT } from '@/components/DocsSearch'
import { LangSuggest } from '@/components/LangSuggest'
import { TableScrollFix } from '@/components/TableScrollFix'
import { Button } from '@/components/ui/button'
import { I18nProvider, useI18n } from '@/i18n'
import { navTitle, type Lang } from '@/i18n-nav'
import { recordRecentVisit } from '@/lib/recent'
import { applyDocumentSeo, buildSeoInput } from '@/lib/seo'
import { loadRegistries, peekRegistries, resolveRender, type Registry } from '@/lib/registry'
import { useEffect, useState, type ReactNode } from 'react'

function Article() {
  const location = useLocation()
  const item = findNavByPath(location.pathname)
  const { brand } = useShell()
  const { lang, t } = useI18n()
  // Content registries are loaded per language on demand (the URL's language
  // plus its fallback chain). The fallback chain — target → en → zh — is
  // resolved by resolveRender, matching the previous inline
  // `registry[id] ?? contentEn[id] ?? content[id]` behavior. zh holds the
  // client guides + live-data pages, which render in the active language.
  // The initial value is the synchronous peek so a prerendered page hydrates
  // against the same markup it was rendered with instead of a spinner.
  const [chain, setChain] = useState<Registry[] | null>(() => peekRegistries(lang))
  const [chunkFailed, setChunkFailed] = useState(false)
  useEffect(() => {
    let alive = true
    // A rejected import means the chunk is gone (a deploy replaced the hashed
    // filenames under a page the browser had already loaded) or the network
    // dropped. Without this branch `chain` stays null forever and the page sits
    // on the spinner — and on a prerendered page that spinner replaced an
    // article the visitor could already read.
    loadRegistries(lang).then(
      (c) => {
        if (!alive) return
        setChain(c)
        setChunkFailed(false)
      },
      () => {
        if (alive) setChunkFailed(true)
      }
    )
    return () => {
      alive = false
    }
  }, [lang])

  const render = chain && item ? resolveRender(chain, item.id) : undefined
  const title = item ? navTitle(item.id, lang, item.title) : t('notfound.title')

  useEffect(() => {
    const group = item ? navTitle(item.groupId, lang, item.groupTitle) : ''
    applyDocumentSeo(buildSeoInput({ item, title, group, brand, lang, t }))
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    if (item) recordRecentVisit(item.path)
  }, [location.pathname, title, brand, item, lang, t])

  let body: ReactNode
  if (chunkFailed) {
    body = (
      <div className="py-16 text-center" role="alert">
        <TriangleAlert className="text-muted-foreground mx-auto size-7" aria-hidden />
        <p className="mt-4 font-semibold">{t('error.content.title')}</p>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          {t('error.content.body')}
        </p>
        {/* A full reload, not another loadRegistries(): the loader caches the
            rejected promise, and a stale HTML document naming chunks that no
            longer exist can only be fixed by fetching the document again. */}
        <Button className="mt-6" onClick={() => window.location.reload()}>
          <RotateCw aria-hidden />
          {t('common.retry')}
        </Button>
      </div>
    )
  } else if (!chain) {
    body = (
      <div
        className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm"
        aria-live="polite"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {t('common.loading')}
      </div>
    )
  } else if (render) {
    body = render()
  } else {
    // No nav entry (or no renderer registered for one): the SPA fallback served
    // this URL, so say so instead of drawing the docs index over it — that read
    // as a working page and hid every broken link behind a 200.
    body = (
      <div className="py-16 text-center">
        <p className="text-muted-foreground font-mono text-xs tracking-widest">404</p>
        <p className="mt-3 text-lg font-semibold">{t('notfound.title')}</p>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">{t('notfound.body')}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/">{t('notfound.home')}</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.dispatchEvent(new CustomEvent(SEARCH_OPEN_EVENT))}
          >
            <Search aria-hidden />
            {t('nav.search')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <article className="article" key={location.pathname + lang}>
      <BreadcrumbBar />
      <TableScrollFix>{body}</TableScrollFix>
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
