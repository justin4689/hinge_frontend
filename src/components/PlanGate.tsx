import { ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../store/useAuthStore'
import { COLORS } from '../utils/constants'

const HIERARCHY: Record<string, number> = { free: 0, plus: 1, x: 2 }

interface Props {
  requiredPlan: 'plus' | 'x'
  children: ReactNode
}

export default function PlanGate({ requiredPlan, children }: Props) {
  const user = useAuthStore((s) => s.user)
  const userLevel = HIERARCHY[user?.plan ?? 'free'] ?? 0
  const requiredLevel = HIERARCHY[requiredPlan]

  if (userLevel >= requiredLevel) return <>{children}</>

  return (
    <View style={styles.container}>
      <View style={styles.blurred} pointerEvents="none">
        {children}
      </View>
      <View style={styles.overlay}>
        <Ionicons name="lock-closed" size={32} color={COLORS.white} />
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/paywall')}>
          <Text style={styles.btnText}>Voir</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  blurred: { opacity: 0.15 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  btn: {
    backgroundColor: COLORS.midnight,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnText: { color: COLORS.white, fontFamily: 'ModernEra-Bold', fontSize: 14 },
})
