import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Nom obligatoire';
    if (!email.trim()) next.email = 'Email obligatoire';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Email invalide';
    if (!password) next.password = 'Mot de passe obligatoire';
    else if (password.length < 8) next.password = 'Minimum 8 caractères';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister(): Promise<void> {
    if (!validate()) return;
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Une erreur est survenue.';
      Alert.alert('Inscription échouée', message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoins Giftly gratuitement</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Prénom ou pseudo"
            value={name}
            onChangeText={setName}
            error={errors.name}
            placeholder="Ex: Marie"
          />
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
            placeholder="Minimum 8 caractères"
          />

          <View style={styles.planInfo}>
            <Text style={styles.planText}>
              🎁 Compte gratuit — 2 événements actifs inclus
            </Text>
          </View>

          <Button label="Créer mon compte" onPress={handleRegister} loading={isLoading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.footerLink}>Se connecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 32, marginTop: 16 },
  backButton: { marginBottom: 24 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 4 },
  form: { gap: 0 },
  planInfo: {
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  planText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
