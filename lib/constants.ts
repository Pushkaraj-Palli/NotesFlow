// Application constants and configuration
export const APP_CONFIG = {
  name: "NotesFlow",
  description: "Premium multi-tenant notes application for modern teams",
  version: "1.0.0",
  author: "NotesFlow Team",

  // URLs
  urls: {
    app: process.env.NEXT_PUBLIC_APP_URL || "https://notesflow.vercel.app",
    api: process.env.NEXT_PUBLIC_API_URL || "/api",
    support: "mailto:support@notesflow.com",
    docs: "https://docs.notesflow.com",
  },

  // Subscription plans
  plans: {
    free: {
      name: "Free",
      price: 0,
      maxNotes: 50,
      maxUsers: 5,
      features: ["basic-notes", "basic-search"],
    },
    pro: {
      name: "Pro",
      price: 19,
      maxNotes: 1000,
      maxUsers: 50,
      features: [
        "unlimited-notes",
        "advanced-search",
        "team-collaboration",
        "export",
        "api-access",
        "priority-support",
      ],
    },
  },

  // Limits and quotas
  limits: {
    noteTitle: 200,
    noteContent: 50000,
    tagsPerNote: 10,
    tagLength: 30,
  },

  // UI configuration
  ui: {
    itemsPerPage: 20,
    maxRecentNotes: 10,
    debounceMs: 300,
  },
} as const

export const FEATURE_FLAGS = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  enableSubscriptions: process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === "true",
  enableTeamFeatures: process.env.NEXT_PUBLIC_ENABLE_TEAM_FEATURES === "true",
  enableExport: process.env.NEXT_PUBLIC_ENABLE_EXPORT === "true",
} as const
