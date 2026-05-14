package com.giftly.service;

import com.giftly.dto.list.WishListResponse;
import com.giftly.model.WishList;
import com.giftly.repository.WishListRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishListService {

    private final WishListRepository wishListRepository;
    private final EventService eventService;

    /**
     * Retourne toutes les listes de souhaits d'un événement.
     * L'appelant doit être participant à l'événement.
     */
    public List<WishListResponse> getByEvent(Long eventId, Long userId) {
        eventService.assertIsParticipant(eventId, userId);
        return wishListRepository.findAllByEventId(eventId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Retourne une liste par son id.
     * L'appelant doit être participant à l'événement associé.
     */
    public WishListResponse getById(Long listId, Long userId) {
        WishList list = findOrThrow(listId);
        eventService.assertIsParticipant(list.getEvent().getId(), userId);
        return toResponse(list);
    }

    // ── Méthodes package-private ─────────────────────────────────────────────

    WishList findOrThrow(Long listId) {
        return wishListRepository.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("Liste introuvable : " + listId));
    }

    // ── Privé ────────────────────────────────────────────────────────────────

    private WishListResponse toResponse(WishList list) {
        return new WishListResponse(
                list.getId(),
                list.getEvent().getId(),
                list.getUser().getId(),
                list.getUser().getName(),
                list.getUser().getAvatarUrl(),
                list.getItems().size()
        );
    }
}
