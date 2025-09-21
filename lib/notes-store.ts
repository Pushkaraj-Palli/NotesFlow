// Zustand store for notes state management
import { create } from "zustand"
import type { NotesState, Note } from "./types"
import { mockNotes } from "./mock-data"

interface NotesStore extends NotesState {
  fetchNotes: (tenantId: string) => Promise<void>
  createNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => Promise<Note>
  updateNote: (id: string, updates: Partial<Note>) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  togglePin: (id: string) => Promise<void>
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  selectedTags: [],

  fetchNotes: async (tenantId: string) => {
    set({ isLoading: true, error: null })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const tenantNotes = mockNotes.filter((note) => note.tenantId === tenantId)
      set({ notes: tenantNotes, isLoading: false })
    } catch (error) {
      set({ error: "Failed to fetch notes", isLoading: false })
    }
  },

  createNote: async (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set((state) => ({
      notes: [newNote, ...state.notes],
    }))

    return newNote
  },

  updateNote: async (id, updates) => {
    const updatedNote = {
      ...get().notes.find((n) => n.id === id)!,
      ...updates,
      updatedAt: new Date(),
    }

    set((state) => ({
      notes: state.notes.map((note) => (note.id === id ? updatedNote : note)),
    }))

    return updatedNote
  },

  deleteNote: async (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }))
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  setSelectedTags: (tags) => {
    set({ selectedTags: tags })
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned })
    }
  },
}))
