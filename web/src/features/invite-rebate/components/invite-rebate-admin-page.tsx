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
import { Gift, Trophy, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import { ADMIN_PAGE_SIZE, BACKFILL_LIMIT } from '../constants'
import {
  useAdminInviteRebateSummary,
  useAdminInviteRebates,
  useInviteRebateBackfill,
} from '../queries'
import type { AdminInviteRebateFilters } from '../types'
import { StatTile } from './stat-tile'
import { TablePager } from './table-pager'
import { TableMessageRow, TableSkeletonRows } from './table-states'

const COLUMN_COUNT = 7

/** Backend filters treat any non-positive id as "no filter". */
function parseUserIdFilter(value: string): number | undefined {
  const parsed = Number(value.trim())
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined
  return parsed
}

export function InviteRebateAdminPage() {
  const { t } = useTranslation()
  const userRole = useAuthStore((state) => state.auth.user?.role ?? 0)
  const [inviterInput, setInviterInput] = useState('')
  const [inviteeInput, setInviteeInput] = useState('')
  // Applied filters are separate from the inputs so typing never fires a query.
  const [filters, setFilters] = useState<AdminInviteRebateFilters>({})
  const [page, setPage] = useState(1)

  const summaryQuery = useAdminInviteRebateSummary(filters.inviterId)
  const rebatesQuery = useAdminInviteRebates(filters, page, ADMIN_PAGE_SIZE)
  const backfillMutation = useInviteRebateBackfill()

  const rows = rebatesQuery.data?.items ?? []
  const summary = summaryQuery.data
  // The backfill endpoint is root-only; hiding it keeps regular admins from
  // triggering a guaranteed 403.
  const canRunBackfill = userRole >= ROLE.SUPER_ADMIN

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFilters({
      inviterId: parseUserIdFilter(inviterInput),
      inviteeId: parseUserIdFilter(inviteeInput),
    })
    setPage(1)
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>
        {t('Invite Rebates (Admin)')}
      </SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        {canRunBackfill ? (
          <Button
            variant='outline'
            size='sm'
            disabled={backfillMutation.isPending}
            onClick={() => backfillMutation.mutate(BACKFILL_LIMIT)}
          >
            {t('Run rebate backfill')}
          </Button>
        ) : null}
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <div className='flex flex-col gap-4'>
          <form
            className='flex flex-wrap items-end gap-2'
            onSubmit={applyFilters}
          >
            <div className='grid gap-1'>
              <Label htmlFor='invite-rebate-inviter-id' className='text-xs'>
                {t('Inviter ID')}
              </Label>
              <Input
                id='invite-rebate-inviter-id'
                className='h-9 w-36'
                inputMode='numeric'
                value={inviterInput}
                onChange={(event) => setInviterInput(event.target.value)}
              />
            </div>
            <div className='grid gap-1'>
              <Label htmlFor='invite-rebate-invitee-id' className='text-xs'>
                {t('Invitee ID')}
              </Label>
              <Input
                id='invite-rebate-invitee-id'
                className='h-9 w-36'
                inputMode='numeric'
                value={inviteeInput}
                onChange={(event) => setInviteeInput(event.target.value)}
              />
            </div>
            <Button type='submit' size='sm' disabled={rebatesQuery.isFetching}>
              {t('Filter')}
            </Button>
          </form>

          <div className='grid gap-3 sm:grid-cols-3'>
            <StatTile
              label={t('Rows')}
              value={String(summary?.row_count ?? 0)}
              icon={Gift}
              loading={summaryQuery.isPending}
            />
            <StatTile
              label={t('Top-up sum')}
              value={formatQuota(summary?.topup_quota_sum ?? 0)}
              icon={Users}
              tone='chart-3'
              loading={summaryQuery.isPending}
            />
            <StatTile
              label={t('Rebate sum')}
              value={formatQuota(summary?.rebate_quota_sum ?? 0)}
              icon={Trophy}
              tone='success'
              loading={summaryQuery.isPending}
            />
          </div>

          <Card>
            <CardContent>
              <Table className='min-w-[900px]'>
                <TableCaption className='sr-only'>
                  {t('Invite Rebates (Admin)')}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope='col'>ID</TableHead>
                    <TableHead scope='col'>{t('Inviter')}</TableHead>
                    <TableHead scope='col'>{t('Invitee')}</TableHead>
                    <TableHead scope='col'>{t('Trade no')}</TableHead>
                    <TableHead scope='col' className='text-right'>
                      {t('Top-up')}
                    </TableHead>
                    <TableHead scope='col' className='text-right'>
                      {t('Rebate')}
                    </TableHead>
                    <TableHead scope='col'>{t('Time')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rebatesQuery.isPending ? (
                    <TableSkeletonRows rows={6} columns={COLUMN_COUNT} />
                  ) : null}
                  {!rebatesQuery.isPending && rebatesQuery.isError ? (
                    <TableMessageRow
                      colSpan={COLUMN_COUNT}
                      message={t('Failed to load admin rebate data')}
                      onRetry={() => void rebatesQuery.refetch()}
                      retryDisabled={rebatesQuery.isFetching}
                    />
                  ) : null}
                  {!rebatesQuery.isPending &&
                  !rebatesQuery.isError &&
                  rows.length === 0 ? (
                    <TableMessageRow
                      colSpan={COLUMN_COUNT}
                      message={t('No rebate records yet')}
                    />
                  ) : null}
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className='tabular-nums'>{row.id}</TableCell>
                      <TableCell>#{row.inviter_id}</TableCell>
                      <TableCell>#{row.invitee_id}</TableCell>
                      <TableCell className='font-mono text-xs'>
                        {row.trade_no || '-'}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatQuota(row.topup_quota)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatQuota(row.rebate_quota)}
                      </TableCell>
                      <TableCell className='text-xs tabular-nums'>
                        {formatTimestampToDate(row.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePager
                page={page}
                pageSize={ADMIN_PAGE_SIZE}
                total={rebatesQuery.data?.total ?? 0}
                busy={rebatesQuery.isFetching}
                onPageChange={setPage}
              />
            </CardContent>
          </Card>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
