package com.giftly.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventParticipant {

    @EmbeddedId
    private EventParticipantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventId")
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParticipantRole role = ParticipantRole.MEMBER;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    private void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
