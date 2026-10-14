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

    @PostMapping
    @PreAuthorize("hasAuthority('PAYMENT_CREATE') or hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ReceiptResponseDto> recordPaymentDirect(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            @RequestBody PaymentRequestDto paymentRequest) {
        if (paymentRequest != null && paymentRequest.getStudentFeeId() != null) {
            return recordPayment(paymentRequest.getStudentFeeId(), idempotencyKeyHeader, paymentRequest);
        }
        throw new IllegalArgumentException("studentFeeId is required for payment processing");
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

    @GetMapping("/receipts/{id}")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN') or @securityOwnershipService.canAccessStudentFinance(authentication, @paymentService.getReceiptById(#id).getStudentId())")
    public ResponseEntity<ReceiptResponseDto> getReceiptById(@PathVariable Long id) {
        Receipt receipt = paymentService.getReceiptById(id);
        return ResponseEntity.ok(ReceiptResponseDto.fromEntity(receipt));
    }

    @GetMapping("/receipts/number/{receiptNumber}")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN') or @securityOwnershipService.canAccessStudentFinance(authentication, @paymentService.getReceiptByNumber(#receiptNumber).getStudentId())")
    public ResponseEntity<ReceiptResponseDto> getReceiptByNumber(@PathVariable String receiptNumber) {
        Receipt receipt = paymentService.getReceiptByNumber(receiptNumber);
        return ResponseEntity.ok(ReceiptResponseDto.fromEntity(receipt));
    }

    @GetMapping("/student/{studentId}/receipts")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN') or @securityOwnershipService.canAccessStudentFinance(authentication, #studentId)")
    public ResponseEntity<java.util.List<ReceiptResponseDto>> getReceiptsByStudentId(@PathVariable Long studentId) {
        java.util.List<Receipt> receipts = paymentService.getReceiptsByStudentId(studentId);
        return ResponseEntity.ok(receipts.stream().map(ReceiptResponseDto::fromEntity).toList());
    }

    @GetMapping("/student-fee/{studentFeeId}/receipts")
    @PreAuthorize("hasAnyRole('FINANCE', 'ADMIN', 'SUPER_ADMIN') or @securityOwnershipService.canAccessStudentFeeFinance(authentication, #studentFeeId)")
    public ResponseEntity<java.util.List<ReceiptResponseDto>> getReceiptsByStudentFeeId(@PathVariable Long studentFeeId) {
        java.util.List<Receipt> receipts = paymentService.getReceiptsByStudentFeeId(studentFeeId);
        return ResponseEntity.ok(receipts.stream().map(ReceiptResponseDto::fromEntity).toList());
    }
}
