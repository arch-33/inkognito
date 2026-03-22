import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react'
import { useNotesStore } from '@/store/useNotesStore'
import { useUIStore } from '@/store/useUIStore'
import { formatDisplay, getTodayISO, isSameDay } from '@/lib/dates'
import type { NoteEntry } from '@/types'
import TagPopover from '@/components/TagPopover'

type Props = {
  entry: NoteEntry
  prevEntry: NoteEntry | null
  nextEntry: NoteEntry | null
}

export default function EditorToolbar({ entry, prevEntry, nextEntry }: Props) {
  const { setActiveEntry, toggleFavorite, removeTagFromEntry } = useNotesStore()
  const { editorMode, toggleEditorMode } = useUIStore()

  const [showTagPopover, setShowTagPopover] = useState(false)

  const today = getTodayISO()
  const isToday = isSameDay(entry.date, today)

  return (
    <>
      {/* Date header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/50">
        <button
          onClick={() => prevEntry && setActiveEntry(prevEntry.id)}
          disabled={!prevEntry}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => nextEntry && setActiveEntry(nextEntry.id)}
          disabled={!nextEntry}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
        <span className="text-[13px] font-medium font-mono text-neutral-700 dark:text-neutral-200">
          {formatDisplay(entry.date)}
        </span>
        {isToday && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300">
            Today
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(entry.id)}
            className="text-neutral-400 hover:text-yellow-500 cursor-pointer transition-colors"
          >
            <Star
              size={14}
              className={entry.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}
            />
          </button>
          <TagPopover
            entryId={entry.id}
            tags={entry.tags}
            open={showTagPopover}
            onToggle={() => setShowTagPopover(!showTagPopover)}
          />

          {/* Edit/Preview toggle */}
          <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden ml-1">
            <button
              onClick={() => { if (editorMode !== 'edit') toggleEditorMode() }}
              className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                editorMode === 'edit'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => { if (editorMode !== 'preview') toggleEditorMode() }}
              className={`px-2.5 py-1 text-[11px] cursor-pointer transition-colors ${
                editorMode === 'preview'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Tags bar */}
      {entry.tags.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-neutral-100 dark:border-neutral-800/50 flex-wrap">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="group inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
            >
              #{tag}
              <button
                onClick={() => removeTagFromEntry(entry.id, tag)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 cursor-pointer transition-opacity"
              >
                <X size={8} />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  )
}
