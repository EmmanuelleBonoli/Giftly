import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/services/api';

/** Écran de réinitialisation du mot de passe — atteint via deep link giftly://reset-password?token=... */
export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset(): Promise<void> {
    if (!password || password.length < 8) {
      Alert.alert('Minimum 8 caractères');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Lien invalide ou expiré.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Mot de passe mis à jour !</Text>
        <Button label="Se connecter" onPress={() => router.replace('/(auth)/login')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inner}>
          <Text style={styles.title}>Nouveau mot de passe</Text>
          <Input label="Mot de passe" value={password} onChangeText={setPassword} isPassword placeholder="Minimum 8 caractères" />
          <Input label="Confirmer" value={confirm} onChangeText={setConfirm} isPassword placeholder="Répète ton mot de passe" />
          <Button label="Enregistrer" onPress={handleReset} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  icon: { fontSize: 56, textAlign: 'center', marginTop: 80 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 24, textAlign: 'center' },
});
