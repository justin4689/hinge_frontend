import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { apiFetch } from '../../../api/client'
import { useAuthStore } from '../../../store/useAuthStore'
import { COLORS } from '../../../utils/constants'

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [job, setJob] = useState(user?.job ?? '')
  const [education, setEducation] = useState(user?.education ?? '')
  const [submitting, setSubmitting] = useState(false)

  const onSave = async () => {
    setSubmitting(true)
    try {
      const res = await apiFetch<any>('/profile/me', { method: 'PUT', body: JSON.stringify({ job, education }) })
      setUser(res.data.user)
      Toast.show({ type: 'success', text1: 'Profil mis à jour' })
      router.back()
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
        <Text style={styles.title}>Modifier le profil</Text>

        <Text style={styles.label}>Profession</Text>
        <TextInput
          style={styles.input}
          placeholder="Ton métier..."
          placeholderTextColor={COLORS.textSecondary}
          value={job}
          onChangeText={setJob}
        />

        <Text style={styles.label}>Formation</Text>
        <TextInput
          style={styles.input}
          placeholder="Ton école ou diplôme..."
          placeholderTextColor={COLORS.textSecondary}
          value={education}
          onChangeText={setEducation}
        />

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={onSave}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>{submitting ? 'Sauvegarde...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { padding: 24, paddingTop: 60 },
  title: { fontSize: 26, color: COLORS.textPrimary, fontFamily: 'Tiempos-Semibold', marginBottom: 28 },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8, fontFamily: 'ModernEra-Bold' },
  input: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: { backgroundColor: COLORS.white, borderRadius: 30, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.black, fontFamily: 'ModernEra-Bold', fontSize: 16 },
})
