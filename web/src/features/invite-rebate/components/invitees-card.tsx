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
import { formatQuota } from '@/lib/format'

import { REBATE_PAGE_SIZE } from '../constants'
import { resolveInviteUserLabel } from '../lib/display'
import { useInviteRebateInvitees } from '../queries'
import { TablePager } from './table-pager'
import { TableMessageRow, TableSkeletonRows } from './table-states'

const COLUMN_COUNT = 4

type InviteesCardProps = {
  page: number
  onPageChange: (page: number) => void
}

export function InviteesCard(props: InviteesCardProps) {
  const { t } = useTranslation()
  const inviteesQuery = useInviteRebateInvitees(props.page, REBATE_PAGE_SIZE)
  const rows = inviteesQuery.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{t('My invitees')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className='min-w-[560px]'>
          <TableCaption className='sr-only'>{t('My invitees')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope='col'>{t('User')}</TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Top-up total')}
              </TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Rebate total')}
              </TableHead>
              <TableHead scope='col' className='text-right'>
                {t('Count')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inviteesQuery.isPending ? (
              <TableSkeletonRows rows={5} columns={COLUMN_COUNT} />
            ) : null}
            {!inviteesQuery.isPending && inviteesQuery.isError ? (
              <TableMessageRow
                colSpan={COLUMN_COUNT}
                message={t('Failed to load invitees')}
                onRetry={() => void inviteesQuery.refetch()}
                retryDisabled={inviteesQuery.isFetching}
              />
            ) : null}
            {!inviteesQuery.isPending &&
            !inviteesQuery.isError &&
            rows.length === 0 ? (
              <TableMessageRow
                colSpan={COLUMN_COUNT}
                message={t('No invitees yet')}
              />
            ) : null}
            {rows.map((row) => (
              <TableRow key={row.invitee_id}>
                <TableCell>
                  {resolveInviteUserLabel(
                    row.display_name,
                    row.username,
                    row.invitee_id,
                    t('Anonymous')
                  )}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatQuota(row.topup_quota_sum)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {formatQuota(row.rebate_quota_sum)}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {row.rebate_count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePager
          page={props.page}
          pageSize={REBATE_PAGE_SIZE}
          total={inviteesQuery.data?.total ?? 0}
          busy={inviteesQuery.isFetching}
          onPageChange={props.onPageChange}
        />
      </CardContent>
    </Card>
  )
}
