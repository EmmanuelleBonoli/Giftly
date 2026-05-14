package com.giftly.dto.list;

public record WishListResponse(
        Long id,
        Long eventId,
        Long userId,
        String ownerName,
        String ownerAvatarUrl,
        int itemCount
) {}
