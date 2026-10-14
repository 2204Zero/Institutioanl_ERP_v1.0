package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRecord {
        private Long id;
        private String username;
        private String email;
        private String passwordHash;
        private String role;
        private Boolean enabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
