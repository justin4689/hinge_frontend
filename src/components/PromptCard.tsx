import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import LikeButton from './LikeButton'
import { COLORS } from '@/utils/constants'

interface Prompt {
  _id: string
  question: string
  answer: string
}

interface Props {
  prompt: Prompt
  onLike: (promptId: string, comment?: string) => void
}

function PromptCard({ prompt, onLike }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.question}>{prompt.question}</Text>
      <Text style={styles.answer}>{prompt.answer}</Text>
      <LikeButton
        onPress={(comment) => onLike(prompt._id, comment)}
        style={styles.likeBtn}
        targetPreview={prompt.answer}
        targetType="prompt"
      />
    </View>
  )
}

export default memo(PromptCard)

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  question: {
    fontSize: 12,
    color: COLORS.textSecondary,
    
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answer: {
    fontSize: 16,
    color: COLORS.textOnWhite,
    
    lineHeight: 22,
    paddingRight: 48,
  },
  likeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
})
