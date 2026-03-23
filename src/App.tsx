import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useNotesStore } from '@/store/useNotesStore'
import { useUIStore } from '@/store/useUIStore'
import MainWindow from '@/windows/MainWindow'
import AboutWindow from '@/windows/AboutWindow'
import TodayPage from '@/pages/TodayPage'
import CalendarPage from '@/pages/CalendarPage'
import TagPage from '@/pages/TagPage'
import FavoritesPage from '@/pages/FavoritesPage'

function MainApp() {
  const notesReady = useNotesStore((s) => s.ready)
  const notesInit = useNotesStore((s) => s.init)
  const uiReady = useUIStore((s) => s.ready)
  const uiInit = useUIStore((s) => s.init)

  useEffect(() => { notesInit(); uiInit() }, [notesInit, uiInit])

  if (!notesReady || !uiReady) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-neutral-950">
        <span className="text-[12px] text-neutral-400">Loading...</span>
      </div>
    )
  }

  return (
    <MainWindow />
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/about" element={<AboutWindow />} />
        <Route path="/" element={<MainApp />}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tag/:tag" element={<TagPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
