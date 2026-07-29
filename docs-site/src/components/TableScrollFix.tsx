import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/** Wrap article tables for horizontal scroll without breaking column layout */
export function TableScrollFix({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const wrapTables = () => {
      const tables = root.querySelectorAll('table')
      tables.forEach((table) => {
        if (table.parentElement?.classList.contains('table-wrap')) return
        const wrap = document.createElement('div')
        wrap.className = 'table-wrap'
        table.parentNode?.insertBefore(wrap, table)
        wrap.appendChild(table)
      })
    }

    wrapTables()
    // content may paint async (e.g. live models)
    const mo = new MutationObserver(() => wrapTables())
    mo.observe(root, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [location.pathname, children])

  return (
    <div ref={ref} className="article-content">
      {children}
    </div>
  )
}
