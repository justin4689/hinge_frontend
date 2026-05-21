import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { apiFetch } from '../../../api/client'
import { COLORS } from '../../../utils/constants'

const GENDERS = ['man', 'woman', 'nonbinary']
const GENDER_LABELS: Record<string, string> = { man: 'Homme', woman: 'Femme', nonbinary: 'Non-binaire' }

export default function OnboardingBasicInfo() {
  const [job, setJob] = useState('')
  const [height, setHeight] = useState(170)
  const [gender, setGender] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const onContinue = async () => {
    if (!gender) {
      Toast.show({ type: 'error', text1: 'Sélectionne ton genre' })
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ job, height, gender }),
      })
      router.push('/(auth)/onboarding/education')
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de sauvegarder' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Infos de base</Text>

        <Text style={styles.label}>Profession</Text>
        <TextInput
          style={styles.input}
          placeholder="Ton métier..."
          placeholderTextColor={COLORS.textSecondary}
          value={job}
          onChangeText={setJob}
        />

        <Text style={styles.label}>Taille : {height} cm</Text>
        <Slider
          style={styles.slider}
          minimumValue={150}
          maximumValue={220}
          step={1}
          value={height}
          onValueChange={setHeight}
          minimumTrackTintColor={COLORS.accent}
          maximumTrackTintColor={COLORS.border}
          thumbTintColor={COLORS.accent}
        />

        <Text style={styles.label}>Genre</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.genderBtnSelected]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>
                {GENDER_LABELS[g]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={onContinue}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>{submitting ? 'Sauvegarde...' : 'Continuer'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: 24, paddingTop: 8 },
  title: { fontSize: 28, color: COLORS.textPrimary,  marginBottom: 24 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8,  },
  input: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slider: { marginBottom: 24 },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
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
  genderText: { color: COLORS.textSecondary, fontSize: 14 },
  genderTextSelected: { color: COLORS.accent,  },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.black,  fontSize: 16 },
})
