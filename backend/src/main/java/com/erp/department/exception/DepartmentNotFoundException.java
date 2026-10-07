package com.erp.department.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class DepartmentNotFoundException extends ResourceNotFoundException {
    public DepartmentNotFoundException(Long id) {
        super("Department", "id", id);
    }
}
