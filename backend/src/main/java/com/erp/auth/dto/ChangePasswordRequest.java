package com.erp.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Request payload for changing authenticated user password")
public record ChangePasswordRequest(
        @Schema(description = "Current account password", example = "OldPass@123")
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @Schema(description = "New account password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char)", example = "NewSecurePass@2026")
        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 128, message = "New password must be between 8 and 128 characters")
        String newPassword,

        @Schema(description = "Confirmation of new password", example = "NewSecurePass@2026")
        @NotBlank(message = "Password confirmation is required")
        String confirmPassword
) {}
