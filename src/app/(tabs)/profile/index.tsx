import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../../store/useAuthStore'
import { COLORS } from '../../../utils/constants'

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        {user?.photos?.[0] && (
          <Image
            source={{ uri: user.photos[0].url }}
            style={styles.avatar}
            contentFit="cover"
          />
        )}
        <Text style={styles.name}>{user?.name}</Text>
        {user?.job && <Text style={styles.job}>{user.job}</Text>}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/profile/edit' as any)}>
          <Ionicons name="pencil-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.actionText}>Modifier le profil</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/profile/settings' as any)}>
          <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.actionText}>Préférences</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/paywall')}>
          <Ionicons name="star-outline" size={20} color={COLORS.midnight} />
          <Text style={[styles.actionText, { color: COLORS.midnight }]}>Hinge+</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => useAuthStore.getState().logout()}
      >
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 32, backgroundColor: COLORS.surfaceDark },
  avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 16, borderWidth: 3, borderColor: COLORS.accent },
  name: { fontSize: 24, color: COLORS.textPrimary,  },
  job: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  actions: { marginTop: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionText: { flex: 1, fontSize: 16, color: COLORS.textPrimary,  },
  logoutBtn: { marginTop: 40, marginHorizontal: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error, alignItems: 'center' },
  logoutText: { color: COLORS.error,  fontSize: 15 },
})
