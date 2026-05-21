import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native'
import { COLORS } from '../utils/constants'

interface Props {
  visible: boolean
  onConfirm: (comment?: string) => void
  onClose: () => void
  targetType: string
  targetPreview: string
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function LikeCommentModal({ visible, onConfirm, onClose, targetPreview }: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (visible) {
      setComment('')
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start()
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavContainer}
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <Text style={styles.preview} numberOfLines={2}>{targetPreview}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ajoute un commentaire (optionnel)"
            placeholderTextColor={COLORS.textSecondary}
            value={comment}
            onChangeText={(t) => setComment(t.slice(0, 150))}
            multiline
            maxLength={150}
          />
          <Text style={styles.counter}>{comment.length}/150</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => onConfirm(undefined)}>
              <Text style={styles.btnSecondaryText}>Liker sans message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => onConfirm(comment || undefined)}>
              <Text style={styles.btnPrimaryText}>Envoyer ♥</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  kavContainer: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  preview: {
    fontSize: 15,
    color: COLORS.textOnWhite,
    marginBottom: 16,
    
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: COLORS.pebble,
    borderRadius: 12,
    padding: 14,
    color: COLORS.textOnWhite,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  counter: { color: COLORS.textSecondary, fontSize: 11, textAlign: 'right', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  btnSecondaryText: { color: COLORS.textOnWhite,  fontSize: 14 },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: COLORS.black,
    alignItems: 'center',
  },
  btnPrimaryText: { color: COLORS.white,  fontSize: 14 },
})
