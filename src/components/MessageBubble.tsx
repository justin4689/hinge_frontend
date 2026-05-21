import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatTime } from '@/utils/formatDate'
import { COLORS } from '@/utils/constants'

interface Message {
  _id: string
  content: string
  createdAt: string
  isRead?: boolean
}

interface Props {
  message: Message
  isMine: boolean
}

function MessageBubble({ message, isMine }: Props) {
  return (
    <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.content, isMine ? styles.contentMine : styles.contentOther]}>
          {message.content}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
          {isMine && (
            <Ionicons
              name={message.isRead ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={message.isRead ? COLORS.accent : COLORS.textSecondary}
              style={styles.check}
            />
          )}
        </View>
      </View>
    </View>
  )
}

export default memo(MessageBubble)

const styles = StyleSheet.create({
  row: { marginVertical: 4, paddingHorizontal: 16 },
  rowRight: { alignItems: 'flex-end' },
  rowLeft: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  content: { fontSize: 15, lineHeight: 20 },
  contentMine: { color: COLORS.white,  },
  contentOther: { color: COLORS.textOnWhite,  },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'flex-end' },
  time: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  check: { marginLeft: 4 },
})
