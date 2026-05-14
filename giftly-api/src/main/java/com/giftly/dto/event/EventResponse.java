package com.giftly.dto.event;

import com.giftly.model.EventType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String name,
        EventType type,
        LocalDate eventDate,
        Long createdById,
        String createdByName,
        boolean active,
        int participantCount,
        LocalDateTime createdAt
) {}
