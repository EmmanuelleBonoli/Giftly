package com.giftly.websocket.dto;

/**
 * Payload envoyé individuellement sur /user/queue/reservations.
 *
 * Envoyé à chaque participant SAUF le propriétaire de la liste —
 * le filtrage est fait dans NotificationService avant l'envoi.
 */
public record WsReservationNotification(
        WsReservationType type,
        Long itemId,
        String itemName,
        Long listId,
        Long eventId,
        /** Null si annulation */
        Long reservedBy,
        /** Null si annulation */
        String reservedByName
) {
    public enum WsReservationType {
        ITEM_RESERVED,
        ITEM_UNRESERVED
    }
}
