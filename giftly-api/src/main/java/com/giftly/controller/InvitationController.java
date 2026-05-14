package com.giftly.controller;

import com.giftly.dto.invitation.CreateInvitationRequest;
import com.giftly.dto.invitation.InvitationResponse;
import com.giftly.dto.invitation.JoinEventResponse;
import com.giftly.security.SecurityUtils;
import com.giftly.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;
    private final SecurityUtils securityUtils;

    /**
     * POST /events/{eventId}/invitations
     * Crée une invitation (avec ou sans email destinataire).
     */
    @PostMapping("/events/{eventId}/invitations")
    public ResponseEntity<InvitationResponse> create(
            @PathVariable Long eventId,
            @Valid @RequestBody(required = false) CreateInvitationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invitationService.create(eventId, request, securityUtils.getCurrentUserId()));
    }

    /**
     * POST /events/join/{code}
     * Rejoint un événement via un code d'invitation.
     */
    @PostMapping("/events/join/{code}")
    public ResponseEntity<JoinEventResponse> join(@PathVariable String code) {
        return ResponseEntity.ok(invitationService.joinByCode(code, securityUtils.getCurrentUserId()));
    }
}
