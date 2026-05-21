import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { COLORS } from '../../../utils/constants'

const TOTAL_STEPS = 6

export default function OnboardingLayout() {
  const [step] = useState(1)

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressSegment, i < step ? styles.progressActive : styles.progressInactive]}
          />
        ))}
      </View>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressActive: { backgroundColor: COLORS.accent },
  progressInactive: { backgroundColor: COLORS.border },
})
