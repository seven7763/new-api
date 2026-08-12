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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

type TablePagerProps = {
  page: number
  pageSize: number
  total: number
  /** Keeps both arrows inert while a page is in flight. */
  busy?: boolean
  onPageChange: (page: number) => void
}

export function TablePager(props: TablePagerProps) {
  const { t } = useTranslation()
  const pageCount = Math.max(1, Math.ceil(props.total / props.pageSize))
  const page = Math.max(1, props.page)

  // Stay rendered while the caller sits on an out-of-range page (for example
  // after a filter shrank the result set) so there is still a way back.
  if (pageCount <= 1 && page <= 1) return null

  return (
    <nav
      aria-label={t('Pagination')}
      className='flex flex-wrap items-center justify-between gap-2 pt-3'
    >
      <span className='text-muted-foreground text-xs'>
        {t('Total:')}{' '}
        <span className='tabular-nums'>{props.total.toLocaleString()}</span>
      </span>
      <div className='flex items-center gap-1.5'>
        <Button
          variant='outline'
          size='sm'
          disabled={props.busy || page <= 1}
          onClick={() => props.onPageChange(page - 1)}
        >
          <ChevronLeft
            data-icon='inline-start'
            className='size-3.5'
            aria-hidden='true'
          />
          {t('Previous')}
        </Button>
        <span
          aria-live='polite'
          className='text-muted-foreground min-w-20 text-center text-xs tabular-nums'
        >
          {t('Page {{page}} of {{pageCount}}', { page, pageCount })}
        </span>
        <Button
          variant='outline'
          size='sm'
          disabled={props.busy || page >= pageCount}
          onClick={() => props.onPageChange(page + 1)}
        >
          {t('Next')}
          <ChevronRight
            data-icon='inline-end'
            className='size-3.5'
            aria-hidden='true'
          />
        </Button>
      </div>
    </nav>
  )
}
