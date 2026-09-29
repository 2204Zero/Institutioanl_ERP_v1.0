package com.erp.academic.semester.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SemesterNotFoundException extends RuntimeException {
    public SemesterNotFoundException(Long id) {
        super("Semester not found with id: " + id);
    }
}
