import { useEffect, useRef } from 'react'
import { useNotesStore } from '@/store/useNotesStore'
import { getTodayISO } from '@/lib/dates'
import EditorPanel from '@/components/EditorPanel'

export default function TodayPage() {
  const { entries, setActiveEntry, createEntry } = useNotesStore()
  const creating = useRef(false)

  useEffect(() => {
    const today = getTodayISO()
    const existing = entries.find((e) => e.date === today)
    if (existing) {
      setActiveEntry(existing.id)
    } else if (!creating.current) {
      creating.current = true
      createEntry(today)
    }
  }, [entries, setActiveEntry, createEntry])

  return <EditorPanel />
}
