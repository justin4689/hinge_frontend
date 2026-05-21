import { useState } from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import LikeCommentModal from './LikeCommentModal'
import { COLORS } from '@/utils/constants'

interface Props {
  onPress: (comment?: string) => void
  size?: number
  style?: ViewStyle
  targetPreview?: string
  targetType?: string
}

export default function LikeButton({ onPress, size = 28, style, targetPreview = '', targetType = 'photo' }: Props) {
  const [modalVisible, setModalVisible] = useState(false)
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = async () => {
    scale.value = withSpring(1.3, { damping: 5 }, () => {
      scale.value = withSpring(1)
    })
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setModalVisible(true)
  }

  const handleConfirm = (comment?: string) => {
    setModalVisible(false)
    onPress(comment)
  }

  return (
    <>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <TouchableOpacity onPress={handlePress} style={styles.btn}>
          <Ionicons name="heart" size={size} color={COLORS.error} />
        </TouchableOpacity>
      </Animated.View>
      <LikeCommentModal
        visible={modalVisible}
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
        targetType={targetType}
        targetPreview={targetPreview}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  btn: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
})
