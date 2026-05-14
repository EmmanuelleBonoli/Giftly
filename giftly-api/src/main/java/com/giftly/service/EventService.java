package com.giftly.service;

import com.giftly.dto.event.CreateEventRequest;
import com.giftly.dto.event.EventResponse;
import com.giftly.model.*;
import com.giftly.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final WishListRepository wishListRepository;
    private final UserRepository userRepository;

    @Value("${app.freemium.max-active-events}")
    private int maxActiveEvents;

    /**
     * Retourne tous les événements auxquels l'utilisateur participe.
     */
    public List<EventResponse> getMyEvents(Long userId) {
        return eventRepository.findAllByParticipantUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Retourne un événement par son id, en vérifiant que l'appelant est participant.
     */
    public EventResponse getById(Long eventId, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertIsParticipant(eventId, userId);
        return toResponse(event);
    }

    /**
     * Crée un événement et inscrit automatiquement le créateur comme ADMIN.
     * Vérifie la limite freemium avant la création.
     *
     * @throws IllegalStateException si la limite d'événements actifs est atteinte
     */
    @Transactional
    public EventResponse create(CreateEventRequest request, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        // Vérification freemium
        if (creator.getPlan() == Plan.FREE) {
            long activeCount = eventRepository.countByCreatedByIdAndActiveTrue(userId);
            if (activeCount >= maxActiveEvents) {
                throw new IllegalStateException(
                        "Limite atteinte : un compte gratuit ne peut gérer que "
                        + maxActiveEvents + " événements actifs. Passez à Premium pour continuer."
                );
            }
        }

        Event event = eventRepository.save(Event.builder()
                .name(request.name())
                .type(request.type())
                .eventDate(request.eventDate())
                .createdBy(creator)
                .build());

        // Inscription automatique du créateur comme admin
        participantRepository.save(EventParticipant.builder()
                .id(new EventParticipantId(event.getId(), userId))
                .event(event)
                .user(creator)
                .role(ParticipantRole.ADMIN)
                .build());

        // Création automatique de la liste de souhaits du créateur
        wishListRepository.save(WishList.builder()
                .event(event)
                .user(creator)
                .build());

        return toResponse(event);
    }

    /**
     * Archive un événement (le rend inactif).
     * Seul l'ADMIN peut archiver.
     */
    @Transactional
    public EventResponse archive(Long eventId, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertIsAdmin(eventId, userId);

        event.setActive(false);
        return toResponse(eventRepository.save(event));
    }

    // ── Méthodes package-private utilisées par d'autres services ────────────

    void assertIsParticipant(Long eventId, Long userId) {
        if (!participantRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new SecurityException("Accès refusé : vous ne participez pas à cet événement");
        }
    }

    // ── Privé ────────────────────────────────────────────────────────────────

    private void assertIsAdmin(Long eventId, Long userId) {
        EventParticipant participant = participantRepository
                .findById(new EventParticipantId(eventId, userId))
                .orElseThrow(() -> new SecurityException("Accès refusé"));

        if (participant.getRole() != ParticipantRole.ADMIN) {
            throw new SecurityException("Accès refusé : seul l'administrateur peut effectuer cette action");
        }
    }

    private Event findEventOrThrow(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Événement introuvable : " + eventId));
    }

    private EventResponse toResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getType(),
                event.getEventDate(),
                event.getCreatedBy().getId(),
                event.getCreatedBy().getName(),
                event.isActive(),
                event.getParticipants().size(),
                event.getCreatedAt()
        );
    }
}
