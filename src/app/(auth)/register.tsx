import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'
import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import { COLORS } from '@/utils/constants'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>()

  const setUser = useAuthStore((s) => s.setUser)
  const password = watch('password')

  const onSubmit = async (values: RegisterForm) => {
    try {
      const res = await apiFetch<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
      })
      await SecureStore.setItemAsync('accessToken', res.data.accessToken)
      await SecureStore.setItemAsync('refreshToken', res.data.refreshToken)
      setUser(res.data.user)
      router.push('/(auth)/onboarding/photos')
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: err?.message ?? 'Inscription impossible' })
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Créer un compte</Text>

        <Controller
          control={control}
          name="name"
          rules={{ required: 'Prénom requis' }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Prénom"
              placeholderTextColor={COLORS.textSecondary}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        <Controller
          control={control}
          name="email"
          rules={{ required: 'Email requis', pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalide' } }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Mot de passe requis', minLength: { value: 8, message: 'Minimum 8 caractères' } }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mot de passe"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Confirmation requise',
            validate: (val) => val === password || 'Les mots de passe ne correspondent pas',
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Inscription...' : 'S\'inscrire'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 32,
    color: COLORS.textPrimary,
    
    marginBottom: 32,
  },
  input: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: { borderColor: COLORS.error },
  error: { color: COLORS.error, fontSize: 12, marginBottom: 8, marginTop: -8 },
  button: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.black,  fontSize: 16 },
  link: { alignItems: 'center', marginTop: 24 },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
})
