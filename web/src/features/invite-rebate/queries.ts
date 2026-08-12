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
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  fetchAdminInviteRebateSummary,
  fetchAdminInviteRebates,
  fetchAffiliateCode,
  fetchInviteRebateInvitees,
  fetchInviteRebateLeaderboard,
  fetchInviteRebateLogs,
  fetchInviteRebateSummary,
  transferAffiliateQuota,
  triggerInviteRebateBackfill,
} from './api'
import type {
  AdminInviteRebateFilters,
  ApiResponse,
  InviteRebateLeaderboardMetric,
} from './types'

const SUMMARY_STALE_TIME_MS = 30 * 1000
const TABLE_STALE_TIME_MS = 60 * 1000
const TABLE_GC_TIME_MS = 5 * 60 * 1000

/**
 * The leaderboard runs two full-table aggregations per request and is not rate
 * limited server side, so it is cached far longer than anything else here and
 * never auto-refetches on mount, focus or reconnect. Combined with the
 * `enabled` gate in the consuming components this keeps a page visit to at most
 * one aggregation per five minutes, and toggling the sort metric back and forth
 * costs nothing after the first load of each metric.
 */
const LEADERBOARD_STALE_TIME_MS = 5 * 60 * 1000
const LEADERBOARD_GC_TIME_MS = 30 * 60 * 1000

/** The affiliate code is immutable for a given account. */
const AFFILIATE_CODE_STALE_TIME_MS = 30 * 60 * 1000

export const inviteRebateKeys = {
  all: ['invite-rebate'] as const,
  summary: () => [...inviteRebateKeys.all, 'summary'] as const,
  affiliateCode: () => [...inviteRebateKeys.all, 'affiliate-code'] as const,
  logs: (page: number, pageSize: number) =>
    [...inviteRebateKeys.all, 'logs', { page, pageSize }] as const,
  invitees: (page: number, pageSize: number) =>
    [...inviteRebateKeys.all, 'invitees', { page, pageSize }] as const,
  leaderboard: (by: InviteRebateLeaderboardMetric, limit: number) =>
    [...inviteRebateKeys.all, 'leaderboard', { by, limit }] as const,
  admin: () => [...inviteRebateKeys.all, 'admin'] as const,
  adminSummary: (inviterId: number | undefined) =>
    [
      ...inviteRebateKeys.admin(),
      'summary',
      { inviterId: inviterId ?? 0 },
    ] as const,
  adminList: (
    filters: AdminInviteRebateFilters,
    page: number,
    pageSize: number
  ) =>
    [
      ...inviteRebateKeys.admin(),
      'list',
      {
        inviterId: filters.inviterId ?? 0,
        inviteeId: filters.inviteeId ?? 0,
        page,
        pageSize,
      },
    ] as const,
}

function unwrapApiData<T>(
  response: ApiResponse<T>,
  fallbackMessage: string
): T {
  if (!response.success || response.data == null) {
    throw new Error(response.message || fallbackMessage)
  }
  return response.data
}

export function useInviteRebateSummary() {
  const { t } = useTranslation()
  return useQuery({
    queryKey: inviteRebateKeys.summary(),
    queryFn: async () =>
      unwrapApiData(
        await fetchInviteRebateSummary(),
        t('Failed to load invite rebate data')
      ),
    staleTime: SUMMARY_STALE_TIME_MS,
  })
}

export function useAffiliateCode() {
  const { t } = useTranslation()
  return useQuery({
    queryKey: inviteRebateKeys.affiliateCode(),
    queryFn: async () =>
      unwrapApiData(
        await fetchAffiliateCode(),
        t('Failed to load your invite link')
      ),
    staleTime: AFFILIATE_CODE_STALE_TIME_MS,
    gcTime: AFFILIATE_CODE_STALE_TIME_MS,
  })
}

export function useInviteRebateLogs(page: number, pageSize: number) {
  const { t } = useTranslation()
  return useQuery({
    queryKey: inviteRebateKeys.logs(page, pageSize),
    queryFn: async () =>
      unwrapApiData(
        await fetchInviteRebateLogs(page, pageSize),
        t('Failed to load rebate logs')
      ),
    staleTime: TABLE_STALE_TIME_MS,
    gcTime: TABLE_GC_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

export function useInviteRebateInvitees(page: number, pageSize: number) {
  const { t } = useTranslation()
  return useQuery({
    queryKey: inviteRebateKeys.invitees(page, pageSize),
    queryFn: async () =>
      unwrapApiData(
        await fetchInviteRebateInvitees(page, pageSize),
        t('Failed to load invitees')
      ),
    staleTime: TABLE_STALE_TIME_MS,
    gcTime: TABLE_GC_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

/**
 * `enabled` is what keeps the expensive aggregation off the wire until the user
 * actually looks at a leaderboard: the overview preview only enables itself
 * once it scrolls into view, and the leaderboard tab only mounts when selected.
 * Both call this with the same limit so they share a single cache entry.
 */
export function useInviteRebateLeaderboard(
  by: InviteRebateLeaderboardMetric,
  limit: number,
  enabled: boolean
) {
  const { t } = useTranslation()
  return useQuery({
    queryKey: inviteRebateKeys.leaderboard(by, limit),
    queryFn: async () =>
      unwrapApiData(
        await fetchInviteRebateLeaderboard(by, limit),
        t('Failed to load leaderboard')
      ),
    enabled,
    staleTime: LEADERBOARD_STALE_TIME_MS,
    gcTime: LEADERBOARD_GC_TIME_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    placeholderData: keepPreviousData,
  })
}

export function useAdminInviteRebateSummary(inviterId: number | undefined) {
  const { t } = useTranslation()
  return useQuery({
    queryKey: inviteRebateKeys.adminSummary(inviterId),
    queryFn: async () =>
      unwrapApiData(
        await fetchAdminInviteRebateSummary(inviterId),
        t('Failed to load admin rebate data')
      ),
    staleTime: TABLE_STALE_TIME_MS,
    gcTime: TABLE_GC_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

export function useAdminInviteRebates(
  filters: AdminInviteRebateFilters,
  page: number,
  pageSize: number
) {
  const { t } = useTranslation()
  return useQuery({
    queryKey: inviteRebateKeys.adminList(filters, page, pageSize),
    queryFn: async () =>
      unwrapApiData(
        await fetchAdminInviteRebates(filters, page, pageSize),
        t('Failed to load admin rebate data')
      ),
    staleTime: TABLE_STALE_TIME_MS,
    gcTime: TABLE_GC_TIME_MS,
    placeholderData: keepPreviousData,
  })
}

/**
 * Only the summary is invalidated on success: the transfer moves pending
 * rewards into the balance and changes neither the rebate ledger nor the
 * leaderboard, so refetching those would be pure waste.
 */
export function useTransferAffiliateQuota() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quota: number) => transferAffiliateQuota({ quota }),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message || t('Transfer failed'))
        return
      }
      toast.success(response.message || t('Transfer successful'))
      void queryClient.invalidateQueries({
        queryKey: inviteRebateKeys.summary(),
      })
    },
  })
}

export function useInviteRebateBackfill() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (limit: number) => triggerInviteRebateBackfill(limit),
    onSuccess: (response) => {
      if (!response.success) {
        toast.error(response.message || t('Backfill failed'))
        return
      }
      if (response.data?.created === false) {
        toast.info(t('A rebate backfill is already queued'))
      } else {
        toast.success(t('Backfill queued'))
      }
      void queryClient.invalidateQueries({ queryKey: inviteRebateKeys.admin() })
    },
  })
}
