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
export type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

/**
 * Mirrors the backend `common.PageInfo` envelope. GORM leaves the slice nil for
 * an empty page, so `items` arrives as `null` and must be normalized.
 */
export type PageResult<T> = {
  page: number
  page_size: number
  total: number
  items: T[] | null
}

export type InviteRebateSummary = {
  invitee_count: number
  topup_quota_sum: number
  rebate_quota_sum: number
  aff_quota: number
  aff_history_quota: number
  enabled: boolean
  /** Rebate rate in basis points: 1 bp = 0.01%. */
  ratio_bp: number
}

export type InviteRebateLog = {
  id: number
  inviter_id: number
  invitee_id: number
  topup_id: number
  trade_no: string
  topup_quota: number
  rebate_quota: number
  ratio_bp: number
  /** `granted` or `skipped`; the listing endpoints only return granted rows. */
  status: string
  /** Unix timestamp in seconds. */
  created_at: number
}

export type InviteeRebateStat = {
  invitee_id: number
  /** Masked by the backend (e.g. `a***`); empty when the user never set one. */
  username: string
  display_name: string
  topup_quota_sum: number
  rebate_quota_sum: number
  rebate_count: number
}

export type InviteRebateLeaderboardMetric = 'rebate' | 'invitees'

export type InviteRebateLeaderboardEntry = {
  rank: number
  /** The backend only reveals the real id to the viewer; 0 for everyone else. */
  user_id: number
  username: string
  display_name: string
  invitee_count: number
  rebate_quota_sum: number
  topup_quota_sum: number
  is_me: boolean
}

export type InviteRebateLeaderboard = {
  by: InviteRebateLeaderboardMetric
  items: InviteRebateLeaderboardEntry[]
  /** 0 when the viewer has neither invitees nor rebate, so they are unranked. */
  my_rank: number
}

export type AdminInviteRebateSummary = {
  topup_quota_sum: number
  rebate_quota_sum: number
  row_count: number
  enabled: boolean
  ratio_bp: number
}

export type AdminInviteRebateFilters = {
  inviterId?: number
  inviteeId?: number
}

export type InviteRebateBackfillResult = {
  /** False when an identical backfill task was already queued or running. */
  created: boolean
  limit: number
}
