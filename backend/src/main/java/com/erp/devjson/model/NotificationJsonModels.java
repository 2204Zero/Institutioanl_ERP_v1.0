package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationRecord {
        private Long id;
        private Long userId;
        private String title;
        private String message;
        private String type; // INFO, WARNING, SUCCESS, ERROR
        private Boolean read;
        private LocalDateTime createdAt;
    }
}
