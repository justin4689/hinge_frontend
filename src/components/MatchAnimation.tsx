import { useEffect } from 'react'
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { COLORS } from '@/utils/constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface MatchUser {
  _id: string
  name: string
  photos: { _id: string; url: string }[]
}

interface Props {
  visible: boolean
  match: { matchId: string; user: MatchUser; firstMessage?: string }
  onClose: () => void
  onSendMessage: () => void
  myPhoto?: string
}

export default function MatchAnimation({ visible, match, onClose, onSendMessage, myPhoto }: Props) {
  const photo1Y = useSharedValue(400)
  const photo2Y = useSharedValue(400)

  const photo1Style = useAnimatedStyle(() => ({ transform: [{ translateY: photo1Y.value }] }))
  const photo2Style = useAnimatedStyle(() => ({ transform: [{ translateY: photo2Y.value }] }))

  useEffect(() => {
    if (visible) {
      photo1Y.value = withSpring(0, { damping: 14, stiffness: 120 })
      photo2Y.value = withDelay(150, withSpring(0, { damping: 14, stiffness: 120 }))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Text style={styles.title}>C'est un match !</Text>

        <View style={styles.photos}>
          <Animated.View style={[styles.photoWrap, photo1Style]}>
            {myPhoto && <Image source={{ uri: myPhoto }} style={styles.photo} contentFit="cover" />}
          </Animated.View>
          <Animated.View style={[styles.photoWrap, photo2Style]}>
            {match.user.photos[0] && (
              <Image source={{ uri: match.user.photos[0].url }} style={styles.photo} contentFit="cover" />
            )}
          </Animated.View>
        </View>

        <Text style={styles.subtitle}>Toi et {match.user.name} vous êtes plûs !</Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => {
            onSendMessage()
            router.push(`/matches/${match.matchId}` as any)
          }}
        >
          <Text style={styles.btnPrimaryText}>Envoyer un message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
          <Text style={styles.btnSecondaryText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    color: COLORS.accent,
    
    marginBottom: 32,
  },
  photos: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  photoWrap: {
    width: (SCREEN_WIDTH - 96) / 2,
    height: (SCREEN_WIDTH - 96) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceDark,
  },
  photo: { width: '100%', height: '100%' },
  subtitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 32,
    textAlign: 'center',
    
  },
  btnPrimary: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  btnPrimaryText: { color: COLORS.black,  fontSize: 16 },
  btnSecondary: { padding: 12 },
  btnSecondaryText: { color: COLORS.textSecondary, fontSize: 14 },
})
