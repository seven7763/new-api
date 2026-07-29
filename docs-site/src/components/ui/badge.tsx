import { cn } from '@/lib/utils'

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        variant === 'default' && 'bg-primary/12 text-primary',
        variant === 'secondary' && 'bg-muted text-muted-foreground',
        variant === 'outline' && 'border-border text-foreground border',
        variant === 'success' && 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
        variant === 'warning' && 'bg-amber-500/12 text-amber-800 dark:text-amber-200',
        className
      )}
      {...props}
    />
  )
}
