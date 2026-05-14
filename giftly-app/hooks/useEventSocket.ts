import { useEffect } from 'react';
import { wsService } from '@/services/websocket-service';
import { WsTopics } from '@/constants/api';
import type { WishItem } from '@/types';

interface WsEventPayload {
  type: 'PARTICIPANT_JOINED' | 'ITEM_ADDED' | 'ITEM_DELETED';
  eventId: number;
  data: unknown;
}

interface UseEventSocketOptions {
  eventId: number;
  onItemAdded?: (item: WishItem) => void;
  onItemDeleted?: (itemId: number) => void;
  onParticipantJoined?: (data: { userId: number; name: string }) => void;
}

/**
 * S'abonne aux broadcasts généraux d'un événement.
 * Appelé dans les écrans qui affichent des listes ou des participants.
 */
export function useEventSocket({ eventId, onItemAdded, onItemDeleted, onParticipantJoined }: UseEventSocketOptions): void {
  useEffect(() => {
    const unsubscribe = wsService.subscribe(
      WsTopics.eventBroadcast(eventId),
      (raw) => {
        const payload = raw as WsEventPayload;
        switch (payload.type) {
          case 'ITEM_ADDED':
            onItemAdded?.(payload.data as WishItem);
            break;
          case 'ITEM_DELETED':
            onItemDeleted?.(payload.data as number);
            break;
          case 'PARTICIPANT_JOINED':
            onParticipantJoined?.(payload.data as { userId: number; name: string });
            break;
        }
      }
    );

    return unsubscribe;
  }, [eventId]);
}
