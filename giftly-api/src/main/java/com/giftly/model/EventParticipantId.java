package com.giftly.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/** Clé composite pour EventParticipant */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class EventParticipantId implements Serializable {

    private Long eventId;
    private Long userId;
}
