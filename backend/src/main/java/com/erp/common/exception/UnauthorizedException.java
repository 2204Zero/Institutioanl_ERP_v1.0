package com.erp.common.exception;

public class UnauthorizedException extends ApiException {
    public UnauthorizedException(String message) {
        super("UNAUTHORIZED_ACCESS", message, 401);
    }
}

