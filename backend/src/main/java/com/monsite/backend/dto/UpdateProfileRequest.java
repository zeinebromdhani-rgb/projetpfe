package com.monsite.backend.dto;

public record UpdateProfileRequest(
        String name,
        String email
) {}
