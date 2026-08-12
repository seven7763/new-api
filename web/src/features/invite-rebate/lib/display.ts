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
import { formatNumber } from '@/lib/format'

/**
 * Render `InviteTopupRebateRateBp` as a percent number without the `%` sign, so
 * callers can place it inside a translated string. The backend stores the rate
 * in basis points (1 bp = 0.01%) and clamps it to 0..10000.
 */
export function formatBasisPointsPercent(ratioBp: number | undefined): string {
  if (ratioBp == null || !Number.isFinite(ratioBp) || ratioBp <= 0) return '0'
  return formatNumber(ratioBp / 100)
}

/**
 * Pick the label for an invitee or leaderboard entry. Names arrive masked from
 * the backend (`a***`) and can be empty, and the numeric id is only exposed for
 * the viewer themselves, so anyone else without a name stays anonymous.
 */
export function resolveInviteUserLabel(
  displayName: string,
  username: string,
  userId: number,
  anonymousLabel: string
): string {
  const name = displayName?.trim() || username?.trim()
  if (name) return name
  if (userId > 0) return `#${userId}`
  return anonymousLabel
}
