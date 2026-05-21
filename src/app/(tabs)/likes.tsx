import { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import PlanGate from '../../components/PlanGate'
import { apiFetch } from '../../api/client'
import { COLORS } from '../../utils/constants'

export default function LikesScreen() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['likes-received'],
    queryFn: () => apiFetch<any>('/discover/likes-received'),
  })

  const likeMutation = useMutation({
    mutationFn: (toUserId: string) =>
      apiFetch<any>('/discover/like', { method: 'POST', body: JSON.stringify({ toUserId, targetType: 'general' }) }),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: "C'est un match !" })
      queryClient.invalidateQueries({ queryKey: ['likes-received'] })
      setSelected(null)
    },
  })

  const likes: any[] = data?.data?.likes ?? []

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qui t'a liké</Text>
      <FlatList
        data={likes}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PlanGate requiredPlan="plus">
            <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
              <Image
                source={{ uri: item.user?.photos?.[0]?.url }}
                style={styles.cardImage}
                contentFit="cover"
              />
              <View style={styles.nameOverlay}>
                <Text style={styles.cardName}>{item.user?.name}</Text>
              </View>
            </TouchableOpacity>
          </PlanGate>
        )}
        contentContainerStyle={styles.grid}
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={styles.modal}>
            <Image
              source={{ uri: selected.user?.photos?.[0]?.url }}
              style={styles.modalImage}
              contentFit="cover"
            />
            <Text style={styles.modalName}>{selected.user?.name}</Text>
            <TouchableOpacity
              style={styles.likeBackBtn}
              onPress={() => likeMutation.mutate(selected.user._id)}
              disabled={likeMutation.isPending}
            >
              <Text style={styles.likeBackBtnText}>
                {likeMutation.isPending ? 'Envoi...' : 'Liker en retour ♥'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, color: COLORS.textPrimary, fontFamily: 'Tiempos-Semibold', padding: 16, paddingTop: 60 },
  grid: { paddingHorizontal: 8 },
  card: { flex: 1, margin: 4, height: 200, borderRadius: 12, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cardName: { color: COLORS.white, fontFamily: 'ModernEra-Bold', fontSize: 14 },
  modal: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalImage: { width: 240, height: 320, borderRadius: 20, marginBottom: 20 },
  modalName: { fontSize: 24, color: COLORS.textPrimary, fontFamily: 'Tiempos-Semibold', marginBottom: 24 },
  likeBackBtn: {
    backgroundColor: COLORS.error,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginBottom: 12,
  },
  likeBackBtnText: { color: COLORS.white, fontFamily: 'ModernEra-Bold', fontSize: 16 },
  closeBtn: { padding: 12 },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 14 },
})
