package com.giftly.service;

import com.giftly.dto.auth.AuthResponse;
import com.giftly.dto.auth.LoginRequest;
import com.giftly.dto.auth.RefreshRequest;
import com.giftly.dto.auth.RegisterRequest;
import com.giftly.model.User;
import com.giftly.repository.UserRepository;
import com.giftly.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Logique d'authentification email/password et refresh token */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Inscrit un nouvel utilisateur.
     *
     * @throws IllegalArgumentException si l'email est déjà utilisé
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        User user = userRepository.save(User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .build());

        return buildAuthResponse(user);
    }

    /**
     * Connecte un utilisateur par email/password.
     *
     * @throws org.springframework.security.core.AuthenticationException si les identifiants sont invalides
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Utilisateur introuvable après authentification"));

        return buildAuthResponse(user);
    }

    /**
     * Renouvelle l'access token à partir d'un refresh token valide.
     *
     * @throws IllegalArgumentException si le refresh token est invalide ou expiré
     */
    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();

        if (!jwtService.isValid(token)) {
            throw new IllegalArgumentException("Refresh token invalide ou expiré");
        }

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAvatarUrl(),
                user.getPlan()
        );
    }
}
