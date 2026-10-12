package com.erp.it.postgres;

import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.common.exception.BusinessException;
import com.erp.finance.dto.PaymentRequestDto;
import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.finance.payment.entity.Payment;
import com.erp.finance.payment.repository.PaymentRepository;
import com.erp.finance.service.PaymentService;
import com.erp.finance.service.StudentFeeService;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import com.erp.finance.invoice.entity.Receipt;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class FinanceConcurrencyPostgresIT extends AbstractPostgresIT {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private StudentFeeService studentFeeService;

    @Autowired
    private StudentFeeRepository studentFeeRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private FeeHeadRepository feeHeadRepository;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Student testStudent;
    private Student testStudent2;
    private AcademicYear testAcademicYear;
    private FeeStructure testStructure;
    private FeeHead testHead;

    @BeforeEach
    void cleanAndSetup() {
        jdbcTemplate.execute("DELETE FROM finance_receipt WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%')");
        jdbcTemplate.execute("DELETE FROM finance_payment_allocation WHERE payment_id IN (SELECT id FROM finance_payment WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%'))");
        jdbcTemplate.execute("DELETE FROM finance_payment WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%')");
        jdbcTemplate.execute("DELETE FROM student_fee_component WHERE student_fee_id IN (SELECT id FROM student_fee WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%'))");
        jdbcTemplate.execute("DELETE FROM student_fee WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%')");
        jdbcTemplate.execute("DELETE FROM fee_structure_component WHERE fee_structure_id IN (SELECT id FROM fee_structure WHERE code LIKE 'PG-FS-95%')");
        jdbcTemplate.execute("DELETE FROM fee_structure WHERE code LIKE 'PG-FS-95%'");
        jdbcTemplate.execute("DELETE FROM fee_head WHERE code LIKE 'PG-HEAD-95%'");
        jdbcTemplate.execute("DELETE FROM students WHERE roll_number LIKE 'PG-STU-95%'");

        testAcademicYear = academicYearRepository.findAll().stream().findFirst().orElseGet(() -> {
            AcademicYear ay = new AcademicYear();
            ay.setName("AY-PGTEST-2026");
            ay.setStartDate(LocalDate.of(2026, 7, 1));
            ay.setEndDate(LocalDate.of(2027, 6, 30));
            ay.setIsActive(true);
            return academicYearRepository.save(ay);
        });

        testStudent = studentRepository.save(new Student(
                "PG-STU-9501", "Finance", "Tester", "finance.pg9501@test.edu", "9998889501",
                LocalDate.of(2003, 1, 1), "FEMALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
        ));

        testStudent2 = studentRepository.save(new Student(
                "PG-STU-9502", "Second", "Tester", "finance.pg9502@test.edu", "9998889502",
                LocalDate.of(2003, 2, 2), "MALE", "CSE", "2024-2028", LocalDate.of(2024, 8, 1)
        ));

        testHead = new FeeHead();
        testHead.setCode("PG-HEAD-9501");
        testHead.setName("PG Tuition");
        testHead.setActive(true);
        testHead = feeHeadRepository.save(testHead);

        testStructure = new FeeStructure();
        testStructure.setCode("PG-FS-9501");
        testStructure.setName("PG Structure");
        testStructure.setActive(true);
        testStructure.setAcademicYearId(testAcademicYear.getId());
        testStructure = feeStructureRepository.save(testStructure);

        FeeStructureComponent fsc = new FeeStructureComponent();
        fsc.setFeeStructure(testStructure);
        fsc.setFeeHead(testHead);
        fsc.setAmount(new BigDecimal("50000.00"));
        testStructure.getComponents().add(fsc);
        testStructure = feeStructureRepository.save(testStructure);
    }

    @org.junit.jupiter.api.AfterEach
    void cleanUp() {
        jdbcTemplate.execute("DELETE FROM finance_receipt WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%')");
        jdbcTemplate.execute("DELETE FROM finance_payment_allocation WHERE payment_id IN (SELECT id FROM finance_payment WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%'))");
        jdbcTemplate.execute("DELETE FROM finance_payment WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%')");
        jdbcTemplate.execute("DELETE FROM student_fee_component WHERE student_fee_id IN (SELECT id FROM student_fee WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%'))");
        jdbcTemplate.execute("DELETE FROM student_fee WHERE student_id IN (SELECT id FROM students WHERE roll_number LIKE 'PG-STU-95%')");
        jdbcTemplate.execute("DELETE FROM fee_structure_component WHERE fee_structure_id IN (SELECT id FROM fee_structure WHERE code LIKE 'PG-FS-95%')");
        jdbcTemplate.execute("DELETE FROM fee_structure WHERE code LIKE 'PG-FS-95%'");
        jdbcTemplate.execute("DELETE FROM fee_head WHERE code LIKE 'PG-HEAD-95%'");
        jdbcTemplate.execute("DELETE FROM students WHERE roll_number LIKE 'PG-STU-95%'");
    }

    @Test
    @DisplayName("PostgreSQL IT: Two concurrent payment requests competing for a balance that can cover only one")
    void testConcurrentPaymentsCompetingForBalance() throws InterruptedException {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        final Long feeId = fee.getId();

        // Outstanding balance: 50,000.00
        // Competing threads try to record 40,000.00 each
        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    PaymentRequestDto request = new PaymentRequestDto();
                    request.setAmount(new BigDecimal("40000.00"));
                    request.setPaymentDate(LocalDate.now());
                    request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                    paymentService.recordPayment(request, feeId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    conflictCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        // Exactly one payment succeeds; the competing payment is rejected
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(conflictCount.get()).isEqualTo(1);

        // Verify StudentFee state
        StudentFee updatedFee = studentFeeRepository.findById(feeId).orElseThrow();
        assertThat(updatedFee.getPaidAmount()).isEqualByComparingTo(new BigDecimal("40000.00"));
        assertThat(updatedFee.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("10000.00"));
        assertThat(updatedFee.getStatus()).isEqualTo(StudentFeeStatus.PARTIALLY_PAID);

        // Verify Payment records
        List<Payment> payments = paymentRepository.findByStudentId(testStudent.getId());
        assertThat(payments).hasSize(1);
        assertThat(payments.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("40000.00"));

        // Verify total allocations
        Integer totalAllocations = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM finance_payment_allocation fpa JOIN finance_payment fp ON fpa.payment_id = fp.id WHERE fp.student_id = ?",
                Integer.class, testStudent.getId()
        );
        assertThat(totalAllocations).isEqualTo(1);
    }

    @Test
    @DisplayName("PostgreSQL IT: Replaying request with same idempotency key and payload returns existing receipt")
    void testDuplicatePaymentRequestsWithIdempotencyKey() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "PG-IDEMP-" + UUID.randomUUID();

        PaymentRequestDto req1 = new PaymentRequestDto();
        req1.setAmount(new BigDecimal("15000.00"));
        req1.setPaymentDate(LocalDate.now());
        req1.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        req1.setReferenceNumber("PG-REF-101");
        req1.setIdempotencyKey(idempotencyKey);

        Receipt receipt1 = paymentService.recordPayment(req1, fee.getId());
        assertThat(receipt1).isNotNull();

        // Retry same request
        PaymentRequestDto req2 = new PaymentRequestDto();
        req2.setAmount(new BigDecimal("15000.00"));
        req2.setPaymentDate(LocalDate.now());
        req2.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        req2.setReferenceNumber("PG-REF-101");
        req2.setIdempotencyKey(idempotencyKey);

        Receipt receipt2 = paymentService.recordPayment(req2, fee.getId());
        assertThat(receipt2.getId()).isEqualTo(receipt1.getId());
        assertThat(receipt2.getReceiptNumber()).isEqualTo(receipt1.getReceiptNumber());

        List<Payment> payments = paymentRepository.findByStudentId(testStudent.getId());
        assertThat(payments).hasSize(1);

        StudentFee updatedFee = studentFeeRepository.findById(fee.getId()).orElseThrow();
        assertThat(updatedFee.getPaidAmount()).isEqualByComparingTo(new BigDecimal("15000.00"));
        assertThat(updatedFee.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("35000.00"));
    }

    @Test
    @DisplayName("PostgreSQL IT: Reusing idempotency key with different payload is rejected")
    void testIdempotencyKeyConflictWithDifferentPayload() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "PG-CONFLICT-" + UUID.randomUUID();

        PaymentRequestDto req1 = new PaymentRequestDto();
        req1.setAmount(new BigDecimal("10000.00"));
        req1.setPaymentDate(LocalDate.now());
        req1.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        req1.setIdempotencyKey(idempotencyKey);

        paymentService.recordPayment(req1, fee.getId());

        PaymentRequestDto req2 = new PaymentRequestDto();
        req2.setAmount(new BigDecimal("20000.00"));
        req2.setPaymentDate(LocalDate.now());
        req2.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        req2.setIdempotencyKey(idempotencyKey);

        Assertions.assertThrows(BusinessException.class, () -> {
            paymentService.recordPayment(req2, fee.getId());
        });

        List<Payment> payments = paymentRepository.findByStudentId(testStudent.getId());
        assertThat(payments).hasSize(1);
    }

    @Test
    @DisplayName("PostgreSQL IT: Concurrent duplicate requests produce exactly one payment record")
    void testConcurrentDuplicateRequestsProduceSinglePayment() throws InterruptedException {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        final Long feeId = fee.getId();
        final String idempotencyKey = "PG-CONC-IDEMP-" + UUID.randomUUID();

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        List<Receipt> receipts = java.util.Collections.synchronizedList(new java.util.ArrayList<>());
        AtomicInteger errorCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    PaymentRequestDto req = new PaymentRequestDto();
                    req.setAmount(new BigDecimal("15000.00"));
                    req.setPaymentDate(LocalDate.now());
                    req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                    req.setReferenceNumber("PG-CONC-REF");
                    req.setIdempotencyKey(idempotencyKey);
                    Receipt r = paymentService.recordPayment(req, feeId);
                    receipts.add(r);
                } catch (Exception e) {
                    errorCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        assertThat(errorCount.get()).isEqualTo(0);
        assertThat(receipts).hasSize(2);
        assertThat(receipts.get(0).getId()).isEqualTo(receipts.get(1).getId());

        List<Payment> payments = paymentRepository.findByStudentId(testStudent.getId());
        assertThat(payments).hasSize(1);

        StudentFee updatedFee = studentFeeRepository.findById(feeId).orElseThrow();
        assertThat(updatedFee.getPaidAmount()).isEqualByComparingTo(new BigDecimal("15000.00"));
        assertThat(updatedFee.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("35000.00"));
    }

    @Test
    @DisplayName("PostgreSQL IT: Failed transaction rolls back and permits retry with same key")
    void testRetryAfterRollback() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "PG-ROLLBACK-" + UUID.randomUUID();

        PaymentRequestDto invalidReq = new PaymentRequestDto();
        invalidReq.setAmount(new BigDecimal("999999.00"));
        invalidReq.setPaymentDate(LocalDate.now());
        invalidReq.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        invalidReq.setIdempotencyKey(idempotencyKey);

        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            paymentService.recordPayment(invalidReq, fee.getId());
        });

        List<Payment> paymentsBefore = paymentRepository.findByStudentId(testStudent.getId());
        assertThat(paymentsBefore).isEmpty();

        PaymentRequestDto validReq = new PaymentRequestDto();
        validReq.setAmount(new BigDecimal("10000.00"));
        validReq.setPaymentDate(LocalDate.now());
        validReq.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        validReq.setIdempotencyKey(idempotencyKey);

        Receipt receipt = paymentService.recordPayment(validReq, fee.getId());
        assertThat(receipt).isNotNull();

        List<Payment> paymentsAfter = paymentRepository.findByStudentId(testStudent.getId());
        assertThat(paymentsAfter).hasSize(1);
    }

    @Test
    @DisplayName("PostgreSQL IT: Reusing idempotency key across different fees is rejected and leaves second fee balance untouched")
    void testCrossFeeSequentialIdempotencyRejection() {
        StudentFee fee1 = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        StudentFee fee2 = studentFeeService.assignFeeStructure(testStudent2.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "PG-CROSS-SEQ-" + UUID.randomUUID();

        PaymentRequestDto req1 = new PaymentRequestDto();
        req1.setAmount(new BigDecimal("10000.00"));
        req1.setPaymentDate(LocalDate.now());
        req1.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        req1.setIdempotencyKey(idempotencyKey);

        Receipt receipt1 = paymentService.recordPayment(req1, fee1.getId());
        assertThat(receipt1).isNotNull();

        PaymentRequestDto req2 = new PaymentRequestDto();
        req2.setAmount(new BigDecimal("10000.00"));
        req2.setPaymentDate(LocalDate.now());
        req2.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        req2.setIdempotencyKey(idempotencyKey);

        Assertions.assertThrows(BusinessException.class, () -> {
            paymentService.recordPayment(req2, fee2.getId());
        });

        StudentFee updatedFee1 = studentFeeRepository.findById(fee1.getId()).orElseThrow();
        assertThat(updatedFee1.getPaidAmount()).isEqualByComparingTo(new BigDecimal("10000.00"));

        StudentFee updatedFee2 = studentFeeRepository.findById(fee2.getId()).orElseThrow();
        assertThat(updatedFee2.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(updatedFee2.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("PostgreSQL IT: Concurrent cross-fee race with same idempotency key produces deterministic outcome without HTTP 500")
    void testCrossFeeConcurrentIdempotencyRace() throws InterruptedException {
        StudentFee fee1 = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        StudentFee fee2 = studentFeeService.assignFeeStructure(testStudent2.getId(), testStructure.getId(), testAcademicYear.getId());
        final String idempotencyKey = "PG-CROSS-CONC-" + UUID.randomUUID();

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);
        AtomicInteger unexpectedErrorCount = new AtomicInteger(0);

        executor.submit(() -> {
            try {
                PaymentRequestDto req = new PaymentRequestDto();
                req.setAmount(new BigDecimal("15000.00"));
                req.setPaymentDate(LocalDate.now());
                req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                req.setIdempotencyKey(idempotencyKey);
                paymentService.recordPayment(req, fee1.getId());
                successCount.incrementAndGet();
            } catch (BusinessException be) {
                rejectedCount.incrementAndGet();
            } catch (Exception e) {
                unexpectedErrorCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        });

        executor.submit(() -> {
            try {
                PaymentRequestDto req = new PaymentRequestDto();
                req.setAmount(new BigDecimal("15000.00"));
                req.setPaymentDate(LocalDate.now());
                req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                req.setIdempotencyKey(idempotencyKey);
                paymentService.recordPayment(req, fee2.getId());
                successCount.incrementAndGet();
            } catch (BusinessException be) {
                rejectedCount.incrementAndGet();
            } catch (Exception e) {
                unexpectedErrorCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        });

        latch.await();
        executor.shutdown();

        assertThat(unexpectedErrorCount.get()).isEqualTo(0);
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(rejectedCount.get()).isEqualTo(1);

        StudentFee updatedFee1 = studentFeeRepository.findById(fee1.getId()).orElseThrow();
        StudentFee updatedFee2 = studentFeeRepository.findById(fee2.getId()).orElseThrow();

        boolean fee1Paid = updatedFee1.getPaidAmount().compareTo(new BigDecimal("15000.00")) == 0;
        boolean fee2Paid = updatedFee2.getPaidAmount().compareTo(new BigDecimal("15000.00")) == 0;

        assertThat(fee1Paid ^ fee2Paid).isTrue();

        if (fee1Paid) {
            assertThat(updatedFee2.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(updatedFee2.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        } else {
            assertThat(updatedFee1.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(updatedFee1.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        }
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("PostgreSQL IT: Replaying request via HTTP returns 200 with original receipt; conflict returns HTTP 409")
    void testIdempotencyHttpOutcomesReplayAndConflict() throws Exception {
        StudentFee fee1 = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        StudentFee fee2 = studentFeeService.assignFeeStructure(testStudent2.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "PG-HTTP-" + UUID.randomUUID();

        PaymentRequestDto initialReq = new PaymentRequestDto();
        initialReq.setAmount(new BigDecimal("12000.00"));
        initialReq.setPaymentDate(LocalDate.now());
        initialReq.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        initialReq.setReferenceNumber("PG-HTTP-REF-1");

        // 1. Initial request -> HTTP 200 OK
        String res1 = mockMvc.perform(post("/api/v1/finance/payments/student-fee/" + fee1.getId())
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.receiptNumber").exists())
                .andReturn().getResponse().getContentAsString();

        Long receiptId1 = objectMapper.readTree(res1).get("id").asLong();

        // 2. Exact replay on same fee -> HTTP 200 OK with identical receipt
        String res2 = mockMvc.perform(post("/api/v1/finance/payments/student-fee/" + fee1.getId())
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long receiptId2 = objectMapper.readTree(res2).get("id").asLong();
        assertThat(receiptId2).isEqualTo(receiptId1);

        // 3. Same key with different amount on same fee -> HTTP 409 Conflict
        PaymentRequestDto diffAmountReq = new PaymentRequestDto();
        diffAmountReq.setAmount(new BigDecimal("24000.00"));
        diffAmountReq.setPaymentDate(LocalDate.now());
        diffAmountReq.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        diffAmountReq.setReferenceNumber("PG-HTTP-REF-1");

        mockMvc.perform(post("/api/v1/finance/payments/student-fee/" + fee1.getId())
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(diffAmountReq)))
                .andExpect(status().isConflict());

        // 4. Same key on different fee -> HTTP 409 Conflict
        mockMvc.perform(post("/api/v1/finance/payments/student-fee/" + fee2.getId())
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialReq)))
                .andExpect(status().isConflict());

        // Assert fee balances & payment counts
        StudentFee updatedFee1 = studentFeeRepository.findById(fee1.getId()).orElseThrow();
        StudentFee updatedFee2 = studentFeeRepository.findById(fee2.getId()).orElseThrow();

        assertThat(updatedFee1.getPaidAmount()).isEqualByComparingTo(new BigDecimal("12000.00"));
        assertThat(updatedFee1.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("38000.00"));

        assertThat(updatedFee2.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(updatedFee2.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));

        List<Payment> fee1Payments = paymentRepository.findByStudentId(testStudent.getId());
        List<Payment> fee2Payments = paymentRepository.findByStudentId(testStudent2.getId());

        assertThat(fee1Payments).hasSize(1);
        assertThat(fee2Payments).isEmpty();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("PostgreSQL IT: Concurrent cross-fee race via HTTP yields one 200 and one 409 without 500")
    void testCrossFeeConcurrentRaceHttpOutcomes() throws Exception {
        StudentFee fee1 = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());
        StudentFee fee2 = studentFeeService.assignFeeStructure(testStudent2.getId(), testStructure.getId(), testAcademicYear.getId());
        final String idempotencyKey = "PG-CONC-HTTP-" + UUID.randomUUID();

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger okCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);

        SecurityContext securityContext = SecurityContextHolder.getContext();

        executor.submit(() -> {
            SecurityContextHolder.setContext(securityContext);
            try {
                PaymentRequestDto req = new PaymentRequestDto();
                req.setAmount(new BigDecimal("18000.00"));
                req.setPaymentDate(LocalDate.now());
                req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);

                int status = mockMvc.perform(post("/api/v1/finance/payments/student-fee/" + fee1.getId())
                                .header("Idempotency-Key", idempotencyKey)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                        .andReturn().getResponse().getStatus();

                if (status == 200) okCount.incrementAndGet();
                else if (status == 409) conflictCount.incrementAndGet();
                else errorCount.incrementAndGet();
            } catch (Exception e) {
                errorCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        });

        executor.submit(() -> {
            SecurityContextHolder.setContext(securityContext);
            try {
                PaymentRequestDto req = new PaymentRequestDto();
                req.setAmount(new BigDecimal("18000.00"));
                req.setPaymentDate(LocalDate.now());
                req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);

                int status = mockMvc.perform(post("/api/v1/finance/payments/student-fee/" + fee2.getId())
                                .header("Idempotency-Key", idempotencyKey)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                        .andReturn().getResponse().getStatus();

                if (status == 200) okCount.incrementAndGet();
                else if (status == 409) conflictCount.incrementAndGet();
                else errorCount.incrementAndGet();
            } catch (Exception e) {
                errorCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        });

        latch.await();
        executor.shutdown();

        assertThat(errorCount.get()).isEqualTo(0);
        assertThat(okCount.get()).isEqualTo(1);
        assertThat(conflictCount.get()).isEqualTo(1);

        StudentFee updatedFee1 = studentFeeRepository.findById(fee1.getId()).orElseThrow();
        StudentFee updatedFee2 = studentFeeRepository.findById(fee2.getId()).orElseThrow();

        boolean fee1Paid = updatedFee1.getPaidAmount().compareTo(new BigDecimal("18000.00")) == 0;
        boolean fee2Paid = updatedFee2.getPaidAmount().compareTo(new BigDecimal("18000.00")) == 0;

        assertThat(fee1Paid ^ fee2Paid).isTrue();

        if (fee1Paid) {
            assertThat(updatedFee2.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(updatedFee2.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        } else {
            assertThat(updatedFee1.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(updatedFee1.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        }
    }

    @Test
    @DisplayName("PostgreSQL IT: Existing payment records with null idempotency key remain valid after V5 migration")
    void testExistingPaymentRecordsRemainValidAfterV5Migration() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent.getId(), testStructure.getId(), testAcademicYear.getId());

        // Insert legacy payment without idempotency key
        Payment legacyPayment = new Payment();
        legacyPayment.setStudentId(testStudent.getId());
        legacyPayment.setStudentFee(fee);
        legacyPayment.setAmount(new BigDecimal("5000.00"));
        legacyPayment.setPaymentDate(LocalDate.now());
        legacyPayment.setPaymentMethod(PaymentMethod.CASH);
        legacyPayment.setReferenceNumber("PG-LEGACY-001");
        legacyPayment.setStatus(com.erp.finance.enums.PaymentStatus.SUCCESS);
        legacyPayment.setCreatedBy("ADMIN");
        legacyPayment.setIdempotencyKey(null);
        legacyPayment.setRequestHash(null);
        paymentRepository.save(legacyPayment);

        List<Payment> payments = paymentRepository.findByStudentId(testStudent.getId());
        assertThat(payments).isNotEmpty();
        assertThat(payments.stream().anyMatch(p -> "PG-LEGACY-001".equals(p.getReferenceNumber()))).isTrue();
    }
}
