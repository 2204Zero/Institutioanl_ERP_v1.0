package com.erp.finance.service;

import com.erp.common.exception.BusinessException;
import com.erp.finance.dto.PaymentRequestDto;
import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.enums.PaymentStatus;
import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.invoice.entity.Receipt;
import com.erp.finance.invoice.repository.ReceiptRepository;
import com.erp.finance.payment.entity.Payment;
import com.erp.finance.payment.entity.PaymentAllocation;
import com.erp.finance.payment.repository.PaymentRepository;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final ReceiptRepository receiptRepository;
    private final PlatformTransactionManager transactionManager;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository, 
                          StudentFeeRepository studentFeeRepository, 
                          ReceiptRepository receiptRepository,
                          @Autowired(required = false) PlatformTransactionManager transactionManager) {
        this.paymentRepository = paymentRepository;
        this.studentFeeRepository = studentFeeRepository;
        this.receiptRepository = receiptRepository;
        this.transactionManager = transactionManager;
    }

    public PaymentService(PaymentRepository paymentRepository, 
                          StudentFeeRepository studentFeeRepository, 
                          ReceiptRepository receiptRepository) {
        this(paymentRepository, studentFeeRepository, receiptRepository, null);
    }

    /**
     * Computes a deterministic SHA-256 hash of payment request parameters
     * to verify payload integrity when evaluating idempotent requests.
     */
    public static String computeRequestHash(Long studentFeeId, BigDecimal amount, PaymentMethod method, String referenceNumber) {
        String amtStr = amount != null ? amount.stripTrailingZeros().toPlainString() : "";
        String methStr = method != null ? method.name() : "";
        String refStr = referenceNumber != null ? referenceNumber.trim() : "";
        String raw = String.format("%s|%s|%s|%s", studentFeeId, amtStr, methStr, refStr);
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return raw;
        }
    }

    public Receipt recordPayment(PaymentRequestDto requestDto, Long studentFeeId) {
        if (requestDto == null) {
            throw new IllegalArgumentException("Payment request payload cannot be null");
        }
        Payment payment = new Payment();
        payment.setAmount(requestDto.getAmount());
        payment.setPaymentDate(requestDto.getPaymentDate());
        payment.setPaymentMethod(requestDto.getPaymentMethod());
        payment.setReferenceNumber(requestDto.getReferenceNumber());
        payment.setRemarks(requestDto.getRemarks());
        payment.setIdempotencyKey(requestDto.getIdempotencyKey());
        return recordPayment(payment, studentFeeId);
    }

    public Receipt recordPayment(Payment paymentDto, Long studentFeeId) {
        if (studentFeeId == null) {
            throw new IllegalArgumentException("Student Fee ID cannot be null");
        }
        if (paymentDto == null) {
            throw new IllegalArgumentException("Payment details cannot be null");
        }

        String idempotencyKey = paymentDto.getIdempotencyKey() != null && !paymentDto.getIdempotencyKey().isBlank()
                ? paymentDto.getIdempotencyKey().trim()
                : null;
        String requestHash = computeRequestHash(studentFeeId, paymentDto.getAmount(), paymentDto.getPaymentMethod(), paymentDto.getReferenceNumber());

        // 1. Idempotency Check: Pre-lock check
        if (idempotencyKey != null) {
            Optional<Payment> existingOpt = paymentRepository.findByIdempotencyKey(idempotencyKey);
            if (existingOpt.isPresent()) {
                Payment existing = existingOpt.get();
                if (requestHash.equals(existing.getRequestHash())) {
                    return receiptRepository.findByPaymentId(existing.getId())
                            .orElseThrow(() -> new BusinessException("Payment exists but receipt was not found for payment ID " + existing.getId()));
                } else {
                    throw new BusinessException("Idempotency key '" + idempotencyKey + "' has already been used with different request parameters");
                }
            }
        }

        if (transactionManager != null) {
            TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
            txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
            try {
                return txTemplate.execute(status -> executePaymentTransaction(paymentDto, studentFeeId, idempotencyKey, requestHash));
            } catch (DataIntegrityViolationException ex) {
                if (idempotencyKey != null && isIdempotencyKeyViolation(ex)) {
                    return resolveIdempotentWinner(idempotencyKey, requestHash);
                }
                throw ex;
            }
        } else {
            try {
                return executePaymentTransaction(paymentDto, studentFeeId, idempotencyKey, requestHash);
            } catch (DataIntegrityViolationException ex) {
                if (idempotencyKey != null && isIdempotencyKeyViolation(ex)) {
                    return resolveIdempotentWinner(idempotencyKey, requestHash);
                }
                throw ex;
            }
        }
    }

    private Receipt executePaymentTransaction(Payment paymentDto, Long studentFeeId, String idempotencyKey, String requestHash) {
        // 2. Validate and acquire pessimistic write lock on student fee
        StudentFee studentFee = studentFeeRepository.findByIdForUpdate(studentFeeId)
                .orElseGet(() -> studentFeeRepository.findById(studentFeeId)
                        .orElseThrow(() -> new IllegalArgumentException("Student Fee not found")));

        // 3. Double-check idempotency key after lock acquisition (handles concurrent duplicate submissions on same fee)
        if (idempotencyKey != null) {
            Optional<Payment> existingOpt = paymentRepository.findByIdempotencyKey(idempotencyKey);
            if (existingOpt.isPresent()) {
                Payment existing = existingOpt.get();
                if (requestHash.equals(existing.getRequestHash())) {
                    return receiptRepository.findByPaymentId(existing.getId())
                            .orElseThrow(() -> new BusinessException("Payment exists but receipt was not found for payment ID " + existing.getId()));
                } else {
                    throw new BusinessException("Idempotency key '" + idempotencyKey + "' has already been used with different request parameters");
                }
            }
        }

        if (studentFee.getStatus() == StudentFeeStatus.PAID || studentFee.getStatus() == StudentFeeStatus.CANCELLED) {
            throw new IllegalArgumentException("Fee is already paid or cancelled");
        }

        // 4. Validate payment amount
        BigDecimal paymentAmount = paymentDto.getAmount();
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than 0");
        }
        if (paymentAmount.compareTo(studentFee.getOutstandingAmount()) > 0) {
            throw new IllegalArgumentException("Payment exceeds outstanding amount");
        }

        // 5. Determine authenticated actor (prevents spoofing of createdBy)
        String actor = "SYSTEM";
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            actor = authentication.getName();
        }

        // 6. Create Payment entity
        Payment payment = new Payment();
        payment.setStudentId(studentFee.getStudentId());
        payment.setStudentFee(studentFee);
        payment.setAmount(paymentAmount);
        payment.setPaymentDate(paymentDto.getPaymentDate() != null ? paymentDto.getPaymentDate() : java.time.LocalDate.now());
        payment.setPaymentMethod(paymentDto.getPaymentMethod());
        payment.setReferenceNumber(paymentDto.getReferenceNumber() != null && !paymentDto.getReferenceNumber().isBlank()
                ? paymentDto.getReferenceNumber().trim()
                : UUID.randomUUID().toString());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setRemarks(paymentDto.getRemarks());
        payment.setCreatedBy(actor);
        payment.setIdempotencyKey(idempotencyKey);
        payment.setRequestHash(requestHash);

        // 7. Allocate Payment across components
        BigDecimal remainingAmount = paymentAmount;
        for (StudentFeeComponent component : studentFee.getComponents()) {
            if (remainingAmount.compareTo(BigDecimal.ZERO) == 0) break;
            
            BigDecimal componentOutstanding = component.getOutstandingAmount();
            if (componentOutstanding != null && componentOutstanding.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal allocateAmount = remainingAmount.min(componentOutstanding);
                
                PaymentAllocation allocation = new PaymentAllocation();
                allocation.setPayment(payment);
                allocation.setStudentFeeComponent(component);
                allocation.setAllocatedAmount(allocateAmount);
                payment.getAllocations().add(allocation);

                // Update component state
                BigDecimal currentPaid = component.getPaidAmount() != null ? component.getPaidAmount() : BigDecimal.ZERO;
                component.setPaidAmount(currentPaid.add(allocateAmount));
                component.setOutstandingAmount(componentOutstanding.subtract(allocateAmount));
                
                remainingAmount = remainingAmount.subtract(allocateAmount);
            }
        }

        paymentRepository.save(payment);

        // 8. Update financial state of StudentFee
        BigDecimal currentFeePaid = studentFee.getPaidAmount() != null ? studentFee.getPaidAmount() : BigDecimal.ZERO;
        studentFee.setPaidAmount(currentFeePaid.add(paymentAmount));
        studentFee.setOutstandingAmount(studentFee.getNetPayable().subtract(studentFee.getPaidAmount()));
        
        if (studentFee.getOutstandingAmount().compareTo(BigDecimal.ZERO) == 0) {
            studentFee.setStatus(StudentFeeStatus.PAID);
        } else {
            studentFee.setStatus(StudentFeeStatus.PARTIALLY_PAID);
        }
        
        studentFeeRepository.save(studentFee);

        // 9. Generate Receipt with collision-safe receipt number
        Receipt receipt = new Receipt();
        receipt.setReceiptNumber("REC-" + Instant.now().toEpochMilli() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        receipt.setPayment(payment);
        receipt.setStudentId(studentFee.getStudentId());
        receipt.setStatus(PaymentStatus.SUCCESS);
        
        return receiptRepository.save(receipt);
    }

    private Receipt resolveIdempotentWinner(String idempotencyKey, String requestHash) {
        if (transactionManager != null) {
            TransactionTemplate readTx = new TransactionTemplate(transactionManager);
            readTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
            readTx.setReadOnly(true);
            return readTx.execute(status -> doResolveIdempotentWinner(idempotencyKey, requestHash));
        } else {
            return doResolveIdempotentWinner(idempotencyKey, requestHash);
        }
    }

    private Receipt doResolveIdempotentWinner(String idempotencyKey, String requestHash) {
        Optional<Payment> committedOpt = paymentRepository.findByIdempotencyKey(idempotencyKey);
        for (int i = 0; i < 10 && committedOpt.isEmpty(); i++) {
            try {
                Thread.sleep(50);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            }
            committedOpt = paymentRepository.findByIdempotencyKey(idempotencyKey);
        }

        if (committedOpt.isPresent()) {
            Payment committed = committedOpt.get();
            if (requestHash.equals(committed.getRequestHash())) {
                Optional<Receipt> receiptOpt = receiptRepository.findByPaymentId(committed.getId());
                for (int i = 0; i < 5 && receiptOpt.isEmpty(); i++) {
                    try {
                        Thread.sleep(20);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    receiptOpt = receiptRepository.findByPaymentId(committed.getId());
                }
                return receiptOpt.orElseThrow(() -> new BusinessException("Payment exists but receipt was not found for payment ID " + committed.getId()));
            } else {
                throw new BusinessException("Idempotency key '" + idempotencyKey + "' has already been used with different request parameters");
            }
        }

        throw new BusinessException("Idempotency key collision detected for key '" + idempotencyKey + "'");
    }

    private boolean isIdempotencyKeyViolation(DataIntegrityViolationException ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof org.hibernate.exception.ConstraintViolationException cve) {
                String cName = cve.getConstraintName();
                if (cName != null && (cName.equalsIgnoreCase("uq_finance_payment_idempotency_key")
                        || cName.toLowerCase().contains("idempotency_key"))) {
                    return true;
                }
            }
            String msg = current.getMessage();
            if (msg != null) {
                String lower = msg.toLowerCase();
                if (lower.contains("uq_finance_payment_idempotency_key") || lower.contains("idempotency_key")) {
                    return true;
                }
            }
            current = current.getCause();
        }
        return false;
    }

    @Transactional(readOnly = true)
    public Receipt getReceiptById(Long id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new com.erp.common.exception.ResourceNotFoundException("Receipt", "id", id));
    }

    @Transactional(readOnly = true)
    public Receipt getReceiptByNumber(String receiptNumber) {
        return receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new com.erp.common.exception.ResourceNotFoundException("Receipt", "receiptNumber", receiptNumber));
    }

    @Transactional(readOnly = true)
    public List<Receipt> getReceiptsByStudentId(Long studentId) {
        return receiptRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<Receipt> getReceiptsByStudentFeeId(Long studentFeeId) {
        List<Payment> payments = paymentRepository.findByStudentFeeId(studentFeeId);
        List<Receipt> receipts = new java.util.ArrayList<>();
        for (Payment p : payments) {
            receiptRepository.findByPaymentId(p.getId()).ifPresent(receipts::add);
        }
        return receipts;
    }
}
