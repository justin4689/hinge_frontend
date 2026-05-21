# CLAUDE.md — Frontend Hinge Clone (React Native Expo SDK 54)

## Stack & versions — DEFINITIF
- Framework : **Expo SDK 54** avec Expo Router v6 (file-based routing)
- Language : TypeScript (.tsx / .ts partout)
- State global : **Zustand** — PAS Redux, PAS Context pour le state global
- Data fetching : **@tanstack/react-query 5.x** (useQuery, useMutation, useInfiniteQuery)
- HTTP : **fetch natif** — PAS axios, aucune librairie HTTP externe
- Realtime : **socket.io-client 4.x**
- Push : **expo-notifications** — PAS @react-native-firebase, PAS notifee
- Photos picker : **expo-image-picker** — PAS react-native-image-picker
- Affichage images : **expo-image** — PAS react-native-fast-image
- Géolocalisation : **expo-location** — PAS react-native-geolocation-service
- Tokens JWT : **expo-secure-store** (chiffré) — PAS AsyncStorage pour les tokens
- Persist Zustand : **@react-native-async-storage/async-storage** — UNIQUEMENT pour l'objet user (non-sensible)
- Animations : react-native-reanimated 3.x (inclus Expo)
- Forms : react-hook-form
- Icônes : @expo/vector-icons → Ionicons (inclus Expo)
- Haptics : expo-haptics
- Paiement : @stripe/stripe-react-native

## Installation
```bash
npx create-expo-app@latest hinge-frontend --template blank-typescript
cd hinge-frontend
npx expo install expo-router
npx expo install expo-notifications expo-image-picker expo-location
npx expo install expo-image expo-secure-store expo-haptics expo-file-system
npx expo install @tanstack/react-query zustand
npx expo install @react-native-async-storage/async-storage
npx expo install socket.io-client
npx expo install react-native-reanimated react-hook-form
npx expo install @expo/vector-icons
npx expo install @stripe/stripe-react-native
npx expo install react-native-toast-message
```

## Structure des dossiers
```
hinge-frontend/
├── app/                            # Expo Router — chaque fichier = une route
│   ├── _layout.tsx                 # Root layout : QueryClientProvider + StripeProvider + setup notifications
│   ├── index.tsx                   # Redirect selon auth : /(auth)/login ou /(tabs)/feed
│   ├── paywall.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx             # Stack layout auth
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── onboarding/
│   │       ├── _layout.tsx         # Stack onboarding avec barre progression
│   │       ├── photos.tsx          # Step 1
│   │       ├── prompts.tsx         # Step 2
│   │       ├── basic-info.tsx      # Step 3
│   │       ├── education.tsx       # Step 4
│   │       ├── preferences.tsx     # Step 5
│   │       └── location.tsx        # Step 6
│   └── (tabs)/
│       ├── _layout.tsx             # Bottom tabs (Feed, Likes, Matches, Profile)
│       ├── feed.tsx
│       ├── likes.tsx
│       ├── matches/
│       │   ├── index.tsx           # Liste des matches
│       │   └── [matchId].tsx       # Chat screen (route dynamique)
│       └── profile/
│           ├── index.tsx
│           ├── edit.tsx
│           └── settings.tsx
├── components/
│   ├── ProfileCard/
│   │   └── index.tsx
│   ├── PromptCard.tsx
│   ├── LikeButton.tsx
│   ├── LikeCommentModal.tsx
│   ├── MatchAnimation.tsx
│   ├── MessageBubble.tsx
│   └── PlanGate.tsx
├── store/
│   ├── useAuthStore.ts
│   ├── useFeedStore.ts
│   └── useMatchesStore.ts
├── hooks/
│   ├── useSocket.ts
│   └── useNotifications.ts
├── api/
│   ├── client.ts               # wrapper fetch natif
│   └── endpoints/
│       ├── auth.ts
│       ├── profile.ts
│       ├── discover.ts
│       └── matches.ts
├── services/
│   └── socketService.ts        # singleton socket.io-client
├── utils/
│   ├── constants.ts            # COLORS, etc.
│   └── formatDate.ts
└── app.json
```

## Zustand — stores (PAS Redux, PAS dispatch, PAS slice)

### store/useAuthStore.ts
```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
// AsyncStorage ici UNIQUEMENT pour l'objet user (non-sensible)
// Les tokens JWT vont dans expo-secure-store, PAS ici

interface AuthStore {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-store', storage: createJSONStorage(() => AsyncStorage) }
  )
)
```

### store/useFeedStore.ts
```ts
// Pas de persist — le feed se recharge à chaque session
import { create } from 'zustand'
interface FeedStore {
  profiles: Profile[]
  cursor: string | null
  hasMore: boolean
  appendProfiles: (profiles: Profile[], nextCursor: string | null) => void
  removeProfile: (id: string) => void
  reset: () => void
}
export const useFeedStore = create<FeedStore>()((set) => ({
  profiles: [], cursor: null, hasMore: true,
  appendProfiles: (p, c) => set((s) => ({ profiles: [...s.profiles, ...p], cursor: c, hasMore: !!c })),
  removeProfile: (id) => set((s) => ({ profiles: s.profiles.filter(p => p._id !== id) })),
  reset: () => set({ profiles: [], cursor: null, hasMore: true })
}))
```

### store/useMatchesStore.ts
```ts
import { create } from 'zustand'
interface MatchesStore {
  matches: Match[]
  unreadCount: number
  setMatches: (matches: Match[]) => void
  addMatch: (match: Match) => void
  updateLastMessage: (matchId: string, lastMessage: string) => void
  incrementUnread: () => void
  resetUnread: () => void
}
export const useMatchesStore = create<MatchesStore>()((set) => ({
  matches: [], unreadCount: 0,
  setMatches: (matches) => set({ matches }),
  addMatch: (match) => set((s) => ({ matches: [match, ...s.matches] })),
  updateLastMessage: (matchId, lastMessage) =>
    set((s) => ({ matches: s.matches.map(m => m._id === matchId ? { ...m, lastMessage } : m) })),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 })
}))
```

## Fetch natif — api/client.ts (PAS axios)
```ts
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../store/useAuthStore'

const BASE = process.env.EXPO_PUBLIC_API_URL  // ex: http://localhost:5000/api

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync('accessToken')

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Refresh automatique si 401
  if (res.status === 401) {
    const refreshed = await tryRefreshToken()
    if (refreshed) return apiFetch(path, options)
    useAuthStore.getState().logout()
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
    throw { error: 'AUTH_REQUIRED' }
  }

  const data = await res.json()
  if (!res.ok) throw data  // { error: 'PLAN_REQUIRED', ... } → React Query onError le catch
  return data
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken')
    if (!refreshToken) return false
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const { data } = await res.json()
    await SecureStore.setItemAsync('accessToken', data.accessToken)
    return true
  } catch {
    return false
  }
}
```

## React Query — conventions
- Query keys : `['feed', filters]`, `['matches']`, `['messages', matchId]`, `['likes-received']`
- `staleTime` : 30 000ms pour le feed, 0 pour les messages
- Mutations avec update optimiste quand possible
- `onError` des mutations : lire `error.error` pour le code (`PLAN_REQUIRED`, etc.)

## Expo Router — conventions
- `app/index.tsx` : `const { user } = useAuthStore(); router.replace(user ? '/(tabs)/feed' : '/(auth)/login')`
- Navigation programmatique : `useRouter()` → `router.push()`, `router.replace()`
- Params de route dynamique : `useLocalSearchParams()` → ex: `const { matchId } = useLocalSearchParams()`
- Zustand **n'a pas besoin de Provider** — pas de wrapper dans `_layout.tsx` pour le store
- `app/_layout.tsx` wrape uniquement : `<QueryClientProvider>` + `<StripeProvider>`

## Variables d'environnement (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
EXPO_PUBLIC_STRIPE_KEY=pk_test_...
```
- Préfixe `EXPO_PUBLIC_` obligatoire pour que la valeur soit accessible côté client
- Accès : `process.env.EXPO_PUBLIC_API_URL`
- Jamais de secrets (clés privées, JWT secrets) dans ce fichier — tout est exposé côté client

## Tokens JWT — expo-secure-store (PAS AsyncStorage)
```ts
import * as SecureStore from 'expo-secure-store'
// Après login :
await SecureStore.setItemAsync('accessToken', data.accessToken)
await SecureStore.setItemAsync('refreshToken', data.refreshToken)
// Lecture :
const token = await SecureStore.getItemAsync('accessToken')
// Suppression (logout) :
await SecureStore.deleteItemAsync('accessToken')
await SecureStore.deleteItemAsync('refreshToken')
```

## Notifications Push — expo-notifications (PAS firebase)
```ts
// hooks/useNotifications.ts
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { apiFetch } from '../api/client'

export function useNotifications() {
  useEffect(() => {
    // Permission + récupération token Expo
    Notifications.requestPermissionsAsync().then(async ({ status }) => {
      if (status !== 'granted') return
      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId
      })
      // Envoyer au backend pour stocker dans User.expoPushToken
      apiFetch('/profile/expo-push-token', {
        method: 'PUT',
        body: JSON.stringify({ expoPushToken })
      })
    })

    // Notification reçue en foreground
    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      // Expo gère l'affichage automatiquement si setNotificationHandler configuré
    })

    // Tap sur notification (app en background)
    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      handleNavigation(data)
    })

    return () => { sub1.remove(); sub2.remove() }
  }, [])
}

function handleNavigation(data: any) {
  if (data.screen === 'Chat') router.push(`/matches/${data.matchId}`)
  else if (data.screen === 'Likes') router.push('/(tabs)/likes')
}
```

## Socket.io — services/socketService.ts (singleton)
```ts
import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

class SocketService {
  private socket: Socket | null = null

  async connect() {
    const token = await SecureStore.getItemAsync('accessToken')
    this.socket = io(process.env.EXPO_PUBLIC_SOCKET_URL!, {
      auth: { token },
      transports: ['websocket']
    })
  }

  disconnect() { this.socket?.disconnect(); this.socket = null }
  emit(event: string, data?: any) { this.socket?.emit(event, data) }
  on(event: string, cb: (data: any) => void) { this.socket?.on(event, cb) }
  off(event: string, cb?: (data: any) => void) { this.socket?.off(event, cb) }
  get isConnected() { return this.socket?.connected ?? false }
}

export default new SocketService()
```

## Design & UI — Brand Hinge officiel

### 🎨 Couleurs officielles (source : hinge.co/brand-resources)
```ts
// utils/constants.ts — COLORS officielles Hinge
export const COLORS = {
  // === Couleurs primaires (90%+ de l'UI) ===
  black:       '#1A1A1A',   // Hinge Black  — fond principal, texte
  white:       '#FFFEFD',   // Hinge White  — surfaces, cartes
  brightWhite: '#FFFFFF',   // Bright White — requis par certains OS

  // === Palette étendue (10% max de l'UI) ===
  midnight:    '#3E1768',   // violet foncé — features spéciales, modals
  aubergine:   '#67295F',   // violet-prune — boutons premium, accents
  lilac:       '#75457D',   // lilas         — secondaire violet
  mauve:       '#9F81A5',   // mauve clair   — états désactivés, subtils
  mist:        '#C7C7E5',   // bleu-lavande  — backgrounds légers
  sand:        '#CCAC9F',   // sable rosé    — touches chaleureuses
  pebble:      '#EEE1DB',   // beige clair   — surfaces secondaires
  stone:       '#484848',   // gris foncé    — texte secondaire, icônes
  forest:      '#025656',   // vert forêt    — succès, confirmations
  kelp:        '#097270',   // vert-teal     — Kohlrabi / accent nature
  coral:       '#D45847',   // rouge-orange  — alertes, erreurs, champs incomplets

  // === Alias sémantiques (à utiliser dans le code) ===
  background:     '#1A1A1A',  // = black
  surface:        '#FFFEFD',  // = white
  surfaceDark:    '#2A2A2A',  // surface légèrement plus claire que background
  textPrimary:    '#FFFEFD',  // texte sur fond noir
  textSecondary:  '#484848',  // = stone
  textOnWhite:    '#1A1A1A',  // texte sur fond blanc
  accent:         '#097270',  // = kelp (couleur nature signature)
  accentPurple:   '#3E1768',  // = midnight (features premium)
  error:          '#D45847',  // = coral
  border:         '#2A2A2A',  // séparateurs sur fond noir
  borderLight:    '#EEE1DB',  // = pebble, séparateurs sur fond blanc
}
```

### 🔤 Typographie officielle
- **Headlines** : `Tiempos Headline` (Semibold pour grands titres, Regular pour sous-titres)
- **Body / Boutons / Labels** : `Modern Era` (Bold, Semibold, Regular, Medium)
- Télécharger les fonts : https://files.hinge.co/2e5fb41ac9db100f3cbd88a75add162678acc250.zip/hinge_font_pack_d5729565d3.zip
- Intégrer dans Expo avec `expo-font` :
```ts
// app/_layout.tsx
import { useFonts } from 'expo-font'
const [fontsLoaded] = useFonts({
  'ModernEra-Regular':  require('../assets/fonts/ModernEra-Regular.otf'),
  'ModernEra-Medium':   require('../assets/fonts/ModernEra-Medium.otf'),
  'ModernEra-Bold':     require('../assets/fonts/ModernEra-Bold.otf'),
  'Tiempos-Light':      require('../assets/fonts/TiemposHeadline-Light.otf'),
  'Tiempos-Semibold':   require('../assets/fonts/TiemposHeadline-Semibold.otf'),
})
```
- Mettre les fichiers .otf dans `assets/fonts/`

### 📐 Règles d'usage couleur (respecter la distribution officielle)
- Noir (`#1A1A1A`) + Blanc (`#FFFEFD`) = **minimum 90% de chaque écran**
- Les couleurs de la palette étendue (midnight, kelp, coral...) = **max 10%**
- `coral (#D45847)` réservé aux erreurs, alertes, champs invalides
- `midnight (#3E1768)` et `aubergine (#67295F)` pour les features premium/modals

### 📦 Assets & Ressources officielles
```
Logo pack (SVG + PNG) :
https://files.hinge.co/942730a46478cc7dba9c705ec96dce4fab0933cb.zip/hinge_logos_64b5e8897d.zip

Font pack (Modern Era + Tiempos) :
https://files.hinge.co/2e5fb41ac9db100f3cbd88a75add162678acc250.zip/hinge_font_pack_d5729565d3.zip

Couleurs (fichier .ai Illustrator) :
https://stnew-strapi-hinge-dev.s3.amazonaws.com/hinge_palette_swatches_b4e45aa516.ai

Brand guidelines complètes :
https://hinge.co/brand-resources
```

### 🖼️ UI Kits Figma (pour référence design)
- **Likee Dating App** (55+ écrans, le plus proche Hinge) :
  https://www.figma.com/community/file/1286602676897133375
- **Modern Dating App UI Kit** (35+ écrans premium) :
  https://www.figma.com/community/file/1511674716470181835
- **Friendzy** (gratuit, dating + chat) :
  https://www.figma.com/community/file/1177513719243269243

### UI — principes d'application dans l'app
- Icônes : `import { Ionicons } from '@expo/vector-icons'` (inclus Expo, pas d'install)
- Feed Discovery = **FlatList verticale** — PAS de swipe gauche/droite
- Profil affiché **en entier** : carrousel photos horizontal + 3 prompt cards
- Like sur chaque photo ET chaque prompt → modal commentaire avant confirmation
- `expo-haptics` sur les actions like/match
- Fond des écrans : `COLORS.background` (#1A1A1A)
- Cartes / surfaces : `COLORS.surface` (#FFFEFD) avec texte `COLORS.textOnWhite`
- Boutons CTA primaires : fond `COLORS.black`, texte `COLORS.white`, font ModernEra-Bold
- Prompts cards : fond `COLORS.surface`, border `COLORS.borderLight`
- Badge "Hinge+" : couleur `COLORS.midnight` (#3E1768)
- Erreurs / champs invalides : `COLORS.coral` (#D45847)

## Navigation tabs — app/(tabs)/_layout.tsx
```ts
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
// Tabs : Feed (compass), Likes (heart + badge), Matches (chatbubble + badge), Profile (person)
```

## app.json — plugins obligatoires
```json
{
  "expo": {
    "scheme": "hinge-clone",
    "plugins": [
      "expo-router",
      "expo-secure-store",
      ["expo-notifications", { "icon": "./assets/notification-icon.png" }],
      ["expo-image-picker", { "photosPermission": "Pour choisir vos photos de profil" }],
      ["expo-location", { "locationWhenInUsePermission": "Pour voir les profils près de toi" }]
    ]
  }
}
```

## Performance
- `expo-image` pour toutes les images (cache intégré, `contentFit="cover"`)
- `FlatList` : `windowSize={3}`, `removeClippedSubviews={true}`, `maxToRenderPerBatch={2}`
- `React.memo` sur ProfileCard et PromptCard
- Images Cloudinary : URL avec transformation `/w_800,h_1000,c_fill/`
- `StyleSheet.create()` pour tous les styles, jamais de styles inline dans le JSX

## Ce qu'il ne faut PAS faire
- PAS axios → fetch natif via `apiFetch()`
- PAS Redux / redux-persist → Zustand uniquement
- PAS @react-native-firebase / notifee → expo-notifications
- PAS react-native-fast-image → expo-image
- PAS react-native-image-picker → expo-image-picker
- PAS react-native-geolocation-service → expo-location
- PAS stocker les tokens JWT dans AsyncStorage → expo-secure-store
- PAS de variables d'env sans préfixe `EXPO_PUBLIC_`
- PAS de `ScrollView` pour des listes longues → FlatList
- PAS de `alert()` natif → react-native-toast-message
- PAS de `KeyboardAvoidingView` oublié sur ChatScreen et écrans avec inputs
