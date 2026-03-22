import { useMemo } from 'react'
import { groupBy, orderBy } from 'es-toolkit'
import { useNotesStore } from '@/store/useNotesStore'
import { format, parse } from 'date-fns'
import EditorPanel from '@/components/EditorPanel'
import NoteListItem from '@/components/NoteListItem'

export default function CalendarPage() {
  const { entries, activeEntryId, setActiveEntry } = useNotesStore()

  const grouped = useMemo(() => {
    const sorted = orderBy(entries, ['date'], ['desc'])
    return groupBy(sorted, (entry) => format(parse(entry.date, 'yyyy-MM-dd', new Date()), 'MMMM yyyy'))
  }, [entries])

  if (activeEntryId && entries.some((e) => e.id === activeEntryId)) {
    return <EditorPanel />
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {Object.entries(grouped).map(([month, monthEntries]) => (
        <div key={month} className="mb-5">
          <h3 className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2">
            {month}
          </h3>
          <div className="space-y-1">
            {monthEntries.map((entry) => (
              <NoteListItem
                key={entry.id}
                entry={entry}
                onClick={() => setActiveEntry(entry.id)}
                showTags
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
