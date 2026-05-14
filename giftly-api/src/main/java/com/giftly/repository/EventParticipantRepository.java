package com.giftly.repository;

import com.giftly.model.EventParticipant;
import com.giftly.model.EventParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, EventParticipantId> {

    boolean existsByEventIdAndUserId(Long eventId, Long userId);
}
