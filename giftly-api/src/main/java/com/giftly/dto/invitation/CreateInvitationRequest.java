package com.giftly.dto.invitation;

import jakarta.validation.constraints.Email;

/**
 * Requête de création d'invitation.
 * L'email est optionnel : s'il est fourni, un mail est envoyé au destinataire.
 * Sans email, seul le lien/code est généré (invitation générique partageable).
 */
public record CreateInvitationRequest(
        @Email(message = "Email invalide")
        String email
) {}
