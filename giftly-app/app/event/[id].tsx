import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { getListsByEvent, createInvitation } from '@/services/list-service';
import { AdBanner } from '@/components/AdBanner';
import { useEventSocket } from '@/hooks/useEventSocket';
import type { WishList } from '@/types';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [lists, setLists] = useState<WishList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Nouveau participant en temps réel → rechargement des listes
  useEventSocket({
    eventId: Number(id),
    onParticipantJoined: () => loadLists(),
  });

  const loadLists = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getListsByEvent(Number(id));
      setLists(data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les listes.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { loadLists(); }, [loadLists]));

  async function handleInvite(): Promise<void> {
    try {
      const { code, link } = await createInvitation(Number(id));
      await Share.share({
        message: `Rejoins mon événement Giftly 🎁\nCode : ${code}\nOu clique : ${link}`,
      });
    } catch {
      Alert.alert('Erreur', 'Impossible de créer une invitation.');
    }
  }

  const myList = lists.find((l) => l.userId === user?.id);
  const otherLists = lists.filter((l) => l.userId !== user?.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>Listes</Text>
        <Pressable onPress={handleInvite} style={styles.inviteBtn}>
          <Text style={styles.inviteBtnText}>Inviter</Text>
        </Pressable>
      </View>

      <FlatList
        data={otherLists}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadLists} tintColor={Colors.primary} />}
        ListHeaderComponent={
          myList ? (
            <Pressable style={[styles.listCard, styles.myCard]} onPress={() => router.push(`/list/${myList.id}`)}>
              <Text style={styles.myCardLabel}>Ma liste</Text>
              <Text style={styles.listName}>{user?.name}</Text>
              <Text style={styles.listMeta}>{myList.itemCount} souhait{myList.itemCount !== 1 ? 's' : ''}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.listCard} onPress={() => router.push(`/list/${item.id}`)}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>{item.ownerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{item.ownerName}</Text>
              <Text style={styles.listMeta}>{item.itemCount} souhait{item.itemCount !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !isLoading && otherLists.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Personne d'autre n'a encore rejoint cet événement.</Text>
              <Pressable onPress={handleInvite}>
                <Text style={styles.inviteLink}>Inviter des participants →</Text>
              </Pressable>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontSize: 24, color: Colors.textPrimary },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  inviteBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  inviteBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 20, gap: 10 },
  listCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  myCard: { borderWidth: 2, borderColor: Colors.primary },
  myCardLabel: { position: 'absolute', top: -10, left: 12, backgroundColor: Colors.primary, color: '#fff', fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarSmallText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  listInfo: { flex: 1 },
  listName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  listMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 20, color: Colors.textDisabled },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  inviteLink: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
});
