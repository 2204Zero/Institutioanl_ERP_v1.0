package com.erp.academic.curriculum.exception;

import com.erp.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class CurriculumNotFoundException extends ResourceNotFoundException {
    public CurriculumNotFoundException(Long id) {
        super("Curriculum not found with id: " + id);
    }
}
