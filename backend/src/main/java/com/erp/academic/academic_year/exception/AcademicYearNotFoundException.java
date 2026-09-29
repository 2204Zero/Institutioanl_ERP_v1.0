package com.erp.academic.academic_year.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class AcademicYearNotFoundException extends ResourceNotFoundException {
    public AcademicYearNotFoundException(Long id) {
        super("AcademicYear", "id", id);
    }
}
