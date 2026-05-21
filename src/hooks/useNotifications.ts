import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { apiFetch } from '@/api/client'

export function useNotifications() {
  useEffect(() => {
    Notifications.requestPermissionsAsync().then(async ({ status }) => {
      if (status !== 'granted') return
      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
      apiFetch('/profile/expo-push-token', {
        method: 'PUT',
        body: JSON.stringify({ expoPushToken }),
      })
    })

    const sub1 = Notifications.addNotificationReceivedListener(() => {})

    const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      handleNavigation(data)
    })

    return () => {
      sub1.remove()
      sub2.remove()
    }
  }, [])
}

function handleNavigation(data: any) {
  if (data.screen === 'Chat') router.push(`/matches/${data.matchId}`)
  else if (data.screen === 'Likes') router.push('/(tabs)/likes')
}
