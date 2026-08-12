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
import type { LucideIcon } from 'lucide-react'

import { IconBadge } from '@/components/ui/icon-badge'
import { Skeleton } from '@/components/ui/skeleton'

type StatTileProps = {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'success' | 'info' | 'chart-3' | 'chart-4'
  loading?: boolean
}

export function StatTile(props: StatTileProps) {
  const Icon = props.icon

  return (
    <div className='bg-card flex min-w-0 items-start gap-3 rounded-xl border p-3 sm:p-4'>
      <IconBadge tone={props.tone ?? 'info'} className='shrink-0'>
        <Icon className='size-4' aria-hidden='true' />
      </IconBadge>
      <div className='min-w-0 flex-1'>
        <div className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
          {props.label}
        </div>
        {props.loading ? (
          <Skeleton className='mt-1.5 h-6 w-24 sm:h-7' />
        ) : (
          <div className='mt-1 truncate text-xl font-semibold tabular-nums sm:text-2xl'>
            {props.value}
          </div>
        )}
        {props.hint ? (
          <div className='text-muted-foreground mt-0.5 line-clamp-1 text-xs'>
            {props.hint}
          </div>
        ) : null}
      </div>
    </div>
  )
}
