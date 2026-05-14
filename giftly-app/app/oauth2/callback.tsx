import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Écran de callback OAuth2 — gère le deep link giftly://oauth2/callback.
 * Le backend y redirige avec ?accessToken=...&refreshToken=...
 * après le flow Google OAuth2.
 */
export default function OAuth2CallbackScreen() {
  const { accessToken, refreshToken, userId, email, name, avatarUrl, plan } = useLocalSearchParams<{
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    name: string;
    avatarUrl?: string;
    plan: string;
  }>();

  const { loginWithTokens } = useAuthStore();

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      router.replace('/(auth)/login');
      return;
    }

    loginWithTokens(accessToken, refreshToken, {
      id: Number(userId),
      email,
      name,
      avatarUrl,
      plan: plan as 'FREE' | 'PREMIUM',
    }).then(() => {
      router.replace('/(tabs)');
    });
  }, [accessToken, refreshToken]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
});
