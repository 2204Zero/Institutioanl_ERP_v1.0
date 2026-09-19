package com.erp.campus.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class CampusNotFoundException extends ResourceNotFoundException {
    public CampusNotFoundException(Long id) {
        super("Campus with ID " + id + " was not found", "CAMPUS_NOT_FOUND");
    }
}
