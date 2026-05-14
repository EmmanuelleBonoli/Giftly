package com.giftly.websocket;

import com.giftly.model.*;
import com.giftly.repository.EventParticipantRepository;
import com.giftly.repository.UserRepository;
import com.giftly.websocket.dto.WsEventBroadcast;
import com.giftly.websocket.dto.WsReservationNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service central d'envoi des notifications WebSocket.
 *
 * Règle de confidentialité des réservations :
 * On envoie la notification individuellement à chaque participant,
 * en excluant le propriétaire de la liste concernée.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final EventParticipantRepository participantRepository;
    private final UserRepository userRepository;

    /**
     * Broadcast général à tous les participants d'un événement.
     * Utilisé pour : ajout/suppression d'item, nouveau participant.
     */
    public void broadcastEventUpdate(Long eventId, WsEventBroadcast payload) {
        String destination = "/topic/event." + eventId;
        messagingTemplate.convertAndSend(destination, payload);
        log.debug("Broadcast [{}] → {}", payload.type(), destination);
    }

    /**
     * Notifie une réservation à tous les participants SAUF le propriétaire de la liste.
     *
     * La confidentialité est garantie côté serveur : le propriétaire de la liste
     * ne reçoit jamais d'information sur qui a réservé quoi dans sa propre liste.
     */
    public void notifyReservation(WishItem item, WsReservationNotification payload) {
        Long listOwnerId = item.getList().getUser().getId();
        Long eventId = item.getList().getEvent().getId();

        List<EventParticipant> participants = participantRepository
                .findAllByEventId(eventId);

        participants.stream()
                .map(EventParticipant::getUser)
                .filter(user -> !user.getId().equals(listOwnerId))
                .forEach(user -> sendToUser(user.getEmail(), "/queue/reservations", payload));
    }

    /**
     * Notifie un utilisateur spécifique (invitation reçue, etc.).
     */
    public void notifyUser(String userEmail, Object payload) {
        sendToUser(userEmail, "/queue/notifications", payload);
    }

    // ── Privé ────────────────────────────────────────────────────────────────

    private void sendToUser(String email, String destination, Object payload) {
        try {
            messagingTemplate.convertAndSendToUser(email, destination, payload);
            log.debug("Notification → {} {}", email, destination);
        } catch (Exception e) {
            // Un utilisateur déconnecté ne doit pas faire échouer l'opération
            log.debug("Utilisateur {} non connecté, notification ignorée : {}", email, e.getMessage());
        }
    }
}
