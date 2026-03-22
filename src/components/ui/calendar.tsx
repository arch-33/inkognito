import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'flex flex-wrap items-center',
        month_caption: 'flex-1 order-2',
        caption_label: 'text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 text-center block',
        button_previous: 'order-1 h-6 w-6 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer',
        button_next: 'order-3 h-6 w-6 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer',
        month_grid: 'w-full order-4 mt-1',
        weekdays: 'flex',
        weekday: 'text-[9px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex-1 text-center',
        week: 'flex',
        day: 'flex-1 flex items-center justify-center p-0',
        day_button: 'h-6 w-6 text-[10px] font-normal text-neutral-400 dark:text-neutral-500 rounded-full inline-flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors',
        selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary',
        today: '[&>button]:bg-blue-500 [&>button]:text-white [&>button]:font-semibold [&>button]:shadow-sm [&>button]:shadow-blue-500/30',
        outside: '[&>button]:text-neutral-300 dark:[&>button]:text-neutral-700 [&>button]:opacity-50',
        disabled: '[&>button]:text-neutral-300 [&>button]:opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
