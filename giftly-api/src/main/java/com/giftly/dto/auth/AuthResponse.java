package com.giftly.dto.auth;

import com.giftly.model.Plan;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        Long userId,
        String email,
        String name,
        String avatarUrl,
        Plan plan
) {}
