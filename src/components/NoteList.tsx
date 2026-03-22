import type { NoteEntry } from '@/types'
import EditorPanel from '@/components/EditorPanel'
import NoteListItem from '@/components/NoteListItem'

type NoteListProps = {
  entries: NoteEntry[]
  activeEntryId: string | null
  onSelectEntry: (id: string) => void
  showTags?: boolean
  header?: React.ReactNode
  emptyMessage?: string
}

export default function NoteList({
  entries,
  activeEntryId,
  onSelectEntry,
  showTags = false,
  header,
  emptyMessage = 'No notes',
}: NoteListProps) {
  if (activeEntryId && entries.some((e) => e.id === activeEntryId)) {
    return <EditorPanel />
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {header}
      <div className="space-y-1">
        {entries.map((entry) => (
          <NoteListItem
            key={entry.id}
            entry={entry}
            onClick={() => onSelectEntry(entry.id)}
            showTags={showTags}
          />
        ))}
        {entries.length === 0 && (
          <p className="text-[12px] text-neutral-400 py-8 text-center">{emptyMessage}</p>
        )}
      </div>
    </div>
  )
}
