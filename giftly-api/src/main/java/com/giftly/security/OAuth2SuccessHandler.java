package com.giftly.security;

import com.giftly.model.OAuthAccount;
import com.giftly.model.User;
import com.giftly.repository.OAuthAccountRepository;
import com.giftly.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

/**
 * Handler déclenché après un succès OAuth2.
 * Crée ou récupère l'utilisateur en base, génère un JWT
 * et redirige vers l'app mobile via deep link.
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final OAuthAccountRepository oAuthAccountRepository;
    private final JwtService jwtService;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String provider = resolveProvider(request);
        String providerId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");

        // Récupère le compte OAuth2 existant ou en crée un nouveau
        User user = oAuthAccountRepository.findByProviderAndProviderId(provider, providerId)
                .map(OAuthAccount::getUser)
                .orElseGet(() -> createUserFromOAuth2(email, name, avatarUrl, provider, providerId));

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        // Redirige vers le deep link de l'app mobile avec les tokens en paramètres
        String redirectUrl = "giftly://oauth2/callback?accessToken=" + accessToken
                + "&refreshToken=" + refreshToken;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private User createUserFromOAuth2(String email, String name, String avatarUrl,
                                      String provider, String providerId) {
        // Si un compte email existe déjà, on y rattache le compte OAuth2
        User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.save(User.builder()
                        .email(email)
                        .name(name)
                        .avatarUrl(avatarUrl)
                        .build())
        );

        oAuthAccountRepository.save(OAuthAccount.builder()
                .user(user)
                .provider(provider)
                .providerId(providerId)
                .build());

        return user;
    }

    /** Extrait le nom du provider depuis l'URL de callback */
    private String resolveProvider(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // ex: /api/auth/oauth2/callback/google → "google"
        String[] parts = uri.split("/");
        return parts[parts.length - 1];
    }
}
