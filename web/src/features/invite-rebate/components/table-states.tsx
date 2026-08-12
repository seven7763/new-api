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

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

type TableSkeletonRowsProps = {
  rows: number
  columns: number
}

export function TableSkeletonRows(props: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: props.rows }, (_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} aria-hidden='true'>
          {Array.from({ length: props.columns }, (_, columnIndex) => (
            <TableCell key={`skeleton-cell-${columnIndex}`}>
              <Skeleton className='h-4 w-full' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

type TableMessageRowProps = {
  colSpan: number
  message: string
  onRetry?: () => void
  retryDisabled?: boolean
}

export function TableMessageRow(props: TableMessageRowProps) {
  const { t } = useTranslation()

  return (
    <TableRow className='hover:bg-transparent'>
      <TableCell colSpan={props.colSpan}>
        <div className='text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm'>
          <span>{props.message}</span>
          {props.onRetry ? (
            <Button
              variant='outline'
              size='sm'
              onClick={props.onRetry}
              disabled={props.retryDisabled}
            >
              {t('Retry')}
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}
