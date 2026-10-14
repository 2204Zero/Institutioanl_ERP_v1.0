const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8081';
const API = `${BASE_URL}/api/v1`;
const AUTH = `${BASE_URL}/auth`;

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${details ? ': ' + details : ''}`);
    failed++;
  }
}

async function login(username, password, role) {
  const res = await axios.post(`${AUTH}/login`, { username, password, role });
  return {
    token: res.data.accessToken || res.data.token,
    user: res.data.user
  };
}

function req(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function runPrompt8AcceptanceSuite() {
  console.log('========================================================================');
  console.log('PROMPT 8 ACCEPTANCE: End-to-End Student Lifecycle, Guardians & Finance');
  console.log('========================================================================\n');

  try {
    // -----------------------------------------------------------------
    // 1. LOGIN CREDENTIAL RESOLUTION
    // -----------------------------------------------------------------
    console.log('--- 1. Authenticating Roles ---');
    const admin = await login('admin', 'Admin@123', 'ADMIN');
    assert(!!admin.token, 'Admin authentication successful');

    const superAdmin = await login('superadmin', 'Admin@123', 'SUPER_ADMIN');
    assert(!!superAdmin.token, 'SuperAdmin authentication successful');

    const finance = await login('finance', 'Finance@123', 'FINANCE');
    assert(!!finance.token, 'Finance authentication successful');

    const existingStudent = await login('student', 'Student@123', 'STUDENT');
    assert(!!existingStudent.token, 'Existing student authentication successful');

    const existingParent = await login('parent', 'Parent@123', 'PARENT');
    assert(!!existingParent.token, 'Existing parent authentication successful');

    // -----------------------------------------------------------------
    // 2. ANONYMOUS & UNAUTHORIZED MUTATION AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 2. Anonymous & Negative Authorization Audit ---');
    try {
      await axios.post(`${API}/students`, { firstName: 'Hacker' });
      assert(false, 'Anonymous student enrollment rejected', 'Allowed anonymously (200 OK)');
    } catch (e) {
      assert(e.response?.status === 401 || e.response?.status === 403, `Anonymous student enrollment rejected (${e.response?.status})`);
    }

    try {
      await axios.post(`${API}/finance/fee-structures`, { name: 'Unauthorized Structure' }, req(existingStudent.token));
      assert(false, 'Student creating fee structure rejected', 'Student allowed to create fee structure');
    } catch (e) {
      assert(e.response?.status === 403, `Student creating fee structure rejected (403 Forbidden)`);
    }

    // -----------------------------------------------------------------
    // 3. ACADEMIC ENTITY LOOKUPS (FORM USABILITY DATA CONTRACT)
    // -----------------------------------------------------------------
    console.log('\n--- 3. Form Usability: Real Academic Entity Lookups ---');
    const deptsRes = await axios.get(`${API}/departments`, req(admin.token));
    const departments = deptsRes.data || [];
    assert(departments.length > 0, `Departments retrieved from persisted catalog (${departments.length} found)`);
    const targetDept = departments[0];

    const programsRes = await axios.get(`${API}/programs?departmentId=${targetDept.id}`, req(admin.token));
    const programs = programsRes.data || [];
    assert(programs.length > 0, `Programs cascade by departmentId (${programs.length} found for Dept #${targetDept.id})`);
    const targetProgram = programs[0];

    const batchesRes = await axios.get(`${API}/batches?programId=${targetProgram.id}`, req(admin.token));
    const batches = batchesRes.data || [];
    assert(batches.length > 0, `Batches cascade by programId (${batches.length} found for Program #${targetProgram.id})`);
    const targetBatch = batches[0];

    const ayRes = await axios.get(`${API}/academic-years`, req(admin.token));
    const academicYears = ayRes.data || [];
    assert(academicYears.length > 0, `Academic years retrieved from persisted catalog (${academicYears.length} found)`);
    const targetAY = academicYears[0];

    const semRes = await axios.get(`${API}/semesters?academicYearId=${targetAY.id}`, req(admin.token));
    const semesters = semRes.data || [];
    assert(semesters.length > 0, `Semesters cascade by academicYearId (${semesters.length} found for AY #${targetAY.id})`);
    const targetSemester = semesters[0];

    // -----------------------------------------------------------------
    // 4. SCENARIO A: CANONICAL STUDENT ENROLLMENT & ACCOUNT PROVISIONING
    // -----------------------------------------------------------------
    console.log('\n--- 4. Scenario A: Student Enrollment & Canonical Identity ---');
    const timestamp = Date.now().toString().slice(-5);
    const student1Email = `student.p8.${timestamp}@institution.edu`;
    const student1Data = {
      firstName: 'Aarav',
      lastName: `Mehta_${timestamp}`,
      email: student1Email,
      phone: `+91 98${timestamp}1234`,
      dateOfBirth: '2004-06-15',
      gender: 'MALE',
      bloodGroup: 'B+',
      address: '101 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020',
      department: targetDept.name,
      departmentId: targetDept.id,
      program: targetProgram.name,
      programId: targetProgram.id,
      batch: targetBatch.name,
      batchId: targetBatch.id,
      academicYearId: targetAY.id,
      semesterId: targetSemester.id,
      enrollmentDate: '2026-08-01',
      password: 'Student@123',
      status: 'ACTIVE'
    };

    const enrollRes = await axios.post(`${API}/students`, student1Data, req(admin.token));
    assert(enrollRes.status === 200 || enrollRes.status === 201, 'Student enrollment API call succeeded');

    const createdStudent1 = enrollRes.data?.data || enrollRes.data;
    assert(!!createdStudent1.id, `Student internal ID generated: #${createdStudent1.id}`);
    
    // Canonical Enrollment Number check
    const enrRegex = /^ENR-\d{4}-\d{5}$/;
    assert(
      enrRegex.test(createdStudent1.enrollmentNumber),
      `Canonical enrollment number format verified (${createdStudent1.enrollmentNumber})`
    );

    // Roll number check: clearly distinct from internal ID and enrollment number
    assert(
      createdStudent1.rollNumber &&
      createdStudent1.rollNumber !== createdStudent1.enrollmentNumber &&
      createdStudent1.rollNumber !== String(createdStudent1.id),
      `Roll number distinctly generated (${createdStudent1.rollNumber})`
    );

    // Lookup by enrollment number
    const lookupByEnr = await axios.get(`${API}/students/enrollment/${createdStudent1.enrollmentNumber}`, req(admin.token));
    assert(
      lookupByEnr.data?.data?.id === createdStudent1.id,
      `Student retrieved successfully by canonical enrollment number (${createdStudent1.enrollmentNumber})`
    );

    // Provisioned user account login verification
    let newStudentLoginSuccess = false;
    try {
      const student1Login = await login(student1Email, 'Student@123', 'STUDENT');
      newStudentLoginSuccess = !!student1Login.token;
      assert(newStudentLoginSuccess, `Provisioned student login successful (${student1Email})`);

      // Verify student self-profile access
      const meRes = await axios.get(`${API}/students/me`, req(student1Login.token));
      assert(meRes.data?.data?.id === createdStudent1.id, 'New student accesses own profile via /students/me');

      // Negative: Verify cross-student profile access is forbidden
      try {
        await axios.get(`${API}/students/1`, req(student1Login.token));
        // If student ID 1 is not createdStudent1.id, must be 403
        if (createdStudent1.id !== 1) {
          assert(false, 'Cross-student profile IDOR rejected', 'Student accessed other student profile');
        }
      } catch (idorErr) {
        assert(idorErr.response?.status === 403, `Cross-student profile access forbidden (403)`);
      }
    } catch (loginErr) {
      assert(false, `Provisioned student login failed: ${loginErr.message}`);
    }

    // -----------------------------------------------------------------
    // 5. SCENARIO B: GUARDIAN LINKAGE & MULTI-WARD MODEL
    // -----------------------------------------------------------------
    console.log('\n--- 5. Scenario B: Guardian Linkage & Multi-Ward Model ---');
    const guardianEmail = `guardian.p8.${timestamp}@example.com`;
    const guardianData = {
      firstName: 'Ramesh',
      lastName: `Mehta_${timestamp}`,
      email: guardianEmail,
      phone: `+91 97${timestamp}5678`,
      relation: 'FATHER',
      relationship: 'FATHER',
      address: '101 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020'
    };

    // Create guardian
    const guardianRes = await axios.post(`${API}/guardians`, guardianData, req(admin.token));
    const createdGuardian = guardianRes.data?.data || guardianRes.data;
    assert(!!createdGuardian.id, `Guardian record created (ID #${createdGuardian.id})`);

    // Link guardian to Student 1
    const link1Res = await axios.post(`${API}/guardians/${createdGuardian.id}/students/${createdStudent1.id}`, {}, req(admin.token));
    assert(link1Res.status === 200 || link1Res.status === 201, `Guardian #${createdGuardian.id} linked to Student 1 (#${createdStudent1.id})`);

    // Enroll Student 2 (Sibling) and link to SAME guardian
    const student2Email = `student2.p8.${timestamp}@institution.edu`;
    const student2Data = {
      firstName: 'Ananya',
      lastName: `Mehta_${timestamp}`,
      email: student2Email,
      phone: `+91 98${timestamp}9999`,
      dateOfBirth: '2006-03-22',
      gender: 'FEMALE',
      bloodGroup: 'B+',
      address: '101 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020',
      department: targetDept.name,
      departmentId: targetDept.id,
      program: targetProgram.name,
      programId: targetProgram.id,
      batch: targetBatch.name,
      batchId: targetBatch.id,
      academicYearId: targetAY.id,
      semesterId: targetSemester.id,
      enrollmentDate: '2026-08-01',
      guardianId: createdGuardian.id,
      password: 'Student@123',
      status: 'ACTIVE'
    };

    const enroll2Res = await axios.post(`${API}/students`, student2Data, req(admin.token));
    const createdStudent2 = enroll2Res.data?.data || enroll2Res.data;
    assert(!!createdStudent2.id, `Student 2 (sibling) enrolled (ID #${createdStudent2.id})`);

    // Link guardian to Student 2
    await axios.post(`${API}/guardians/${createdGuardian.id}/students/${createdStudent2.id}`, {}, req(admin.token));

    // Verify multi-ward model: Guardian has both wards
    const wardsRes = await axios.get(`${API}/guardians/${createdGuardian.id}/students`, req(admin.token));
    const wards = wardsRes.data?.data || wardsRes.data || [];
    assert(wards.length >= 2, `Multi-ward model preserved: Guardian has ${wards.length} linked wards`);

    // Verify Student 1 has guardian listed
    const s1Guardians = await axios.get(`${API}/students/${createdStudent1.id}/guardians`, req(admin.token));
    assert(
      (s1Guardians.data?.data || []).some(g => g.id === createdGuardian.id),
      `Student 1 profile shows linked guardian #${createdGuardian.id}`
    );

    // Verify existing parent cannot access unlinked students (Cross-family protection)
    try {
      await axios.get(`${API}/students/${createdStudent1.id}`, req(existingParent.token));
      assert(false, 'Cross-family access rejected', 'Parent accessed unlinked student profile');
    } catch (unlinkedErr) {
      assert(unlinkedErr.response?.status === 403, 'Cross-family access rejected (403 Forbidden for unlinked ward)');
    }

    // -----------------------------------------------------------------
    // 6. SCENARIO C: FINANCE END-TO-END WORKFLOW (STRUCTURE, ASSIGNMENT, PAYMENT, RECEIPTS)
    // -----------------------------------------------------------------
    console.log('\n--- 6. Scenario C: Finance Lifecycle End-to-End ---');
    // Ensure active fee structure
    const structuresRes = await axios.get(`${API}/finance/fee-structures`, req(finance.token));
    let structures = structuresRes.data || [];
    let activeStructure = structures.find(s => s.active);

    if (!activeStructure) {
      console.log('  Creating and approving new active fee structure...');
      const feeHeadsRes = await axios.get(`${API}/finance/fee-heads`, req(finance.token));
      const heads = feeHeadsRes.data || [];
      const selectedHead = heads.length > 0 ? heads[0] : { id: 1 };

      const createStructRes = await axios.post(`${API}/finance/fee-structures`, {
        name: `B.Tech Semester Fee AY 2026`,
        code: `FS-ENGG-${timestamp}`,
        academicYearId: targetAY.id,
        programId: targetProgram.id,
        active: false
      }, req(finance.token));
      const newStruct = createStructRes.data;

      // Add component
      await axios.post(`${API}/finance/fee-structures/${newStruct.id}/components?headId=${selectedHead.id}&amount=45000.00`, {}, req(finance.token));

      // Approve fee structure
      const approvedRes = await axios.patch(`${API}/finance/fee-structures/${newStruct.id}/approve`, {}, req(finance.token));
      activeStructure = approvedRes.data;
    }

    assert(!!activeStructure && activeStructure.active, `Active fee structure available: ${activeStructure.name} (#${activeStructure.id})`);

    // Assign fee structure to Student 1
    const assignFeeRes = await axios.post(`${API}/finance/student-fees/assign`, {
      studentId: createdStudent1.id,
      feeStructureId: activeStructure.id,
      academicYearId: targetAY.id
    }, req(finance.token));

    const assignedFee = assignFeeRes.data;
    assert(!!assignedFee.id, `Fee structure assigned to Student 1 (StudentFee #${assignedFee.id})`);
    assert(assignedFee.status === 'PENDING', `Initial student fee status is PENDING`);
    assert(Number(assignedFee.paidAmount) === 0, `Initial paid amount is 0`);

    // Negative: Reject duplicate fee assignment
    try {
      await axios.post(`${API}/finance/student-fees/assign`, {
        studentId: createdStudent1.id,
        feeStructureId: activeStructure.id,
        academicYearId: targetAY.id
      }, req(finance.token));
      assert(false, 'Duplicate fee assignment rejected', 'Duplicate fee structure assignment allowed');
    } catch (dupFeeErr) {
      assert(dupFeeErr.response?.status === 400, `Duplicate fee assignment rejected (400 Bad Request)`);
    }

    // Partial Payment
    const idempotencyKey1 = `PAY-IDEM-${timestamp}-1`;
    const partialPaymentRes = await axios.post(`${API}/finance/payments`, {
      studentId: createdStudent1.id,
      studentFeeId: assignedFee.id,
      amount: 20000.00,
      paymentMethod: 'UPI',
      idempotencyKey: idempotencyKey1,
      remarks: 'Partial installment payment'
    }, req(finance.token));

    assert(partialPaymentRes.status === 200 || partialPaymentRes.status === 201, 'Partial payment recorded successfully');
    const payment1 = partialPaymentRes.data;
    assert(!!payment1.referenceNumber, `Payment reference number generated: ${payment1.referenceNumber}`);

    // Verify updated fee balance
    const updatedFee1 = await axios.get(`${API}/finance/student-fees/${assignedFee.id}`, req(finance.token));
    assert(Number(updatedFee1.data.paidAmount) === 20000.00, `Paid amount updated to 20000.00`);
    assert(updatedFee1.data.status === 'PARTIALLY_PAID', `Status updated to PARTIALLY_PAID`);

    // Payment Idempotency check 1: replay exact same payment request with same idempotency key returns existing receipt without double charge
    const replayRes = await axios.post(`${API}/finance/payments`, {
      studentId: createdStudent1.id,
      studentFeeId: assignedFee.id,
      amount: 20000.00,
      paymentMethod: 'UPI',
      idempotencyKey: idempotencyKey1,
      remarks: 'Partial installment payment'
    }, req(finance.token));
    assert(
      replayRes.data.receiptNumber === payment1.receiptNumber,
      `Idempotent replay returned existing receipt without double charge (${replayRes.data.receiptNumber})`
    );
    const balanceAfterReplay = await axios.get(`${API}/finance/student-fees/${assignedFee.id}`, req(finance.token));
    assert(
      Number(balanceAfterReplay.data.paidAmount) === 20000.00,
      `Balance remains unchanged after idempotent replay (20000.00)`
    );

    // Payment Idempotency check 2: conflicting payload with same idempotency key is rejected
    try {
      await axios.post(`${API}/finance/payments`, {
        studentId: createdStudent1.id,
        studentFeeId: assignedFee.id,
        amount: 99999.00,
        paymentMethod: 'UPI',
        idempotencyKey: idempotencyKey1
      }, req(finance.token));
      assert(false, 'Conflicting idempotency payload rejected', 'Allowed different payload with same key');
    } catch (confErr) {
      assert(
        confErr.response?.status === 409 || confErr.response?.status === 400,
        `Conflicting idempotency payload rejected (${confErr.response?.status})`
      );
    }

    // Remaining Payment (Complete Balance)
    const remainingBalance = Number(updatedFee1.data.outstandingAmount);
    const idempotencyKey2 = `PAY-IDEM-${timestamp}-2`;
    const finalPaymentRes = await axios.post(`${API}/finance/payments`, {
      studentId: createdStudent1.id,
      studentFeeId: assignedFee.id,
      amount: remainingBalance,
      paymentMethod: 'BANK_TRANSFER',
      idempotencyKey: idempotencyKey2,
      remarks: 'Settlement payment'
    }, req(finance.token));

    assert(finalPaymentRes.status === 200 || finalPaymentRes.status === 201, 'Full settlement payment recorded successfully');

    // Verify fee is now PAID
    const finalizedFee = await axios.get(`${API}/finance/student-fees/${assignedFee.id}`, req(finance.token));
    assert(finalizedFee.data.status === 'PAID', `Student fee status transitioned to PAID`);
    assert(Number(finalizedFee.data.outstandingAmount) === 0, `Outstanding balance is zero`);

    // Verify Receipts
    const receiptsRes = await axios.get(`${API}/finance/payments/student/${createdStudent1.id}/receipts`, req(finance.token));
    const receipts = receiptsRes.data || [];
    assert(receipts.length >= 2, `Persisted receipts generated for all transactions (${receipts.length} receipts found)`);

    const receipt = receipts[0];
    assert(receipt.receiptNumber && receipt.receiptNumber.startsWith('REC-'), `Receipt has official receiptNumber (${receipt.receiptNumber})`);

    // -----------------------------------------------------------------
    // 7. SCENARIO D: STUDENT DOCUMENTS & AUTHORIZATION
    // -----------------------------------------------------------------
    console.log('\n--- 7. Scenario D: Student Documents (ID Card & Transcript) ---');
    // Generate ID Card for Student 1
    const idCardRes = await axios.get(`${API}/students/${createdStudent1.id}/id-card`, req(admin.token));
    assert(idCardRes.status === 200, 'Student ID Card generated successfully');
    const idCard = idCardRes.data?.data;
    assert(idCard.enrollmentNumber === createdStudent1.enrollmentNumber, `ID card contains canonical enrollment number (${idCard.enrollmentNumber})`);
    assert(idCard.department === createdStudent1.department, `ID card contains accurate department (${idCard.department})`);
    assert(!!idCard.verificationCode, `ID card contains cryptographic verification code (${idCard.verificationCode})`);

    // Attempt transcript generation for student without course registrations
    try {
      await axios.get(`${API}/students/${createdStudent1.id}/transcript`, req(admin.token));
      assert(false, 'Missing source course registrations rejected', 'Fabricated transcript returned without course registrations');
    } catch (transcriptErr) {
      assert(
        transcriptErr.response?.status === 400 &&
        transcriptErr.response?.data?.message?.includes('No course registrations found'),
        'Transcript generation safely rejects students without course registrations without fabricating data (400 Bad Request)'
      );
    }

    // Document ownership & security tests
    // Student 1 accesses own ID card:
    const student1Client = await login(student1Email, 'Student@123', 'STUDENT');
    const studentSelfCardRes = await axios.get(`${API}/students/${createdStudent1.id}/id-card`, req(student1Client.token));
    assert(studentSelfCardRes.status === 200, 'Student can access own official ID Card');

    // Negative: Student 1 attempts to access Student 2 ID card (Forbidden)
    try {
      await axios.get(`${API}/students/${createdStudent2.id}/id-card`, req(student1Client.token));
      assert(false, 'Cross-student document IDOR rejected', 'Student accessed peer student ID Card');
    } catch (crossDocErr) {
      assert(crossDocErr.response?.status === 403, 'Cross-student document access rejected (403 Forbidden)');
    }

    // -----------------------------------------------------------------
    // 8. SCENARIO E: FAILURE RECOVERY & INTEGRITY
    // -----------------------------------------------------------------
    console.log('\n--- 8. Scenario E: Failure Recovery & Entity Validation ---');
    // Non-existent Department
    try {
      await axios.post(`${API}/students`, {
        ...student1Data,
        email: `invalid.dept.${timestamp}@institution.edu`,
        departmentId: 999999
      }, req(admin.token));
      assert(false, 'Invalid department ID rejected', 'Enrolled with non-existent department');
    } catch (e) {
      assert(e.response?.status === 400 || e.response?.status === 404, `Invalid department ID rejected (${e.response?.status})`);
    }

    // Invalid payment amount (negative)
    try {
      await axios.post(`${API}/finance/payments`, {
        studentId: createdStudent1.id,
        studentFeeId: assignedFee.id,
        amount: -500.00,
        paymentMethod: 'CASH',
        idempotencyKey: `NEG-KEY-${timestamp}`
      }, req(finance.token));
      assert(false, 'Negative payment rejected', 'Processed negative payment');
    } catch (e) {
      assert(e.response?.status === 400, 'Negative payment rejected (400 Bad Request)');
    }

    console.log('\n========================================================================');
    console.log(`PROMPT 8 BEHAVIORAL SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    return { passed, failed };
  } catch (err) {
    console.error('Fatal error running Prompt 8 test suite:', err.response?.data || err.message);
    process.exit(1);
  }
}

runPrompt8AcceptanceSuite().then(results => {
  if (results.failed > 0) {
    process.exit(1);
  }
});
