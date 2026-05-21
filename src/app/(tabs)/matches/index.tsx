import { useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import socketService from '../../../services/socketService'
import { useMatchesStore } from '../../../store/useMatchesStore'
import { apiFetch } from '../../../api/client'
import { formatDate } from '../../../utils/formatDate'
import { COLORS } from '../../../utils/constants'

export default function MatchesScreen() {
  const queryClient = useQueryClient()
  const { setMatches, addMatch, updateLastMessage, incrementUnread, matches } = useMatchesStore()

  const { isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await apiFetch<any>('/matches')
      setMatches(res?.data?.matches ?? [])
      return res
    },
  })

  useEffect(() => {
    socketService.on('new_match', (data: any) => {
      addMatch(data.match)
      Toast.show({ type: 'success', text1: 'Nouveau match !', text2: data.user?.name })
    })
    socketService.on('new_message', (data: any) => {
      updateLastMessage(data.matchId, data.content)
      incrementUnread()
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    })
    return () => {
      socketService.off('new_match')
      socketService.off('new_message')
    }
  }, [])

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => router.push(`/matches/${item._id}` as any)}>
            <Image
              source={{ uri: item.user?.photos?.[0]?.url }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.user?.name}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {item.lastMessage ?? 'Dis bonjour !'}
              </Text>
            </View>
            <View style={styles.right}>
              {item.lastMessageAt && (
                <Text style={styles.time}>{formatDate(item.lastMessageAt)}</Text>
              )}
              {!item.isRead && item.lastMessage && <View style={styles.dot} />}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Pas encore de matches</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, color: COLORS.textPrimary,  padding: 16, paddingTop: 60 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12, backgroundColor: COLORS.surfaceDark },
  info: { flex: 1 },
  name: { fontSize: 16, color: COLORS.textPrimary,  marginBottom: 2 },
  lastMsg: { fontSize: 13, color: COLORS.textSecondary,  },
  right: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: 11, color: COLORS.textSecondary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 16 },
})
