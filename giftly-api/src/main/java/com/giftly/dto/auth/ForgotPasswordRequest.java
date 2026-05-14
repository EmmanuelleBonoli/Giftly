package com.giftly.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @Email(message = "Email invalide")
        @NotBlank(message = "L'email est obligatoire")
        String email
) {}
