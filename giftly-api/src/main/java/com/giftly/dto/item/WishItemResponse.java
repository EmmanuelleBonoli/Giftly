package com.giftly.dto.item;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Représentation d'un souhait retournée au client.
 *
 * Règle de confidentialité : si l'appelant est le propriétaire de la liste,
 * reservedBy et reservedByName sont null même si une réservation existe.
 * Le champ reserved indique uniquement si le souhait est pris (sans révéler par qui).
 */
public record WishItemResponse(
        Long id,
        Long listId,
        String name,
        String description,
        String url,
        BigDecimal price,
        String imageUrl,
        LocalDateTime createdAt,
        /** true si réservé — visible par tous y compris le propriétaire */
        boolean reserved,
        /** null si l'appelant est le propriétaire de la liste */
        Long reservedBy,
        /** null si l'appelant est le propriétaire de la liste */
        String reservedByName
) {}
