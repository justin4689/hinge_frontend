import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '@/store/useAuthStore'

const BASE = process.env.EXPO_PUBLIC_API_URL

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync('accessToken')

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    const refreshed = await tryRefreshToken()
    if (refreshed) return apiFetch(path, options)
    useAuthStore.getState().logout()
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    throw { error: 'AUTH_REQUIRED' }
  }

  const data = await res.json()
  if (!res.ok) throw data
  return data
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken')
    if (!refreshToken) return false
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const { data } = await res.json()
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    return true
  } catch {
    return false
  }
}
