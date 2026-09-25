package com.erp.institution.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class InstitutionNotFoundException extends ResourceNotFoundException {
    public InstitutionNotFoundException(Long id) {
        super("Institution with ID " + id + " was not found", "INSTITUTION_NOT_FOUND");
    }
}
