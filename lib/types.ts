import mongoose from 'mongoose';

// Core types for the multi-tenant SaaS Notes Application

export interface User {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  tenantId: mongoose.Types.ObjectId;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  _id: mongoose.Types.ObjectId;
  name: string;
  plan: "free" | "pro";
  settings: {
    maxNotes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  _id: mongoose.Types.ObjectId;
  id?: string; // Optional client-side string ID
  title: string;
  content: string;
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];
}

export type AuthUser = User;
export type AuthTenant = Tenant;
