import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/colors';
import { API_BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email obligatoire';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Email invalide';
    if (!password) next.password = 'Mot de passe obligatoire';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin(): Promise<void> {
    if (!validate()) return;
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Connexion échouée', 'Email ou mot de passe incorrect.');
    }
  }

  async function handleGoogleLogin(): Promise<void> {
    // Ouvre le flow OAuth2 Google via le backend Spring Boot
    await WebBrowser.openAuthSessionAsync(
      `${API_BASE_URL}/auth/oauth2/authorize/google`,
      'giftly://oauth2/callback'
    );
    // Le deep link giftly://oauth2/callback est géré dans app/oauth2/callback.tsx
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🎁</Text>
          <Text style={styles.title}>Giftly</Text>
          <Text style={styles.subtitle}>Connecte-toi pour gérer tes cadeaux</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
            placeholder="ton@email.com"
          />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
            placeholder="••••••••"
          />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </Pressable>

          <Button label="Se connecter" onPress={handleLogin} loading={isLoading} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button label="Continuer avec Google" onPress={handleGoogleLogin} variant="outline" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>S'inscrire</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56 },
  title: { fontSize: 34, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' },
  form: { gap: 0 },
  forgotLink: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 12, color: Colors.textSecondary, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
