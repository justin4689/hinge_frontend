import { useState, useRef, useEffect } from 'react'
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import MessageBubble from '../../../components/MessageBubble'
import socketService from '../../../services/socketService'
import { apiFetch } from '../../../api/client'
import { useAuthStore } from '../../../store/useAuthStore'
import { COLORS } from '../../../utils/constants'

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>()
  const user = useAuthStore((s) => s.user)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const flatRef = useRef<FlatList>(null)

  const { isLoading } = useQuery({
    queryKey: ['messages', matchId],
    queryFn: async () => {
      const res = await apiFetch<any>(`/matches/${matchId}/messages`)
      setMessages(res?.data?.messages ?? [])
      return res
    },
    staleTime: 0,
  })

  useEffect(() => {
    socketService.emit('join_match', { matchId })
    socketService.on('new_message', (data: any) => {
      if (data.matchId === matchId) {
        setMessages((prev) => [...prev, data])
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100)
      }
    })
    return () => {
      socketService.off('new_message')
    }
  }, [matchId])

  const send = async () => {
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    try {
      const res = await apiFetch<any>(`/matches/${matchId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
      setMessages((prev) => [...prev, res?.data?.message])
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100)
    } catch {}
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isMine={item.sender === user?._id} />
        )}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={COLORS.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color={text.trim() ? COLORS.accent : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  list: { paddingVertical: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surfaceDark,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sendBtn: { padding: 8, marginLeft: 4 },
})
