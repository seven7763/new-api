import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Languages, X } from 'lucide-react'
import { docsHref, LANG_META } from '@/config'
import { preferredLang, rememberLang, translate, useI18n } from '@/i18n'
import type { Lang } from '@/i18n-nav'

const DISMISS_KEY = 'dx_docs_lang_hint_off'

/**
 * "This page is also available in …" hint.
 *
 * Language negotiation cannot happen on the server here — the site is static
 * files behind nginx — and auto-redirecting visitors by `Accept-Language` would
 * both risk redirect loops and stop crawlers from reaching the other language
 * variants, which is the opposite of what the language URLs are for. So the
 * negotiated language is offered as a link instead, in the language being
 * offered, and only after mount: the first render returns null on the server
 * and on the client alike, so hydration never sees a difference.
 */
export function LangSuggest() {
  const { lang } = useI18n()
  const location = useLocation()
  const [suggested, setSuggested] = useState<Lang | null>(null)

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      /* ignore */
    }
    if (dismissed) return
    const preferred = preferredLang()
    setSuggested(preferred && preferred !== lang ? preferred : null)
  }, [lang])

  if (!suggested) return null

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setSuggested(null)
  }

  return (
    <div className="border-border bg-muted/40 border-b" lang={LANG_META[suggested].html}>
      <div className="text-muted-foreground mx-auto flex w-full max-w-[1500px] items-center gap-3 px-4 py-2 text-[13px] sm:px-6 lg:px-8">
        <Languages className="size-3.5 shrink-0 opacity-70" aria-hidden />
        <span>{translate(suggested, 'lang.suggest.text')}</span>
        <a
          href={docsHref(location.pathname, suggested)}
          hrefLang={LANG_META[suggested].hreflang}
          className="text-primary font-medium underline-offset-2 hover:underline"
          onClick={() => rememberLang(suggested)}
        >
          {translate(suggested, 'lang.suggest.action')}
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="hover:text-foreground ml-auto flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors"
          aria-label={translate(suggested, 'lang.suggest.dismiss')}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
