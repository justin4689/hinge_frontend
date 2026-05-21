import { memo, useRef } from 'react'
import { View, Text, FlatList, StyleSheet, Dimensions, ViewToken } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import LikeButton from '../LikeButton'
import PromptCard from '../PromptCard'
import { COLORS } from '../../utils/constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface Photo { _id: string; url: string }
interface Prompt { _id: string; question: string; answer: string }
interface Profile {
  _id: string
  name: string
  age: number
  distance?: number
  job?: string
  education?: string
  photos: Photo[]
  prompts: Prompt[]
}

interface Props {
  profile: Profile
  onLikePhoto: (photoId: string, comment?: string) => void
  onLikePrompt: (promptId: string, comment?: string) => void
}

function ProfileCard({ profile, onLikePhoto, onLikePrompt }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}, {profile.age}</Text>
        {profile.distance !== undefined && (
          <Text style={styles.distance}>{Math.round(profile.distance)} km</Text>
        )}
      </View>

      <FlatList
        data={profile.photos}
        horizontal
        pagingEnabled
        snapToInterval={SCREEN_WIDTH - 32}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: item.url }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
            <LikeButton
              onPress={(comment) => onLikePhoto(item._id, comment)}
              style={styles.photoLikeBtn}
              targetPreview={profile.name}
              targetType="photo"
            />
          </View>
        )}
      />

      <View style={styles.infoSection}>
        {profile.job && (
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{profile.job}</Text>
          </View>
        )}
        {profile.education && (
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{profile.education}</Text>
          </View>
        )}
      </View>

      <View style={styles.prompts}>
        {profile.prompts.slice(0, 3).map((prompt) => (
          <PromptCard key={prompt._id} prompt={prompt} onLike={onLikePrompt} />
        ))}
      </View>
    </View>
  )
}

export default memo(ProfileCard)

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  name: {
    fontSize: 22,
    color: COLORS.textPrimary,
    
  },
  distance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  photoContainer: {
    width: SCREEN_WIDTH - 32,
    height: 440,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  photoLikeBtn: { position: 'absolute', bottom: 12, right: 12 },
  infoSection: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: COLORS.textSecondary,  },
  prompts: { paddingHorizontal: 16 },
})
