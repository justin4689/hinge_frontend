import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { apiFetch } from '@/api/client'
import { COLORS } from '@/utils/constants'

const RELIGIONS = [
  'Agnostique', 'Athée', 'Bouddhiste', 'Catholique', 'Chrétien',
  'Hindou', 'Juif', 'Musulman', 'Orthodoxe', 'Protestant', 'Autre',
]

export default function OnboardingEducation() {
  const [education, setEducation] = useState('')
  const [religion, setReligion] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onContinue = async () => {
    setSubmitting(true)
    try {
      await apiFetch('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ education, religion }),
      })
      router.push('/(auth)/onboarding/preferences')
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
        <Text style={styles.title}>Formation & croyances</Text>

        <Text style={styles.label}>Formation</Text>
        <TextInput
          style={styles.input}
          placeholder="Ton école ou diplôme..."
          placeholderTextColor={COLORS.textSecondary}
          value={education}
          onChangeText={setEducation}
        />

        <Text style={styles.label}>Religion</Text>
        <View style={styles.religionGrid}>
          {RELIGIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, religion === r && styles.chipSelected]}
              onPress={() => setReligion(r === religion ? '' : r)}
            >
              <Text style={[styles.chipText, religion === r && styles.chipTextSelected]}>{r}</Text>
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
  religionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceDark,
  },
  chipSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  chipText: { color: COLORS.textSecondary, fontSize: 14 },
  chipTextSelected: { color: COLORS.accent,  },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.black,  fontSize: 16 },
})
