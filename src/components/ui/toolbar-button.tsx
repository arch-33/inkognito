import { cn } from '@/lib/utils'

type ToolbarButtonProps = {
  active?: boolean
  activeClassName?: string
  children: React.ReactNode
  onClick: () => void
}

export default function ToolbarButton({
  active = false,
  activeClassName = 'bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200',
  children,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border transition-colors cursor-pointer',
        active
          ? activeClassName
          : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
      )}
    >
      {children}
    </button>
  )
}
