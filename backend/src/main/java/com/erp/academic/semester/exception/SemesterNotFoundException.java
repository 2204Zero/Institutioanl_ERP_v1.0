package com.erp.academic.semester.exception;

import com.erp.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SemesterNotFoundException extends ResourceNotFoundException {
    public SemesterNotFoundException(Long id) {
        super("Semester not found with id: " + id);
    }
}
