package com.erp.finance.controller;

import com.erp.finance.dto.PaymentRequestDto;
import com.erp.finance.dto.ReceiptResponseDto;
import com.erp.finance.invoice.entity.Receipt;
import com.erp.finance.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/finance/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/student-fee/{studentFeeId}")
    @PreAuthorize("hasAuthority('PAYMENT_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ReceiptResponseDto> recordPayment(
            @PathVariable Long studentFeeId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            @RequestBody PaymentRequestDto paymentRequest) {
        if (paymentRequest != null && (paymentRequest.getIdempotencyKey() == null || paymentRequest.getIdempotencyKey().isBlank())) {
            if (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank()) {
                paymentRequest.setIdempotencyKey(idempotencyKeyHeader.trim());
            }
        }
        Receipt receipt = paymentService.recordPayment(paymentRequest, studentFeeId);
        return ResponseEntity.ok(ReceiptResponseDto.fromEntity(receipt));
    }
}
