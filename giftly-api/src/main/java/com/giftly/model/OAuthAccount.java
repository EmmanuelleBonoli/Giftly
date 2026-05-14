package com.giftly.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "oauth_accounts",
    uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuthAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Nom du provider OAuth2 (ex: "google") */
    @Column(nullable = false, length = 50)
    private String provider;

    /** Identifiant unique retourné par le provider */
    @Column(name = "provider_id", nullable = false)
    private String providerId;
}
