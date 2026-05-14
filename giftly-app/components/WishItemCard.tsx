import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { WishItem } from '@/types';

interface WishItemCardProps {
  item: WishItem;
  isMyList: boolean;
  onReserve?: () => void;
  onUnreserve?: () => void;
  onDelete?: () => void;
}

export function WishItemCard({ item, isMyList, onReserve, onUnreserve, onDelete }: WishItemCardProps) {
  const canReserve = !isMyList && !item.reserved;
  const canUnreserve = !isMyList && item.reserved && item.reservedBy !== undefined;

  return (
    <View style={[styles.card, item.reserved && styles.reservedCard]}>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

        {item.price != null && (
          <Text style={styles.price}>{item.price.toFixed(2)} €</Text>
        )}

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        ) : null}

        {/* Statut réservation — le propriétaire voit uniquement le cadenas */}
        {item.reserved && isMyList && (
          <View style={styles.reservedBadge}>
            <Text style={styles.reservedBadgeText}>🔒 Déjà prévu par quelqu'un</Text>
          </View>
        )}
        {item.reserved && !isMyList && item.reservedByName && (
          <View style={styles.reservedBadge}>
            <Text style={styles.reservedBadgeText}>✅ Réservé par {item.reservedByName}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {canReserve && (
          <Pressable style={styles.reserveBtn} onPress={onReserve}>
            <Text style={styles.reserveBtnText}>Je le prends</Text>
          </Pressable>
        )}
        {canUnreserve && (
          <Pressable style={styles.unreserveBtn} onPress={onUnreserve}>
            <Text style={styles.unreserveBtnText}>Annuler</Text>
          </Pressable>
        )}
        {isMyList && !item.reserved && (
          <Pressable style={styles.deleteBtn} onPress={onDelete}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  reservedCard: { opacity: 0.75 },
  main: { flex: 1, marginBottom: 10 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  price: { fontSize: 14, color: Colors.primary, fontWeight: '600', marginTop: 4 },
  description: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  reservedBadge: { marginTop: 8, backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  reservedBadgeText: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  reserveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  reserveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  unreserveBtn: { flex: 1, backgroundColor: Colors.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  unreserveBtnText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  deleteBtn: { width: 42, backgroundColor: '#FFF5F5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 16 },
});
