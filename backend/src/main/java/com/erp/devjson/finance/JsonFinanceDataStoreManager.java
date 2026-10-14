package com.erp.devjson.finance;

import com.erp.common.exception.BusinessException;
import com.erp.common.exception.ResourceNotFoundException;
import com.erp.devjson.academic.JsonAcademicDataStoreManager;
import com.erp.devjson.config.DevJsonProperties;
import com.erp.devjson.core.JsonEntityStore;
import com.erp.devjson.core.JsonFileStorageEngine;
import com.erp.devjson.model.FinanceJsonModels.*;
import com.erp.devjson.student.JsonStudentDataStoreManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Component
@Profile("dev-json")
public class JsonFinanceDataStoreManager {

    private final JsonEntityStore<FeeHeadRecord> feeHeadStore;
    private final JsonEntityStore<FeeStructureRecord> feeStructureStore;
    private final JsonEntityStore<StudentFeeRecord> studentFeeStore;
    private final JsonEntityStore<PaymentRecord> paymentStore;
    private final JsonEntityStore<ReceiptRecord> receiptStore;

    private final JsonStudentDataStoreManager studentManager;
    private final JsonAcademicDataStoreManager academicManager;

    // Emulation of database pessimistic locks (@Lock(LockModeType.PESSIMISTIC_WRITE))
    private final ConcurrentHashMap<Long, ReentrantLock> feeRowLocks = new ConcurrentHashMap<>();

    @Autowired
    public JsonFinanceDataStoreManager(
            DevJsonProperties properties,
            JsonStudentDataStoreManager studentManager,
            JsonAcademicDataStoreManager academicManager) {
        this(properties.getStoragePath(), studentManager, academicManager);
    }

    public JsonFinanceDataStoreManager(
            Path baseDirectory,
            JsonStudentDataStoreManager studentManager,
            JsonAcademicDataStoreManager academicManager) {
        this.studentManager = studentManager;
        this.academicManager = academicManager;
        JsonFileStorageEngine engine = new JsonFileStorageEngine();

        this.feeHeadStore = new JsonEntityStore<>(
                baseDirectory.resolve("fee_heads.json"),
                FeeHeadRecord.class, engine,
                FeeHeadRecord::getId, FeeHeadRecord::setId);

        this.feeStructureStore = new JsonEntityStore<>(
                baseDirectory.resolve("fee_structures.json"),
                FeeStructureRecord.class, engine,
                FeeStructureRecord::getId, FeeStructureRecord::setId);

        this.studentFeeStore = new JsonEntityStore<>(
                baseDirectory.resolve("student_fees.json"),
                StudentFeeRecord.class, engine,
                StudentFeeRecord::getId, StudentFeeRecord::setId);

        this.paymentStore = new JsonEntityStore<>(
                baseDirectory.resolve("payments.json"),
                PaymentRecord.class, engine,
                PaymentRecord::getId, PaymentRecord::setId);

        this.receiptStore = new JsonEntityStore<>(
                baseDirectory.resolve("receipts.json"),
                ReceiptRecord.class, engine,
                ReceiptRecord::getId, ReceiptRecord::setId);
    }

    private ReentrantLock getLockForFee(Long studentFeeId) {
        return feeRowLocks.computeIfAbsent(studentFeeId, k -> new ReentrantLock());
    }

    public static String computeRequestHash(Long studentFeeId, BigDecimal amount, String method, String referenceNumber) {
        String amtStr = amount != null ? amount.stripTrailingZeros().toPlainString() : "";
        String methStr = method != null ? method.trim().toUpperCase() : "";
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

    // --- Fee Head ---
    public synchronized FeeHeadRecord createFeeHead(FeeHeadRecord head) {
        if (head.getName() == null || head.getName().isBlank()) {
            throw new BusinessException("Fee head name cannot be empty");
        }
        if (head.getCode() == null || head.getCode().isBlank()) {
            throw new BusinessException("Fee head code cannot be empty");
        }
        boolean exists = feeHeadStore.findAll().stream()
                .anyMatch(h -> h.getCode().equalsIgnoreCase(head.getCode().trim()));
        if (exists) {
            throw new BusinessException("Fee head code '" + head.getCode() + "' already exists");
        }
        return feeHeadStore.save(head);
    }

    // --- Fee Structure ---
    public synchronized FeeStructureRecord createFeeStructure(FeeStructureRecord structure) {
        if (structure.getName() == null || structure.getName().isBlank()) {
            throw new BusinessException("Fee structure name cannot be empty");
        }
        if (structure.getAcademicYearId() == null) {
            throw new BusinessException("Academic year ID is required");
        }
        if (academicManager != null && academicManager.getAcademicYearById(structure.getAcademicYearId()).isEmpty()) {
            throw new ResourceNotFoundException("Academic year not found with id: " + structure.getAcademicYearId());
        }
        if (structure.getActive() == null) {
            structure.setActive(true);
        }
        return feeStructureStore.save(structure);
    }

    // --- Student Fee Assignment ---
    public synchronized StudentFeeRecord assignFeeStructure(Long studentId, Long feeStructureId, Long academicYearId) {
        if (studentId == null) {
            throw new BusinessException("Student ID cannot be null");
        }
        if (studentManager != null && studentManager.getStudentById(studentId).isEmpty()) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        if (feeStructureId == null) {
            throw new BusinessException("Fee structure ID cannot be null");
        }
        FeeStructureRecord structure = feeStructureStore.findById(feeStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found with id: " + feeStructureId));
        if (!Boolean.TRUE.equals(structure.getActive())) {
            throw new BusinessException("Cannot assign inactive fee structure");
        }
        if (academicYearId == null) {
            throw new BusinessException("Academic year ID cannot be null");
        }
        if (academicManager != null && academicManager.getAcademicYearById(academicYearId).isEmpty()) {
            throw new ResourceNotFoundException("Academic year not found with id: " + academicYearId);
        }

        // Duplicate check
        boolean duplicate = studentFeeStore.findAll().stream()
                .anyMatch(sf -> studentId.equals(sf.getStudentId()) && academicYearId.equals(sf.getAcademicYearId()));
        if (duplicate) {
            throw new BusinessException("Student fee already assigned for this student in this academic year");
        }

        BigDecimal gross = BigDecimal.ZERO;
        List<StudentFeeComponentItem> components = new ArrayList<>();
        if (structure.getComponents() != null) {
            for (FeeStructureComponentItem item : structure.getComponents()) {
                components.add(StudentFeeComponentItem.builder()
                        .feeHeadId(item.getFeeHeadId())
                        .feeHeadName(item.getFeeHeadName())
                        .grossAmount(item.getAmount())
                        .outstandingAmount(item.getAmount())
                        .build());
                gross = gross.add(item.getAmount());
            }
        }

        StudentFeeRecord record = StudentFeeRecord.builder()
                .studentId(studentId)
                .academicYearId(academicYearId)
                .feeStructureId(feeStructureId)
                .grossAmount(gross)
                .netPayable(gross)
                .outstandingAmount(gross)
                .status("PENDING")
                .components(components)
                .build();

        return studentFeeStore.save(record);
    }

    // --- Payment Recording with Pessimistic Lock & Idempotency Emulation ---
    public ReceiptRecord recordPayment(PaymentRecord payment) {
        if (payment.getStudentFeeId() == null) {
            throw new BusinessException("Student Fee ID is required");
        }
        if (payment.getAmount() == null || payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero");
        }

        String idempotencyKey = payment.getIdempotencyKey() != null && !payment.getIdempotencyKey().isBlank()
                ? payment.getIdempotencyKey().trim()
                : null;
        String requestHash = computeRequestHash(payment.getStudentFeeId(), payment.getAmount(), payment.getPaymentMethod(), payment.getReferenceNumber());
        payment.setRequestHash(requestHash);

        // Pre-lock idempotency check
        if (idempotencyKey != null) {
            Optional<PaymentRecord> existingOpt = paymentStore.findAll().stream()
                    .filter(p -> idempotencyKey.equalsIgnoreCase(p.getIdempotencyKey()))
                    .findFirst();
            if (existingOpt.isPresent()) {
                PaymentRecord existing = existingOpt.get();
                if (requestHash.equals(existing.getRequestHash())) {
                    return receiptStore.findAll().stream()
                            .filter(r -> r.getPaymentId().equals(existing.getId()))
                            .findFirst()
                            .orElseThrow(() -> new BusinessException("Payment exists but receipt was not found"));
                } else {
                    throw new BusinessException("Idempotency key '" + idempotencyKey + "' has already been used with different request parameters");
                }
            }
        }

        // Acquire Pessimistic Row Lock on Student Fee
        ReentrantLock feeLock = getLockForFee(payment.getStudentFeeId());
        feeLock.lock();
        try {
            // Re-check idempotency under lock
            if (idempotencyKey != null) {
                Optional<PaymentRecord> existingOpt = paymentStore.findAll().stream()
                        .filter(p -> idempotencyKey.equalsIgnoreCase(p.getIdempotencyKey()))
                        .findFirst();
                if (existingOpt.isPresent()) {
                    PaymentRecord existing = existingOpt.get();
                    if (requestHash.equals(existing.getRequestHash())) {
                        return receiptStore.findAll().stream()
                                .filter(r -> r.getPaymentId().equals(existing.getId()))
                                .findFirst()
                                .orElseThrow(() -> new BusinessException("Payment exists but receipt was not found"));
                    } else {
                        throw new BusinessException("Idempotency key '" + idempotencyKey + "' has already been used with different request parameters");
                    }
                }
            }

            StudentFeeRecord fee = studentFeeStore.findById(payment.getStudentFeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student Fee not found with id: " + payment.getStudentFeeId()));

            if ("PAID".equalsIgnoreCase(fee.getStatus()) || "CANCELLED".equalsIgnoreCase(fee.getStatus())) {
                throw new BusinessException("Fee is already fully paid or cancelled");
            }

            if (payment.getAmount().compareTo(fee.getOutstandingAmount()) > 0) {
                throw new BusinessException("Payment amount (" + payment.getAmount() + ") exceeds outstanding amount (" + fee.getOutstandingAmount() + ")");
            }

            // Update Fee Outstanding and Status
            BigDecimal newOutstanding = fee.getOutstandingAmount().subtract(payment.getAmount());
            fee.setOutstandingAmount(newOutstanding);
            if (newOutstanding.compareTo(BigDecimal.ZERO) == 0) {
                fee.setStatus("PAID");
            } else {
                fee.setStatus("PARTIAL");
            }
            studentFeeStore.save(fee);

            // Save Payment
            payment.setStatus("SUCCESS");
            payment.setCreatedAt(LocalDateTime.now());
            if (payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDate.now());
            }
            PaymentRecord savedPayment = paymentStore.save(payment);

            // Generate Receipt
            String receiptNum = "REC-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            ReceiptRecord receipt = ReceiptRecord.builder()
                    .receiptNumber(receiptNum)
                    .paymentId(savedPayment.getId())
                    .studentFeeId(fee.getId())
                    .amount(payment.getAmount())
                    .receiptDate(payment.getPaymentDate())
                    .issuedBy(payment.getCreatedBy() != null ? payment.getCreatedBy() : "SYSTEM")
                    .build();

            return receiptStore.save(receipt);
        } finally {
            feeLock.unlock();
        }
    }

    public List<StudentFeeRecord> getStudentFeesByStudentId(Long studentId) {
        if (studentId == null) return List.of();
        return studentFeeStore.findAll().stream()
                .filter(sf -> studentId.equals(sf.getStudentId()))
                .collect(Collectors.toList());
    }

    public Optional<StudentFeeRecord> getStudentFeeById(Long id) {
        return studentFeeStore.findById(id);
    }

    public List<PaymentRecord> getPaymentsByFeeId(Long feeId) {
        if (feeId == null) return List.of();
        return paymentStore.findAll().stream()
                .filter(p -> feeId.equals(p.getStudentFeeId()))
                .collect(Collectors.toList());
    }

    public Optional<ReceiptRecord> getReceiptByPaymentId(Long paymentId) {
        if (paymentId == null) return Optional.empty();
        return receiptStore.findAll().stream()
                .filter(r -> paymentId.equals(r.getPaymentId()))
                .findFirst();
    }

    // --- Financial Summary Metrics (JPQL Sum Equivalents) ---
    public FinanceSummaryRecord getFinancialSummary() {
        BigDecimal totalGross = studentFeeStore.findAll().stream()
                .map(StudentFeeRecord::getGrossAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCollected = paymentStore.findAll().stream()
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()))
                .map(PaymentRecord::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutstanding = studentFeeStore.findAll().stream()
                .map(StudentFeeRecord::getOutstandingAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FinanceSummaryRecord.builder()
                .totalGrossAssigned(totalGross)
                .totalCollected(totalCollected)
                .totalOutstanding(totalOutstanding)
                .build();
    }

    public JsonEntityStore<FeeHeadRecord> getFeeHeadStore() { return feeHeadStore; }
    public JsonEntityStore<FeeStructureRecord> getFeeStructureStore() { return feeStructureStore; }
    public JsonEntityStore<StudentFeeRecord> getStudentFeeStore() { return studentFeeStore; }
    public JsonEntityStore<PaymentRecord> getPaymentStore() { return paymentStore; }
    public JsonEntityStore<ReceiptRecord> getReceiptStore() { return receiptStore; }
}
