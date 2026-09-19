package com.erp.student.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class StudentNotFoundException extends ResourceNotFoundException {
    public StudentNotFoundException(Long id) {
        super("Student with ID " + id + " was not found", "STUDENT_NOT_FOUND");
    }
}
