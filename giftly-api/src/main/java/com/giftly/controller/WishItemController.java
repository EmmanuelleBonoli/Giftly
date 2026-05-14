package com.giftly.controller;

import com.giftly.dto.item.CreateWishItemRequest;
import com.giftly.dto.item.WishItemResponse;
import com.giftly.security.SecurityUtils;
import com.giftly.service.WishItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WishItemController {

    private final WishItemService wishItemService;
    private final SecurityUtils securityUtils;

    /** GET /lists/{listId}/items — souhaits d'une liste (filtre confidentialité appliqué) */
    @GetMapping("/lists/{listId}/items")
    public ResponseEntity<List<WishItemResponse>> getByList(@PathVariable Long listId) {
        return ResponseEntity.ok(wishItemService.getByList(listId, securityUtils.getCurrentUserId()));
    }

    /** POST /lists/{listId}/items — ajout d'un souhait (propriétaire uniquement) */
    @PostMapping("/lists/{listId}/items")
    public ResponseEntity<WishItemResponse> addItem(
            @PathVariable Long listId,
            @Valid @RequestBody CreateWishItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(wishItemService.addItem(listId, request, securityUtils.getCurrentUserId()));
    }

    /** DELETE /items/{id} — suppression d'un souhait (propriétaire uniquement) */
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        wishItemService.deleteItem(id, securityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    /** POST /items/{id}/reserve — réservation d'un souhait */
    @PostMapping("/items/{id}/reserve")
    public ResponseEntity<WishItemResponse> reserve(@PathVariable Long id) {
        return ResponseEntity.ok(wishItemService.reserve(id, securityUtils.getCurrentUserId()));
    }

    /** DELETE /items/{id}/reserve — annulation d'une réservation */
    @DeleteMapping("/items/{id}/reserve")
    public ResponseEntity<WishItemResponse> unreserve(@PathVariable Long id) {
        return ResponseEntity.ok(wishItemService.unreserve(id, securityUtils.getCurrentUserId()));
    }
}
