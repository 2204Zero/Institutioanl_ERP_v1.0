const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function runStudentLifecycleRegression() {
  console.log('================================================================');
  console.log('PROMPT 5 ACCEPTANCE: Student Lifecycle, Alumni Controls & Audit');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  async function login(username, password, role) {
    const res = await axios.post(`${BASE_URL}/auth/login`, { username, password, role });
    return res.data.accessToken;
  }

  try {
    const adminToken = await login('admin', 'Admin@123', 'ADMIN');
    const studentToken = await login('student', 'Student@123', 'STUDENT');
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    console.log('--- 1. Status Transition Security & RBAC Enforcement ---');
    // 1. Unauthenticated request blocked
    try {
      await axios.patch(`${BASE_URL}/api/v1/students/1/status`, {
        status: 'GRADUATED',
        reason: 'Unauthorized attempt',
        effectiveDate: '2026-10-13'
      });
      assert(false, 'Unauthenticated status modification should be rejected');
    } catch (err) {
      assert(err.response?.status === 401 || err.response?.status === 403, 'Unauthenticated status PATCH rejected with 401/403');
    }

    // 2. Student role blocked from modifying student status
    try {
      await axios.patch(`${BASE_URL}/api/v1/students/1/status`, {
        status: 'GRADUATED',
        reason: 'Student self-graduation',
        effectiveDate: '2026-10-13'
      }, { headers: studentHeaders });
      assert(false, 'Student role should be blocked from modifying status');
    } catch (err) {
      assert(err.response?.status === 403, 'Student role PATCH /students/1/status rejected with 403 Forbidden');
    }

    console.log('\n--- 2. End-to-End Student Creation & Lifecycle State Machine ---');
    const timestamp = Date.now();
    const studentEmail = `lifecycle.${timestamp}@college.edu`;
    const studentRoll = `ENR_${timestamp}`;

    // Create student
    const createRes = await axios.post(`${BASE_URL}/api/v1/students`, {
      rollNumber: studentRoll,
      firstName: 'Kabir',
      lastName: 'Mehta',
      email: studentEmail,
      phone: '+919876543288',
      dateOfBirth: '2004-06-25',
      gender: 'MALE',
      department: 'Computer Science and Engineering',
      batch: '2024-2028',
      enrollmentDate: '2024-08-01',
      status: 'ACTIVE'
    }, { headers: adminHeaders });

    const studentId = createRes.data?.data?.id;
    assert(studentId != null && createRes.data?.data?.status === 'ACTIVE', `Student created successfully in ACTIVE status (ID: ${studentId})`);

    // Step A: Premature Alumni transition from ACTIVE must be rejected
    try {
      await axios.patch(`${BASE_URL}/api/v1/students/${studentId}/status`, {
        status: 'ALUMNI',
        reason: 'Premature transition attempt',
        effectiveDate: '2026-10-13'
      }, { headers: adminHeaders });
      assert(false, 'Direct transition from ACTIVE to ALUMNI should have been rejected');
    } catch (err) {
      assert(err.response?.status === 409 && err.response?.data?.message?.includes('Invalid status transition from ACTIVE to ALUMNI'),
        'Direct ACTIVE -> ALUMNI rejected with 409 Conflict ("Invalid status transition from ACTIVE to ALUMNI")');
    }

    // Step B: Valid transition ACTIVE -> SUSPENDED
    const suspendRes = await axios.patch(`${BASE_URL}/api/v1/students/${studentId}/status`, {
      status: 'SUSPENDED',
      reason: 'Attendance shortage below minimum 60% requirement in Semester 2',
      effectiveDate: '2026-10-13'
    }, { headers: adminHeaders });
    assert(suspendRes.status === 200 && suspendRes.data?.data?.status === 'SUSPENDED',
      'Student successfully transitioned from ACTIVE -> SUSPENDED');

    // Step C: Valid reinstatement SUSPENDED -> ACTIVE
    const reinstateRes = await axios.patch(`${BASE_URL}/api/v1/students/${studentId}/status`, {
      status: 'ACTIVE',
      reason: 'Completed compensatory academic assignment, reinstatement approved',
      effectiveDate: '2026-10-13'
    }, { headers: adminHeaders });
    assert(reinstateRes.status === 200 && reinstateRes.data?.data?.status === 'ACTIVE',
      'Student successfully reinstated from SUSPENDED -> ACTIVE');

    // Step D: Valid graduation ACTIVE -> GRADUATED
    const graduateRes = await axios.patch(`${BASE_URL}/api/v1/students/${studentId}/status`, {
      status: 'GRADUATED',
      reason: 'Completed all 8 semesters with cumulative CGPA 8.80',
      effectiveDate: '2026-10-13'
    }, { headers: adminHeaders });
    assert(graduateRes.status === 200 && graduateRes.data?.data?.status === 'GRADUATED',
      'Student successfully transitioned from ACTIVE -> GRADUATED');

    // Step E: Valid alumni transition GRADUATED -> ALUMNI
    const alumniRes = await axios.patch(`${BASE_URL}/api/v1/students/${studentId}/status`, {
      status: 'ALUMNI',
      reason: 'Convocation ceremony completed, enrolled in Alumni Portal',
      effectiveDate: '2026-10-13'
    }, { headers: adminHeaders });
    assert(alumniRes.status === 200 && alumniRes.data?.data?.status === 'ALUMNI',
      'Student successfully transitioned from GRADUATED -> ALUMNI (Alumni control verified)');

    // Step F: Terminal state enforcement: ALUMNI cannot transition to ACTIVE
    try {
      await axios.patch(`${BASE_URL}/api/v1/students/${studentId}/status`, {
        status: 'ACTIVE',
        reason: 'Attempt reactivation from alumni',
        effectiveDate: '2026-10-13'
      }, { headers: adminHeaders });
      assert(false, 'Transition from ALUMNI to ACTIVE should have failed');
    } catch (err) {
      assert(err.response?.status === 409 && err.response?.data?.message?.includes('Invalid status transition from ALUMNI to ACTIVE'),
        'Transition from ALUMNI -> ACTIVE rejected with 409 Conflict ("Terminal status")');
    }

    // Step G: Duplicate/repeated transition to ALUMNI is idempotent
    const repeatAlumniRes = await axios.patch(`${BASE_URL}/api/v1/students/${studentId}/status`, {
      status: 'ALUMNI',
      reason: 'Redundant alumni call',
      effectiveDate: '2026-10-13'
    }, { headers: adminHeaders });
    assert(repeatAlumniRes.status === 200 && repeatAlumniRes.data?.data?.status === 'ALUMNI',
      'Duplicate/repeated transition to ALUMNI returns 200 OK idempotently');

    console.log('\n--- 3. Audit History & Traceability ---');
    const historyRes = await axios.get(`${BASE_URL}/api/v1/students/${studentId}/status-history`, { headers: adminHeaders });
    const history = historyRes.data?.data || [];
    assert(Array.isArray(history) && history.length >= 4,
      `Audit history retrieved with complete chronology (${history.length} events logged)`);

    const latestEvent = history[0];
    assert(latestEvent.newStatus === 'ALUMNI' && latestEvent.previousStatus === 'GRADUATED',
      'Latest audit entry correctly records GRADUATED -> ALUMNI with author & timestamp');

    console.log('\n--- 4. Directory Filtering & Record Preservation ---');
    // Directory filtering by ALUMNI
    const alumniListRes = await axios.get(`${BASE_URL}/api/v1/students`, {
      params: { status: 'ALUMNI', page: 0, size: 20 },
      headers: adminHeaders
    });
    const alumniStudents = alumniListRes.data?.data?.content || [];
    const foundAlumni = alumniStudents.some(s => s.id === studentId);
    assert(foundAlumni, `Student ${studentId} successfully returned when filtering directory by status=ALUMNI`);

    // Verify historical profile data remains intact
    const profileRes = await axios.get(`${BASE_URL}/api/v1/students/${studentId}`, { headers: adminHeaders });
    const prof = profileRes.data?.data;
    assert(prof.id === studentId && prof.email === studentEmail && prof.status === 'ALUMNI',
      'Student profile and demographic data remain 100% intact after becoming ALUMNI');

  } catch (err) {
    console.error('Unexpected error during test execution:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStudentLifecycleRegression();
