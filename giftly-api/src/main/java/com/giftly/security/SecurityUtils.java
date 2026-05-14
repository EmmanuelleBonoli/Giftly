package com.giftly.security;

import com.giftly.model.User;
import com.giftly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utilitaire pour récupérer l'utilisateur courant depuis le SecurityContext.
 * Injecté dans les services qui ont besoin de l'identité de l'appelant.
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    /**
     * Retourne l'utilisateur authentifié courant.
     *
     * @throws IllegalStateException si aucun utilisateur n'est authentifié
     */
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Utilisateur courant introuvable : " + email));
    }

    /** Retourne uniquement l'id de l'utilisateur courant */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
