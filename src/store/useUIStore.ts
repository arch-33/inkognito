import { create } from 'zustand'
import { merge } from 'es-toolkit'
import { AppSettings, SidebarView } from '@/types'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

const defaultSettings: AppSettings = {
  general: {
    launchAtLogin: true,
    alwaysOnTop: true,
    weekStartsOn: 1,
    defaultNoteDate: 'today',
  },
  appearance: {
    theme: 'system',
    editorFont: 'Berkeley Mono',
    fontSize: 13,
    windowOpacity: 95,
  },
  privacy: {
    contentProtection: true,
    showProtectedBadge: true,
    autoProtectOnMinimize: false,
  },
  editor: {
    spellCheck: false,
    lineNumbers: false,
    fontLigatures: true,
    lineWrap: true,
    autoSaveInterval: 5,
  },
  shortcuts: {
    toggleProtection: 'meta+shift+h',
    toggleFloat: 'meta+shift+f',
    toggleSidebar: 'meta+b',
    toggleSettings: 'meta+,',
    toggleEditorMode: 'meta+shift+e',
  },
  sync: {
    enabled: false,
  },
}

type UIStore = {
  ready: boolean
  init: () => Promise<void>

  // Sidebar
  sidebarView: SidebarView
  setSidebarView: (v: SidebarView) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Editor
  editorMode: 'edit' | 'preview'
  toggleEditorMode: () => void

  // Dialogs
  settingsOpen: boolean
  toggleSettings: () => void

  // Protection
  isProtected: boolean
  toggleProtection: () => void

  // Float / always on top
  isFloating: boolean
  toggleFloat: () => void
  setFloating: (value: boolean) => void

  // Settings
  settings: AppSettings
  updateSettings: (patch: DeepPartial<AppSettings>) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  ready: false,
  init: async () => {
    if (get().ready) return // Guard against double init
    try {
      const saved = await invoke<AppSettings>('get_settings')
      const settings = merge(defaultSettings, saved as DeepPartial<AppSettings>)

      set({
        settings,
        isProtected: settings.privacy.contentProtection,
        isFloating: settings.general.alwaysOnTop,
        ready: true,
      })

      // Apply loaded settings to the actual window
      invoke('set_content_protection', { enabled: settings.privacy.contentProtection }).catch((e) =>
        console.warn('[set_content_protection]', e),
      )
      getCurrentWindow().setAlwaysOnTop(settings.general.alwaysOnTop).catch(() => {})
    } catch (e) {
      console.warn('[ui init]', e)
      set({ ready: true })
    }
  },

  sidebarView: 'today',
  setSidebarView: (v) => set({ sidebarView: v }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  editorMode: 'edit',
  toggleEditorMode: () =>
    set((state) => ({ editorMode: state.editorMode === 'edit' ? 'preview' : 'edit' })),

  settingsOpen: false,
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),

  isProtected: true,
  toggleProtection: () => {
    get().updateSettings({ privacy: { contentProtection: !get().isProtected } })
  },

  isFloating: true,
  toggleFloat: () => {
    get().updateSettings({ general: { alwaysOnTop: !get().isFloating } })
  },
  setFloating: (value) => {
    if (get().isFloating === value) return
    get().updateSettings({ general: { alwaysOnTop: value } })
  },

  settings: defaultSettings,
  updateSettings: (patch) => {
    set((state) => {
      const next = merge(state.settings, patch)
      invoke('save_settings', { settings: next }).catch((e) =>
        console.warn('[save_settings]', e),
      )

      const updates: Record<string, unknown> = { settings: next }

      // Sync runtime state & window when relevant settings change
      if (next.privacy.contentProtection !== state.isProtected) {
        updates.isProtected = next.privacy.contentProtection
        invoke('set_content_protection', { enabled: next.privacy.contentProtection }).catch((e) =>
          console.warn('[set_content_protection]', e),
        )
      }
      if (next.general.alwaysOnTop !== state.isFloating) {
        updates.isFloating = next.general.alwaysOnTop
        getCurrentWindow().setAlwaysOnTop(next.general.alwaysOnTop).catch(() => {})
      }

      return updates
    })
  },
}))
