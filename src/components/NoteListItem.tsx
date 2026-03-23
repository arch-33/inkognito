import { formatShort, formatLastUpdated } from '@/lib/dates'
import {  getNoteTitle } from '@/lib/notes'
import type { NoteEntry } from '@/types'

type NoteListItemProps = {
  entry: NoteEntry
  onClick: () => void
  showTags?: boolean
}

export default function NoteListItem({ entry, onClick, showTags = false }: NoteListItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
    >
      <span className="text-[12px] font-mono text-neutral-600 dark:text-neutral-300 w-16 shrink-0">
        {formatShort(entry.date)}
      </span>
      <span className="text-[12px] text-neutral-500 truncate flex-1">
        {getNoteTitle(entry.content)}
      </span>
      <span className="text-[10px] text-neutral-400">{formatLastUpdated(entry.updatedAt)}</span>
      {showTags && entry.tags.map((tag) => (
        <span
          key={tag}
          className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
        >
          {tag}
        </span>
      ))}
    </button>
  )
}
