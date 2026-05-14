package com.giftly.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "invitations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    /** Code court (ex: "NOEL25") — unique en base */
    @Column(nullable = false, unique = true, length = 10)
    private String code;

    /** Null si l'invitation est un lien générique sans destinataire précis */
    @Column(length = 255)
    private String email;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** Null tant que l'invitation n'a pas été utilisée */
    @Column(name = "used_at")
    private LocalDateTime usedAt;

    /** @return true si l'invitation est valide et non expirée */
    public boolean isValid() {
        return usedAt == null && LocalDateTime.now().isBefore(expiresAt);
    }
}
