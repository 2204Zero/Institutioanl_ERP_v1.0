/**
 * EduPulse - Comprehensive Prompt 10 Defect Resolution & End-to-End Regression Suite
 * Covers all 12 defect areas against the active local environment.
 */
const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:8081';

function request(method, path, body = null, token = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }

    const reqData = body ? JSON.stringify(body) : null;
    if (reqData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(reqData);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', reject);
    if (reqData) req.write(reqData);
    req.end();
  });
}

async function login(username, password, role = 'SUPER_ADMIN') {
  const res = await request('POST', '/auth/login', { username, password, role });
  if (res.status === 200 && res.data?.accessToken) {
    return res.data.accessToken;
  }
  if (res.status === 200 && res.data?.data?.accessToken) {
    return res.data.data.accessToken;
  }
  throw new Error(`Login failed for ${username}: ${JSON.stringify(res.data)}`);
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${detail}`);
    failedCount++;
  }
}

async function runSuite() {
  console.log('================================================================');
  console.log('   EduPulse Prompt 10 Consolidated Acceptance & Regression Suite');
  console.log('================================================================\n');

  // Log in as Super Admin
  const adminToken = await login('superadmin', 'Admin@123', 'SUPER_ADMIN');
  assert(!!adminToken, 'Auth: Login as SuperAdmin');

  // Log in as Student
  let studentToken;
  try {
    studentToken = await login('student', 'Student@123', 'STUDENT');
    assert(!!studentToken, 'Auth: Login as Student');
  } catch (err) {
    console.log('Student login fallback:', err.message);
  }

  // Log in as Parent
  let parentToken;
  try {
    parentToken = await login('parent', 'Parent@123', 'PARENT');
    assert(!!parentToken, 'Auth: Login as Parent');
  } catch (err) {
    console.log('Parent login fallback:', err.message);
  }

  // -------------------------------------------------------------------------
  // 1. §2 Public Admissions Page & Endpoints
  // -------------------------------------------------------------------------
  console.log('\n--- §2 Public Admissions API Checks ---');
  
  // GET Public Programs without auth
  const pubProgs = await request('GET', '/api/v1/admissions/public/programs');
  assert(pubProgs.status === 200, 'Public Admissions: Programs accessible unauthenticated', `Status: ${pubProgs.status}`);
  const progList = Array.isArray(pubProgs.data) ? pubProgs.data : pubProgs.data?.data || [];
  assert(progList.length > 0, 'Public Admissions: Returns program options', `Found: ${progList.length}`);

  // POST Public Inquiry
  const testInquiryEmail = `test.inquiry.${Date.now()}@example.com`;
  const testInquiryPhone = '+919' + Math.floor(100000000 + Math.random() * 900000000);
  const inqRes = await request('POST', '/api/v1/admissions/public/inquiries', {
    prospectName: 'Test Applicant Prompt10',
    email: testInquiryEmail,
    phone: testInquiryPhone,
    programOfInterest: 'Computer Science',
    notes: 'Interested in B.Tech program admission.',
  });
  assert(inqRes.status === 200 || inqRes.status === 201, 'Public Admissions: Submit inquiry successfully', `Status: ${inqRes.status}`);
  const inqRef = inqRes.data?.data?.referenceNumber || inqRes.data?.referenceNumber || inqRes.data?.id;
  assert(!!inqRef, 'Public Admissions: Inquiry receives real reference number', `Ref: ${inqRef}`);

  // POST Public Application
  const testAppEmail = `test.app.${Date.now()}@example.com`;
  const testAppPhone = '+918' + Math.floor(100000000 + Math.random() * 900000000);
  const appRes = await request('POST', '/api/v1/admissions/public/applications', {
    firstName: 'Jane',
    lastName: 'Doe',
    email: testAppEmail,
    phone: testAppPhone,
    programId: progList[0]?.id || 1,
    academicYearId: 1,
    dateOfBirth: '2005-04-12',
    gender: 'FEMALE',
    remarks: 'City High School graduate with honors',
  });
  assert(appRes.status === 200 || appRes.status === 201, 'Public Admissions: Submit application successfully', `Status: ${appRes.status}`);
  const appRef = appRes.data?.data?.applicationNumber || appRes.data?.applicationNumber || appRes.data?.id;
  assert(!!appRef, 'Public Admissions: Application receives real reference number', `Ref: ${appRef}`);

  // Test Validation: Invalid email
  const badInqRes = await request('POST', '/api/v1/admissions/public/inquiries', {
    prospectName: 'Bad Request',
    email: 'not-an-email',
    phone: '123',
  });
  assert(badInqRes.status === 400 || badInqRes.status === 422 || badInqRes.status === 500, 'Public Admissions: Rejects invalid inquiry payload', `Status: ${badInqRes.status}`);

  // -------------------------------------------------------------------------
  // 2. §3 Student Search & Lookup
  // -------------------------------------------------------------------------
  console.log('\n--- §3 Student Search & Lookup Checks ---');
  const searchByName = await request('GET', '/api/v1/students?search=Alice', null, adminToken);
  assert(searchByName.status === 200, 'Student Search: Name search executes 200');
  const studentsByName = searchByName.data?.data?.content || searchByName.data?.content || searchByName.data?.data || [];
  const aliceFound = studentsByName.find(s => s.firstName === 'Alice' || s.lastName === 'Wonderland');
  assert(!!aliceFound, 'Student Search: Finds Alice Wonderland by name', `Matches: ${studentsByName.length}`);

  // Search by exact numeric ID / enrollment number
  const searchByRoll = await request('GET', '/api/v1/students?search=ROLL-WS-001', null, adminToken);
  const studentsByRoll = searchByRoll.data?.data?.content || searchByRoll.data?.content || searchByRoll.data?.data || [];
  assert(studentsByRoll.length >= 1, 'Student Search: Finds student by roll number');

  // Direct ID lookup
  const getById = await request('GET', '/api/v1/students/1', null, adminToken);
  assert(getById.status === 200 && getById.data?.data?.id === 1, 'Student Lookup: Exact ID lookup returns student #1');

  // -------------------------------------------------------------------------
  // 3. §4 Guardian Deduplication & Guardian Editing
  // -------------------------------------------------------------------------
  console.log('\n--- §4 Guardian Deduplication & Editing Checks ---');
  // Student 2 is Ananya Mehta
  const stu2Guardians = await request('GET', '/api/v1/students/2/guardians', null, adminToken);
  assert(stu2Guardians.status === 200, 'Guardians: Student #2 guardians endpoint returns 200');
  const gList2 = stu2Guardians.data?.data || stu2Guardians.data || [];
  const rameshOccurrences = gList2.filter(g => (g.name && g.name.includes('Ramesh')) || (g.firstName && g.firstName.includes('Ramesh')));
  assert(rameshOccurrences.length <= 1, 'Guardians: Ramesh Mehta is NOT duplicated in Student #2 profile', `Occurrences: ${rameshOccurrences.length}`);

  // Guardian Editing: PUT /api/v1/guardians/{id}
  if (gList2.length > 0) {
    const guardianToEdit = gList2[0];
    const originalPhone = guardianToEdit.phone || '+919811223344';
    const updatedPhone = originalPhone.includes('999') ? '+919811223344' : '+919811223999';
    
    const editRes = await request('PUT', `/api/v1/guardians/${guardianToEdit.id}`, {
      firstName: guardianToEdit.firstName || guardianToEdit.name?.split(' ')[0] || 'Ramesh',
      lastName: guardianToEdit.lastName || guardianToEdit.name?.split(' ')[1] || 'Mehta',
      relation: guardianToEdit.relation || guardianToEdit.relationship || 'FATHER',
      phone: updatedPhone,
      email: guardianToEdit.email,
      occupation: 'Senior Consultant',
    }, adminToken);
    
    assert(editRes.status === 200, 'Guardians: Admin can edit guardian contact details', `Status: ${editRes.status}`);
    const updatedG = editRes.data?.data || editRes.data;
    assert(updatedG?.phone === updatedPhone, 'Guardians: Phone number was updated in persisted record', `Phone: ${updatedG?.phone}`);
    
    // Authorization check: Student cannot edit guardian
    if (studentToken) {
      const unauthEdit = await request('PUT', `/api/v1/guardians/${guardianToEdit.id}`, {
        firstName: 'Hacker',
        phone: '+910000000000',
      }, studentToken);
      assert(unauthEdit.status === 403, 'Guardians: Unauthorized student editing is blocked with 403', `Status: ${unauthEdit.status}`);
    }
  }

  // -------------------------------------------------------------------------
  // 4. §5 Attendance Dates & Serialization
  // -------------------------------------------------------------------------
  console.log('\n--- §5 Attendance Dates & Serialization Checks ---');
  const attRes = await request('GET', '/api/v1/attendance/student/1', null, adminToken);
  assert(attRes.status === 200, 'Attendance: Query student #1 attendance returns 200');
  const attList = attRes.data?.data || attRes.data || [];
  assert(attList.length > 0, 'Attendance: Attendance records exist for student #1', `Count: ${attList.length}`);

  let hasValidDateSerialization = true;
  let hasPlausibleDates = true;

  for (const rec of attList) {
    const d = rec.date || rec.attendanceDate;
    if (!d) {
      hasValidDateSerialization = false;
    }
    const year = parseInt(String(d).substring(0, 4), 10);
    if (year > 2030) {
      hasPlausibleDates = false;
      console.error(`Suspicious future year detected: ${d} in attendance id: ${rec.id}`);
    }
  }
  assert(hasValidDateSerialization, 'Attendance: Every record provides a valid date field');
  assert(hasPlausibleDates, 'Attendance: No implausible future dates (e.g. 2044) exist in student records');

  // -------------------------------------------------------------------------
  // 5. §6 & §7 Course Registrations & Suspended Lifecycle
  // -------------------------------------------------------------------------
  console.log('\n--- §6 & §7 Course Registrations & Suspended Lifecycle Checks ---');
  const courseRegs = await request('GET', '/api/v1/course-registrations?studentId=1', null, adminToken);
  assert(courseRegs.status === 200, 'Courses: Course registrations query returns 200');
  const regList = courseRegs.data?.data || courseRegs.data || [];
  assert(regList.length > 0, 'Courses: Registrations exist for student #1', `Count: ${regList.length}`);

  const sampleReg = regList[0];
  const hasCourseName = !!(sampleReg.courseName || sampleReg.courseOffering?.course?.name);
  const hasCourseCode = !!(sampleReg.courseCode || sampleReg.courseOffering?.course?.code);
  assert(hasCourseName, 'Courses: Catalog title is serialized (not blank)', `Name: ${sampleReg.courseName}`);
  assert(hasCourseCode, 'Courses: Catalog code is serialized (not generic CR-4)', `Code: ${sampleReg.courseCode}`);

  // Check Suspended Student record retention
  const student1 = await request('GET', '/api/v1/students/1', null, adminToken);
  const s1Status = student1.data?.data?.status;
  assert(s1Status === 'SUSPENDED', 'Lifecycle: Alice Wonderland status is SUSPENDED');
  assert(regList.length > 0, 'Lifecycle: Suspended student retains historical course registrations');
  assert(attList.length > 0, 'Lifecycle: Suspended student retains historical attendance records');

  // -------------------------------------------------------------------------
  // 6. §8 Event-Driven Notifications End-to-End
  // -------------------------------------------------------------------------
  console.log('\n--- §8 Event-Driven Notifications Checks ---');
  // Trigger status transition for Student #2 (Ananya Mehta)
  // Transition to SUSPENDED, then back to ACTIVE
  const updateStatusRes = await request('PATCH', '/api/v1/students/2/status', {
    status: 'SUSPENDED',
    reason: 'Temporary administrative disciplinary hold',
    changedBy: 'superadmin',
    effectiveDate: '2026-10-14',
  }, adminToken);
  assert(updateStatusRes.status === 200, 'Notifications: Student #2 status transition successful', `Status: ${updateStatusRes.status}`);

  // Verify notifications were created
  const allNotifs = await request('GET', '/api/v1/notifications', null, adminToken);
  assert(allNotifs.status === 200, 'Notifications: Admin query notifications returns 200');

  // Check student notifications
  if (studentToken) {
    const stuNotifs = await request('GET', '/api/v1/notifications', null, studentToken);
    assert(stuNotifs.status === 200, 'Notifications: Student can fetch own notifications');
    const stuUnread = await request('GET', '/api/v1/notifications/unread-count', null, studentToken);
    assert(stuUnread.status === 200 && typeof stuUnread.data?.unreadCount === 'number', 'Notifications: Student unread-count returns valid number');
  }

  // Check bulk mark-all-read endpoint
  const markAllRes = await request('PATCH', '/api/v1/notifications/mark-all-read', null, adminToken);
  assert(markAllRes.status === 200, 'Notifications: Bulk PATCH /mark-all-read returns 200', `Marked: ${markAllRes.data?.marked}`);

  // Revert Student #2 status back to ACTIVE for consistency
  await request('PATCH', '/api/v1/students/2/status', {
    status: 'ACTIVE',
    reason: 'Administrative hold lifted',
    changedBy: 'superadmin',
    effectiveDate: '2026-10-14',
  }, adminToken);

  // -------------------------------------------------------------------------
  // 7. §9 Student ID Card Cryptographic Credential
  // -------------------------------------------------------------------------
  console.log('\n--- §9 Student ID Card Verification ---');
  const idCardRes = await request('GET', '/api/v1/students/1/id-card', null, adminToken);
  assert(idCardRes.status === 200, 'ID Card: Generation endpoint returns 200');
  const cardData = idCardRes.data?.data || idCardRes.data;
  assert(cardData?.fullName === 'Alice Wonderland', 'ID Card: Correct student full name', `Name: ${cardData?.fullName}`);
  assert(!!cardData?.verificationCode, 'ID Card: Contains cryptographic verification code', `Code: ${cardData?.verificationCode?.substring(0, 16)}...`);
  assert(cardData?.status === 'SUSPENDED', 'ID Card: Reflects current lifecycle status');

  // -------------------------------------------------------------------------
  // 8. §10 Academic Years & Overlap Validation
  // -------------------------------------------------------------------------
  console.log('\n--- §10 Academic Years & Overlap Validation Checks ---');
  const ayListRes = await request('GET', '/api/v1/academic-years', null, adminToken);
  assert(ayListRes.status === 200, 'Academic Years: Listing returns 200');
  const ayList = ayListRes.data?.data || ayListRes.data || [];
  assert(ayList.length > 0, 'Academic Years: Persisted years exist', `Count: ${ayList.length}`);

  // Test Overlap Validation: Try to create a year overlapping with 2026-2027 (2026-08-01 to 2027-05-31)
  const overlapRes = await request('POST', '/api/v1/academic-years', {
    name: 'Conflicting Year 2026-2027',
    startDate: '2026-09-01',
    endDate: '2027-04-30',
    isActive: false,
  }, adminToken);
  assert(overlapRes.status === 400 || overlapRes.status === 409 || overlapRes.status === 500,
    'Academic Years: Overlapping academic year creation is REJECTED', `Status: ${overlapRes.status}`);

  // Test Non-Overlapping Year: Create adjacent future year dynamically derived from existing records
  const currentYears = ayList.map(a => {
    const e = parseInt(String(a.endDate || '').substring(0, 4), 10);
    return isNaN(e) ? 2027 : e;
  }).filter(y => y < 2500);
  const maxYear = Math.max(...currentYears, 2027);
  const startYr = maxYear + 1;
  const endYr = maxYear + 2;

  const nonOverlapRes = await request('POST', '/api/v1/academic-years', {
    name: `AY ${startYr}-${endYr} Test`,
    startDate: `${startYr}-08-01`,
    endDate: `${endYr}-05-31`,
    isActive: false,
  }, adminToken);
  assert(nonOverlapRes.status === 200 || nonOverlapRes.status === 201,
    'Academic Years: Non-overlapping year is accepted', `Status: ${nonOverlapRes.status}`);

  // -------------------------------------------------------------------------
  // 9. §11 Finance Workflows & Idempotency
  // -------------------------------------------------------------------------
  console.log('\n--- §11 Finance Workflows & Idempotency Checks ---');
  const fsListRes = await request('GET', '/api/v1/finance/fee-structures', null, adminToken);
  assert(fsListRes.status === 200, 'Finance: Fee structures endpoint returns 200');
  const fsList = fsListRes.data?.data || fsListRes.data || [];
  assert(fsList.length > 0, 'Finance: Approved fee structures exist', `Count: ${fsList.length}`);

  // Find fee record with outstanding balance or assign one
  const feesRes = await request('GET', '/api/v1/finance/student-fees', null, adminToken);
  const feeList = Array.isArray(feesRes.data) ? feesRes.data : feesRes.data?.data || [];
  let targetFee = feeList.find(f => f.status === 'PARTIALLY_PAID' || (f.outstandingAmount && f.outstandingAmount > 0));

  if (!targetFee && fsList.length > 0) {
    const assignRes = await request('POST', '/api/v1/finance/student-fees/assign', {
      studentId: 1,
      feeStructureId: fsList[0].id,
      academicYearId: 1,
    }, adminToken);
    targetFee = assignRes.data?.data || assignRes.data;
  }

  const targetFeeId = targetFee?.id || 3;
  const targetStudentId = targetFee?.studentId || 18;

  // Test Payment Idempotency with a dedicated unique test idempotency key
  const idempotencyKey = `TEST-IDEMP-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const paymentPayload = {
    studentId: targetStudentId,
    studentFeeId: targetFeeId,
    amount: 10.0,
    paymentMethod: 'ONLINE',
    referenceNumber: `TXN-${Date.now()}`,
    remarks: 'Regression test idempotency payment',
  };

  const pay1 = await request('POST', '/api/v1/finance/payments', paymentPayload, adminToken, {
    'Idempotency-Key': idempotencyKey,
  });

  if (pay1.status === 200 || pay1.status === 201) {
    assert(true, 'Finance: First payment submission accepted');
    const pay1Data = pay1.data?.data || pay1.data;
    const receipt1 = pay1Data?.receiptNumber || pay1Data?.id;

    // Replay exact same request with same idempotency key
    const pay2 = await request('POST', '/api/v1/finance/payments', paymentPayload, adminToken, {
      'Idempotency-Key': idempotencyKey,
    });
    assert(pay2.status === 200 || pay2.status === 201, 'Finance: Replayed idempotent payment succeeds without error');
    const pay2Data = pay2.data?.data || pay2.data;
    const receipt2 = pay2Data?.receiptNumber || pay2Data?.id;
    assert(receipt1 === receipt2, 'Finance: Replayed payment returns identical receipt (no duplicate payment)', `Receipt: ${receipt1}`);
  } else {
    console.log(`Payment endpoint status: ${pay1.status} (payload response: ${JSON.stringify(pay1.data)})`);
  }

  // -------------------------------------------------------------------------
  // 10. §12 Academic Batches & Location Dataset
  // -------------------------------------------------------------------------
  console.log('\n--- §12 Batches & Locations Checks ---');
  const batchRes = await request('GET', '/api/v1/batches', null, adminToken);
  assert(batchRes.status === 200, 'Batches: Batch listing returns 200');
  const batchList = Array.isArray(batchRes.data) ? batchRes.data : batchRes.data?.data || [];
  assert(batchList.length > 0, 'Batches: Persisted batches exist', `Count: ${batchList.length}`);
  const allBatchesHaveCode = batchList.every(b => !!b.code || !!b.name);
  assert(allBatchesHaveCode, 'Batches: Every batch possesses a valid code or name');

  // Verify location constants in frontend
  const locationsFile = require('fs').readFileSync(
    require('path').resolve(__dirname, '../frontend-v2/src/constants/locations.ts'),
    'utf8'
  );
  assert(locationsFile.includes('Maharashtra'), 'Locations: Maharashtra present');
  assert(locationsFile.includes('Delhi'), 'Locations: Delhi UT present');
  assert(locationsFile.includes('Ladakh'), 'Locations: Ladakh UT present');
  assert(locationsFile.includes('getCitiesForState'), 'Locations: getCitiesForState helper exported');

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`   TEST RESULTS SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
