import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

class SocketService {
  private socket: Socket | null = null

  async connect() {
    const token = await SecureStore.getItemAsync('accessToken')
    this.socket = io(process.env.EXPO_PUBLIC_SOCKET_URL!, {
      auth: { token },
      transports: ['websocket'],
    })
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data)
  }

  on(event: string, cb: (data: any) => void) {
    this.socket?.on(event, cb)
  }

  off(event: string, cb?: (data: any) => void) {
    this.socket?.off(event, cb)
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export default new SocketService()
