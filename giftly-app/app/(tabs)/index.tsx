import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEventStore } from '@/stores/useEventStore';
import { EventCard } from '@/components/EventCard';
import { AdBanner } from '@/components/AdBanner';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { events, isLoading, fetchMyEvents } = useEventStore();

  // Rechargement à chaque fois que l'onglet est affiché
  useFocusEffect(
    useCallback(() => {
      fetchMyEvents().catch(() => {});
    }, [])
  );

  const activeEvents = events.filter((e) => e.isActive);
  const archivedEvents = events.filter((e) => !e.isActive);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.subtitle}>Tes événements cadeaux</Text>
      </View>

      <FlatList
        data={activeEvents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchMyEvents} tintColor={Colors.primary} />
        }
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => router.push(`/event/${item.id}`)} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyTitle}>Aucun événement actif</Text>
              <Text style={styles.emptyText}>Crée ou rejoins un événement depuis l'onglet +</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          archivedEvents.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Archivés</Text>
              {archivedEvents.map((e) => (
                <EventCard key={e.id} event={e} onPress={() => router.push(`/event/${e.id}`)} />
              ))}
            </View>
          ) : null
        }
      />

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  greeting: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
});
