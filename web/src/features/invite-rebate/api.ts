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
import { transferAffiliateQuota } from '@/features/wallet/api'
import { api } from '@/lib/api'

import type {
  AdminInviteRebateFilters,
  AdminInviteRebateSummary,
  ApiResponse,
  InviteeRebateStat,
  InviteRebateBackfillResult,
  InviteRebateLeaderboard,
  InviteRebateLeaderboardMetric,
  InviteRebateLog,
  InviteRebateSummary,
  PageResult,
} from './types'

export { transferAffiliateQuota }

export async function fetchInviteRebateSummary(): Promise<
  ApiResponse<InviteRebateSummary>
> {
  const res = await api.get('/api/user/invite_rebate/summary')
  return res.data
}

export async function fetchInviteRebateLogs(
  page: number,
  pageSize: number
): Promise<ApiResponse<PageResult<InviteRebateLog>>> {
  const res = await api.get('/api/user/invite_rebate/logs', {
    params: { p: page, page_size: pageSize },
  })
  return res.data
}

export async function fetchInviteRebateInvitees(
  page: number,
  pageSize: number
): Promise<ApiResponse<PageResult<InviteeRebateStat>>> {
  const res = await api.get('/api/user/invite_rebate/invitees', {
    params: { p: page, page_size: pageSize },
  })
  return res.data
}

/**
 * Leaderboard is the most expensive endpoint of this feature (full-table
 * aggregation, no server-side rate limit), so failures are surfaced to the
 * caller instead of raising a global toast and the query layer keeps it behind
 * a long `staleTime`.
 */
export async function fetchInviteRebateLeaderboard(
  by: InviteRebateLeaderboardMetric,
  limit: number
): Promise<ApiResponse<InviteRebateLeaderboard>> {
  try {
    const res = await api.get('/api/user/invite_rebate/leaderboard', {
      params: { by, limit },
      skipErrorHandler: true,
      skipBusinessError: true,
    })
    return res.data
  } catch (error) {
    // Re-throw as a plain Error: the global query cache handler navigates the
    // whole app to /500 for any AxiosError carrying a 500, and an optional
    // leaderboard must never take the rest of the page down with it.
    throw new Error(
      error instanceof Error
        ? error.message
        : 'invite rebate leaderboard failed',
      { cause: error }
    )
  }
}

export async function fetchAdminInviteRebates(
  filters: AdminInviteRebateFilters,
  page: number,
  pageSize: number
): Promise<ApiResponse<PageResult<InviteRebateLog>>> {
  const res = await api.get('/api/invite_rebate/', {
    params: {
      p: page,
      page_size: pageSize,
      inviter_id: filters.inviterId,
      invitee_id: filters.inviteeId,
    },
  })
  return res.data
}

export async function fetchAdminInviteRebateSummary(
  inviterId?: number
): Promise<ApiResponse<AdminInviteRebateSummary>> {
  const res = await api.get('/api/invite_rebate/summary', {
    params: { inviter_id: inviterId },
  })
  return res.data
}

/** Root-only: enqueues an on-demand `invite_rebate_backfill` system task. */
export async function triggerInviteRebateBackfill(
  limit: number
): Promise<ApiResponse<InviteRebateBackfillResult>> {
  const res = await api.post('/api/system-task/invite-rebate-backfill', null, {
    params: { limit },
  })
  return res.data
}

export async function fetchAffiliateCode(): Promise<ApiResponse<string>> {
  const res = await api.get('/api/user/aff')
  return res.data
}
