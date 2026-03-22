import type { ShortcutAction } from '@/lib/shortcuts'

export type Tag = {
  id: string   // same as name — acts as the unique key
  name: string
}

export type NoteEntry = {
  id: string
  date: string
  content: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

// --- Settings (grouped by concern) ---

export type GeneralSettings = {
  launchAtLogin: boolean
  alwaysOnTop: boolean
  weekStartsOn: 0 | 1
  defaultNoteDate: 'today' | 'yesterday' | 'pick'
}

export type AppearanceSettings = {
  theme: 'system' | 'light' | 'dark'
  editorFont: string
  fontSize: number
  windowOpacity: number
}

export type PrivacySettings = {
  contentProtection: boolean
  showProtectedBadge: boolean
  autoProtectOnMinimize: boolean
}

export type EditorSettings = {
  spellCheck: boolean
  lineNumbers: boolean
  fontLigatures: boolean
  lineWrap: boolean
  autoSaveInterval: 1 | 5 | 30
}

export type ShortcutsSettings = Record<ShortcutAction, string>

export type SyncSettings = {
  enabled: boolean
}

export type AppSettings = {
  general: GeneralSettings
  appearance: AppearanceSettings
  privacy: PrivacySettings
  editor: EditorSettings
  shortcuts: ShortcutsSettings
  sync: SyncSettings
}

export type SidebarView = 'today' | 'calendar' | 'tag' | 'favorites'
