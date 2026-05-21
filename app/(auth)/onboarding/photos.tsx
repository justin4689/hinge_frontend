import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { apiFetch } from '../../../api/client'
import { COLORS } from '../../../utils/constants'

interface PickedPhoto {
  uri: string
  assetId?: string
}

export default function OnboardingPhotos() {
  const [photos, setPhotos] = useState<PickedPhoto[]>([])
  const [uploading, setUploading] = useState(false)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, { uri: result.assets[0].uri }])
    }
  }

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri))
  }

  const onContinue = async () => {
    if (photos.length < 2) {
      Toast.show({ type: 'error', text1: 'Photos requises', text2: 'Ajoute au moins 2 photos' })
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      photos.forEach((photo, i) => {
        formData.append('photos', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `photo_${i}.jpg`,
        } as any)
      })
      await apiFetch('/profile/photos/upload', {
        method: 'POST',
        body: formData,
        headers: {},
      })
      router.push('/(auth)/onboarding/prompts')
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Upload impossible' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tes meilleures photos</Text>
      <Text style={styles.subtitle}>Ajoute au moins 2 photos de toi</Text>

      <FlatList
        data={[...photos, { uri: 'add' }]}
        numColumns={2}
        keyExtractor={(item, i) => item.uri + i}
        renderItem={({ item }) =>
          item.uri === 'add' ? (
            <TouchableOpacity style={styles.addBox} onPress={pickImage}>
              <Ionicons name="add" size={40} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.photoBox}>
              <Image source={{ uri: item.uri }} style={styles.photo} contentFit="cover" />
              <TouchableOpacity style={styles.remove} onPress={() => removePhoto(item.uri)}>
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )
        }
        style={styles.grid}
      />

      <TouchableOpacity
        style={[styles.button, (photos.length < 2 || uploading) && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={photos.length < 2 || uploading}
      >
        <Text style={styles.buttonText}>{uploading ? 'Upload...' : 'Continuer'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  title: { fontSize: 28, color: COLORS.textPrimary, fontFamily: 'Tiempos-Semibold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  grid: { flex: 1 },
  photoBox: { flex: 1, margin: 4, height: 180, borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  addBox: {
    flex: 1,
    margin: 4,
    height: 180,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: { position: 'absolute', top: 6, right: 6 },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: COLORS.black, fontFamily: 'ModernEra-Bold', fontSize: 16 },
})
