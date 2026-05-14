import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useEventStore } from '@/stores/useEventStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdBanner } from '@/components/AdBanner';
import type { Event } from '@/types';

type Mode = 'menu' | 'create' | 'join';

export default function NewEventScreen() {
  const [mode, setMode] = useState<Mode>('menu');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {mode === 'menu' && <MenuView onSelect={setMode} />}
      {mode === 'create' && <CreateView onBack={() => setMode('menu')} />}
      {mode === 'join' && <JoinView onBack={() => setMode('menu')} />}
      <AdBanner />
    </SafeAreaView>
  );
}

function MenuView({ onSelect }: { onSelect: (mode: Mode) => void }) {
  const { user } = useAuthStore();
  const { events } = useEventStore();
  const activeCount = events.filter((e) => e.isActive && e.createdById === user?.id).length;
  const atLimit = user?.plan === 'FREE' && activeCount >= 2;

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>Nouveau</Text>

      <View style={styles.option}>
        <Text style={styles.optionIcon}>✨</Text>
        <Text style={styles.optionTitle}>Créer un événement</Text>
        <Text style={styles.optionDesc}>Lance un Noël, un anniversaire ou n'importe quelle occasion</Text>
        {atLimit && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>Limite atteinte — passe en Premium pour continuer</Text>
          </View>
        )}
        <Button label="Créer" onPress={() => onSelect('create')} disabled={atLimit} />
      </View>

      <View style={styles.divider} />

      <View style={styles.option}>
        <Text style={styles.optionIcon}>🔗</Text>
        <Text style={styles.optionTitle}>Rejoindre un événement</Text>
        <Text style={styles.optionDesc}>Entre le code reçu par quelqu'un ou utilise le lien d'invitation</Text>
        <Button label="Rejoindre" onPress={() => onSelect('join')} variant="outline" />
      </View>
    </View>
  );
}

function CreateView({ onBack }: { onBack: () => void }) {
  const { createEvent } = useEventStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<Event['type']>('OTHER');
  const [loading, setLoading] = useState(false);

  const types: { value: Event['type']; label: string; icon: string }[] = [
    { value: 'CHRISTMAS', label: 'Noël', icon: '🎄' },
    { value: 'BIRTHDAY', label: 'Anniversaire', icon: '🎂' },
    { value: 'OTHER', label: 'Autre', icon: '🎁' },
  ];

  async function handleCreate(): Promise<void> {
    if (!name.trim()) { Alert.alert('Donne un nom à ton événement'); return; }
    setLoading(true);
    try {
      const event = await createEvent({ name: name.trim(), type });
      router.replace(`/event/${event.id}`);
    } catch {
      Alert.alert('Erreur', 'Impossible de créer l\'événement.');
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <Button label="← Retour" onPress={onBack} variant="ghost" />
        <Text style={styles.title}>Créer un événement</Text>

        <Input label="Nom de l'événement" value={name} onChangeText={setName} placeholder="Ex : Noël 2025 famille" />

        <Text style={styles.fieldLabel}>Type</Text>
        <View style={styles.typeRow}>
          {types.map((t) => (
            <View
              key={t.value}
              style={[styles.typeChip, type === t.value && styles.typeChipActive]}
            >
              <Text
                style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}
                onPress={() => setType(t.value)}
              >
                {t.icon} {t.label}
              </Text>
            </View>
          ))}
        </View>

        <Button label="Créer l'événement" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function JoinView({ onBack }: { onBack: () => void }) {
  const { joinByCode } = useEventStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleJoin(): Promise<void> {
    if (!code.trim()) { Alert.alert('Entre le code d\'invitation'); return; }
    setLoading(true);
    try {
      const result = await joinByCode(code.trim().toUpperCase());
      router.replace(`/event/${result.event.id}`);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Code invalide ou expiré.';
      Alert.alert('Erreur', msg);
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.formContainer}>
        <Button label="← Retour" onPress={onBack} variant="ghost" />
        <Text style={styles.title}>Rejoindre un événement</Text>
        <Input
          label="Code d'invitation"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="Ex : NOEL25"
          autoCapitalize="characters"
          maxLength={10}
        />
        <Button label="Rejoindre" onPress={handleJoin} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  menuContainer: { flex: 1, padding: 24 },
  formContainer: { flexGrow: 1, padding: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginBottom: 28, marginTop: 8 },
  option: { marginBottom: 8 },
  optionIcon: { fontSize: 32, marginBottom: 8 },
  optionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  optionDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 14 },
  limitBadge: { backgroundColor: '#FFF5F5', borderRadius: 8, padding: 10, marginBottom: 12 },
  limitText: { fontSize: 13, color: Colors.error, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  typeChip: { flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, paddingVertical: 10, alignItems: 'center' },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: '#FFF5F5' },
  typeChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  typeChipTextActive: { color: Colors.primary },
});
