package com.giftly.dto.item;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateWishItemRequest(
        @NotBlank(message = "Le nom du souhait est obligatoire")
        @Size(max = 200, message = "Le nom ne peut pas dépasser 200 caractères")
        String name,

        String description,

        @Size(max = 1000, message = "L'URL ne peut pas dépasser 1000 caractères")
        String url,

        @PositiveOrZero(message = "Le prix doit être positif ou nul")
        BigDecimal price,

        @Size(max = 1000, message = "L'URL de l'image ne peut pas dépasser 1000 caractères")
        String imageUrl
) {}
