import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { wsService } from '@/services/websocket-service';
import { STORAGE_KEYS } from '@/services/api';

/**
 * Layout racine — hydrate l'auth et gère le cycle de vie de la connexion WebSocket.
 *
 * Comportement :
 * - Connexion WS au login (dès que user passe de null à non-null)
 * - Déconnexion WS au logout (dès que user repasse à null)
 */
export default function RootLayout() {
  const { hydrate, isHydrated, user } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  // Connexion / déconnexion WS selon l'état d'authentification
  useEffect(() => {
    if (!isHydrated) return;

    if (user) {
      SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN).then((token) => {
        if (token) wsService.connect(token);
      });
    } else {
      wsService.disconnect();
    }
  }, [user, isHydrated]);

  if (!isHydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
});
