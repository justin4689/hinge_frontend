import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { apiFetch } from '../../../api/client'
import { COLORS } from '../../../utils/constants'

export default function OnboardingLocation() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const requestLocation = async () => {
    setLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission refusée', text2: 'Active la localisation dans les réglages' })
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      await apiFetch('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          location: {
            type: 'Point',
            coordinates: [loc.coords.longitude, loc.coords.latitude],
          },
        }),
      })
      setDone(true)
      setTimeout(() => router.replace('/(tabs)/feed'), 800)
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de récupérer ta position' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Ionicons name="location-outline" size={80} color={COLORS.accent} style={styles.icon} />
      <Text style={styles.title}>Où es-tu ?</Text>
      <Text style={styles.subtitle}>
        On utilise ta position pour te montrer des profils près de toi. Elle n'est jamais partagée publiquement.
      </Text>

      <TouchableOpacity
        style={[styles.button, (loading || done) && styles.buttonDisabled]}
        onPress={requestLocation}
        disabled={loading || done}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.black} />
        ) : done ? (
          <Ionicons name="checkmark" size={24} color={COLORS.accent} />
        ) : (
          <Text style={styles.buttonText}>Activer la localisation</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(tabs)/feed')} style={styles.skip}>
        <Text style={styles.skipText}>Passer cette étape</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: { marginBottom: 24 },
  title: { fontSize: 28, color: COLORS.textPrimary, fontFamily: 'Tiempos-Semibold', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.black, fontFamily: 'ModernEra-Bold', fontSize: 16 },
  skip: { marginTop: 20 },
  skipText: { color: COLORS.textSecondary, fontSize: 14 },
})
