package com.giftly.controller;

import com.giftly.dto.list.WishListResponse;
import com.giftly.security.SecurityUtils;
import com.giftly.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;
    private final SecurityUtils securityUtils;

    /** GET /events/{eventId}/lists — toutes les listes d'un événement */
    @GetMapping("/events/{eventId}/lists")
    public ResponseEntity<List<WishListResponse>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(wishListService.getByEvent(eventId, securityUtils.getCurrentUserId()));
    }

    /** GET /lists/{id} — détail d'une liste */
    @GetMapping("/lists/{id}")
    public ResponseEntity<WishListResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(wishListService.getById(id, securityUtils.getCurrentUserId()));
    }
}
