package com.erp.academic.batch.exception;

import com.erp.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class BatchNotFoundException extends ResourceNotFoundException {
    public BatchNotFoundException(Long id) {
        super("Batch not found with id: " + id);
    }
}
