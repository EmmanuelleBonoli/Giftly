package com.giftly.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Réservation d'un souhait par un participant.
 * IMPORTANT : cette entité ne doit JAMAIS être retournée à l'appelant
 * si celui-ci est le propriétaire de la liste parente.
 */
@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    private WishItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserved_by", nullable = false)
    private User reservedBy;

    @Column(name = "reserved_at", nullable = false, updatable = false)
    private LocalDateTime reservedAt;

    @PrePersist
    private void onCreate() {
        reservedAt = LocalDateTime.now();
    }
}
