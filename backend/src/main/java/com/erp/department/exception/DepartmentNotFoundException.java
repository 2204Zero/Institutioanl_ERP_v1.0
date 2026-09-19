package com.erp.department.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class DepartmentNotFoundException extends ResourceNotFoundException {
    public DepartmentNotFoundException(Long id) {
        super("Department with ID " + id + " was not found", "DEPARTMENT_NOT_FOUND");
    }
}
