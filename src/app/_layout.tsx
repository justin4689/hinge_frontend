import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StripeProvider } from '@stripe/stripe-react-native'
import * as Notifications from 'expo-notifications'
import { AndroidImportance } from 'expo-notifications'
import Toast from 'react-native-toast-message'
import { useFonts } from 'expo-font'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
    mutations: { retry: 0 },
  },
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'ModernEra-Regular': require('../assets/fonts/ModernEra-Regular.otf'),
    'ModernEra-Medium': require('../assets/fonts/ModernEra-Medium.otf'),
    'ModernEra-Bold': require('../assets/fonts/ModernEra-Bold.otf'),
    'Tiempos-Light': require('../assets/fonts/TiemposHeadline-Light.otf'),
    'Tiempos-Semibold': require('../assets/fonts/TiemposHeadline-Semibold.otf'),
  })

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('hinge', {
        name: 'Hinge',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#097270',
      })
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_KEY ?? ''}>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
      </StripeProvider>
    </QueryClientProvider>
  )
}
