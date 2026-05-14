package com.giftly.service;

import com.giftly.dto.event.EventResponse;
import com.giftly.dto.invitation.CreateInvitationRequest;
import com.giftly.dto.invitation.InvitationResponse;
import com.giftly.dto.invitation.JoinEventResponse;
import com.giftly.model.*;
import com.giftly.repository.*;
import com.giftly.websocket.NotificationService;
import com.giftly.websocket.dto.WsEventBroadcast;
import com.giftly.websocket.dto.WsEventBroadcast.WsEventType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final WishListRepository wishListRepository;
    private final UserRepository userRepository;
    private final EventService eventService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.invitation.expiration-hours}")
    private int expirationHours;

    @Value("${app.invitation.base-url}")
    private String baseUrl;

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Crée une invitation pour un événement.
     * Seul un participant ADMIN peut inviter.
     * Si un email est fourni, un email est envoyé en asynchrone.
     */
    @Transactional
    public InvitationResponse create(Long eventId, CreateInvitationRequest request, Long userId) {
        Event event = findEventOrThrow(eventId);
        eventService.assertIsParticipant(eventId, userId);

        User inviter = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        String code = generateUniqueCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(expirationHours);

        Invitation invitation = invitationRepository.save(Invitation.builder()
                .event(event)
                .code(code)
                .email(request != null ? request.email() : null)
                .expiresAt(expiresAt)
                .build());

        // Envoi email si un destinataire est précisé
        if (invitation.getEmail() != null && !invitation.getEmail().isBlank()) {
            emailService.sendInvitationEmail(
                    invitation.getEmail(),
                    inviter.getName(),
                    event.getName(),
                    code,
                    expiresAt
            );
        }

        return toResponse(invitation);
    }

    /**
     * Rejoint un événement via un code d'invitation.
     * Crée automatiquement la liste de souhaits du nouvel arrivant.
     *
     * @throws IllegalArgumentException si le code est invalide ou expiré
     * @throws IllegalStateException    si l'utilisateur est déjà participant
     */
    @Transactional
    public JoinEventResponse joinByCode(String code, Long userId) {
        Invitation invitation = invitationRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Code d'invitation invalide"));

        if (!invitation.isValid()) {
            throw new IllegalArgumentException("Cette invitation a expiré ou a déjà été utilisée");
        }

        Long eventId = invitation.getEvent().getId();

        if (participantRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new IllegalStateException("Vous participez déjà à cet événement");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        // Inscription comme membre
        participantRepository.save(EventParticipant.builder()
                .id(new EventParticipantId(eventId, userId))
                .event(invitation.getEvent())
                .user(user)
                .role(ParticipantRole.MEMBER)
                .build());

        // Création automatique de la liste de souhaits
        WishList myList = wishListRepository.save(WishList.builder()
                .event(invitation.getEvent())
                .user(user)
                .build());

        // Marquer l'invitation comme utilisée
        invitation.setUsedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        EventResponse eventResponse = eventService.getById(eventId, userId);

        // Notification broadcast — nouveau participant visible par tous
        notificationService.broadcastEventUpdate(
                eventId,
                new WsEventBroadcast(WsEventType.PARTICIPANT_JOINED, eventId,
                        java.util.Map.of("userId", user.getId(), "name", user.getName()))
        );

        return new JoinEventResponse(eventResponse, myList.getId());
    }

    // ── Privé ────────────────────────────────────────────────────────────────

    /**
     * Génère un code alphanumérique unique de 6 caractères.
     * Boucle jusqu'à trouver un code non existant en base (collision très rare).
     */
    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            code = sb.toString();
        } while (invitationRepository.existsByCode(code));
        return code;
    }

    private Event findEventOrThrow(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Événement introuvable : " + eventId));
    }

    private InvitationResponse toResponse(Invitation invitation) {
        String link = "giftly://join?code=" + invitation.getCode();
        return new InvitationResponse(
                invitation.getId(),
                invitation.getEvent().getId(),
                invitation.getEvent().getName(),
                invitation.getCode(),
                link,
                invitation.getEmail(),
                invitation.getExpiresAt(),
                invitation.getUsedAt() != null
        );
    }
}
