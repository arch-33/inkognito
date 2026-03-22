import { useMemo } from 'react'
import { countBy } from 'es-toolkit'
import { BookOpen, CalendarDays, Star, Hash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotesStore } from '@/store/useNotesStore'
import { useUIStore } from '@/store/useUIStore'
import { formatShort } from '@/lib/dates'
import MiniCalendar from '@/components/MiniCalendar'

export default function Sidebar() {
  const { entries, setActiveEntry, tags, activeTag, setActiveTag } = useNotesStore()
  const { sidebarView, setSidebarView } = useUIStore()
  const navigate = useNavigate()

  const favorites = useMemo(() => entries.filter((e) => e.isFavorite), [entries])

  const tagCounts = useMemo(
    () => countBy(entries.flatMap((e) => e.tags), (tag) => tag),
    [entries],
  )

  const navItem = (view: typeof sidebarView, label: string, icon: React.ReactNode, path: string) => {
    const active = sidebarView === view
    return (
      <button
        key={view}
        onClick={() => {
          setActiveEntry(null)
          setSidebarView(view)
          navigate(path)
        }}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] cursor-pointer w-full transition-colors ${
          active
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
            : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <aside className="w-52 h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shrink-0 overflow-y-auto">
      <div className="pt-2 px-2 flex flex-col gap-0.5">
        {navItem('today', 'Today', <BookOpen size={14} />, '/today')}
        {navItem('calendar', 'Calendar', <CalendarDays size={14} />, '/calendar')}
      </div>

      <div className="px-2 pt-3">
        <MiniCalendar />
      </div>

      <div className="px-2 pt-4">
        <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider px-2 mb-1">
          Favorites
        </p>
        {favorites.length === 0 && (
          <p className="text-[10px] text-neutral-400 px-2 py-1">No favorites yet</p>
        )}
        {favorites.map((entry) => (
          <button
            key={entry.id}
            onClick={() => {
              setActiveEntry(entry.id)
              setSidebarView('favorites')
              navigate('/favorites')
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer w-full transition-colors"
          >
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="truncate">{formatShort(entry.date)}</span>
          </button>
        ))}
      </div>

      <div className="px-2 pt-4 pb-3">
        <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider px-2 mb-1">
          Tags
        </p>
        {tags.length === 0 && (
          <p className="text-[10px] text-neutral-400 px-2 py-1">No tags yet</p>
        )}
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveEntry(null)
              setActiveTag(t.id)
              setSidebarView('tag')
              navigate(`/tag/${t.id}`)
            }}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] cursor-pointer w-full transition-colors ${
              sidebarView === 'tag' && activeTag === t.id
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Hash size={12} className="shrink-0" />
            <span className="truncate">{t.name}</span>
            <span className="ml-auto text-[10px] text-neutral-400">{tagCounts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
