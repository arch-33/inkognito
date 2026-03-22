import { create } from 'zustand'
import { NoteEntry, Tag } from '@/types'
import { getTodayISO } from '@/lib/dates'
import { invoke } from '@tauri-apps/api/core'
import { useUIStore } from '@/store/useUIStore'

// Per-note debounce so switching notes doesn't cancel pending saves
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()
function debouncedSave(noteId: string, content: string, delayMs: number) {
  const existing = saveTimers.get(noteId)
  if (existing) clearTimeout(existing)
  saveTimers.set(noteId, setTimeout(() => {
    saveTimers.delete(noteId)
    invoke('save_note_content', { noteId, content }).catch((e) =>
      console.warn('[save_note_content]', e),
    )
  }, delayMs))
}
function flushPendingSave(noteId: string) {
  const existing = saveTimers.get(noteId)
  if (existing) {
    clearTimeout(existing)
    saveTimers.delete(noteId)
  }
}

type NotesStore = {
  ready: boolean
  init: () => Promise<void>

  // Notes
  entries: NoteEntry[]
  activeEntryId: string | null
  setActiveEntry: (id: string | null) => void
  updateEntry: (id: string, content: string) => void
  createEntry: (date: string) => NoteEntry
  deleteEntry: (id: string) => void
  addTagToEntry: (id: string, tag: string) => void
  removeTagFromEntry: (id: string, tag: string) => void
  toggleFavorite: (id: string) => void

  // Tags
  tags: Tag[]
  activeTag: string | null
  setActiveTag: (tag: string | null) => void
  createTag: (name: string) => void
  deleteTag: (name: string) => void
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  ready: false,
  init: async () => {
    if (get().ready) return // Guard against double init
    try {
      const [notes, tags] = await Promise.all([
        invoke<NoteEntry[]>('get_all_notes'),
        invoke<Tag[]>('list_tags'),
      ])
      const today = getTodayISO()
      const activeId = notes.find((e) => e.date === today)?.id ?? notes[0]?.id ?? null
      set({ entries: notes, tags, activeEntryId: activeId, ready: true })
    } catch (e) {
      console.warn('[notes init]', e)
      set({ ready: true })
    }
  },

  entries: [],
  activeEntryId: null,
  setActiveEntry: (id) => set({ activeEntryId: id }),

  updateEntry: (id, content) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, content, updatedAt: new Date().toISOString() } : e
      ),
    }))
    const intervalSec = useUIStore.getState().settings.editor.autoSaveInterval
    debouncedSave(id, content, intervalSec * 1000)
  },

  createEntry: (date) => {
    const entry: NoteEntry = {
      id: `e${Date.now()}`,
      date,
      content: '',
      tags: [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({ entries: [...state.entries, entry], activeEntryId: entry.id }))
    invoke('create_note', { id: entry.id, date }).catch((e) =>
      console.warn('[create_note]', e),
    )
    return entry
  },

  deleteEntry: (id) => {
    flushPendingSave(id)
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
      activeEntryId: state.activeEntryId === id ? null : state.activeEntryId,
    }))
    invoke('delete_note', { noteId: id }).catch((e) =>
      console.warn('[delete_note]', e),
    )
  },

  addTagToEntry: (id, tag) => {
    set((state) => {
      const tags = state.tags.some((t) => t.id === tag)
        ? state.tags
        : [...state.tags, { id: tag, name: tag }]
      return {
        tags,
        entries: state.entries.map((e) =>
          e.id === id && !e.tags.includes(tag)
            ? { ...e, tags: [...e.tags, tag], updatedAt: new Date().toISOString() }
            : e
        ),
      }
    })
    invoke('add_tag_to_note', { noteId: id, tag }).catch((e) =>
      console.warn('[add_tag_to_note]', e),
    )
  },

  removeTagFromEntry: (id, tag) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id
          ? { ...e, tags: e.tags.filter((t) => t !== tag), updatedAt: new Date().toISOString() }
          : e
      ),
    }))
    invoke('remove_tag_from_note', { noteId: id, tag }).catch((e) =>
      console.warn('[remove_tag_from_note]', e),
    )
  },

  toggleFavorite: (id) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, isFavorite: !e.isFavorite, updatedAt: new Date().toISOString() } : e
      ),
    }))
    invoke('toggle_favorite', { noteId: id }).catch((e) =>
      console.warn('[toggle_favorite]', e),
    )
  },

  tags: [],
  activeTag: null,
  setActiveTag: (tag) => set({ activeTag: tag }),

  createTag: (name) => {
    const normalized = name.trim().toLowerCase()
    if (!normalized) return
    set((state) => {
      if (state.tags.some((t) => t.id === normalized)) return state
      return { tags: [...state.tags, { id: normalized, name: normalized }] }
    })
    invoke('create_tag', { tag: normalized }).catch((e) =>
      console.warn('[create_tag]', e),
    )
  },

  deleteTag: (name) => {
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== name),
      entries: state.entries.map((e) =>
        e.tags.includes(name)
          ? { ...e, tags: e.tags.filter((t) => t !== name), updatedAt: new Date().toISOString() }
          : e
      ),
      // Clear activeTag if deleted tag was active
      activeTag: state.activeTag === name ? null : state.activeTag,
    }))
    invoke('delete_tag', { tag: name }).catch((e) =>
      console.warn('[delete_tag]', e),
    )
  },
}))
