package com.erp.finance.controller;

import com.erp.finance.invoice.entity.Receipt;
import com.erp.finance.payment.entity.Payment;
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
    public ResponseEntity<Receipt> recordPayment(@PathVariable Long studentFeeId, @RequestBody Payment payment) {
        Receipt receipt = paymentService.recordPayment(payment, studentFeeId);
        return ResponseEntity.ok(receipt);
    }
}
