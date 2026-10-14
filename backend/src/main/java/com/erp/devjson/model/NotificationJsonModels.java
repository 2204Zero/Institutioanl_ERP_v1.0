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
        private String link;
        private Boolean read;
        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
    }
}
