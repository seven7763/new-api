import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiUrl, siteConfig } from '@/config'

type ThemeMode = 'light' | 'dark' | 'system'

type StatusData = {
  system_name?: string
  logo?: string
  HeaderNavModules?: unknown
  docs_link?: string
  announcements?: Array<{
    id?: number
    content?: string
    extra?: string
    publishDate?: string
    type?: string
  }>
  announcements_enabled?: boolean
  faq?: Array<{ question?: string; answer?: string }>
  faq_enabled?: boolean
  [key: string]: unknown
}

type UserData = {
  username?: string
  display_name?: string
  role?: number
  group?: string
}

type ShellContextValue = {
  brand: string
  logo: string
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  status: StatusData | null
  user: UserData | null
  noticeHtml: string
  noticeUnread: boolean
  markNoticeSeen: () => void
  signOut: () => void
  refreshUser: () => void
  refreshStatus: () => Promise<void>
}

const ShellContext = createContext<ShellContextValue | null>(null)
const THEME_KEY = 'vite-ui-theme'
const NOTICE_KEY = 'v3-notice-seen'

function systemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readTheme(): ThemeMode {
  try {
    const m = document.cookie.match(/(?:^|;\s*)vite-ui-theme=([^;]*)/)
    if (m) {
      const t = decodeURIComponent(m[1])
      if (t === 'light' || t === 'dark' || t === 'system') return t
    }
  } catch {
    /* ignore */
  }
  try {
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'light' || t === 'dark' || t === 'system') return t
  } catch {
    /* ignore */
  }
  return 'system'
}

function applyTheme(theme: ThemeMode) {
  const dark = theme === 'dark' || (theme === 'system' && systemDark())
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
  const meta = document.querySelector("meta[name='theme-color']")
  if (meta) meta.setAttribute('content', dark ? '#020817' : '#fff')
}

function hashOf(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return String(h)
}

export function ShellProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    typeof window === 'undefined' ? 'system' : readTheme()
  )
  const [status, setStatus] = useState<StatusData | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('status') || 'null')
    } catch {
      return null
    }
  })
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })
  const [noticeHtml, setNoticeHtml] = useState('')
  const [noticeHash, setNoticeHash] = useState('')
  const [noticeUnread, setNoticeUnread] = useState(false)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
      document.cookie =
        THEME_KEY + '=' + encodeURIComponent(theme) + '; path=/; max-age=' + 60 * 60 * 24 * 365
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (readTheme() === 'system') applyTheme('system')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    fetch(apiUrl('/api/status'), { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const data = json && json.success !== false && json.data
        if (!data || typeof data !== 'object') return
        setStatus(data)
        try {
          localStorage.setItem('status', JSON.stringify(data))
        } catch {
          /* ignore */
        }
      })
      .catch(() => {})

    fetch(apiUrl('/api/notice'), { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const data = json && json.data
        if (typeof data !== 'string' || !data.trim()) return
        const h = hashOf(data)
        setNoticeHtml(data)
        setNoticeHash(h)
        try {
          setNoticeUnread(localStorage.getItem(NOTICE_KEY) !== h)
        } catch {
          setNoticeUnread(true)
        }
      })
      .catch(() => {})
  }, [])

  const setTheme = (t: ThemeMode) => setThemeState(t)

  const markNoticeSeen = () => {
    if (!noticeHash) return
    try {
      localStorage.setItem(NOTICE_KEY, noticeHash)
    } catch {
      /* ignore */
    }
    setNoticeUnread(false)
  }

  const refreshUser = () => {
    try {
      setUser(JSON.parse(localStorage.getItem('user') || 'null'))
    } catch {
      setUser(null)
    }
  }

  const refreshStatus = async () => {
    try {
      const r = await fetch(apiUrl('/api/status'), { headers: { Accept: 'application/json' } })
      if (!r.ok) return
      const json = await r.json()
      const data = json && json.success !== false && json.data
      if (!data || typeof data !== 'object') return
      setStatus(data)
      try {
        localStorage.setItem('status', JSON.stringify(data))
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  }

  const signOut = () => {
    fetch(apiUrl('/api/user/logout'), {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
      .catch(() => {})
      .finally(() => {
        try {
          localStorage.removeItem('user')
          localStorage.removeItem('uid')
        } catch {
          /* ignore */
        }
        setUser(null)
      })
  }

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'user') refreshUser()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const brand = status?.system_name?.trim() || siteConfig.brand
  const logo = status?.logo?.trim() || siteConfig.logo

  const value = useMemo(
    () => ({
      brand,
      logo,
      theme,
      setTheme,
      status,
      user,
      noticeHtml,
      noticeUnread,
      markNoticeSeen,
      signOut,
      refreshUser,
      refreshStatus,
    }),
    [brand, logo, theme, status, user, noticeHtml, noticeUnread]
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell outside provider')
  return ctx
}
