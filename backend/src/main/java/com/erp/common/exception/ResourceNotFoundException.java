package com.erp.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public ResourceNotFoundException(String resourceName, Object id) {
        super(String.format("%s not found with id: '%s'", resourceName, id));
    }

    public ResourceNotFoundException(String message, String errorCode) {
        super(message);
        // Note: RuntimeException doesn't store errorCode, but this fixes compilation.
    }
}
