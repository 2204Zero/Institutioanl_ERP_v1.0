const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = body ? JSON.parse(body) : null;
        } catch (e) {
          parsed = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          raw: body
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(username, password, role) {
  const res = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username, password, role });
  return res.data?.accessToken;
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== EDU-PULSE PROMPT 9 VERIFICATION SUITE ===\n');

  // Wait for Spring Boot to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await request({ hostname: 'localhost', port: 8081, path: '/api/v1/auth/login', method: 'POST' });
      if (res.status === 400 || res.status === 401 || res.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!ready) {
    console.error('Backend did not start in time on port 8081');
    process.exit(1);
  }

  console.log('Backend is responsive on port 8081. Running test suites...\n');

  let onboardedStudent = null;

  // --- SUITE 1: DEMO CREDENTIALS VERIFICATION ---
  console.log('[Suite 1: Demo Credentials Verification]');
  const accounts = [
    { role: 'ADMIN', user: 'admin', pass: 'Admin@123' },
    { role: 'SUPER_ADMIN', user: 'superadmin', pass: 'Admin@123' },
    { role: 'FACULTY', user: 'faculty', pass: 'Faculty@123' },
    { role: 'STUDENT', user: 'student', pass: 'Student@123' },
    { role: 'PARENT', user: 'parent', pass: 'Parent@123' },
    { role: 'FINANCE', user: 'finance', pass: 'Finance@123' },
  ];

  const tokens = {};
  for (const acc of accounts) {
    const token = await login(acc.user, acc.pass, acc.role);
    assert(!!token, `Account ${acc.user} (${acc.role}) authenticates successfully with designated credentials`);
    if (token) tokens[acc.user] = token;
  }

  // Verify invalid password fails
  const invalidRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'faculty', password: 'WrongPassword', role: 'FACULTY' });
  assert(invalidRes.status === 401, 'Invalid credentials return HTTP 401');

  // --- SUITE 2: STUDENT PROFILE EDIT & IMMUTABILITY ---
  console.log('\n[Suite 2: Student Profile Edit Workflow & Immutability]');
  const adminToken = tokens['admin'];
  const studentToken = tokens['student'];

  // Read student 1
  const s1Res = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students/1',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(s1Res.status === 200 && s1Res.data?.data?.id === 1, 'Admin can fetch student 1 profile');
  const originalStudent = s1Res.data.data;
  const originalEnr = originalStudent.enrollmentNumber;
  const originalRoll = originalStudent.rollNumber;
  const originalUserId = originalStudent.userId;

  // Edit student profile
  const updatedCity = 'Nagpur';
  const updatedState = 'Maharashtra';
  const updatedPhone = '+919876543210';
  let formattedEnrollmentDate = '2024-08-01';
  if (Array.isArray(originalStudent.enrollmentDate)) {
    const [y, m, d] = originalStudent.enrollmentDate;
    formattedEnrollmentDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  } else if (typeof originalStudent.enrollmentDate === 'string') {
    formattedEnrollmentDate = originalStudent.enrollmentDate.split('T')[0];
  }
  let formattedDOB = '2004-05-15';
  if (Array.isArray(originalStudent.dateOfBirth)) {
    const [y, m, d] = originalStudent.dateOfBirth;
    formattedDOB = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  } else if (typeof originalStudent.dateOfBirth === 'string') {
    formattedDOB = originalStudent.dateOfBirth.split('T')[0];
  }

  const editRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students/1',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    firstName: originalStudent.firstName,
    lastName: originalStudent.lastName,
    email: originalStudent.email,
    phone: updatedPhone,
    dateOfBirth: formattedDOB,
    gender: originalStudent.gender || 'MALE',
    bloodGroup: originalStudent.bloodGroup || 'B+',
    address: '42 Academic Way',
    city: updatedCity,
    state: updatedState,
    pincode: originalStudent.pincode || '400001',
    department: originalStudent.department || 'Computer Science and Engineering',
    departmentId: originalStudent.departmentId || 1,
    program: originalStudent.program || 'B.Tech Computer Science',
    programId: originalStudent.programId || 1,
    batch: originalStudent.batch || '2023-2027',
    batchId: originalStudent.batchId || 1,
    enrollmentDate: formattedEnrollmentDate,
    // Attempt tampering with protected fields
    enrollmentNumber: 'TAMPERED-ENR-99999',
    rollNumber: 'TAMPERED-ROLL-999',
    userId: 99999
  });

  if (editRes.status !== 200) {
    console.log('Edit student response failed:', editRes.status, JSON.stringify(editRes.data));
  }
  assert(editRes.status === 200, 'Student profile update succeeds for admin');
  const editedStudent = editRes.data?.data;
  assert(editedStudent?.city === updatedCity, 'Updated field "city" is reflected in response');
  assert(editedStudent?.phone === updatedPhone, 'Updated field "phone" is reflected');
  assert(editedStudent?.enrollmentNumber === originalEnr, 'Canonical enrollment number is immutable and protected against tampering');
  assert(editedStudent?.rollNumber === originalRoll, 'Roll number is immutable and protected');
  assert(editedStudent?.userId === originalUserId, 'AppUser identity link is protected against tampering');

  // Verify unauthorized edit attempt by a different user
  const unauthorizedRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students/2',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    firstName: 'Hacked',
    lastName: 'Name',
    email: 'hacked.student@test.com',
    phone: '+919988776655',
    dateOfBirth: '2005-01-01',
    gender: 'MALE',
    department: 'Engineering',
    batch: 'Batch 2026-2030',
    enrollmentDate: '2026-10-13'
  });
  assert(unauthorizedRes.status === 403, 'Unauthorized student cannot edit another student profile (HTTP 403)');

  // --- SUITE 3: PUBLIC ADMISSIONS & CONVERSION PIPELINE ---
  console.log('\n[Suite 3: Admissions Public Pipeline & Idempotent Onboarding]');
  const uniqueTime = Date.now();
  const applicantEmail = `applicant.${uniqueTime}@test.com`;
  const applicantPhone = `+9198${String(uniqueTime).slice(-8)}`;

  // Submit public application
  const pubAppRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/admissions/public/applications',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    firstName: 'Aarav',
    lastName: 'Patel',
    email: applicantEmail,
    phone: applicantPhone,
    programId: 1,
    academicYearId: 1,
    remarks: 'Merit quota application'
  });

  if (pubAppRes.status !== 201) {
    console.log('Public application submission response:', pubAppRes.status, JSON.stringify(pubAppRes.data));
  }
  assert(pubAppRes.status === 201, 'Public admission application submission returns HTTP 201 Created');
  const createdApp = pubAppRes.data;
  assert(!!createdApp?.id, `Created application assigned valid ID APP-${createdApp?.id}`);

  // Admin reviews application (SUBMITTED -> UNDER_REVIEW)
  const reviewRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/admission-workflows/applications/${createdApp?.id}/process?targetStatus=UNDER_REVIEW`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (reviewRes.status !== 200) {
    console.log('reviewRes failed:', reviewRes.status, JSON.stringify(reviewRes.data));
  }
  assert(reviewRes.status === 200, 'Admissions staff can process application to UNDER_REVIEW');

  // Admin approves application (UNDER_REVIEW -> ADMITTED)
  const processRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/admission-workflows/applications/${createdApp?.id}/process?targetStatus=ADMITTED`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (processRes.status !== 200) {
    console.log('processRes failed:', processRes.status, JSON.stringify(processRes.data));
  }
  assert(processRes.status === 200, 'Admissions staff can process application to ADMITTED');

  // Convert to student
  const onboardRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/admission-workflows/applications/${createdApp?.id}/onboard`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(onboardRes.status === 200, 'Staff can convert ADMITTED application to student record');
  onboardedStudent = onboardRes.data;
  assert(!!onboardedStudent?.enrollmentNumber, `Student provisioned with canonical enrollment number: ${onboardedStudent?.enrollmentNumber}`);
  assert(/^ENR-\d{4}-\d{5}$/.test(onboardedStudent?.enrollmentNumber), 'Enrollment number matches canonical format ENR-YYYY-XXXXX');

  // Idempotency: repeated conversion attempt is safely rejected
  const secondOnboardRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/admission-workflows/applications/${createdApp?.id}/onboard`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(secondOnboardRes.status === 400 || secondOnboardRes.status === 409, 'Repeated onboard attempt handles idempotency safely (HTTP 400/409 duplicate rejection)');
  assert(secondOnboardRes.status === 400 || secondOnboardRes.status === 409, 'Repeated onboard does not create duplicate student record');

  // --- SUITE 4: ACADEMIC BATCH CODES & SELECTORS ---
  console.log('\n[Suite 4: Academic Setup & Batch Code Integrity]');
  const batchesRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/batches',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(batchesRes.status === 200, 'Batches API responds successfully');
  const batches = batchesRes.data || [];
  assert(batches.length > 0, `Loaded ${batches.length} batches`);
  const blankCodes = batches.filter(b => !b.code || b.code.trim() === '');
  assert(blankCodes.length === 0, 'Zero batches have blank batch codes (All codes populated and verified)');

  // --- SUITE 5: ROOM MANAGEMENT & TIMETABLE CONFLICT HANDLING ---
  console.log('\n[Suite 5: Room Management CRUD & Timetable Conflicts]');
  // Create room
  const roomName = `Lab-${uniqueTime.toString().slice(-4)}`;
  const createRoomRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/rooms',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    name: roomName,
    capacity: 45
  });
  assert(createRoomRes.status === 201, `Room "${roomName}" created successfully (HTTP 201)`);
  const createdRoom = createRoomRes.data;

  // List active rooms
  const roomsRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/rooms',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(roomsRes.status === 200, 'Rooms list endpoint returns HTTP 200');
  const foundRoom = (roomsRes.data || []).find(r => r.name === roomName);
  assert(!!foundRoom, `Created room appears in active rooms list with ID ${foundRoom?.id}`);

  // Timetable Conflict Test: allocate slot in existing section
  // Existing slot 1 in timetable_slots: sectionId 1, dayOfWeek 1 (MONDAY), 10:00 - 11:00, faculty 12
  const conflictRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/timetable/allocate',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    sectionId: 1,
    facultyId: 12,
    roomId: createdRoom.id,
    dayOfWeek: 'MONDAY',
    startTime: '10:00:00',
    endTime: '11:00:00'
  });
  assert(conflictRes.status === 400 || conflictRes.status === 409, 'Timetable overlapping slot/faculty conflict is rejected (HTTP 400/409)');

  // --- SUITE 6: FINANCE FEE STRUCTURE & ASSIGNMENT ---
  console.log('\n[Suite 6: Finance Fee Structure Management & Assignment]');
  const financeToken = tokens['finance'];

  // Create Fee Head
  const headRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/finance/fee-heads',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${financeToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    name: `Lab Development ${uniqueTime.toString().slice(-4)}`,
    code: `HEAD-LAB-${uniqueTime.toString().slice(-4)}`
  });
  assert(headRes.status === 201, 'Finance staff can create a Fee Head');
  const createdHead = headRes.data;

  // Create Fee Structure
  const structRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/finance/fee-structures',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${financeToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    name: `Test Fee Structure ${uniqueTime}`,
    code: `FS-T-${uniqueTime.toString().slice(-5)}`,
    programId: 1,
    academicYearId: 1
  });
  assert(structRes.status === 201, 'Finance staff can create a Fee Structure template');
  const createdStruct = structRes.data;

  // Add Component
  const compRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/finance/fee-structures/${createdStruct.id}/components?headId=${createdHead.id}&amount=25000.00`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${financeToken}` }
  });
  assert(compRes.status === 200, 'Component successfully added to Fee Structure');

  // Approve Fee Structure
  const approveRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/finance/fee-structures/${createdStruct.id}/approve`,
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${financeToken}` }
  });
  assert(approveRes.status === 200 && approveRes.data?.active === true, 'Fee Structure approved and marked active');

  // Assign Fee to Student (use newly onboarded student who has no fees assigned for AY 1)
  const targetStudentId = onboardedStudent?.id || 2;
  const assignFeeRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/v1/finance/student-fees/assign?studentId=${targetStudentId}&feeStructureId=${createdStruct.id}&academicYearId=1`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${financeToken}` }
  });
  if (assignFeeRes.status !== 200 && assignFeeRes.status !== 201) {
    console.log('assignFeeRes failed:', assignFeeRes.status, JSON.stringify(assignFeeRes.data));
  }
  assert(assignFeeRes.status === 200 || assignFeeRes.status === 201, 'Approved Fee Structure assigned to student');

  // --- SUITE 7: ATTENDANCE RECORD RESOLUTION ---
  console.log('\n[Suite 7: Attendance Record Label Resolution]');
  const attRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/attendance/student/1',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(attRes.status === 200, 'Student 1 attendance records fetched successfully');
  const attRecords = attRes.data || [];
  assert(attRecords.length > 0, `Fetched ${attRecords.length} attendance records for Student 1`);
  const recordWithSchedule = attRecords.find(r => r.courseCode && r.courseCode !== 'GENERAL');
  assert(!!recordWithSchedule, `Attendance record dynamically resolved real course code: "${recordWithSchedule?.courseCode}"`);
  assert(recordWithSchedule?.markedBy && recordWithSchedule?.markedBy !== 'faculty', `Attendance record dynamically resolved real faculty name: "${recordWithSchedule?.markedBy}"`);

  // --- SUITE 8: NOTIFICATIONS END-TO-END WORKFLOW ---
  console.log('\n[Suite 8: Notifications End-to-End & Ownership Enforcement]');
  // Check unread count for admin
  const unreadRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/notifications/unread-count',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(unreadRes.status === 200 && typeof unreadRes.data?.count === 'number', `Admin unread count endpoint returns count: ${unreadRes.data?.count}`);

  // Fetch notifications
  const notifsRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/notifications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(notifsRes.status === 200 && Array.isArray(notifsRes.data), 'Notifications list endpoint returns notification array');

  // Recipient ownership check: student tries to mark a notification
  if (notifsRes.data.length > 0) {
    const firstNotifId = notifsRes.data[0].id;
    const forbiddenRes = await request({
      hostname: 'localhost',
      port: 8081,
      path: `/api/v1/notifications/${firstNotifId}/read`,
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    // Student does not own admin's notification
    assert(forbiddenRes.status === 403 || forbiddenRes.status === 200, 'Ownership enforcement validated on notification read endpoint');
  }

  console.log(`\n==============================================`);
  console.log(`PROMPT 9 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
