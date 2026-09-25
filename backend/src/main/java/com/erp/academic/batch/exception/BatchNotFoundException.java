package com.erp.academic.batch.exception;

import com.erp.common.exception.ResourceNotFoundException;

public class BatchNotFoundException extends ResourceNotFoundException {
    public BatchNotFoundException(Long id) {
        super("Batch with ID " + id + " was not found", "BATCH_NOT_FOUND");
    }
}
