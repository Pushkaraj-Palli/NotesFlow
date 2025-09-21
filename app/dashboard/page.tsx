"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Header } from "@/components/dashboard/header"
import { NoteCard } from "@/components/dashboard/note-card"
import { NoteEditor } from "@/components/dashboard/note-editor"
import { UpgradeBanner } from "@/components/subscription/upgrade-banner"
import { FeatureGate } from "@/components/subscription/feature-gate"
import { PricingModal } from "@/components/subscription/pricing-modal"
import { UsageStats } from "@/components/subscription/usage-stats"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Plus, Filter } from "lucide-react"
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useTogglePin } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth-store"
import type { Note } from "@/lib/types"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, tenant } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isPricingOpen, setIsPricingOpen] = useState(false)

  // Log tenant data
  useEffect(() => {
    console.log("app/dashboard/page.tsx: Tenant plan:", tenant?.plan);
    console.log("app/dashboard/page.tsx: Tenant maxNotes setting:", tenant?.settings.maxNotes);
  }, [tenant]);

  // Fetch notes with search and tags
  const { data: notes = [], isLoading, error, refetch } = useNotes(searchQuery, selectedTags)

  // Mutations
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()
  const togglePinMutation = useTogglePin()

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach((note: Note) => {
      note.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [notes])

  // Check if user can create more notes
  const canCreateNote = tenant?.plan === "pro" || notes.length < (tenant?.settings.maxNotes || 50);

  // Refetch notes when user changes
  useEffect(() => {
    if (user) {
      refetch()
    }
  }, [user, refetch])

  const handleCreateNote = () => {
    if (!canCreateNote) {
      setIsPricingOpen(true)
      return
    }
    setEditingNote(null)
    setIsEditorOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote({ ...note, id: note._id.toString() });
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt" | "tenantId" | "userId" | "isPinned">,
  ) => {
    console.log("app/dashboard/page.tsx: handleSaveNote called with data:", noteData); // Log note data
    try {
      if (editingNote) {
        console.log("app/dashboard/page.tsx: Updating existing note:", editingNote.id); // Log update attempt
        if (!editingNote.id) {
          console.error("app/dashboard/page.tsx: Cannot update note, ID is missing.");
          // Potentially show a user-friendly error or throw an error
          return;
        }
        await updateNoteMutation.mutateAsync({
          id: editingNote.id,
          updates: noteData,
        });
        console.log("app/dashboard/page.tsx: Note updated successfully."); // Log success
      } else {
        console.log("app/dashboard/page.tsx: Creating new note.", noteData); // Log creation attempt
        await createNoteMutation.mutateAsync(noteData)
        console.log("app/dashboard/page.tsx: New note created successfully."); // Log success
      }
      setIsEditorOpen(false)
      setEditingNote(null)
    } catch (error) {
      console.error("app/dashboard/page.tsx: Failed to save note:", error); // Log error
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNoteMutation.mutateAsync(id)
      } catch (error) {
        console.error("Failed to delete note:", error)
      }
    }
  }

  const handleTogglePin = async (id: string) => {
    try {
      await togglePinMutation.mutateAsync(id)
    } catch (error) {
      console.error("Failed to toggle pin:", error)
    }
  }

  const handleTagFilter = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  const handleUpgrade = () => {
    setIsPricingOpen(true)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <Header onCreateNote={handleCreateNote} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="container mx-auto px-4 py-8">
          <UpgradeBanner onUpgrade={handleUpgrade} />
          <UsageStats notesCount={notes.length} onUpgrade={handleUpgrade} />

          {/* Advanced Search Feature Gate */}
          {searchQuery && tenant?.plan === "free" && (
            <FeatureGate
              feature="advanced-search"
              description="Unlock advanced search capabilities with fuzzy matching, content search, and saved searches."
              onUpgrade={handleUpgrade}
            >
              <div className="mb-6">
                <Alert className="border-warning/30 bg-warning/10">
                  <AlertDescription className="text-warning-foreground">
                    You're using basic search. Upgrade to Pro for advanced search features!
                  </AlertDescription>
                </Alert>
              </div>
            </FeatureGate>
          )}

          {/* Filters */}
          {allTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Filter by tags:</span>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                        : "border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:border-primary/50"
                    }`}
                    onClick={() => handleTagFilter(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
              <Alert variant="destructive">
                <AlertDescription>Failed to load notes. Please try again.</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-primary/20 to-accent/20" />
                  <Skeleton className="h-20 w-full bg-gradient-to-r from-primary/10 to-accent/10" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 bg-primary/20" />
                    <Skeleton className="h-6 w-20 bg-accent/20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && notes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                {searchQuery || selectedTags.length > 0 ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || selectedTags.length > 0
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Create your first note to get started with organizing your thoughts and ideas."}
              </p>
              {!searchQuery && selectedTags.length === 0 && (
                <Button
                  onClick={handleCreateNote}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              )}
            </motion.div>
          )}

          {/* Notes Grid */}
          {!isLoading && notes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {notes.map((note: Note, index: number) => (
                  <NoteCard
                    key={note._id.toString()}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* Note Editor */}
        <NoteEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingNote(null)
          }}
          onSave={handleSaveNote}
          note={editingNote}
          isLoading={createNoteMutation.isPending || updateNoteMutation.isPending}
        />

        <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      </div>
    </AuthGuard>
  )
}
