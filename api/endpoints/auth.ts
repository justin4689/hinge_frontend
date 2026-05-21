import { apiFetch } from '../client'

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, password: string) =>
    apiFetch<any>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  logout: () =>
    apiFetch<any>('/auth/logout', { method: 'POST' }),
}
