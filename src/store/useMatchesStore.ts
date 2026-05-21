import { create } from 'zustand'

interface Match {
  _id: string
  user: {
    _id: string
    name: string
    photos: { _id: string; url: string }[]
  }
  lastMessage?: string
  lastMessageAt?: string
  isRead?: boolean
}

interface MatchesStore {
  matches: Match[]
  unreadCount: number
  setMatches: (matches: Match[]) => void
  addMatch: (match: Match) => void
  updateLastMessage: (matchId: string, lastMessage: string) => void
  incrementUnread: () => void
  resetUnread: () => void
}

export const useMatchesStore = create<MatchesStore>()((set) => ({
  matches: [],
  unreadCount: 0,
  setMatches: (matches) => set({ matches }),
  addMatch: (match) => set((s) => ({ matches: [match, ...s.matches] })),
  updateLastMessage: (matchId, lastMessage) =>
    set((s) => ({
      matches: s.matches.map((m) => (m._id === matchId ? { ...m, lastMessage } : m)),
    })),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
}))
