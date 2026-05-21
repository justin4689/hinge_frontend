import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { apiFetch } from '../../../api/client'
import { COLORS } from '../../../utils/constants'

const GENDERS = [
  { key: 'man', label: 'Hommes' },
  { key: 'woman', label: 'Femmes' },
  { key: 'nonbinary', label: 'Non-binaires' },
]

export default function SettingsScreen() {
  const [ageMin, setAgeMin] = useState(22)
  const [ageMax, setAgeMax] = useState(35)
  const [maxDistance, setMaxDistance] = useState(50)
  const [genderPref, setGenderPref] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggleGender = (key: string) => {
    setGenderPref((prev) => prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key])
  }

  const onSave = async () => {
    setSubmitting(true)
    try {
      await apiFetch('/profile/preferences', {
        method: 'PUT',
        body: JSON.stringify({ ageMin, ageMax, maxDistance, genderPreference: genderPref }),
      })
      Toast.show({ type: 'success', text1: 'Préférences mises à jour' })
      router.back()
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Préférences</Text>

      <Text style={styles.label}>Tranche d'âge : {ageMin} – {ageMax} ans</Text>
      <Slider
        style={styles.slider}
        minimumValue={18}
        maximumValue={70}
        step={1}
        value={ageMin}
        onValueChange={(v) => setAgeMin(Math.min(v, ageMax - 1))}
        minimumTrackTintColor={COLORS.accent}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={COLORS.accent}
      />
      <Slider
        style={styles.slider}
        minimumValue={18}
        maximumValue={70}
        step={1}
        value={ageMax}
        onValueChange={(v) => setAgeMax(Math.max(v, ageMin + 1))}
        minimumTrackTintColor={COLORS.accent}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={COLORS.accent}
      />

      <Text style={styles.label}>Distance max : {maxDistance} km</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={200}
        step={1}
        value={maxDistance}
        onValueChange={setMaxDistance}
        minimumTrackTintColor={COLORS.accent}
        maximumTrackTintColor={COLORS.border}
        thumbTintColor={COLORS.accent}
      />

      <Text style={styles.label}>Je cherche</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g.key}
            style={[styles.genderBtn, genderPref.includes(g.key) && styles.genderBtnSelected]}
            onPress={() => toggleGender(g.key)}
          >
            <Text style={[styles.genderText, genderPref.includes(g.key) && styles.genderTextSelected]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSave}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color={COLORS.black} />
          : <Text style={styles.buttonText}>Enregistrer</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: 24, paddingTop: 60 },
  title: { fontSize: 26, color: COLORS.textPrimary, fontFamily: 'Tiempos-Semibold', marginBottom: 24 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 4, fontFamily: 'ModernEra-Bold', marginTop: 16 },
  slider: { marginBottom: 8 },
  genderRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 32 },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
  },
  genderBtnSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  genderText: { color: COLORS.textSecondary, fontSize: 13 },
  genderTextSelected: { color: COLORS.accent, fontFamily: 'ModernEra-Bold' },
  button: { backgroundColor: COLORS.white, borderRadius: 30, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.black, fontFamily: 'ModernEra-Bold', fontSize: 16 },
})
