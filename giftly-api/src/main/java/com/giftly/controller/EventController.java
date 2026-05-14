package com.giftly.controller;

import com.giftly.dto.event.CreateEventRequest;
import com.giftly.dto.event.EventResponse;
import com.giftly.security.SecurityUtils;
import com.giftly.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final SecurityUtils securityUtils;

    /** GET /events — liste des événements de l'utilisateur connecté */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getMyEvents() {
        return ResponseEntity.ok(eventService.getMyEvents(securityUtils.getCurrentUserId()));
    }

    /** GET /events/{id} — détail d'un événement */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getById(id, securityUtils.getCurrentUserId()));
    }

    /** POST /events — création d'un événement */
    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody CreateEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.create(request, securityUtils.getCurrentUserId()));
    }

    /** PATCH /events/{id}/archive — archivage d'un événement (admin uniquement) */
    @PatchMapping("/{id}/archive")
    public ResponseEntity<EventResponse> archive(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.archive(id, securityUtils.getCurrentUserId()));
    }
}
