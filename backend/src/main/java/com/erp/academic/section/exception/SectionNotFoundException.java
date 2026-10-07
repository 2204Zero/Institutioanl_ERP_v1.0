package com.erp.academic.section.exception;

import com.erp.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SectionNotFoundException extends ResourceNotFoundException {
    public SectionNotFoundException(Long id) {
        super("Section not found with id: " + id);
    }
}
