import { useState } from 'react'
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import ProfileCard from '../../components/ProfileCard'
import MatchAnimation from '../../components/MatchAnimation'
import { apiFetch } from '../../api/client'
import { useAuthStore } from '../../store/useAuthStore'
import { useFeedStore } from '../../store/useFeedStore'
import { COLORS } from '../../utils/constants'

export default function FeedScreen() {
  const user = useAuthStore((s) => s.user)
  const { removeProfile } = useFeedStore()
  const [matchData, setMatchData] = useState<any>(null)
  const [showMatch, setShowMatch] = useState(false)

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = '' }) =>
      apiFetch<any>(`/discover/feed?cursor=${pageParam}&maxDistance=50&ageMin=18&ageMax=60`),
    getNextPageParam: (lastPage: any) => lastPage?.data?.nextCursor ?? undefined,
    staleTime: 30000,
    initialPageParam: '',
  })

  const likeMutation = useMutation({
    mutationFn: (payload: any) => apiFetch<any>('/discover/like', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (res, variables) => {
      removeProfile(variables.toUserId)
      if (res?.data?.isMatch) {
        setMatchData(res.data)
        setShowMatch(true)
      }
    },
    onError: (err: any) => {
      if (err?.error === 'DAILY_LIKE_LIMIT') router.push('/paywall')
      else Toast.show({ type: 'error', text1: 'Erreur', text2: 'Like impossible' })
    },
  })

  const profiles = data?.pages.flatMap((p: any) => p?.data?.profiles ?? []) ?? []

  const handleLikePhoto = async (profile: any, photoId: string, comment?: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    likeMutation.mutate({ toUserId: profile._id, targetType: 'photo', targetId: photoId, comment })
  }

  const handleLikePrompt = async (profile: any, promptId: string, comment?: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    likeMutation.mutate({ toUserId: profile._id, targetType: 'prompt', targetId: promptId, comment })
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Plus de profils près de toi</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/profile/settings' as any)}>
          <Text style={styles.emptyBtnText}>Modifier mes préférences</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={profiles}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <ProfileCard
            profile={item}
            onLikePhoto={(photoId, comment) => handleLikePhoto(item, photoId, comment)}
            onLikePrompt={(promptId, comment) => handleLikePrompt(item, promptId, comment)}
          />
        )}
        windowSize={3}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        onEndReachedThreshold={0.5}
        onEndReached={() => hasNextPage && fetchNextPage()}
        contentContainerStyle={styles.list}
      />

      {matchData && (
        <MatchAnimation
          visible={showMatch}
          match={{ matchId: matchData.matchId, user: matchData.user }}
          myPhoto={user?.photos?.[0]?.url}
          onClose={() => setShowMatch(false)}
          onSendMessage={() => setShowMatch(false)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingTop: 8 },
  centered: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: COLORS.textPrimary, fontSize: 18,  textAlign: 'center', marginBottom: 20 },
  emptyBtn: { backgroundColor: COLORS.accent, borderRadius: 30, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: COLORS.white,  fontSize: 14 },
})
