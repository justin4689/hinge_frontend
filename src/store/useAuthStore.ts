import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  _id: string
  name: string
  email: string
  photos: { _id: string; url: string }[]
  age?: number
  job?: string
  education?: string
  plan?: 'free' | 'plus' | 'x'
  expoPushToken?: string
}

interface AuthStore {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-store', storage: createJSONStorage(() => AsyncStorage) }
  )
)
