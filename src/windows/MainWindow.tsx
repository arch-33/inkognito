import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useUIStore } from '@/store/useUIStore'
import { useIsDark } from '@/hooks/useIsDark'
import { matchShortcut } from '@/lib/shortcuts'
import TitleBar from '@/components/TitleBar'
import Sidebar from '@/components/Sidebar'
import StatusBar from '@/components/StatusBar'
import SettingsWindow from '@/windows/SettingsWindow'

export default function MainWindow() {
  const {
    settings, settingsOpen, sidebarCollapsed,
    toggleProtection, toggleFloat, toggleSettings, toggleSidebar, toggleEditorMode,
  } = useUIStore()
  const isDark = useIsDark()
  const resolvedTheme = isDark ? 'dark' : 'light'

  useEffect(() => {
    const { shortcuts } = settings
    const handler = (e: KeyboardEvent) => {
      if (matchShortcut(e, shortcuts.toggleProtection)) {
        e.preventDefault()
        toggleProtection()
      } else if (matchShortcut(e, shortcuts.toggleFloat)) {
        e.preventDefault()
        toggleFloat()
      } else if (matchShortcut(e, shortcuts.toggleSettings)) {
        e.preventDefault()
        toggleSettings()
      } else if (matchShortcut(e, shortcuts.toggleSidebar)) {
        e.preventDefault()
        toggleSidebar()
      } else if (matchShortcut(e, shortcuts.toggleEditorMode)) {
        e.preventDefault()
        toggleEditorMode()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [settings, toggleProtection, toggleFloat, toggleSettings, toggleSidebar, toggleEditorMode])

  return (
    <div
      data-color-mode={resolvedTheme}
      className="flex flex-col h-screen w-screen rounded-[14px] overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 select-none"
    >
      <TitleBar />
      <div className="flex flex-1 overflow-hidden relative">
        <div className={`transition-all duration-200 overflow-hidden shrink-0 h-full ${sidebarCollapsed ? 'w-0' : 'w-52'}`}>
          <div className="w-52 h-full">
            <Sidebar />
          </div>
        </div>
        <main className="flex flex-1 overflow-hidden">
          <Outlet />
        </main>
        {settingsOpen && <SettingsWindow />}
      </div>
      <StatusBar />
    </div>
  )
}
