export type ShortcutAction = 'toggleProtection' | 'toggleFloat' | 'toggleSidebar' | 'toggleSettings' | 'toggleEditorMode'

export const shortcutLabels: Record<ShortcutAction, string> = {
  toggleProtection: 'Toggle content protection',
  toggleFloat: 'Toggle float / always on top',
  toggleSidebar: 'Toggle sidebar',
  toggleSettings: 'Open settings',
  toggleEditorMode: 'Toggle edit / preview',
}

export const shortcutActions: ShortcutAction[] = [
  'toggleProtection',
  'toggleFloat',
  'toggleSidebar',
  'toggleSettings',
  'toggleEditorMode',
]

/** "meta+shift+h" → "⌘⇧H" */
export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split('+')
  return parts
    .map((p) => {
      switch (p) {
        case 'meta': return '⌘'
        case 'shift': return '⇧'
        case 'ctrl': return '⌃'
        case 'alt': return '⌥'
        default: return p.length === 1 ? p.toUpperCase() : p
      }
    })
    .join('')
}

/** Check if a KeyboardEvent matches a shortcut string */
export function matchShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.split('+')
  const key = parts[parts.length - 1]
  const mods = new Set(parts.slice(0, -1))

  if (e.key.toLowerCase() !== key.toLowerCase()) return false
  if (mods.has('meta') !== e.metaKey) return false
  if (mods.has('shift') !== e.shiftKey) return false
  if (mods.has('ctrl') !== e.ctrlKey) return false
  if (mods.has('alt') !== e.altKey) return false

  return true
}

/** Convert a KeyboardEvent to a shortcut string. Returns null for lone modifiers or no-modifier keys. */
export function eventToShortcut(e: KeyboardEvent): string | null {
  if (['Meta', 'Shift', 'Control', 'Alt'].includes(e.key)) return null

  const parts: string[] = []
  if (e.metaKey) parts.push('meta')
  if (e.ctrlKey) parts.push('ctrl')
  if (e.altKey) parts.push('alt')
  if (e.shiftKey) parts.push('shift')

  // Require at least one modifier
  if (parts.length === 0) return null

  parts.push(e.key.toLowerCase())
  return parts.join('+')
}
