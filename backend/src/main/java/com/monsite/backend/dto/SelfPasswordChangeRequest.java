package com.monsite.backend.dto;

public record SelfPasswordChangeRequest(
        String currentPassword,
        String newPassword
) {}
