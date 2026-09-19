package com.erp.guardian.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class GuardianNotFoundException extends ResourceNotFoundException {
    public GuardianNotFoundException(Long id) {
        super("Guardian with ID " + id + " was not found", "GUARDIAN_NOT_FOUND");
    }
}
