import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Point d'entrée — redirige vers les tabs si connecté, sinon vers le login.
 * Ne s'affiche que quand isHydrated est true (géré dans _layout.tsx).
 */
export default function Index() {
  const { user } = useAuthStore();
  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}
