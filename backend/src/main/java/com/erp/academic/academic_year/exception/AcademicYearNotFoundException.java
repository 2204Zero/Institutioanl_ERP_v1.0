package com.erp.academic.academic_year.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class AcademicYearNotFoundException extends ResourceNotFoundException {
    public AcademicYearNotFoundException(Long id) {
        super("AcademicYear with ID " + id + " was not found", "ACADEMIC_YEAR_NOT_FOUND");
    }
}
