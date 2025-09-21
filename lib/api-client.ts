// Client-side API functions using React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Note } from "./types"

const API_BASE = "/api"

// API client with authentication
class ApiClient {
  private getAuthHeaders() {
    if (typeof window === "undefined") {
      // Running on server, localStorage is not available
      console.log("lib/api-client.ts: Running on server, localStorage not available.");
      return {};
    }
    const token = localStorage.getItem("auth-token");
    console.log("lib/api-client.ts: Token retrieved from localStorage:", token); // Log token retrieval
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    return response.json();
  }

  // Notes API methods
  async getNotes(search?: string, tags?: string[]) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (tags?.length) params.append("tags", tags.join(","));

    return this.request(`/notes?${params}`);
  }

  async createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt" | "tenantId" | "userId" | "isPinned">) {
    return this.request("/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });
  }

  async updateNote(id: string, updates: Partial<Note>) {
    return this.request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteNote(id: string) {
    return this.request(`/notes/${id}`, {
      method: "DELETE",
    });
  }

  async togglePin(id: string) {
    return this.request(`/notes/${id}/pin`, {
      method: "PATCH",
    });
  }
}

export const apiClient = new ApiClient();

// React Query hooks
export function useNotes(search?: string, tags?: string[]) {
  return useQuery({
    queryKey: ["notes", search, tags],
    queryFn: () => apiClient.getNotes(search, tags),
    staleTime: 30000, // 30 seconds
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Note> }) => apiClient.updateNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export function useTogglePin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.togglePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}
