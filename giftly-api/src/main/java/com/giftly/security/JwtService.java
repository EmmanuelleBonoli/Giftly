package com.giftly.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Service de génération et validation des tokens JWT */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    /** Génère un access token pour l'utilisateur donné */
    public String generateAccessToken(Long userId, String email) {
        return buildToken(userId, email, expirationMs);
    }

    /** Génère un refresh token (durée de vie plus longue) */
    public String generateRefreshToken(Long userId, String email) {
        return buildToken(userId, email, refreshExpirationMs);
    }

    /** Extrait l'email contenu dans le token */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /** Extrait l'id utilisateur contenu dans le token */
    public Long extractUserId(String token) {
        return parseClaims(token).get("userId", Long.class);
    }

    /** Vérifie que le token est valide et non expiré */
    public boolean isValid(String token) {
        try {
            return !parseClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private String buildToken(Long userId, String email, long durationMs) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + durationMs))
                .signWith(signingKey)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
