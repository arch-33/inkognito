import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useNotesStore } from '@/store/useNotesStore'
import { useUIStore } from '@/store/useUIStore'
import { Calendar } from '@/components/ui/calendar'

export default function MiniCalendar() {
  const { entries, setActiveEntry } = useNotesStore()
  const { setSidebarView, settings } = useUIStore()
  const navigate = useNavigate()
  const [month, setMonth] = useState(new Date())

  const today = new Date()
  const entryDates = entries.map((e) => new Date(e.date + 'T00:00:00'))

  const handleSelect = (date: Date | undefined) => {
    if (!date) return
    const iso = format(date, 'yyyy-MM-dd')
    const entry = entries.find((e) => e.date === iso)
    if (entry) {
      setActiveEntry(entry.id)
      if (isSameDay(date, today)) {
        setSidebarView('today')
        navigate('/today')
      } else {
        setSidebarView('calendar')
        navigate('/calendar')
      }
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-hidden">
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        onSelect={handleSelect}
        weekStartsOn={settings.general.weekStartsOn}
        modifiers={{ hasEntry: entryDates }}
        modifiersClassNames={{
          hasEntry: '[&>button]:text-neutral-700 dark:[&>button]:text-neutral-200 [&>button]:font-semibold',
        }}
        showOutsideDays={false}
      />
    </div>
  )
}
