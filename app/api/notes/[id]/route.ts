// Individual note operations (GET, PUT, DELETE)
import type { NextRequest } from "next/server"
import { getAuthUser, createApiResponse, createErrorResponse } from "@/lib/api-utils"
import { mockNotes } from "@/lib/mock-data"

// In-memory storage for demo
const notesStorage = [...mockNotes]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request)
  if (!user) {
    return createErrorResponse("Unauthorized", 401)
  }

  const note = notesStorage.find((n) => n.id === params.id && n.tenantId === user.tenantId)
  if (!note) {
    return createErrorResponse("Note not found", 404)
  }

  return createApiResponse(note)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request)
  if (!user) {
    return createErrorResponse("Unauthorized", 401)
  }

  try {
    const updates = await request.json()
    const noteIndex = notesStorage.findIndex((n) => n.id === params.id && n.tenantId === user.tenantId)

    if (noteIndex === -1) {
      return createErrorResponse("Note not found", 404)
    }

    // Update the note
    notesStorage[noteIndex] = {
      ...notesStorage[noteIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return createApiResponse(notesStorage[noteIndex])
  } catch (error) {
    return createErrorResponse("Invalid request body", 400)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(request)
  if (!user) {
    return createErrorResponse("Unauthorized", 401)
  }

  const noteIndex = notesStorage.findIndex((n) => n.id === params.id && n.tenantId === user.tenantId)
  if (noteIndex === -1) {
    return createErrorResponse("Note not found", 404)
  }

  // Check if user owns the note or is admin
  const note = notesStorage[noteIndex]
  if (note.userId !== user.id && user.role !== "admin") {
    return createErrorResponse("Forbidden", 403)
  }

  notesStorage.splice(noteIndex, 1)
  return createApiResponse({ message: "Note deleted successfully" })
}
