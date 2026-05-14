import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Event } from '@/types';

const EVENT_ICONS: Record<Event['type'], string> = {
  CHRISTMAS: '🎄',
  BIRTHDAY: '🎂',
  OTHER: '🎁',
};

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed, !event.isActive && styles.archived]}
      onPress={onPress}
    >
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{EVENT_ICONS[event.type]}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{event.name}</Text>
        <Text style={styles.meta}>
          {event.participantCount} participant{event.participantCount > 1 ? 's' : ''}
          {event.eventDate ? ` · ${formatDate(event.eventDate)}` : ''}
        </Text>
      </View>
      {!event.isActive && <View style={styles.badge}><Text style={styles.badgeText}>Archivé</Text></View>}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pressed: { opacity: 0.85 },
  archived: { opacity: 0.6 },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 22 },
  content: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: Colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 },
  badgeText: { fontSize: 11, color: Colors.textSecondary },
  arrow: { fontSize: 20, color: Colors.textDisabled },
});
