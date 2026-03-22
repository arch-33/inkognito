import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useNotesStore } from '@/store/useNotesStore'
import { getWordCount } from '@/lib/notes'

export default function StatusBar() {
  const { entries, activeEntryId } = useNotesStore()
  const entry = entries.find((e) => e.id === activeEntryId)
  const wordCount = entry ? getWordCount(entry.content) : 0

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-3 px-3.5 py-1.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[10px] font-mono text-neutral-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      <span>saved</span>
      <span>·</span>
      <span>{wordCount} words</span>
      <span>·</span>
      <span>markdown</span>
      <span className="ml-auto">{format(now, "EEE dd MMM yyyy '·' HH:mm")}</span>
    </div>
  )
}
