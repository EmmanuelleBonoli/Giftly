import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { AdBanner } from '@/components/AdBanner';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  function handleLogout(): void {
    Alert.alert('Déconnexion', 'Tu veux vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.planBadge}>
          <Text style={styles.planText}>
            {user?.plan === 'PREMIUM' ? '⭐ Premium' : '🆓 Gratuit — 2 événements actifs'}
          </Text>
        </View>

        <View style={styles.separator} />

        <Pressable style={styles.row} onPress={handleLogout}>
          <Text style={styles.rowTextDanger}>Se déconnecter</Text>
        </Pressable>
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, alignSelf: 'flex-start', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  email: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  planBadge: { marginTop: 12, backgroundColor: '#FFF5F5', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  planText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  separator: { width: '100%', height: 1, backgroundColor: Colors.border, marginTop: 32, marginBottom: 8 },
  row: { width: '100%', paddingVertical: 16 },
  rowTextDanger: { fontSize: 16, color: Colors.error, fontWeight: '600' },
});
