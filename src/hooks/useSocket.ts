import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import socketService from '@/services/socketService'

export function useSocket() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) return
    socketService.connect()
    return () => {
      socketService.disconnect()
    }
  }, [user])

  return socketService
}
