package com.erp.institution.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class InstitutionNotFoundException extends ResourceNotFoundException {
    public InstitutionNotFoundException(Long id) {
        super("Institution", "id", id);
    }
}
