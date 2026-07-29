import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ListTree } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n'

type TocItem = {
  id: string
  text: string
  level: number
}

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Observe article h2/h3 and render right-rail TOC */
export function ArticleToc({ rootSelector = '.article' }: { rootSelector?: string }) {
  const { t } = useI18n()
  const location = useLocation()
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const root = document.querySelector(rootSelector)
    if (!root) {
      setItems([])
      return
    }
    const headings = Array.from(root.querySelectorAll('h2, h3')) as HTMLElement[]
    const next: TocItem[] = []
    const used = new Set<string>()
    headings.forEach((el) => {
      const text = (el.textContent || '').trim()
      if (!text) return
      let id = el.id || slugify(text) || 'section'
      let i = 2
      while (used.has(id)) {
        id = `${slugify(text)}-${i++}`
      }
      used.add(id)
      el.id = id
      next.push({ id, text, level: el.tagName === 'H3' ? 3 : 2 })
    })
    setItems(next)
    setActiveId(next[0]?.id || '')

    if (!next.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    headings.forEach((h) => obs.observe(h))
    return () => obs.disconnect()
  }, [location.pathname, rootSelector])

  const hasToc = items.length >= 2

  const list = useMemo(
    () =>
      items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={cn('toc-link', it.level === 3 && 'pl-5', activeId === it.id && 'active')}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(it.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActiveId(it.id)
            history.replaceState(null, '', `#${it.id}`)
          }}
        >
          {it.text}
        </a>
      )),
    [items, activeId]
  )

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto pr-1">
        {hasToc ? (
          <div>
            <div className="text-muted-foreground mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold tracking-wider uppercase">
              <ListTree className="size-3.5" />
              {t('toc.title')}
            </div>
            <nav className="border-border flex flex-col border-l pl-0">{list}</nav>
          </div>
        ) : null}

        <div className="border-border bg-card/80 rounded-xl border p-3 shadow-sm">
          <div className="text-muted-foreground mb-2 text-[11px] font-bold tracking-wider uppercase">
            {t('toc.quick')}
          </div>
          <div className="flex flex-col gap-1.5 text-[12.5px] font-semibold">
            <Link to="/start/quickstart" className="text-primary no-underline hover:underline">
              {t('toc.quickstart')}
            </Link>
            <Link to="/guide/recommended-models" className="text-primary no-underline hover:underline">
              {t('toc.models')}
            </Link>
            <Link to="/guide/multi-protocol" className="text-primary no-underline hover:underline">
              {t('toc.protocol')}
            </Link>
            <Link to="/guide/verify" className="text-primary no-underline hover:underline">
              {t('toc.verify')}
            </Link>
            <Link to="/guide/errors" className="text-primary no-underline hover:underline">
              {t('toc.errors')}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
