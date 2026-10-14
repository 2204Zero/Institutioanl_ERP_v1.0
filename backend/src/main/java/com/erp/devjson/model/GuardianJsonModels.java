package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

public class GuardianJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuardianRecord {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String relationship;
        private Long userId;
        @Builder.Default
        private List<Long> wardStudentIds = new ArrayList<>();
    }
}
