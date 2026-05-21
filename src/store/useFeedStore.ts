import { create } from 'zustand'

interface Photo {
  _id: string
  url: string
}

interface Prompt {
  _id: string
  question: string
  answer: string
  category?: string
}

interface Profile {
  _id: string
  name: string
  age: number
  distance?: number
  job?: string
  education?: string
  photos: Photo[]
  prompts: Prompt[]
}

interface FeedStore {
  profiles: Profile[]
  cursor: string | null
  hasMore: boolean
  appendProfiles: (profiles: Profile[], nextCursor: string | null) => void
  removeProfile: (id: string) => void
  reset: () => void
}

export const useFeedStore = create<FeedStore>()((set) => ({
  profiles: [],
  cursor: null,
  hasMore: true,
  appendProfiles: (p, c) => set((s) => ({ profiles: [...s.profiles, ...p], cursor: c, hasMore: !!c })),
  removeProfile: (id) => set((s) => ({ profiles: s.profiles.filter((p) => p._id !== id) })),
  reset: () => set({ profiles: [], cursor: null, hasMore: true }),
}))
