package com.giftly.service;

import com.giftly.dto.item.CreateWishItemRequest;
import com.giftly.dto.item.WishItemResponse;
import com.giftly.model.*;
import com.giftly.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishItemService {

    private final WishItemRepository wishItemRepository;
    private final WishListRepository wishListRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EventService eventService;

    /**
     * Retourne les souhaits d'une liste.
     *
     * Règle de confidentialité : si l'appelant est le propriétaire de la liste,
     * les informations de réservation (reservedBy, reservedByName) sont masquées.
     * Seul le champ {@code reserved} (booléen) reste visible pour lui.
     */
    public List<WishItemResponse> getByList(Long listId, Long userId) {
        WishList list = findListOrThrow(listId);
        eventService.assertIsParticipant(list.getEvent().getId(), userId);

        boolean isOwner = list.getUser().getId().equals(userId);

        return wishItemRepository.findAllByListId(listId)
                .stream()
                .map(item -> toResponse(item, isOwner))
                .toList();
    }

    /**
     * Ajoute un souhait à une liste.
     * Seul le propriétaire de la liste peut y ajouter des souhaits.
     */
    @Transactional
    public WishItemResponse addItem(Long listId, CreateWishItemRequest request, Long userId) {
        WishList list = findListOrThrow(listId);
        assertIsListOwner(list, userId);

        WishItem item = wishItemRepository.save(WishItem.builder()
                .list(list)
                .name(request.name())
                .description(request.description())
                .url(request.url())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .build());

        // Le propriétaire voit ses propres items sans info de réservation
        return toResponse(item, true);
    }

    /**
     * Supprime un souhait.
     * Seul le propriétaire de la liste peut supprimer ses souhaits.
     */
    @Transactional
    public void deleteItem(Long itemId, Long userId) {
        WishItem item = findItemOrThrow(itemId);
        assertIsListOwner(item.getList(), userId);
        wishItemRepository.delete(item);
    }

    /**
     * Réserve un souhait pour l'utilisateur courant.
     * Un utilisateur ne peut pas réserver un souhait de sa propre liste.
     *
     * @throws IllegalStateException si le souhait est déjà réservé
     * @throws SecurityException     si l'appelant est le propriétaire de la liste
     */
    @Transactional
    public WishItemResponse reserve(Long itemId, Long userId) {
        WishItem item = findItemOrThrow(itemId);
        eventService.assertIsParticipant(item.getList().getEvent().getId(), userId);

        if (item.getList().getUser().getId().equals(userId)) {
            throw new SecurityException("Vous ne pouvez pas réserver un souhait de votre propre liste");
        }
        if (reservationRepository.existsByItemId(itemId)) {
            throw new IllegalStateException("Ce souhait est déjà réservé");
        }

        User reserver = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        reservationRepository.save(Reservation.builder()
                .item(item)
                .reservedBy(reserver)
                .build());

        // Recharge l'item avec la réservation
        item = findItemOrThrow(itemId);
        return toResponse(item, false);
    }

    /**
     * Annule une réservation.
     * Seul l'utilisateur qui a réservé peut annuler.
     */
    @Transactional
    public WishItemResponse unreserve(Long itemId, Long userId) {
        WishItem item = findItemOrThrow(itemId);
        Reservation reservation = reservationRepository.findByItemId(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Aucune réservation sur ce souhait"));

        if (!reservation.getReservedBy().getId().equals(userId)) {
            throw new SecurityException("Vous ne pouvez annuler que vos propres réservations");
        }

        reservationRepository.delete(reservation);
        item.setReservation(null);
        return toResponse(item, false);
    }

    // ── Privé ────────────────────────────────────────────────────────────────

    /**
     * Construit la réponse en appliquant le filtre de confidentialité.
     *
     * @param isOwner true si l'appelant est le propriétaire de la liste
     */
    private WishItemResponse toResponse(WishItem item, boolean isOwner) {
        Reservation reservation = item.getReservation();
        boolean isReserved = reservation != null;

        // Le propriétaire sait que son cadeau est réservé mais ne voit pas par qui
        Long reservedById = (isOwner || !isReserved) ? null : reservation.getReservedBy().getId();
        String reservedByName = (isOwner || !isReserved) ? null : reservation.getReservedBy().getName();

        return new WishItemResponse(
                item.getId(),
                item.getList().getId(),
                item.getName(),
                item.getDescription(),
                item.getUrl(),
                item.getPrice(),
                item.getImageUrl(),
                item.getCreatedAt(),
                isReserved,
                reservedById,
                reservedByName
        );
    }

    private void assertIsListOwner(WishList list, Long userId) {
        if (!list.getUser().getId().equals(userId)) {
            throw new SecurityException("Accès refusé : vous n'êtes pas propriétaire de cette liste");
        }
    }

    private WishList findListOrThrow(Long listId) {
        return wishListRepository.findById(listId)
                .orElseThrow(() -> new EntityNotFoundException("Liste introuvable : " + listId));
    }

    private WishItem findItemOrThrow(Long itemId) {
        return wishItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Souhait introuvable : " + itemId));
    }
}
