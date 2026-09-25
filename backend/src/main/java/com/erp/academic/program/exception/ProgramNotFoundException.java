package com.erp.academic.program.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class ProgramNotFoundException extends ResourceNotFoundException {
    public ProgramNotFoundException(Long id) {
        super("Program with ID " + id + " was not found", "PROGRAM_NOT_FOUND");
    }
}
