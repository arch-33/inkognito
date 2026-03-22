import { useState, useMemo } from 'react'
import { Pin, PinOff, ShieldCheck, Settings2, PanelLeft } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { getCurrentWindow } from '@tauri-apps/api/window'
import ToolbarButton from '@/components/ui/toolbar-button'

export default function TitleBar() {
  const {
    isProtected, toggleProtection,
    isFloating, toggleFloat,
    settingsOpen, toggleSettings,
    sidebarCollapsed, toggleSidebar,
  } = useUIStore()

  const [hovered, setHovered] = useState<string | null>(null)

  const appWindow = useMemo(() => {
    try { return getCurrentWindow() } catch { return null }
  }, [])

  const handleClose = () => appWindow?.close()
  const handleMinimize = () => appWindow?.minimize()
  const handleMaximize = () => appWindow?.toggleMaximize()

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800"
    >
      {/* Left: traffic lights + sidebar toggle */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2"
          onMouseEnter={() => setHovered('group')}
          onMouseLeave={() => setHovered(null)}
        >
          <button
            onClick={handleClose}
            onMouseEnter={() => setHovered('close')}
            className="w-3 h-3 rounded-full cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: '#FF5F57' }}
          >
            {hovered && (
              <svg width="6" height="6" viewBox="0 0 6 6" className="text-black/60">
                <path d="M0.5 0.5L5.5 5.5M5.5 0.5L0.5 5.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>
          <button
            onClick={handleMinimize}
            onMouseEnter={() => setHovered('minimize')}
            className="w-3 h-3 rounded-full cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: '#FEBC2E' }}
          >
            {hovered && (
              <svg width="6" height="6" viewBox="0 0 6 6" className="text-black/60">
                <path d="M0.5 3H5.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>
          <button
            onClick={handleMaximize}
            onMouseEnter={() => setHovered('maximize')}
            className="w-3 h-3 rounded-full cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: '#28C840' }}
          >
            {hovered && (
              <svg width="6" height="6" viewBox="0 0 8 8" className="text-black/60">
                <path d="M1 2.5L4 0.5L7 2.5L7 5.5L4 7.5L1 5.5Z" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Right actions */}
      <div className="flex gap-1.5">
        <ToolbarButton active={!sidebarCollapsed} onClick={toggleSidebar}>
          <PanelLeft size={12} />
        </ToolbarButton>
        <ToolbarButton active={isFloating} onClick={toggleFloat}>
          {isFloating ? <Pin size={12} /> : <PinOff size={12} />}
          Float
        </ToolbarButton>

        <ToolbarButton
          active={isProtected}
          activeClassName="bg-red-500 text-white border-red-500"
          onClick={toggleProtection}
        >
          <ShieldCheck size={12} />
          Protected
        </ToolbarButton>

        <ToolbarButton active={settingsOpen} onClick={toggleSettings}>
          <Settings2 size={12} />
        </ToolbarButton>
      </div>
    </div>
  )
}
