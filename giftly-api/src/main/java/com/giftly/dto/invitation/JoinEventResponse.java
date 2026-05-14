package com.giftly.dto.invitation;

import com.giftly.dto.event.EventResponse;

/** Réponse retournée quand un utilisateur rejoint un événement via invitation */
public record JoinEventResponse(
        EventResponse event,
        Long myListId
) {}
