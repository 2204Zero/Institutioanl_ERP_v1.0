package com.erp.academic.section.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SectionNotFoundException extends RuntimeException {
    public SectionNotFoundException(Long id) {
        super("Section not found with id: " + id);
    }
}
