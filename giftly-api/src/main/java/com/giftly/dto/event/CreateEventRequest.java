package com.giftly.dto.event;

import com.giftly.model.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateEventRequest(
        @NotBlank(message = "Le nom de l'événement est obligatoire")
        @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
        String name,

        @NotNull(message = "Le type d'événement est obligatoire")
        EventType type,

        LocalDate eventDate
) {}
