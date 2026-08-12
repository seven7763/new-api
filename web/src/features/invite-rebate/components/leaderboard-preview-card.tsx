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
import { Crown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import { LEADERBOARD_LIMIT, LEADERBOARD_PREVIEW_SIZE } from '../constants'
import { resolveInviteUserLabel } from '../lib/display'
import { useInviteRebateLeaderboard } from '../queries'
import type {
  InviteRebateLeaderboardEntry,
  InviteRebateLeaderboardMetric,
} from '../types'

type LeaderboardPreviewCardProps = {
  metric: InviteRebateLeaderboardMetric
  onViewAll: () => void
}

export function LeaderboardPreviewCard(props: LeaderboardPreviewCardProps) {
  const { t } = useTranslation()
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  // Without IntersectionObserver we cannot tell whether the card is on screen,
  // so fall back to fetching as soon as it mounts.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined'
  )

  useEffect(() => {
    if (!container || inView) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setInView(true)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [container, inView])

  // Same limit as the full leaderboard so both views share one cache entry and
  // the backend never runs its aggregation twice for a single page visit.
  const leaderboardQuery = useInviteRebateLeaderboard(
    props.metric,
    LEADERBOARD_LIMIT,
    inView
  )
  const topRows = (leaderboardQuery.data?.items ?? []).slice(
    0,
    LEADERBOARD_PREVIEW_SIZE
  )

  return (
    <Card ref={setContainer}>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm'>{t('Top inviters')}</CardTitle>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 text-xs'
          onClick={props.onViewAll}
        >
          {t('View all')}
        </Button>
      </CardHeader>
      <CardContent className='space-y-2'>
        {/* A disabled query reports `isPending`, so an off-screen card shows
            skeletons while a cached leaderboard still renders instantly. */}
        <PreviewBody
          isPending={leaderboardQuery.isPending}
          isError={leaderboardQuery.isError}
          isFetching={leaderboardQuery.isFetching}
          rows={topRows}
          onRetry={() => void leaderboardQuery.refetch()}
        />
      </CardContent>
    </Card>
  )
}

type PreviewBodyProps = {
  isPending: boolean
  isError: boolean
  isFetching: boolean
  rows: InviteRebateLeaderboardEntry[]
  onRetry: () => void
}

function PreviewBody(props: PreviewBodyProps) {
  const { t } = useTranslation()

  if (props.isPending) {
    return (
      <>
        {Array.from({ length: LEADERBOARD_PREVIEW_SIZE }, (_, index) => (
          <Skeleton key={`preview-row-${index}`} className='h-9 rounded-lg' />
        ))}
      </>
    )
  }

  if (props.isError) {
    return (
      <div className='text-muted-foreground space-y-2 text-sm'>
        <p>{t('Failed to load leaderboard')}</p>
        <Button
          size='sm'
          variant='outline'
          onClick={props.onRetry}
          disabled={props.isFetching}
        >
          {t('Retry')}
        </Button>
      </div>
    )
  }

  if (props.rows.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>
        {t('No leaderboard data yet')}
      </p>
    )
  }

  return (
    <ol className='space-y-2'>
      {props.rows.map((row) => (
        <li
          key={row.rank}
          className={cn(
            'flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm',
            row.is_me && 'border-primary/40 bg-primary/5'
          )}
        >
          <span className='flex min-w-0 items-center gap-2'>
            <span className='text-muted-foreground w-6 shrink-0 tabular-nums'>
              #{row.rank}
            </span>
            {row.rank <= 3 ? (
              <Crown
                className={cn(
                  'size-3.5 shrink-0',
                  row.rank === 1 && 'text-amber-500',
                  row.rank === 2 && 'text-slate-400',
                  row.rank === 3 && 'text-orange-700'
                )}
                aria-hidden='true'
              />
            ) : null}
            <span className='truncate font-medium'>
              {resolveInviteUserLabel(
                row.display_name,
                row.username,
                row.user_id,
                t('Anonymous')
              )}
              {row.is_me ? (
                <span className='text-primary ml-1 text-xs'>({t('You')})</span>
              ) : null}
            </span>
          </span>
          <span className='shrink-0 tabular-nums'>
            {formatQuota(row.rebate_quota_sum)}
          </span>
        </li>
      ))}
    </ol>
  )
}
