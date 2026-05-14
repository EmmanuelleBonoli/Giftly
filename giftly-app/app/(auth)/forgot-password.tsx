import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSend(): Promise<void> {
    if (!email.trim()) {
      Alert.alert('Email requis');
      return;
    }
    setLoading(true);
    // TODO étape future — endpoint /auth/forgot-password à implémenter côté backend
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>📬</Text>
        <Text style={styles.title}>Email envoyé !</Text>
        <Text style={styles.subtitle}>
          Si un compte existe avec {email}, tu recevras un lien de réinitialisation.
        </Text>
        <Button label="Retour à la connexion" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>
          Entre ton adresse email et on t'enverra un lien pour réinitialiser ton mot de passe.
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="ton@email.com"
        />
        <Button label="Envoyer le lien" onPress={handleSend} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 24, backgroundColor: Colors.background },
  backButton: { marginTop: 16, marginBottom: 24 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  icon: { fontSize: 56, textAlign: 'center', marginTop: 60, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
});
