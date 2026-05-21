import { apiFetch } from '@/api/client'

export const discoverApi = {
  getFeed: (cursor: string, maxDistance: number, ageMin: number, ageMax: number) =>
    apiFetch<any>(`/discover/feed?cursor=${cursor}&maxDistance=${maxDistance}&ageMin=${ageMin}&ageMax=${ageMax}`),

  like: (toUserId: string, targetType: string, targetId?: string, comment?: string) =>
    apiFetch<any>('/discover/like', {
      method: 'POST',
      body: JSON.stringify({ toUserId, targetType, targetId, comment }),
    }),

  getLikesReceived: () => apiFetch<any>('/discover/likes-received'),
}
