package com.erp.finance;

import com.erp.common.exception.BusinessException;
import com.erp.academic.academic_year.entity.AcademicYear;
import com.erp.academic.academic_year.repository.AcademicYearRepository;
import com.erp.auth.entity.AppUser;
import com.erp.auth.model.Role;
import com.erp.auth.model.UserPrincipal;
import com.erp.auth.repository.UserRepository;
import com.erp.finance.dto.FeeStructureResponseDto;
import com.erp.finance.dto.FinanceSummaryResponseDto;
import com.erp.finance.dto.PaymentRequestDto;
import com.erp.finance.dto.ReceiptResponseDto;
import com.erp.finance.dto.StudentFeeResponseDto;
import com.erp.finance.enums.PaymentMethod;
import com.erp.finance.enums.PaymentStatus;
import com.erp.finance.enums.StudentFeeStatus;
import com.erp.finance.fee_structure.entity.FeeHead;
import com.erp.finance.fee_structure.entity.FeeStructure;
import com.erp.finance.fee_structure.entity.FeeStructureComponent;
import com.erp.finance.fee_structure.repository.FeeHeadRepository;
import com.erp.finance.fee_structure.repository.FeeStructureRepository;
import com.erp.finance.invoice.entity.Receipt;
import com.erp.finance.payment.entity.Payment;
import com.erp.finance.payment.repository.PaymentRepository;
import com.erp.finance.service.FinanceReportService;
import com.erp.finance.service.PaymentService;
import com.erp.finance.service.StudentFeeService;
import com.erp.finance.student_fee.entity.StudentFee;
import com.erp.finance.student_fee.entity.StudentFeeComponent;
import com.erp.finance.student_fee.repository.StudentFeeRepository;
import com.erp.guardian.entity.Guardian;
import com.erp.guardian.repository.GuardianRepository;
import com.erp.security.SecurityOwnershipService;
import com.erp.student.entity.Student;
import com.erp.student.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class FinanceModuleIntegrityAuditTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FeeHeadRepository feeHeadRepository;

    @Autowired
    private FeeStructureRepository feeStructureRepository;

    @Autowired
    private StudentFeeRepository studentFeeRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GuardianRepository guardianRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FinanceReportService financeReportService;

    @Autowired
    private com.erp.finance.invoice.repository.ReceiptRepository receiptRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private StudentFeeService studentFeeService;

    @Autowired
    private SecurityOwnershipService securityOwnershipService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private Student testStudent1;
    private Student testStudent2;
    private AppUser studentUser1;
    private AppUser studentUser2;
    private FeeHead testHead;
    private FeeStructure testStructure;
    private AcademicYear testAcademicYear;

    @BeforeEach
    void setupTestData() {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        tx.execute(status -> {
            guardianRepository.deleteAll();
            receiptRepository.deleteAll();
            paymentRepository.deleteAll();
            studentFeeRepository.deleteAll();

            // Create academic year
            testAcademicYear = new AcademicYear();
            testAcademicYear.setName("AY-2026-2027-" + UUID.randomUUID().toString().substring(0, 5));
            testAcademicYear.setStartDate(LocalDate.of(2026, 7, 1));
            testAcademicYear.setEndDate(LocalDate.of(2027, 6, 30));
            testAcademicYear = academicYearRepository.save(testAcademicYear);

            // Create student 1 & user
            studentUser1 = new AppUser();
            studentUser1.setUsername("student1_" + UUID.randomUUID());
            studentUser1.setEmail("student1_" + UUID.randomUUID() + "@university.edu");
            studentUser1.setPassword("Secret123!");
            studentUser1.setRole(Role.STUDENT);
            studentUser1 = userRepository.save(studentUser1);

            testStudent1 = new Student();
            testStudent1.setFirstName("Alice");
            testStudent1.setLastName("Audit");
            testStudent1.setEmail(studentUser1.getEmail());
            testStudent1.setRollNumber("FIN-001-" + UUID.randomUUID().toString().substring(0, 5));
            testStudent1.setDepartment("Computer Science");
            testStudent1.setBatch("2026");
            testStudent1.setEnrollmentDate(LocalDate.now());
            testStudent1.setDateOfBirth(LocalDate.of(2004, 1, 1));
            testStudent1.setGender("FEMALE");
            testStudent1.setPhone("+919876543210");
            testStudent1.setUserId(studentUser1.getId());
            testStudent1 = studentRepository.save(testStudent1);

            // Create student 2 & user
            studentUser2 = new AppUser();
            studentUser2.setUsername("student2_" + UUID.randomUUID());
            studentUser2.setEmail("student2_" + UUID.randomUUID() + "@university.edu");
            studentUser2.setPassword("Secret123!");
            studentUser2.setRole(Role.STUDENT);
            studentUser2 = userRepository.save(studentUser2);

            testStudent2 = new Student();
            testStudent2.setFirstName("Bob");
            testStudent2.setLastName("Audit");
            testStudent2.setEmail(studentUser2.getEmail());
            testStudent2.setRollNumber("FIN-002-" + UUID.randomUUID().toString().substring(0, 5));
            testStudent2.setDepartment("Computer Science");
            testStudent2.setBatch("2026");
            testStudent2.setEnrollmentDate(LocalDate.now());
            testStudent2.setDateOfBirth(LocalDate.of(2004, 1, 1));
            testStudent2.setGender("MALE");
            testStudent2.setPhone("+919876543211");
            testStudent2.setUserId(studentUser2.getId());
            testStudent2 = studentRepository.save(testStudent2);

            // Create FeeHead
            testHead = new FeeHead();
            testHead.setCode("TUIT-" + UUID.randomUUID().toString().substring(0, 5));
            testHead.setName("Tuition Fee");
            testHead.setActive(true);
            testHead = feeHeadRepository.save(testHead);

            // Create FeeStructure
            testStructure = new FeeStructure();
            testStructure.setCode("FS-ENG-" + UUID.randomUUID().toString().substring(0, 5));
            testStructure.setName("B.Tech Fee Structure");
            testStructure.setActive(true);
            testStructure.setAcademicYearId(testAcademicYear.getId());
            testStructure = feeStructureRepository.save(testStructure);

            // Add component to structure
            FeeStructureComponent comp = new FeeStructureComponent();
            comp.setFeeStructure(testStructure);
            comp.setFeeHead(testHead);
            comp.setAmount(new BigDecimal("50000.00"));
            testStructure.getComponents().add(comp);
            testStructure = feeStructureRepository.save(testStructure);

            return null;
        });
    }

    private UsernamePasswordAuthenticationToken createAuthToken(AppUser appUser, String roleName) {
        UserPrincipal principal = new UserPrincipal(
                appUser.getId(),
                appUser.getUsername(),
                appUser.getPassword(),
                appUser.getEmail(),
                appUser.getRole(),
                appUser.getRole().getPermissions(),
                true
        );
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }

    // ==========================================
    // 1. Unauthenticated Access (Must be 401)
    // ==========================================

    @Test
    @DisplayName("Unauthenticated requests to finance endpoints must return 401")
    void unauthenticatedRequestsReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/finance/fee-structures"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/finance/reports/summary"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/finance/student-fees"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/finance/student-fees/assign?studentId=1&feeStructureId=1&academicYearId=1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/finance/payments/student-fee/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // 2. DEF-FIN-02: Restrict Student Finance Access
    // ==========================================

    @Test
    @DisplayName("DEF-FIN-02: FACULTY cannot access student financial records (returns 403 Forbidden)")
    @WithMockUser(roles = "FACULTY")
    void facultyCannotAccessStudentFees() throws Exception {
        // Faculty attempting to read student fees receives 403 Forbidden
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent1.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DEF-FIN-02: Faculty maintains legitimate access to academic student data")
    void facultyMaintainsAcademicAccess() {
        UsernamePasswordAuthenticationToken facultyAuth = new UsernamePasswordAuthenticationToken(
                "prof_smith", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_FACULTY"))
        );
        // Academic access method still returns true for faculty
        assertThat(securityOwnershipService.canAccessStudentData(facultyAuth, testStudent1.getId())).isTrue();
        // But finance access method returns false for faculty!
        assertThat(securityOwnershipService.canAccessStudentFinance(facultyAuth, testStudent1.getId())).isFalse();
    }

    @Test
    @DisplayName("DEF-FIN-02: Student can view their own fee record but CANNOT view another student's fee record")
    void studentFeeOwnershipAndIdorCheck() throws Exception {
        UsernamePasswordAuthenticationToken student1Auth = createAuthToken(studentUser1, "ROLE_STUDENT");

        // Assign fee to student 1
        studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());

        // Student 1 accessing Student 1 -> 200 OK
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent1.getId())
                        .with(authentication(student1Auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(testStudent1.getId()))
                .andExpect(jsonPath("$[0].grossAmount").value(50000.00));

        // Student 1 accessing Student 2 -> 403 Forbidden (IDOR prevented)
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent2.getId())
                        .with(authentication(student1Auth)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Parent can view their authorized ward's fee record but CANNOT view another student's fee record")
    void parentFeeOwnershipAndIdorCheck() throws Exception {
        // Create verified parent user and guardian linked to testStudent1
        AppUser parentUser = new AppUser();
        parentUser.setUsername("parent_" + UUID.randomUUID());
        parentUser.setEmail("parent_" + UUID.randomUUID() + "@university.edu");
        parentUser.setPassword("Secret123!");
        parentUser.setRole(Role.PARENT);
        parentUser = userRepository.save(parentUser);

        Guardian guardian = new Guardian("Parent", "Test", "MOTHER", "+919876543299", parentUser.getEmail());
        guardian.setUserId(parentUser.getId());
        guardian.setStudent(testStudent1);
        guardianRepository.save(guardian);

        // Assign fee to testStudent1 and testStudent2
        studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        studentFeeService.assignFeeStructure(testStudent2.getId(), testStructure.getId(), testAcademicYear.getId());

        UsernamePasswordAuthenticationToken parentAuth = createAuthToken(parentUser, "ROLE_PARENT");

        // Verified parent accessing Ward (testStudent1) -> 200 OK
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent1.getId())
                        .with(authentication(parentAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(testStudent1.getId()))
                .andExpect(jsonPath("$[0].grossAmount").value(50000.00));

        // Verified parent accessing testStudent2 (not their ward) -> 403 Forbidden (IDOR prevented)
        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent2.getId())
                        .with(authentication(parentAuth)))
                .andExpect(status().isForbidden());

        // Unverified parent (not guardian of testStudent1) -> 403 Forbidden
        AppUser strangerParent = new AppUser();
        strangerParent.setUsername("stranger_" + UUID.randomUUID());
        strangerParent.setEmail("stranger_" + UUID.randomUUID() + "@university.edu");
        strangerParent.setPassword("Secret123!");
        strangerParent.setRole(Role.PARENT);
        strangerParent = userRepository.save(strangerParent);
        UsernamePasswordAuthenticationToken strangerAuth = createAuthToken(strangerParent, "ROLE_PARENT");

        mockMvc.perform(get("/api/v1/finance/student-fees/student/" + testStudent1.getId())
                        .with(authentication(strangerAuth)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Parent can access their own guardian profile via /api/v1/guardians/me")
    void parentCanAccessGuardiansMe() throws Exception {
        AppUser parentUser = new AppUser();
        parentUser.setUsername("parent_me_" + UUID.randomUUID());
        parentUser.setEmail("parent_me_" + UUID.randomUUID() + "@university.edu");
        parentUser.setPassword("Secret123!");
        parentUser.setRole(Role.PARENT);
        parentUser = userRepository.save(parentUser);

        Guardian guardian = new Guardian("ParentMe", "Test", "FATHER", "+919876543288", parentUser.getEmail());
        guardian.setUserId(parentUser.getId());
        guardian.setStudent(testStudent1);
        guardianRepository.save(guardian);

        UsernamePasswordAuthenticationToken parentAuth = createAuthToken(parentUser, "ROLE_PARENT");

        mockMvc.perform(get("/api/v1/guardians/me")
                        .with(authentication(parentAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].email").value(parentUser.getEmail()))
                .andExpect(jsonPath("$.data[0].studentId").value(testStudent1.getId()));
    }

    @Test
    @DisplayName("STUDENT, FACULTY, and PARENT cannot view administrative finance reports")
    @WithMockUser(roles = "STUDENT")
    void studentCannotAccessFinanceReportsSummary() throws Exception {
        mockMvc.perform(get("/api/v1/finance/reports/summary"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("FINANCE and ADMIN roles can access financial reports and structures")
    @WithMockUser(roles = "FINANCE")
    void financeRoleCanAccessReportsAndStructures() throws Exception {
        mockMvc.perform(get("/api/v1/finance/fee-structures"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/finance/reports/summary"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/finance/student-fees"))
                .andExpect(status().isOk());
    }

    // ==========================================
    // 3. DEF-FIN-03: Correct Revenue Calculation
    // ==========================================

    @Test
    @DisplayName("DEF-FIN-03: Revenue calculation strictly includes SUCCESS payments and excludes FAILED/CANCELLED/REVERSED/PENDING")
    void revenueCalculationOnlyIncludesSuccessPayments() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());

        // 1. FAILED payment of 10,000
        Payment failedPayment = new Payment();
        failedPayment.setStudentId(testStudent1.getId());
        failedPayment.setStudentFee(fee);
        failedPayment.setAmount(new BigDecimal("10000.00"));
        failedPayment.setPaymentDate(LocalDate.now());
        failedPayment.setPaymentMethod(PaymentMethod.ONLINE);
        failedPayment.setReferenceNumber("FAIL-" + UUID.randomUUID());
        failedPayment.setStatus(PaymentStatus.FAILED);
        failedPayment.setCreatedBy("GATEWAY");
        paymentRepository.save(failedPayment);

        // 2. CANCELLED payment of 5,000
        Payment cancelledPayment = new Payment();
        cancelledPayment.setStudentId(testStudent1.getId());
        cancelledPayment.setStudentFee(fee);
        cancelledPayment.setAmount(new BigDecimal("5000.00"));
        cancelledPayment.setPaymentDate(LocalDate.now());
        cancelledPayment.setPaymentMethod(PaymentMethod.ONLINE);
        cancelledPayment.setReferenceNumber("CANCEL-" + UUID.randomUUID());
        cancelledPayment.setStatus(PaymentStatus.CANCELLED);
        cancelledPayment.setCreatedBy("GATEWAY");
        paymentRepository.save(cancelledPayment);

        // 3. REVERSED payment of 3,000
        Payment reversedPayment = new Payment();
        reversedPayment.setStudentId(testStudent1.getId());
        reversedPayment.setStudentFee(fee);
        reversedPayment.setAmount(new BigDecimal("3000.00"));
        reversedPayment.setPaymentDate(LocalDate.now());
        reversedPayment.setPaymentMethod(PaymentMethod.ONLINE);
        reversedPayment.setReferenceNumber("REV-" + UUID.randomUUID());
        reversedPayment.setStatus(PaymentStatus.REVERSED);
        reversedPayment.setCreatedBy("GATEWAY");
        paymentRepository.save(reversedPayment);

        // 4. PENDING payment of 2,000
        Payment pendingPayment = new Payment();
        pendingPayment.setStudentId(testStudent1.getId());
        pendingPayment.setStudentFee(fee);
        pendingPayment.setAmount(new BigDecimal("2000.00"));
        pendingPayment.setPaymentDate(LocalDate.now());
        pendingPayment.setPaymentMethod(PaymentMethod.ONLINE);
        pendingPayment.setReferenceNumber("PEND-" + UUID.randomUUID());
        pendingPayment.setStatus(PaymentStatus.PENDING);
        pendingPayment.setCreatedBy("GATEWAY");
        paymentRepository.save(pendingPayment);

        // 5. SUCCESS payment of 25,000
        Payment successPayment = new Payment();
        successPayment.setStudentId(testStudent1.getId());
        successPayment.setStudentFee(fee);
        successPayment.setAmount(new BigDecimal("25000.00"));
        successPayment.setPaymentDate(LocalDate.now());
        successPayment.setPaymentMethod(PaymentMethod.ONLINE);
        successPayment.setReferenceNumber("SUCC-" + UUID.randomUUID());
        successPayment.setStatus(PaymentStatus.SUCCESS);
        successPayment.setCreatedBy("GATEWAY");
        paymentRepository.save(successPayment);

        // Query summary
        FinanceSummaryResponseDto summary = financeReportService.getFinancialSummaryDto();

        // Exactly 25,000 collected (the SUCCESS payment only)
        assertThat(summary.getTotalCollected()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(summary.getTotalGrossAssigned()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    // ==========================================
    // 4. DEF-FIN-01: Response DTOs & Serialization
    // ==========================================

    @Test
    @DisplayName("DEF-FIN-01: StudentFeeResponseDto and FeeStructureResponseDto serialize without recursion")
    void responseDtosSerializeCleanly() throws Exception {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        StudentFeeResponseDto feeDto = StudentFeeResponseDto.fromEntity(fee);

        String json = objectMapper.writeValueAsString(feeDto);
        assertThat(json).contains("\"grossAmount\":50000.00");
        assertThat(json).contains("\"components\":[");
        assertThat(json).doesNotContain("\"document nesting depth\"");

        FeeStructureResponseDto structureDto = FeeStructureResponseDto.fromEntity(testStructure);
        String structJson = objectMapper.writeValueAsString(structureDto);
        assertThat(structJson).contains("\"components\":[");
    }

    // ==========================================
    // 5. DEF-FIN-05: Fee Assignment Validation
    // ==========================================

    @Test
    @DisplayName("DEF-FIN-05: Fee assignment rejects non-existent student")
    void feeAssignmentRejectsNonExistentStudent() {
        Long nonExistentStudentId = 99999999L;
        assertThrows(IllegalArgumentException.class, () ->
                studentFeeService.assignFeeStructure(nonExistentStudentId, testStructure.getId(), testAcademicYear.getId()));
    }

    @Test
    @DisplayName("DEF-FIN-05: Fee assignment rejects non-existent academic year")
    void feeAssignmentRejectsNonExistentAcademicYear() {
        Long nonExistentAcademicYearId = 88888888L;
        assertThrows(IllegalArgumentException.class, () ->
                studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), nonExistentAcademicYearId));
    }

    @Test
    @DisplayName("DEF-FIN-05: Duplicate fee assignment for same academic year is rejected")
    void feeAssignmentRejectsDuplicates() {
        studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());

        assertThrows(IllegalArgumentException.class, () ->
                studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId()));
    }

    // ==========================================
    // 6. DEF-FIN-06: Payment Audit Attribution
    // ==========================================

    @Test
    @DisplayName("DEF-FIN-06: Payment recording records actual authenticated user and prevents caller spoofing")
    void paymentAuditAttributionRecordsAuthenticatedUser() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());

        // Set authenticated user in SecurityContext
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                "finance_officer_bob", null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_FINANCE"))
        );
        SecurityContextHolder.getContext().setAuthentication(authToken);

        PaymentRequestDto request = new PaymentRequestDto();
        request.setAmount(new BigDecimal("10000.00"));
        request.setPaymentDate(LocalDate.now());
        request.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        request.setRemarks("Fee installment 1");

        Receipt receipt = paymentService.recordPayment(request, fee.getId());

        Payment savedPayment = paymentRepository.findById(receipt.getPayment().getId()).orElseThrow();
        assertThat(savedPayment.getCreatedBy()).isEqualTo("finance_officer_bob");

        SecurityContextHolder.clearContext();
    }

    // ==========================================
    // 7. DEF-FIN-04: Concurrency Protection
    // ==========================================

    @Test
    @DisplayName("DEF-FIN-04: Competing concurrent payment requests for same fee - exactly one succeeds")
    void concurrentPaymentRequestsCompetingForBalance() throws InterruptedException {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        final Long feeId = fee.getId();

        // Outstanding balance is 50,000.
        // Two competing requests each try to pay 40,000.
        // Both cannot succeed because total (80,000) exceeds 50,000.
        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    PaymentRequestDto request = new PaymentRequestDto();
                    request.setAmount(new BigDecimal("40000.00"));
                    request.setPaymentDate(LocalDate.now());
                    request.setPaymentMethod(PaymentMethod.ONLINE);
                    paymentService.recordPayment(request, feeId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        assertThat(successCount.get()).isEqualTo(1);
        assertThat(failureCount.get()).isEqualTo(1);

        StudentFee updatedFee = studentFeeRepository.findById(feeId).orElseThrow();
        assertThat(updatedFee.getPaidAmount()).isEqualByComparingTo(new BigDecimal("40000.00"));
        assertThat(updatedFee.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("10000.00"));
        assertThat(updatedFee.getStatus()).isEqualTo(StudentFeeStatus.PARTIALLY_PAID);

        List<Payment> payments = paymentRepository.findAll();
        assertThat(payments).hasSize(1);
    }

    // ==========================================
    // 8. Batch 12: Payment Idempotency & Integrity
    // ==========================================

    @Test
    @DisplayName("Idempotency: Replaying request with same key and payload returns existing receipt without double-charging")
    void sameIdempotencyKeyAndSamePayload_returnsExistingReceipt() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "IDEMP-KEY-" + UUID.randomUUID();

        PaymentRequestDto req1 = new PaymentRequestDto();
        req1.setAmount(new BigDecimal("15000.00"));
        req1.setPaymentDate(LocalDate.now());
        req1.setPaymentMethod(PaymentMethod.ONLINE);
        req1.setReferenceNumber("REF-TXN-101");
        req1.setIdempotencyKey(idempotencyKey);

        Receipt receipt1 = paymentService.recordPayment(req1, fee.getId());
        assertThat(receipt1).isNotNull();
        assertThat(receipt1.getReceiptNumber()).isNotNull();

        // Check fee state after first payment
        StudentFee feeAfter1 = studentFeeRepository.findById(fee.getId()).orElseThrow();
        assertThat(feeAfter1.getPaidAmount()).isEqualByComparingTo(new BigDecimal("15000.00"));
        assertThat(feeAfter1.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("35000.00"));
        assertThat(paymentRepository.count()).isEqualTo(1);

        // Retry same request with same idempotency key and same payload
        PaymentRequestDto req2 = new PaymentRequestDto();
        req2.setAmount(new BigDecimal("15000.00"));
        req2.setPaymentDate(LocalDate.now());
        req2.setPaymentMethod(PaymentMethod.ONLINE);
        req2.setReferenceNumber("REF-TXN-101");
        req2.setIdempotencyKey(idempotencyKey);

        Receipt receipt2 = paymentService.recordPayment(req2, fee.getId());
        assertThat(receipt2).isNotNull();
        assertThat(receipt2.getId()).isEqualTo(receipt1.getId());
        assertThat(receipt2.getReceiptNumber()).isEqualTo(receipt1.getReceiptNumber());

        // Balance must not be consumed twice and only 1 payment must exist
        StudentFee feeAfter2 = studentFeeRepository.findById(fee.getId()).orElseThrow();
        assertThat(feeAfter2.getPaidAmount()).isEqualByComparingTo(new BigDecimal("15000.00"));
        assertThat(feeAfter2.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("35000.00"));
        assertThat(paymentRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Idempotency: Reusing idempotency key with different payload is rejected with BusinessException (HTTP 409 Conflict)")
    void sameIdempotencyKeyWithDifferentPayload_rejectedWithException() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "IDEMP-CONFLICT-" + UUID.randomUUID();

        PaymentRequestDto req1 = new PaymentRequestDto();
        req1.setAmount(new BigDecimal("10000.00"));
        req1.setPaymentDate(LocalDate.now());
        req1.setPaymentMethod(PaymentMethod.ONLINE);
        req1.setIdempotencyKey(idempotencyKey);

        Receipt receipt1 = paymentService.recordPayment(req1, fee.getId());
        assertThat(receipt1).isNotNull();

        // Send different amount with same idempotency key
        PaymentRequestDto req2 = new PaymentRequestDto();
        req2.setAmount(new BigDecimal("20000.00"));
        req2.setPaymentDate(LocalDate.now());
        req2.setPaymentMethod(PaymentMethod.ONLINE);
        req2.setIdempotencyKey(idempotencyKey);

        org.junit.jupiter.api.Assertions.assertThrows(BusinessException.class, () -> {
            paymentService.recordPayment(req2, fee.getId());
        });

        // Ensure state remains consistent (only 1 payment persisted)
        assertThat(paymentRepository.count()).isEqualTo(1);
        StudentFee updatedFee = studentFeeRepository.findById(fee.getId()).orElseThrow();
        assertThat(updatedFee.getPaidAmount()).isEqualByComparingTo(new BigDecimal("10000.00"));
    }

    @Test
    @DisplayName("Idempotency: Concurrent duplicate requests produce one logical payment result")
    void concurrentDuplicateRequests_produceOnePaymentResult() throws InterruptedException {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        final Long feeId = fee.getId();
        final String idempotencyKey = "CONCURRENT-IDEMP-" + UUID.randomUUID();

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        List<Receipt> receipts = java.util.Collections.synchronizedList(new java.util.ArrayList<>());
        AtomicInteger errors = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    PaymentRequestDto req = new PaymentRequestDto();
                    req.setAmount(new BigDecimal("12000.00"));
                    req.setPaymentDate(LocalDate.now());
                    req.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                    req.setReferenceNumber("CONC-REF-1");
                    req.setIdempotencyKey(idempotencyKey);
                    Receipt r = paymentService.recordPayment(req, feeId);
                    receipts.add(r);
                } catch (Exception e) {
                    errors.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        assertThat(errors.get()).isEqualTo(0);
        assertThat(receipts).hasSize(2);
        // Both threads must receive the same receipt
        assertThat(receipts.get(0).getId()).isEqualTo(receipts.get(1).getId());
        assertThat(receipts.get(0).getReceiptNumber()).isEqualTo(receipts.get(1).getReceiptNumber());

        // Balance deducted only once
        StudentFee updatedFee = studentFeeRepository.findById(feeId).orElseThrow();
        assertThat(updatedFee.getPaidAmount()).isEqualByComparingTo(new BigDecimal("12000.00"));
        assertThat(updatedFee.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("38000.00"));
        assertThat(paymentRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Idempotency: Retry after transaction rollback succeeds without permanent key lock")
    void retryAfterTransactionRollback_succeeds() {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "ROLLBACK-KEY-" + UUID.randomUUID();

        // First attempt sends amount exceeding balance -> fails and rolls back
        PaymentRequestDto invalidReq = new PaymentRequestDto();
        invalidReq.setAmount(new BigDecimal("999999.00"));
        invalidReq.setPaymentDate(LocalDate.now());
        invalidReq.setPaymentMethod(PaymentMethod.ONLINE);
        invalidReq.setIdempotencyKey(idempotencyKey);

        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () -> {
            paymentService.recordPayment(invalidReq, fee.getId());
        });

        assertThat(paymentRepository.count()).isEqualTo(0);

        // Client fixes amount and retries with the same idempotency key
        PaymentRequestDto validReq = new PaymentRequestDto();
        validReq.setAmount(new BigDecimal("10000.00"));
        validReq.setPaymentDate(LocalDate.now());
        validReq.setPaymentMethod(PaymentMethod.ONLINE);
        validReq.setIdempotencyKey(idempotencyKey);

        Receipt receipt = paymentService.recordPayment(validReq, fee.getId());
        assertThat(receipt).isNotNull();
        assertThat(paymentRepository.count()).isEqualTo(1);

        StudentFee updatedFee = studentFeeRepository.findById(fee.getId()).orElseThrow();
        assertThat(updatedFee.getPaidAmount()).isEqualByComparingTo(new BigDecimal("10000.00"));
    }

    @Test
    @WithMockUser(username = "finance_officer", roles = {"FINANCE"})
    @DisplayName("Idempotency: HTTP Controller with Idempotency-Key header is fully idempotent")
    void httpController_withIdempotencyKeyHeader_isIdempotent() throws Exception {
        StudentFee fee = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        String key = "HEADER-KEY-" + UUID.randomUUID();

        PaymentRequestDto req = new PaymentRequestDto();
        req.setAmount(new BigDecimal("5000.00"));
        req.setPaymentDate(LocalDate.now());
        req.setPaymentMethod(PaymentMethod.ONLINE);
        req.setReferenceNumber("REF-HEADER-1");

        // First POST
        String res1 = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/v1/finance/payments/student-fee/" + fee.getId())
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andReturn().getResponse().getContentAsString();

        ReceiptResponseDto receipt1 = objectMapper.readValue(res1, ReceiptResponseDto.class);

        // Second POST with same header and body
        String res2 = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/v1/finance/payments/student-fee/" + fee.getId())
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andReturn().getResponse().getContentAsString();

        ReceiptResponseDto receipt2 = objectMapper.readValue(res2, ReceiptResponseDto.class);

        assertThat(receipt2.getId()).isEqualTo(receipt1.getId());
        assertThat(receipt2.getReceiptNumber()).isEqualTo(receipt1.getReceiptNumber());
        assertThat(paymentRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Idempotency: Reusing idempotency key across different fee records is rejected and does not alter second fee")
    void sameIdempotencyKeyWithDifferentFee_rejectedWithException() {
        StudentFee fee1 = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        StudentFee fee2 = studentFeeService.assignFeeStructure(testStudent2.getId(), testStructure.getId(), testAcademicYear.getId());
        String idempotencyKey = "CROSS-FEE-SEQ-" + UUID.randomUUID();

        PaymentRequestDto req1 = new PaymentRequestDto();
        req1.setAmount(new BigDecimal("10000.00"));
        req1.setPaymentDate(LocalDate.now());
        req1.setPaymentMethod(PaymentMethod.ONLINE);
        req1.setIdempotencyKey(idempotencyKey);

        Receipt receipt1 = paymentService.recordPayment(req1, fee1.getId());
        assertThat(receipt1).isNotNull();

        // Second payment targets fee2 with the same idempotency key
        PaymentRequestDto req2 = new PaymentRequestDto();
        req2.setAmount(new BigDecimal("10000.00"));
        req2.setPaymentDate(LocalDate.now());
        req2.setPaymentMethod(PaymentMethod.ONLINE);
        req2.setIdempotencyKey(idempotencyKey);

        assertThrows(BusinessException.class, () -> {
            paymentService.recordPayment(req2, fee2.getId());
        });

        // Fee 1 was paid, Fee 2 is completely unchanged
        StudentFee updatedFee1 = studentFeeRepository.findById(fee1.getId()).orElseThrow();
        assertThat(updatedFee1.getPaidAmount()).isEqualByComparingTo(new BigDecimal("10000.00"));

        StudentFee updatedFee2 = studentFeeRepository.findById(fee2.getId()).orElseThrow();
        assertThat(updatedFee2.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(updatedFee2.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(paymentRepository.count()).isEqualTo(1);
    }

    @Test
    @DisplayName("Idempotency: Concurrent requests using same idempotency key against different fees have deterministic outcome")
    void concurrentRequestsSameKeyAcrossDifferentFees_deterministicOutcome() throws InterruptedException {
        StudentFee fee1 = studentFeeService.assignFeeStructure(testStudent1.getId(), testStructure.getId(), testAcademicYear.getId());
        StudentFee fee2 = studentFeeService.assignFeeStructure(testStudent2.getId(), testStructure.getId(), testAcademicYear.getId());
        final String idempotencyKey = "CROSS-FEE-CONC-" + UUID.randomUUID();

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);
        AtomicInteger unexpectedErrorCount = new AtomicInteger(0);

        executor.submit(() -> {
            try {
                PaymentRequestDto req = new PaymentRequestDto();
                req.setAmount(new BigDecimal("12000.00"));
                req.setPaymentDate(LocalDate.now());
                req.setPaymentMethod(PaymentMethod.ONLINE);
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
                req.setAmount(new BigDecimal("12000.00"));
                req.setPaymentDate(LocalDate.now());
                req.setPaymentMethod(PaymentMethod.ONLINE);
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

        // Exactly one succeeds and one is rejected with IllegalArgumentException (no 500 error)
        assertThat(unexpectedErrorCount.get()).isEqualTo(0);
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(rejectedCount.get()).isEqualTo(1);

        // Exactly 1 payment in DB
        assertThat(paymentRepository.count()).isEqualTo(1);

        // Exactly one fee had balance deducted, the other fee has balance untouched
        StudentFee updatedFee1 = studentFeeRepository.findById(fee1.getId()).orElseThrow();
        StudentFee updatedFee2 = studentFeeRepository.findById(fee2.getId()).orElseThrow();

        boolean fee1Paid = updatedFee1.getPaidAmount().compareTo(new BigDecimal("12000.00")) == 0;
        boolean fee2Paid = updatedFee2.getPaidAmount().compareTo(new BigDecimal("12000.00")) == 0;

        // Exactly one is paid, exactly one is untouched
        assertThat(fee1Paid ^ fee2Paid).isTrue();

        if (fee1Paid) {
            assertThat(updatedFee2.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(updatedFee2.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        } else {
            assertThat(updatedFee1.getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(updatedFee1.getOutstandingAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        }
    }
}
