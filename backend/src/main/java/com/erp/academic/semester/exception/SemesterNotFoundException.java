package com.erp.academic.semester.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class SemesterNotFoundException extends ResourceNotFoundException {
    public SemesterNotFoundException(Long id) {
        super("Semester with ID " + id + " was not found", "SEMESTER_NOT_FOUND");
    }
}
