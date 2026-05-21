import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../store/useAuthStore'
import { COLORS } from '../utils/constants'

export default function Index() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(user ? '/(tabs)/feed' : '/(auth)/login')
    }, 100)
    return () => clearTimeout(timer)
  }, [user])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
