package com.giftly.dto.invitation;

import java.time.LocalDateTime;

public record InvitationResponse(
        Long id,
        Long eventId,
        String eventName,
        /** Code court à partager (ex: "NOEL25") */
        String code,
        /** Lien deep link complet pour l'app mobile */
        String link,
        String email,
        LocalDateTime expiresAt,
        boolean used
) {}
