import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useMatchesStore } from '../../store/useMatchesStore'
import { COLORS } from '../../utils/constants'

export default function TabsLayout() {
  const unreadCount = useMatchesStore((s) => s.unreadCount)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.background, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.stone,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
