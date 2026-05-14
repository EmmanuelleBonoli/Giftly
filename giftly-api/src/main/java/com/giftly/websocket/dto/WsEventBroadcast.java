package com.giftly.websocket.dto;

/**
 * Payload broadcast général sur /topic/event.{eventId}.
 * Envoyé à tous les participants sans restriction.
 */
public record WsEventBroadcast(
        WsEventType type,
        Long eventId,
        Object data
) {
    public enum WsEventType {
        PARTICIPANT_JOINED,
        ITEM_ADDED,
        ITEM_DELETED
    }
}
