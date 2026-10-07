package com.erp.academic.program.exception;

import com.erp.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProgramNotFoundException extends ResourceNotFoundException {
    public ProgramNotFoundException(Long id) {
        super("Program not found with id: " + id);
    }
}
