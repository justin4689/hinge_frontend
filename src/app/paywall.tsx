import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { COLORS } from '@/utils/constants'

export default function Paywall() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passe à Hinge+</Text>
      <Text style={styles.subtitle}>Vois qui t'a liké, booste ton profil et plus encore.</Text>
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Abonnement mensuel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Text style={styles.closeText}>Pas maintenant</Text>
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
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: COLORS.textPrimary,
    
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.midnight,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    
  },
  close: {
    padding: 12,
  },
  closeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
})
