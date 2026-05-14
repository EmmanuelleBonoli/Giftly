package com.giftly.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration du broker STOMP.
 *
 * Topics utilisés :
 *  - /topic/event.{id}  → broadcast général à tous les participants
 *  - /user/queue/reservations → notifs de réservation (filtrage propriétaire côté serveur)
 *  - /user/queue/notifications → notifs privées (invitation reçue, etc.)
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Broker simple en mémoire pour les topics et les queues utilisateur
        registry.enableSimpleBroker("/topic", "/queue");
        // Préfixe pour les messages envoyés au serveur (controllers @MessageMapping)
        registry.setApplicationDestinationPrefixes("/app");
        // Préfixe pour les destinations utilisateur (/user/queue/...)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint natif WebSocket — utilisé par le client React Native
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*");

        // Endpoint SockJS — fallback pour les navigateurs web
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
