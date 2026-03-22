import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { enable as enableAutostart, disable as disableAutostart } from '@tauri-apps/plugin-autostart'
import { useUIStore } from '@/store/useUIStore'
import Toggle from '@/components/ui/toggle'
import SelectNative from '@/components/ui/select-native'
import SettingsRow from '@/components/ui/settings-row'
import { shortcutActions, shortcutLabels, formatShortcut, eventToShortcut } from '@/lib/shortcuts'
import type { ShortcutAction } from '@/lib/shortcuts'

type Section = 'general' | 'appearance' | 'privacy' | 'editor' | 'shortcuts' | 'sync'

function ShortcutRecorder({
  action,
  shortcut,
  onRecord,
}: {
  action: ShortcutAction
  shortcut: string
  onRecord: (action: ShortcutAction, shortcut: string) => void
}) {
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    if (!recording) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const s = eventToShortcut(e)
      if (s) {
        onRecord(action, s)
        setRecording(false)
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [recording, action, onRecord])

  return (
    <button
      onClick={() => setRecording(true)}
      className={`text-[11px] font-mono px-2 py-1 rounded cursor-pointer transition-colors ${
        recording
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 animate-pulse'
          : 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      }`}
    >
      {recording ? 'Press keys…' : formatShortcut(shortcut)}
    </button>
  )
}

export default function SettingsWindow() {
  const { settings, updateSettings, toggleSettings } = useUIStore()
  const [activeSection, setActiveSection] = useState<Section>('general')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSettings()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleSettings])

  const handleShortcutRecord = useCallback(
    (action: ShortcutAction, shortcut: string) => {
      updateSettings({ shortcuts: { [action]: shortcut } })
    },
    [updateSettings],
  )

  const sections: { id: Section; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'editor', label: 'Editor' },
    { id: 'shortcuts', label: 'Shortcuts' },
  ]

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50" onClick={toggleSettings}>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 w-160 h-120 flex overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Left nav */}
        <div className="w-40 border-r border-neutral-200 dark:border-neutral-800 flex flex-col py-3 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center justify-between px-3 mb-3">
            <span className="text-[12px] font-medium text-neutral-600 dark:text-neutral-300">
              Settings
            </span>
            <button
              onClick={toggleSettings}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`text-left px-3 py-1.5 text-[12px] cursor-pointer transition-colors ${
                activeSection === s.id
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeSection === 'general' && (
            <div>
              <h3 className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 mb-3">General</h3>
              <SettingsRow label="Launch at login">
                <Toggle checked={settings.general.launchAtLogin} onChange={(v) => {
                  updateSettings({ general: { launchAtLogin: v } })
                  ;(v ? enableAutostart() : disableAutostart()).catch((e) => console.warn('[autostart]', e))
                }} />
              </SettingsRow>
              <SettingsRow label="Always floating window">
                <Toggle checked={settings.general.alwaysOnTop} onChange={(v) => updateSettings({ general: { alwaysOnTop: v } })} />
              </SettingsRow>
              <SettingsRow label="Default note date">
                <SelectNative
                  value={settings.general.defaultNoteDate}
                  options={[{ label: 'Today', value: 'today' }, { label: 'Yesterday', value: 'yesterday' }, { label: 'Pick date', value: 'pick' }]}
                  onChange={(v) => updateSettings({ general: { defaultNoteDate: v as 'today' | 'yesterday' | 'pick' } })}
                />
              </SettingsRow>
              <SettingsRow label="Week starts on">
                <SelectNative
                  value={settings.general.weekStartsOn}
                  options={[{ label: 'Monday', value: '1' }, { label: 'Sunday', value: '0' }]}
                  onChange={(v) => updateSettings({ general: { weekStartsOn: Number(v) as 0 | 1 } })}
                />
              </SettingsRow>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h3 className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 mb-3">Appearance</h3>
              <SettingsRow label="Theme">
                <SelectNative
                  value={settings.appearance.theme}
                  options={[{ label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }]}
                  onChange={(v) => updateSettings({ appearance: { theme: v as 'system' | 'light' | 'dark' } })}
                />
              </SettingsRow>
              <SettingsRow label="Editor font">
                <SelectNative
                  value={settings.appearance.editorFont}
                  options={[{ label: 'Berkeley Mono', value: 'Berkeley Mono' }, { label: 'JetBrains Mono', value: 'JetBrains Mono' }, { label: 'Fira Code', value: 'Fira Code' }]}
                  onChange={(v) => updateSettings({ appearance: { editorFont: v } })}
                />
              </SettingsRow>
              <SettingsRow label="Font size">
                <SelectNative
                  value={settings.appearance.fontSize}
                  options={[{ label: '12px', value: '12' }, { label: '13px', value: '13' }, { label: '14px', value: '14' }, { label: '15px', value: '15' }]}
                  onChange={(v) => updateSettings({ appearance: { fontSize: Number(v) } })}
                />
              </SettingsRow>
              <SettingsRow label="Window opacity">
                <input type="range" min={30} max={100} value={settings.appearance.windowOpacity} onChange={(e) => updateSettings({ appearance: { windowOpacity: Number(e.target.value) } })} className="w-24 accent-blue-500 cursor-pointer" />
              </SettingsRow>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h3 className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 mb-3">Privacy</h3>
              <SettingsRow label="Content protection" description="Hide content from screen capture">
                <Toggle checked={settings.privacy.contentProtection} onChange={(v) => updateSettings({ privacy: { contentProtection: v } })} />
              </SettingsRow>
              <SettingsRow label="Show protected badge in titlebar">
                <Toggle checked={settings.privacy.showProtectedBadge} onChange={(v) => updateSettings({ privacy: { showProtectedBadge: v } })} />
              </SettingsRow>
              <SettingsRow label="Auto-protect on minimize">
                <Toggle checked={settings.privacy.autoProtectOnMinimize} onChange={(v) => updateSettings({ privacy: { autoProtectOnMinimize: v } })} />
              </SettingsRow>
            </div>
          )}

          {activeSection === 'editor' && (
            <div>
              <h3 className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 mb-3">Editor</h3>
              <SettingsRow label="Spell check">
                <Toggle checked={settings.editor.spellCheck} onChange={(v) => updateSettings({ editor: { spellCheck: v } })} />
              </SettingsRow>
              <SettingsRow label="Line numbers">
                <Toggle checked={settings.editor.lineNumbers} onChange={(v) => updateSettings({ editor: { lineNumbers: v } })} />
              </SettingsRow>
              <SettingsRow label="Font ligatures">
                <Toggle checked={settings.editor.fontLigatures} onChange={(v) => updateSettings({ editor: { fontLigatures: v } })} />
              </SettingsRow>
              <SettingsRow label="Line wrap">
                <Toggle checked={settings.editor.lineWrap} onChange={(v) => updateSettings({ editor: { lineWrap: v } })} />
              </SettingsRow>
              <SettingsRow label="Auto-save interval">
                <SelectNative
                  value={`${settings.editor.autoSaveInterval}s`}
                  options={[{ label: '1s', value: '1s' }, { label: '5s', value: '5s' }, { label: '30s', value: '30s' }]}
                  onChange={(v) => updateSettings({ editor: { autoSaveInterval: Number(v.replace('s', '')) as 1 | 5 | 30 } })}
                />
              </SettingsRow>
            </div>
          )}

          {activeSection === 'shortcuts' && (
            <div>
              <h3 className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 mb-3">Shortcuts</h3>
              <p className="text-[11px] text-neutral-400 mb-3">Click a shortcut to re-assign it</p>
              <div className="space-y-2">
                {shortcutActions.map((action) => (
                  <div key={action} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <span className="text-[12px] text-neutral-600 dark:text-neutral-300">{shortcutLabels[action]}</span>
                    <ShortcutRecorder
                      action={action}
                      shortcut={settings.shortcuts[action]}
                      onRecord={handleShortcutRecord}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
