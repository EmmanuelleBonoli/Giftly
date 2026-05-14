package com.giftly.repository;

import com.giftly.model.EventParticipant;
import com.giftly.model.EventParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, EventParticipantId> {

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    List<EventParticipant> findAllByEventId(Long eventId);
}
