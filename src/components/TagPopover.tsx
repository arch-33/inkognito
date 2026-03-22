import { useState, useMemo } from 'react'
import { Tag, X, Trash2 } from 'lucide-react'
import { useClickAway } from '@uidotdev/usehooks'
import { useNotesStore } from '@/store/useNotesStore'

type Props = {
  entryId: string
  tags: string[]
  open: boolean
  onToggle: () => void
}

export default function TagPopover({ entryId, tags, open, onToggle }: Props) {
  const { tags: allTags, addTagToEntry, removeTagFromEntry, deleteTag } = useNotesStore()
  const [tagInput, setTagInput] = useState('')
  const popoverRef = useClickAway<HTMLDivElement>(() => {
    if (open) onToggle()
  })

  // Suggestions: tags that exist in store but aren't on this entry, filtered by input
  const suggestions = useMemo(() => {
    const query = tagInput.trim().toLowerCase()
    if (!query) return []
    return allTags
      .filter((t) => !tags.includes(t.id) && t.name.includes(query))
      .slice(0, 5)
  }, [tagInput, allTags, tags])

  const handleAdd = (value?: string) => {
    const tag = (value ?? tagInput).trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      addTagToEntry(entryId, tag)
    }
    setTagInput('')
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={onToggle}
        className={`text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer ${open ? 'text-blue-500' : ''}`}
      >
        <Tag size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-60 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-2">
          {/* Input + Add */}
          <div className="flex gap-1 mb-2 relative">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
              placeholder="Add tag..."
              className="flex-1 text-[11px] text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 outline-none"
              autoFocus
            />
            <button
              onClick={() => handleAdd()}
              className="text-[10px] px-2 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
            >
              Add
            </button>
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="mb-2 border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden">
              {suggestions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleAdd(t.name)}
                  className="flex items-center w-full px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  #{t.name}
                </button>
              ))}
            </div>
          )}

          {/* Current tags on this note */}
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
              >
                {tag}
                <button
                  onClick={() => removeTagFromEntry(entryId, tag)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X size={8} />
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-[10px] text-neutral-400">No tags on this note</span>
            )}
          </div>

          {/* All tags (manage) */}
          {allTags.length > 0 && (
            <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-[9px] text-neutral-400 uppercase tracking-wider mb-1">All tags</p>
              <div className="flex flex-wrap gap-1">
                {allTags.map((t) => (
                  <span
                    key={t.id}
                    className="group inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 dark:bg-neutral-800/50 text-neutral-400"
                  >
                    #{t.name}
                    <button
                      onClick={() => deleteTag(t.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 cursor-pointer transition-opacity"
                      title="Delete tag globally"
                    >
                      <Trash2 size={8} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
