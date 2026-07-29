const RECENT_KEY = 'dx_docs_recent_v1'
const MAX_RECENT = 6

export function recordRecentVisit(path: string) {
  try {
    const list = readRecentVisits().filter((p) => p !== path)
    list.unshift(path)
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
  } catch {
    /* ignore */
  }
}

export function readRecentVisits(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((p) => typeof p === 'string') : []
  } catch {
    return []
  }
}
