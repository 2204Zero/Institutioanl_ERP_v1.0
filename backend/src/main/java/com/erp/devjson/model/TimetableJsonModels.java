package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

public class TimetableJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimetableSlotRecord {
        private Long id;
        private Long sectionId;
        private Integer dayOfWeek; // 1 = Monday, 7 = Sunday
        private LocalTime startTime;
        private LocalTime endTime;
        private Long facultyId;
        private String room;
        private Boolean isActive;
    }
}
