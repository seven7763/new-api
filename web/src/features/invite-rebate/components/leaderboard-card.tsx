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
import { Crown, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import { LEADERBOARD_LIMIT } from '../constants'
import { resolveInviteUserLabel } from '../lib/display'
import { useInviteRebateLeaderboard } from '../queries'
import type {
  InviteRebateLeaderboardEntry,
  InviteRebateLeaderboardMetric,
} from '../types'
import { TableMessageRow, TableSkeletonRows } from './table-states'

const RANK_ICON_CLASS_NAME: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-orange-700',
}

type LeaderboardCardProps = {
  metric: InviteRebateLeaderboardMetric
  onMetricChange: (metric: InviteRebateLeaderboardMetric) => void
}

export function LeaderboardCard(props: LeaderboardCardProps) {
  const { t } = useTranslation()
  // This card only mounts while its tab is selected, so enabling the query here
  // is already the lazy gate for the expensive aggregation.
  const leaderboardQuery = useInviteRebateLeaderboard(
    props.metric,
    LEADERBOARD_LIMIT,
    true
  )

  const rows = leaderboardQuery.data?.items ?? []
  const myRank = leaderboardQuery.data?.my_rank ?? 0
  const isRankedOffBoard = myRank > 0 && !rows.some((row) => row.is_me)

  return (
    <Card>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2'>
        <div className='min-w-0'>
          <CardTitle className='text-base'>{t('Invite leaderboard')}</CardTitle>
          <p className='text-muted-foreground mt-1 text-xs'>
            {myRank > 0
              ? t('Your current rank: #{{rank}}', { rank: myRank })
              : t('Invite friends and climb the board')}
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-1'>
          <Button
            size='sm'
            variant={props.metric === 'rebate' ? 'default' : 'outline'}
            aria-pressed={props.metric === 'rebate'}
            onClick={() => props.onMetricChange('rebate')}
          >
            {t('By rebate')}
          </Button>
          <Button
            size='sm'
            variant={props.metric === 'invitees' ? 'default' : 'outline'}
            aria-pressed={props.metric === 'invitees'}
            onClick={() => props.onMetricChange('invitees')}
          >
            {t('By invitees')}
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='size-8'
            aria-label={t('Refresh')}
            disabled={leaderboardQuery.isFetching}
            onClick={() => void leaderboardQuery.refetch()}
          >
            <RefreshCw
              className={cn(
                'size-3.5',
                leaderboardQuery.isFetching && 'animate-spin'
              )}
              aria-hidden='true'
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table className='min-w-[640px]'>
          <TableCaption className='sr-only'>
            {t('Invite leaderboard')}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope='col' className='w-16'>
                {t('Rank')}
              </TableHead>
              <TableHead scope='col'>{t('User')}</TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Invitees')}
              </TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Invitee top-up total')}
              </TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Rebate total')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <LeaderboardRows
              metric={props.metric}
              isPending={leaderboardQuery.isPending}
              isError={leaderboardQuery.isError}
              isFetching={leaderboardQuery.isFetching}
              rows={rows}
              onRetry={() => void leaderboardQuery.refetch()}
            />
          </TableBody>
        </Table>
        {isRankedOffBoard ? (
          <p className='text-muted-foreground mt-3 text-xs'>
            {t(
              'You are ranked #{{rank}}, just outside the top {{limit}}. Keep inviting to break in.',
              { rank: myRank, limit: LEADERBOARD_LIMIT }
            )}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

type LeaderboardRowsProps = {
  metric: InviteRebateLeaderboardMetric
  isPending: boolean
  isError: boolean
  isFetching: boolean
  rows: InviteRebateLeaderboardEntry[]
  onRetry: () => void
}

function LeaderboardRows(props: LeaderboardRowsProps) {
  const { t } = useTranslation()

  if (props.isPending) return <TableSkeletonRows rows={5} columns={5} />

  if (props.isError) {
    return (
      <TableMessageRow
        colSpan={5}
        message={t('Failed to load leaderboard')}
        onRetry={props.onRetry}
        retryDisabled={props.isFetching}
      />
    )
  }

  if (props.rows.length === 0) {
    return (
      <TableMessageRow colSpan={5} message={t('No leaderboard data yet')} />
    )
  }

  return (
    <>
      {props.rows.map((row) => (
        <TableRow
          key={`${props.metric}-${row.rank}`}
          className={cn(row.is_me && 'bg-primary/5')}
        >
          <TableCell className='font-semibold tabular-nums'>
            <span className='flex items-center gap-1.5'>
              #{row.rank}
              {RANK_ICON_CLASS_NAME[row.rank] ? (
                <Crown
                  className={cn('size-3.5', RANK_ICON_CLASS_NAME[row.rank])}
                  aria-hidden='true'
                />
              ) : null}
            </span>
          </TableCell>
          <TableCell>
            {resolveInviteUserLabel(
              row.display_name,
              row.username,
              row.user_id,
              t('Anonymous')
            )}
            {row.is_me ? (
              <Badge variant='secondary' className='ml-2 text-[10px]'>
                {t('You')}
              </Badge>
            ) : null}
          </TableCell>
          <TableCell className='text-right tabular-nums'>
            {row.invitee_count}
          </TableCell>
          <TableCell className='text-right tabular-nums'>
            {formatQuota(row.topup_quota_sum)}
          </TableCell>
          <TableCell className='text-right font-medium tabular-nums'>
            {formatQuota(row.rebate_quota_sum)}
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
