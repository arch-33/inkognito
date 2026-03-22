import { orderBy } from 'es-toolkit'
import { useNotesStore } from '@/store/useNotesStore'
import NoteList from '@/components/NoteList'

export default function FavoritesPage() {
  const { entries, activeEntryId, setActiveEntry } = useNotesStore()

  const favorites = orderBy(entries.filter((e) => e.isFavorite), ['date'], ['desc'])

  return (
    <NoteList
      entries={favorites}
      activeEntryId={activeEntryId}
      onSelectEntry={setActiveEntry}
      showTags
      header={
        <h2 className="text-[14px] font-medium text-neutral-700 dark:text-neutral-200 mb-4">
          Favorites
        </h2>
      }
      emptyMessage="No favorite notes yet"
    />
  )
}
