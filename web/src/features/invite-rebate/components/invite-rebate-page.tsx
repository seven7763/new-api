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
import { Copy, Gift, Share2, Trophy, Users, Wallet } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransferDialog } from '@/features/wallet/components/dialogs/transfer-dialog'
import { generateAffiliateLink } from '@/features/wallet/lib'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatQuota } from '@/lib/format'

import { formatBasisPointsPercent } from '../lib/display'
import {
  useAffiliateCode,
  useInviteRebateSummary,
  useTransferAffiliateQuota,
} from '../queries'
import type { InviteRebateLeaderboardMetric } from '../types'
import { InviteesCard } from './invitees-card'
import { LeaderboardCard } from './leaderboard-card'
import { LeaderboardPreviewCard } from './leaderboard-preview-card'
import { RebateLogsCard } from './rebate-logs-card'
import { StatTile } from './stat-tile'

type InviteRebateTab = 'overview' | 'leaderboard' | 'logs' | 'invitees'

export function InviteRebatePage() {
  const { t } = useTranslation()
  const { copyToClipboard } = useCopyToClipboard()
  const [tab, setTab] = useState<InviteRebateTab>('overview')
  const [metric, setMetric] = useState<InviteRebateLeaderboardMetric>('rebate')
  const [logsPage, setLogsPage] = useState(1)
  const [inviteesPage, setInviteesPage] = useState(1)
  const [transferOpen, setTransferOpen] = useState(false)

  const summaryQuery = useInviteRebateSummary()
  const affiliateCodeQuery = useAffiliateCode()
  const transferMutation = useTransferAffiliateQuota()

  const summary = summaryQuery.data
  const affiliateLink = affiliateCodeQuery.data
    ? generateAffiliateLink(affiliateCodeQuery.data)
    : ''
  const ratePercent = formatBasisPointsPercent(summary?.ratio_bp)
  const availableQuota = summary?.aff_quota ?? 0

  const handleTransfer = async (quota: number) => {
    try {
      const response = await transferMutation.mutateAsync(quota)
      return response.success === true
    } catch {
      // Errors are already surfaced by the axios and mutation error handlers.
      return false
    }
  }

  const showLeaderboardTab = useCallback(() => setTab('leaderboard'), [])

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Invite Rebate')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button
          variant='outline'
          size='sm'
          onClick={() => void copyToClipboard(affiliateLink)}
          disabled={!affiliateLink}
        >
          <Copy
            data-icon='inline-start'
            className='size-3.5'
            aria-hidden='true'
          />
          {t('Copy invite link')}
        </Button>
        <Button
          size='sm'
          onClick={() => setTransferOpen(true)}
          disabled={availableQuota <= 0}
        >
          <Wallet
            data-icon='inline-start'
            className='size-3.5'
            aria-hidden='true'
          />
          {t('Transfer to Balance')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <div className='flex flex-col gap-4'>
          <Card className='border-dashed'>
            <CardContent className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Share2 className='text-primary size-4' aria-hidden='true' />
                  <span className='text-sm font-semibold'>
                    {t('Your invite program')}
                  </span>
                  {summary?.enabled === false ? (
                    <Badge variant='outline' className='text-[10px]'>
                      {t('Rebate disabled')}
                    </Badge>
                  ) : null}
                  {summary?.enabled ? (
                    <Badge variant='secondary' className='text-[10px]'>
                      {t('{{rate}}% rebate', { rate: ratePercent })}
                    </Badge>
                  ) : null}
                </div>
                <p className='text-muted-foreground mt-1 text-xs'>
                  {summary?.enabled === false
                    ? t('Top-up rebate is currently disabled by admin')
                    : t(
                        'Share your link. When friends top up, you earn a rebate into pending rewards.'
                      )}
                </p>
              </div>
              <div className='flex min-w-0 flex-1 items-center gap-2 sm:max-w-md sm:justify-end'>
                <Input
                  readOnly
                  value={affiliateLink}
                  aria-label={t('Your invite link')}
                  placeholder={
                    affiliateCodeQuery.isPending ? t('Loading...') : undefined
                  }
                  className='bg-muted/40 h-9 font-mono text-xs'
                />
                <Button
                  size='icon'
                  variant='outline'
                  className='size-9 shrink-0'
                  aria-label={t('Copy invite link')}
                  onClick={() => void copyToClipboard(affiliateLink)}
                  disabled={!affiliateLink}
                >
                  <Copy className='size-4' aria-hidden='true' />
                </Button>
              </div>
            </CardContent>
          </Card>

          {summaryQuery.isError ? (
            <Card className='border-destructive/40'>
              <CardContent className='flex flex-wrap items-center justify-between gap-2 p-4 text-sm'>
                <span>{t('Failed to load invite rebate data')}</span>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={summaryQuery.isFetching}
                  onClick={() => void summaryQuery.refetch()}
                >
                  {t('Retry')}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <StatTile
              label={t('Invitees')}
              value={String(summary?.invitee_count ?? 0)}
              hint={t('Friends who joined via you')}
              icon={Users}
              tone='info'
              loading={summaryQuery.isPending}
            />
            <StatTile
              label={t('Invitee top-up total')}
              value={formatQuota(summary?.topup_quota_sum ?? 0)}
              hint={t('Credited quota from invitees')}
              icon={Gift}
              tone='chart-3'
              loading={summaryQuery.isPending}
            />
            <StatTile
              label={t('Rebate total')}
              value={formatQuota(summary?.rebate_quota_sum ?? 0)}
              hint={t('Lifetime earned from top-ups')}
              icon={Trophy}
              tone='chart-4'
              loading={summaryQuery.isPending}
            />
            <StatTile
              label={t('Pending rewards')}
              value={formatQuota(availableQuota)}
              hint={t('Ready to transfer to balance')}
              icon={Wallet}
              tone='success'
              loading={summaryQuery.isPending}
            />
          </div>

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as InviteRebateTab)}
          >
            <TabsList>
              <TabsTrigger value='overview'>{t('Overview')}</TabsTrigger>
              <TabsTrigger value='leaderboard'>
                {t('Invite leaderboard')}
              </TabsTrigger>
              <TabsTrigger value='logs'>{t('Rebate logs')}</TabsTrigger>
              <TabsTrigger value='invitees'>{t('My invitees')}</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='mt-3'>
              <div className='grid gap-3 lg:grid-cols-2'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>
                      {t('How it works')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='text-muted-foreground space-y-2 text-sm'>
                    <ol className='list-inside list-decimal space-y-2'>
                      <li>{t('Copy and share your invite link')}</li>
                      <li>{t('Friends sign up with your link')}</li>
                      <li>
                        {summary
                          ? t(
                              'When they top up successfully, you earn {{rate}}% rebate',
                              { rate: ratePercent }
                            )
                          : t(
                              'When they top up successfully, you earn a rebate'
                            )}
                      </li>
                      <li>{t('Transfer pending rewards to your balance')}</li>
                    </ol>
                  </CardContent>
                </Card>
                <LeaderboardPreviewCard
                  metric={metric}
                  onViewAll={showLeaderboardTab}
                />
              </div>
            </TabsContent>

            <TabsContent value='leaderboard' className='mt-3'>
              <LeaderboardCard metric={metric} onMetricChange={setMetric} />
            </TabsContent>

            <TabsContent value='logs' className='mt-3'>
              <RebateLogsCard page={logsPage} onPageChange={setLogsPage} />
            </TabsContent>

            <TabsContent value='invitees' className='mt-3'>
              <InviteesCard
                page={inviteesPage}
                onPageChange={setInviteesPage}
              />
            </TabsContent>
          </Tabs>

          <TransferDialog
            open={transferOpen}
            onOpenChange={setTransferOpen}
            onConfirm={handleTransfer}
            availableQuota={availableQuota}
            transferring={transferMutation.isPending}
          />
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
