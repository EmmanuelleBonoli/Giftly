import { useEffect } from 'react';
import { wsService } from '@/services/websocket-service';
import { WsTopics } from '@/constants/api';

interface WsReservationPayload {
  type: 'ITEM_RESERVED' | 'ITEM_UNRESERVED';
  itemId: number;
  itemName: string;
  listId: number;
  eventId: number;
  reservedBy?: number;
  reservedByName?: string;
}

interface UseReservationSocketOptions {
  onReserved?: (payload: WsReservationPayload) => void;
  onUnreserved?: (payload: WsReservationPayload) => void;
}

/**
 * S'abonne aux notifications de réservation personnelles (/user/queue/reservations).
 * Le serveur garantit que ces notifications n'arrivent jamais au propriétaire de la liste.
 */
export function useReservationSocket({ onReserved, onUnreserved }: UseReservationSocketOptions): void {
  useEffect(() => {
    const unsubscribe = wsService.subscribe(
      WsTopics.userReservations,
      (raw) => {
        const payload = raw as WsReservationPayload;
        if (payload.type === 'ITEM_RESERVED') {
          onReserved?.(payload);
        } else if (payload.type === 'ITEM_UNRESERVED') {
          onUnreserved?.(payload);
        }
      }
    );

    return unsubscribe;
  }, []);
}
