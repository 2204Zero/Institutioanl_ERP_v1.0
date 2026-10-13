package com.erp.devjson.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

public class FacultyJsonModels {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacultyRecord {
        private Long id;
        private String employeeId;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private Long departmentId;
        private String designation;
        private Long userId;
        @Builder.Default
        private List<Long> assignedSectionIds = new ArrayList<>();
    }
}
