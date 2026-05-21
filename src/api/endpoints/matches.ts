import { apiFetch } from '@/api/client'

export const matchesApi = {
  getMatches: () => apiFetch<any>('/matches'),

  getMessages: (matchId: string) => apiFetch<any>(`/matches/${matchId}/messages`),

  sendMessage: (matchId: string, content: string) =>
    apiFetch<any>(`/matches/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
}
