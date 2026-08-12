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
import { useTranslation } from 'react-i18next'

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
import { formatQuota, formatTimestampToDate } from '@/lib/format'

import { REBATE_PAGE_SIZE } from '../constants'
import { useInviteRebateLogs } from '../queries'
import { TablePager } from './table-pager'
import { TableMessageRow, TableSkeletonRows } from './table-states'

const COLUMN_COUNT = 5

type RebateLogsCardProps = {
  page: number
  onPageChange: (page: number) => void
}

export function RebateLogsCard(props: RebateLogsCardProps) {
  const { t } = useTranslation()
  const logsQuery = useInviteRebateLogs(props.page, REBATE_PAGE_SIZE)
  const rows = logsQuery.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{t('Rebate logs')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className='min-w-[640px]'>
          <TableCaption className='sr-only'>{t('Rebate logs')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope='col'>{t('Time')}</TableHead>
              <TableHead scope='col'>{t('Invitee')}</TableHead>
              <TableHead scope='col'>{t('Trade no')}</TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Top-up')}
              </TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Rebate')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logsQuery.isPending ? (
              <TableSkeletonRows rows={5} columns={COLUMN_COUNT} />
            ) : null}
            {!logsQuery.isPending && logsQuery.isError ? (
              <TableMessageRow
                colSpan={COLUMN_COUNT}
                message={t('Failed to load rebate logs')}
                onRetry={() => void logsQuery.refetch()}
                retryDisabled={logsQuery.isFetching}
              />
            ) : null}
            {!logsQuery.isPending && !logsQuery.isError && rows.length === 0 ? (
              <TableMessageRow
                colSpan={COLUMN_COUNT}
                message={t('No rebate records yet')}
              />
            ) : null}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className='text-xs tabular-nums'>
                  {formatTimestampToDate(row.created_at)}
                </TableCell>
                <TableCell>#{row.invitee_id}</TableCell>
                <TableCell className='font-mono text-xs'>
                  {row.trade_no || '-'}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatQuota(row.topup_quota)}
                </TableCell>
                <TableCell className='text-right font-medium tabular-nums'>
                  {formatQuota(row.rebate_quota)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePager
          page={props.page}
          pageSize={REBATE_PAGE_SIZE}
          total={logsQuery.data?.total ?? 0}
          busy={logsQuery.isFetching}
          onPageChange={props.onPageChange}
        />
      </CardContent>
    </Card>
  )
}
