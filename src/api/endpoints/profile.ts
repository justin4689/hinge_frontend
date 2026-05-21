import { apiFetch } from '@/api/client'

export const profileApi = {
  getMe: () => apiFetch<any>('/profile/me'),

  updateMe: (data: Record<string, any>) =>
    apiFetch<any>('/profile/me', { method: 'PUT', body: JSON.stringify(data) }),

  updatePreferences: (data: Record<string, any>) =>
    apiFetch<any>('/profile/preferences', { method: 'PUT', body: JSON.stringify(data) }),

  updatePrompts: (prompts: any[]) =>
    apiFetch<any>('/profile/prompts', { method: 'PUT', body: JSON.stringify({ prompts }) }),

  updateExpoPushToken: (expoPushToken: string) =>
    apiFetch<any>('/profile/expo-push-token', { method: 'PUT', body: JSON.stringify({ expoPushToken }) }),
}
