import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Clock, FileText, Flame, Loader2, Search, X } from 'lucide-react'
import { findNavByPath } from '@/config'
import { useI18n } from '@/i18n'
import { navTitle } from '@/i18n-nav'
import { readRecentVisits } from '@/lib/recent'
import { loadSearchIndex, searchDocs, type SearchDoc } from '@/lib/search'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const POPULAR_PATHS = [
  '/start/quickstart',
  '/guide/recommended-models',
  '/guide/multi-protocol',
  '/guide/verify',
  '/guide/errors',
]

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Wrap matched query tokens in <mark> */
function highlight(text: string, tokens: string[]): ReactNode {
  if (!tokens.length || !text) return text
  const re = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(re)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="search-mark">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

type QuickEntry = { path: string; title: string; groupTitle: string }

const OPEN_EVENT = 'dx-docs-open-search'
const LISTBOX_ID = 'dx-docs-search-listbox'
const optionId = (idx: number) => `dx-docs-search-opt-${idx}`

/**
 * Trigger-only variant for a second placement (e.g. the mobile header row).
 * It signals the single dialog-owning <DocsSearch /> instance instead of
 * mounting another dialog, so ⌘K / clicks never open two stacked palettes.
 */
export function DocsSearchTrigger() {
  const { t } = useI18n()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT))}
      aria-label={t('nav.search')}
    >
      <Search className="size-4" />
    </Button>
  )
}

export function DocsSearch() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [docs, setDocs] = useState<SearchDoc[] | null>(null)
  const [recent, setRecent] = useState<string[]>([])

  // Build the language-specific full-text index the first time the palette
  // opens (and rebuild when the UI language changes: zh / en / ru / vi).
  useEffect(() => {
    setDocs(null)
  }, [lang])
  useEffect(() => {
    if (!open) return
    setRecent(readRecentVisits())
    if (docs) return
    let alive = true
    loadSearchIndex(lang).then(
      (idx) => {
        if (alive) setDocs(idx)
      },
      () => {
        if (alive) setDocs([])
      }
    )
    return () => {
      alive = false
    }
  }, [open, docs, lang])

  const query = q.trim()
  const tokens = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query])

  const hits = useMemo(
    () => (docs && query ? searchDocs(docs, query, lang) : []),
    [docs, query, lang]
  )

  const toEntry = (path: string): QuickEntry | null => {
    const it = findNavByPath(path)
    if (!it) return null
    return {
      path: it.path,
      title: navTitle(it.id, lang, it.title),
      groupTitle: navTitle(it.groupId, lang, it.groupTitle),
    }
  }

  const recentEntries = useMemo(
    () => recent.map(toEntry).filter((e): e is QuickEntry => !!e).slice(0, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recent, lang]
  )
  const popularEntries = useMemo(
    () =>
      POPULAR_PATHS.filter((p) => !recent.slice(0, 5).includes(p))
        .map(toEntry)
        .filter((e): e is QuickEntry => !!e),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recent, lang]
  )

  // flat keyboard-navigable list for the empty-query state
  const quickList = useMemo(
    () => [...recentEntries, ...popularEntries],
    [recentEntries, popularEntries]
  )
  const navigable = query ? hits.map((h) => h.path) : quickList.map((e) => e.path)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  useEffect(() => {
    setActive(0)
  }, [q, open])

  const go = (path: string) => {
    setOpen(false)
    setQ('')
    navigate(path)
  }

  const quickRow = (e: QuickEntry, icon: ReactNode, idxOffset: number, i: number) => {
    const idx = idxOffset + i
    return (
      <button
        key={e.path}
        type="button"
        role="option"
        id={optionId(idx)}
        aria-selected={idx === active}
        onClick={() => go(e.path)}
        onMouseEnter={() => setActive(idx)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition',
          idx === active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/70'
        )}
      >
        {icon}
        <span className="min-w-0 text-sm font-medium">{e.title}</span>
        <span className="text-muted-foreground ml-auto shrink-0 text-xs">{e.groupTitle}</span>
      </button>
    )
  }

  const activeDescendant = navigable.length ? optionId(active) : undefined
  const dialog = open ? (
    <div className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="animate-in fade-in-0 absolute inset-0 bg-black/45 backdrop-blur-[2px] duration-150"
        aria-label="Close search"
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.search')}
        className="border-border bg-card animate-in fade-in-0 zoom-in-95 relative z-[121] w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl duration-150"
      >
        <div className="border-border flex items-center gap-2 border-b px-3 py-2.5">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('nav.search.placeholder')}
            aria-label={t('nav.search')}
            role="combobox"
            aria-expanded="true"
            aria-controls={LISTBOX_ID}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendant}
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => Math.min(i + 1, Math.max(navigable.length - 1, 0)))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter' && navigable[active]) {
                e.preventDefault()
                go(navigable[active])
              }
            }}
          />
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md p-1 focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>
        <div
          id={LISTBOX_ID}
          role="listbox"
          aria-label={t('nav.search')}
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {!query ? (
            <>
              {recentEntries.length ? (
                <>
                  <div className="text-muted-foreground flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase">
                    <Clock className="size-3" /> {t('nav.search.recent')}
                  </div>
                  {recentEntries.map((e, i) =>
                    quickRow(e, <Clock className="text-muted-foreground size-4 shrink-0 opacity-70" />, 0, i)
                  )}
                </>
              ) : null}
              {popularEntries.length ? (
                <>
                  <div className="text-muted-foreground flex items-center gap-1.5 px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase">
                    <Flame className="size-3" /> {t('nav.search.popular')}
                  </div>
                  {popularEntries.map((e, i) =>
                    quickRow(
                      e,
                      <Flame className="text-muted-foreground size-4 shrink-0 opacity-70" />,
                      recentEntries.length,
                      i
                    )
                  )}
                </>
              ) : null}
            </>
          ) : !docs ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 px-3 py-8 text-sm">
              <Loader2 className="size-4 animate-spin" /> {t('common.loading')}
            </div>
          ) : (
            <>
              {hits.map((h, i) => (
                <button
                  key={h.id}
                  type="button"
                  role="option"
                  id={optionId(i)}
                  aria-selected={i === active}
                  onClick={() => go(h.path)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition',
                    i === active ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/70'
                  )}
                >
                  <FileText className="mt-0.5 size-4 shrink-0 opacity-70" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {highlight(h.title, tokens)}
                      <span className="text-muted-foreground ml-2 text-xs font-normal">
                        {h.groupTitle}
                      </span>
                    </span>
                    {h.snippet ? (
                      <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                        {highlight(h.snippet, tokens)}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
              {!hits.length ? (
                <div className="text-muted-foreground px-3 py-8 text-center text-sm">
                  {t('nav.search.empty')}
                </div>
              ) : null}
            </>
          )}
        </div>
        <div className="text-muted-foreground border-border border-t px-3 py-2 text-[11px]">
          ↑↓ · Enter · Esc · {t('nav.search.hint')}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-muted-foreground hidden h-8 gap-2 rounded-lg px-2.5 md:inline-flex"
        onClick={() => setOpen(true)}
        aria-label={t('nav.search')}
      >
        <Search className="size-3.5" />
        <span className="max-w-[7rem] truncate text-xs">{t('nav.search')}</span>
        <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label={t('nav.search')}
      >
        <Search className="size-4" />
      </Button>

      {dialog ? createPortal(dialog, document.body) : null}
    </>
  )
}
