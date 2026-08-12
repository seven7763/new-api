/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
const STATUS_STORAGE_KEY = 'status'

/**
 * Read and parse the cached `/api/status` payload from localStorage.
 * Returns null if the key is missing, JSON is invalid, or the result is not a plain object.
 *
 * The cache is a first-paint accelerator only: `main.tsx` always refetches
 * `/api/status` on boot and overwrites both the cache and the document, so an
 * admin SEO change lands on the next page load. There is deliberately no TTL —
 * expiring the cache would only trade a stale first frame for an empty one.
 */
export function readCachedStatus(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(STATUS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    /* empty */
  }
  return null
}

export function writeCachedStatus(status: Record<string, unknown>): void {
  try {
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(status))
  } catch {
    /* empty */
  }
}
