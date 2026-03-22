import { useCallback, useMemo } from 'react'
import { orderBy } from 'es-toolkit'
import { useNotesStore } from '@/store/useNotesStore'
import { useUIStore } from '@/store/useUIStore'
import EditorToolbar from '@/components/EditorToolbar'
import MarkdownEditor from '@/components/MarkdownEditor'
import MarkdownPreview from '@/components/MarkdownPreview'

export default function EditorPanel() {
  const { entries, activeEntryId, updateEntry } = useNotesStore()
  const { editorMode } = useUIStore()

  const entry = entries.find((e) => e.id === activeEntryId)

  const sortedEntries = useMemo(
    () => orderBy(entries, ['date'], ['desc']),
    [entries],
  )

  const { prevEntry, nextEntry } = useMemo(() => {
    const currentIndex = sortedEntries.findIndex((e) => e.id === activeEntryId)
    return {
      prevEntry: currentIndex < sortedEntries.length - 1 ? sortedEntries[currentIndex + 1] : null,
      nextEntry: currentIndex > 0 ? sortedEntries[currentIndex - 1] : null,
    }
  }, [sortedEntries, activeEntryId])

  const onChange = useCallback(
    (val: string) => updateEntry(entry?.id ?? '', val),
    [entry?.id, updateEntry],
  )

  if (!entry) return null

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-stone-50 dark:bg-[#1c1c1e]">
      <EditorToolbar entry={entry} prevEntry={prevEntry} nextEntry={nextEntry} />
      {editorMode === 'edit' ? (
        <MarkdownEditor value={entry.content} onChange={onChange} />
      ) : (
        <MarkdownPreview content={entry.content} />
      )}
    </div>
  )
}
