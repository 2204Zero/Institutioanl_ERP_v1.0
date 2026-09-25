package com.erp.common.exception;

public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String resourceName, Object identifier) {
        super("RESOURCE_NOT_FOUND", resourceName + " not found with id: " + identifier, 404);
    }
}

