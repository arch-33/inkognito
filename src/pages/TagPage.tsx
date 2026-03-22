import { useEffect } from 'react'
import { orderBy } from 'es-toolkit'
import { useParams } from 'react-router-dom'
import { useNotesStore } from '@/store/useNotesStore'
import NoteList from '@/components/NoteList'

export default function TagPage() {
  const { tag } = useParams()
  const { entries, activeEntryId, setActiveEntry, setActiveTag } = useNotesStore()

  // Sync activeTag with route param
  useEffect(() => {
    if (tag) setActiveTag(tag)
  }, [tag, setActiveTag])

  const tagEntries = orderBy(entries.filter((e) => tag && e.tags.includes(tag)), ['date'], ['desc'])

  return (
    <NoteList
      entries={tagEntries}
      activeEntryId={activeEntryId}
      onSelectEntry={setActiveEntry}
      header={
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[13px] font-mono text-blue-500">#{tag}</span>
          <span className="text-[11px] text-neutral-400">{tagEntries.length} notes</span>
        </div>
      }
      emptyMessage="No notes with this tag"
    />
  )
}
