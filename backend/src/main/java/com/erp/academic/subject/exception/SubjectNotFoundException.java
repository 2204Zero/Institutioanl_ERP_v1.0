package com.erp.academic.subject.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SubjectNotFoundException extends RuntimeException {
    public SubjectNotFoundException(Long id) {
        super("Subject not found with id: " + id);
    }
}
