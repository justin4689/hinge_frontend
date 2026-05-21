import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SectionList,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { apiFetch } from '../../../api/client'
import { COLORS } from '../../../utils/constants'

interface Prompt {
  _id: string
  question: string
  category: string
}

interface SelectedPrompt {
  promptId: string
  question: string
  answer: string
}

export default function OnboardingPrompts() {
  const [selected, setSelected] = useState<SelectedPrompt[]>([])
  const [submitting, setSubmitting] = useState(false)

  const { data } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => apiFetch<any>('/prompts'),
  })

  const prompts: Prompt[] = data?.data ?? []
  const categories = [...new Set(prompts.map((p) => p.category))]
  const sections = categories.map((cat) => ({
    title: cat,
    data: prompts.filter((p) => p.category === cat),
  }))

  const toggle = (prompt: Prompt) => {
    const exists = selected.find((s) => s.promptId === prompt._id)
    if (exists) {
      setSelected((prev) => prev.filter((s) => s.promptId !== prompt._id))
    } else if (selected.length < 3) {
      setSelected((prev) => [...prev, { promptId: prompt._id, question: prompt.question, answer: '' }])
    }
  }

  const setAnswer = (promptId: string, answer: string) => {
    setSelected((prev) =>
      prev.map((s) => (s.promptId === promptId ? { ...s, answer } : s))
    )
  }

  const onContinue = async () => {
    if (selected.length !== 3) {
      Toast.show({ type: 'error', text1: 'Sélectionne exactement 3 prompts' })
      return
    }
    if (selected.some((s) => !s.answer.trim())) {
      Toast.show({ type: 'error', text1: 'Réponds à tous les prompts' })
      return
    }
    setSubmitting(true)
    try {
      await apiFetch('/profile/prompts', { method: 'PUT', body: JSON.stringify({ prompts: selected }) })
      router.push('/(auth)/onboarding/basic-info')
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de sauvegarder' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tes prompts ({selected.length}/3)</Text>

      {selected.map((s) => (
        <View key={s.promptId} style={styles.selectedCard}>
          <Text style={styles.selectedQ}>{s.question}</Text>
          <TextInput
            style={styles.answerInput}
            placeholder="Ta réponse..."
            placeholderTextColor={COLORS.textSecondary}
            value={s.answer}
            onChangeText={(t) => setAnswer(s.promptId, t.slice(0, 150))}
            multiline
          />
          <Text style={styles.counter}>{s.answer.length}/150</Text>
        </View>
      ))}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const isSelected = selected.some((s) => s.promptId === item._id)
          return (
            <TouchableOpacity
              style={[styles.promptItem, isSelected && styles.promptSelected]}
              onPress={() => toggle(item)}
              disabled={!isSelected && selected.length >= 3}
            >
              <Text style={[styles.promptText, isSelected && styles.promptTextSelected]}>
                {item.question}
              </Text>
            </TouchableOpacity>
          )
        }}
        style={styles.list}
      />

      <TouchableOpacity
        style={[styles.button, (selected.length !== 3 || submitting) && styles.buttonDisabled]}
        onPress={onContinue}
        disabled={selected.length !== 3 || submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Sauvegarde...' : 'Continuer'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  title: { fontSize: 24, color: COLORS.textPrimary, fontFamily: 'Tiempos-Semibold', marginBottom: 16 },
  selectedCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  selectedQ: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 8 },
  answerInput: { color: COLORS.textPrimary, fontSize: 14, minHeight: 40 },
  counter: { color: COLORS.textSecondary, fontSize: 11, textAlign: 'right', marginTop: 4 },
  list: { flex: 1 },
  sectionTitle: { color: COLORS.accent, fontSize: 12, fontFamily: 'ModernEra-Bold', marginTop: 16, marginBottom: 8 },
  promptItem: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptSelected: { borderColor: COLORS.accent },
  promptText: { color: COLORS.textPrimary, fontSize: 14 },
  promptTextSelected: { color: COLORS.accent },
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
