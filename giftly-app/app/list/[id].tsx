import { useCallback, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/useAuthStore';
import { getItemsByList, addItem, deleteItem, reserveItem, unreserveItem } from '@/services/list-service';
import { WishItemCard } from '@/components/WishItemCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdBanner } from '@/components/AdBanner';
import { useEventSocket } from '@/hooks/useEventSocket';
import { useReservationSocket } from '@/hooks/useReservationSocket';
import type { WishItem, WishList } from '@/types';
import api from '@/services/api';

export default function WishListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [items, setItems] = useState<WishItem[]>([]);
  const [listOwnerId, setListOwnerId] = useState<number | null>(null);
  const [listOwnerName, setListOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const isMyList = listOwnerId === user?.id;
  const [eventId, setEventId] = useState<number>(0);

  // Mises à jour temps réel — item ajouté ou supprimé par le propriétaire
  useEventSocket({
    eventId,
    onItemAdded: (item) => {
      // On n'ajoute que si l'item appartient à cette liste
      if (item.listId === Number(id)) {
        setItems((prev) => {
          const exists = prev.some((i) => i.id === item.id);
          return exists ? prev : [...prev, item];
        });
      }
    },
    onItemDeleted: (itemId) => setItems((prev) => prev.filter((i) => i.id !== itemId)),
  });

  // Mises à jour temps réel — réservation reçue (jamais envoyée au propriétaire par le serveur)
  useReservationSocket({
    onReserved: (payload) => {
      if (payload.listId !== Number(id)) return;
      setItems((prev) => prev.map((i) =>
        i.id === payload.itemId
          ? { ...i, reserved: true, reservedBy: payload.reservedBy, reservedByName: payload.reservedByName ?? null }
          : i
      ));
    },
    onUnreserved: (payload) => {
      if (payload.listId !== Number(id)) return;
      setItems((prev) => prev.map((i) =>
        i.id === payload.itemId
          ? { ...i, reserved: false, reservedBy: null, reservedByName: null }
          : i
      ));
    },
  });

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Chargement des infos de la liste + items en parallèle
      const [itemsData, listData] = await Promise.all([
        getItemsByList(Number(id)),
        api.get<WishList>(`/lists/${id}`),
      ]);
      setItems(itemsData);
      setListOwnerId(listData.data.userId);
      setListOwnerName(listData.data.ownerName);
      setEventId(listData.data.eventId);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger la liste.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Pas de useFocusEffect ici — on charge une fois au mount
  useState(() => { loadItems(); });

  async function handleReserve(itemId: number): Promise<void> {
    try {
      const updated = await reserveItem(itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Impossible de réserver.';
      Alert.alert('Erreur', msg);
    }
  }

  async function handleUnreserve(itemId: number): Promise<void> {
    try {
      const updated = await unreserveItem(itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
    } catch {
      Alert.alert('Erreur', 'Impossible d\'annuler la réservation.');
    }
  }

  async function handleDelete(itemId: number): Promise<void> {
    Alert.alert('Supprimer', 'Retirer ce souhait de ta liste ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await deleteItem(itemId);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer ce souhait.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {isMyList ? 'Ma liste' : `Liste de ${listOwnerName}`}
          </Text>
          {isMyList && <Text style={styles.subtitle}>Seuls les autres voient tes réservations 🔒</Text>}
        </View>
        {isMyList && (
          <Pressable style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadItems} tintColor={Colors.primary} />}
        renderItem={({ item }) => (
          <WishItemCard
            item={item}
            isMyList={isMyList}
            onReserve={() => handleReserve(item.id)}
            onUnreserve={() => handleUnreserve(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{isMyList ? '✍️' : '🕊️'}</Text>
              <Text style={styles.emptyTitle}>{isMyList ? 'Ta liste est vide' : 'Liste vide'}</Text>
              <Text style={styles.emptyText}>
                {isMyList ? 'Ajoute tes souhaits en appuyant sur +' : 'Cette personne n\'a pas encore ajouté de souhaits.'}
              </Text>
            </View>
          ) : null
        }
      />

      <AdBanner />

      {isMyList && (
        <AddItemModal
          visible={showAddModal}
          listId={Number(id)}
          onClose={() => setShowAddModal(false)}
          onAdded={(item) => { setItems((prev) => [...prev, item]); setShowAddModal(false); }}
        />
      )}
    </SafeAreaView>
  );
}

interface AddItemModalProps {
  visible: boolean;
  listId: number;
  onClose: () => void;
  onAdded: (item: WishItem) => void;
}

function AddItemModal({ visible, listId, onClose, onAdded }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(): Promise<void> {
    if (!name.trim()) { Alert.alert('Le nom est obligatoire'); return; }
    setLoading(true);
    try {
      const item = await addItem(listId, {
        name: name.trim(),
        price: price ? parseFloat(price) : undefined,
        url: url.trim() || undefined,
        description: description.trim() || undefined,
      });
      onAdded(item);
      setName(''); setPrice(''); setUrl(''); setDescription('');
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ajouter ce souhait.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Ajouter un souhait</Text>
          <Input label="Nom *" value={name} onChangeText={setName} placeholder="Ex : Livre de cuisine" />
          <Input label="Prix (€)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="Ex : 25.00" />
          <Input label="Lien (optionnel)" value={url} onChangeText={setUrl} placeholder="https://..." keyboardType="url" />
          <Input label="Description (optionnel)" value={description} onChangeText={setDescription} placeholder="Taille, couleur..." multiline />
          <Button label="Ajouter à ma liste" onPress={handleAdd} loading={loading} />
          <Button label="Annuler" onPress={onClose} variant="ghost" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { padding: 4, marginRight: 8 },
  backText: { fontSize: 24, color: Colors.textPrimary },
  headerInfo: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 28 },
  list: { padding: 20, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalContent: { padding: 24, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 24 },
});
