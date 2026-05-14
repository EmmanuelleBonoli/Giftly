package com.giftly.service;

import com.giftly.model.PasswordResetToken;
import com.giftly.model.User;
import com.giftly.repository.PasswordResetTokenRepository;
import com.giftly.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.invitation.base-url}")
    private String baseUrl;

    /**
     * Génère un token de réinitialisation et envoie un email.
     * Ne révèle pas si l'email existe ou non (protection contre l'énumération).
     */
    @Transactional
    public void requestReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = generateSecureToken();
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(2);

            tokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(expiresAt)
                    .build());

            emailService.sendPasswordResetEmail(email, user.getName(), token, expiresAt);
        });
    }

    /**
     * Valide le token et met à jour le mot de passe.
     *
     * @throws IllegalArgumentException si le token est invalide ou expiré
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de réinitialisation invalide"));

        if (!resetToken.isValid()) {
            throw new IllegalArgumentException("Ce lien de réinitialisation a expiré ou a déjà été utilisé");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[48];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
