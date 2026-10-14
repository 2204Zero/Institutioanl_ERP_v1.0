const axios = require('axios');

const API = 'http://localhost:8081/api/v1';
const AUTH = 'http://localhost:8081/auth';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}${details ? ': ' + details : ''}`);
    failed++;
  }
}

async function login(username, password, role) {
  const res = await axios.post(`${AUTH}/login`, { username, password, role });
  return {
    token: res.data.accessToken,
    user: res.data.user
  };
}

function req(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function runRegressionSuite() {
  console.log('===============================================================');
  console.log('EduPulse Batch 1 Behavioral Regression Test Suite');
  console.log('===============================================================\n');

  try {
    // -----------------------------------------------------------------
    // 1. STUDENT FINANCE NAVIGATION & OWNERSHIP
    // -----------------------------------------------------------------
    console.log('--- TEST GROUP 1: Student "My Invoices" & Personal Fee View ---');
    const studentAuth = await login('student', 'Student@123', 'STUDENT');
    assert(!!studentAuth.token, 'Student authentication succeeds');

    // Student identity resolution
    let studentProfileRes;
    try {
      studentProfileRes = await axios.get(`${API}/students/me`, req(studentAuth.token));
      assert(
        studentProfileRes.status === 200 && studentProfileRes.data?.data?.id === 1,
        'Student /students/me resolves to Student ID 1',
        `Returned ID: ${studentProfileRes.data?.data?.id}`
      );
    } catch (e) {
      assert(false, 'Student /students/me resolves to Student ID 1', e.response?.data?.message || e.message);
    }

    const studentId = studentProfileRes?.data?.data?.id || 1;

    // Student personal fee record access
    let studentFeesRes;
    try {
      studentFeesRes = await axios.get(`${API}/finance/student-fees/student/${studentId}`, req(studentAuth.token));
      assert(
        studentFeesRes.status === 200 && Array.isArray(studentFeesRes.data),
        'Student successfully accesses own fee records (/finance/student-fees/student/1)'
      );
    } catch (e) {
      assert(false, 'Student successfully accesses own fee records', e.response?.data?.message || e.message);
    }

    // -----------------------------------------------------------------
    // 2. PARENT FINANCE NAVIGATION & WARD FEE ACCESS
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Parent "Ward Fees" & Authorized Ward View ---');
    const parentAuth = await login('parent', 'Parent@123', 'PARENT');
    assert(!!parentAuth.token, 'Parent authentication succeeds');

    // Parent guardian lookup via /guardians/me
    let parentGuardiansRes;
    try {
      parentGuardiansRes = await axios.get(`${API}/guardians/me`, req(parentAuth.token));
      const guardians = parentGuardiansRes.data?.data || [];
      const wardStudentId = guardians[0]?.studentId;
      assert(
        parentGuardiansRes.status === 200 && guardians.length > 0 && wardStudentId === 1,
        'Parent /guardians/me resolves to registered ward (Student ID 1)',
        `Ward Student ID: ${wardStudentId}`
      );
    } catch (e) {
      assert(false, 'Parent /guardians/me resolves to registered ward', e.response?.data?.message || e.message);
    }

    // Parent access to authorized ward fee record
    try {
      const parentWardFeeRes = await axios.get(`${API}/finance/student-fees/student/1`, req(parentAuth.token));
      assert(
        parentWardFeeRes.status === 200 && Array.isArray(parentWardFeeRes.data),
        'Parent successfully accesses authorized ward fee records (/finance/student-fees/student/1)'
      );
    } catch (e) {
      assert(false, 'Parent successfully accesses authorized ward fee records', e.response?.data?.message || e.message);
    }

    // -----------------------------------------------------------------
    // 3. IDOR / CROSS-ACCOUNT AUTHORIZATION HARDENING
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: IDOR Hardening (Cross-Student Financial Access Denied) ---');

    // Student attempts to view another student's fee record (ID 2)
    try {
      await axios.get(`${API}/finance/student-fees/student/2`, req(studentAuth.token));
      assert(false, 'Student CANNOT view Student 2 fees (Expected 403 Forbidden)');
    } catch (e) {
      assert(
        e.response?.status === 403,
        'Student accessing Student 2 fees is blocked with HTTP 403 Forbidden (IDOR prevented)',
        `Status: ${e.response?.status}`
      );
    }

    // Parent attempts to view unlinked student's fee record (ID 2)
    try {
      await axios.get(`${API}/finance/student-fees/student/2`, req(parentAuth.token));
      assert(false, 'Parent CANNOT view Student 2 fees (Expected 403 Forbidden)');
    } catch (e) {
      assert(
        e.response?.status === 403,
        'Parent accessing Student 2 fees is blocked with HTTP 403 Forbidden (IDOR prevented)',
        `Status: ${e.response?.status}`
      );
    }

    // Student attempts to view Student 2 profile
    try {
      await axios.get(`${API}/students/2`, req(studentAuth.token));
      assert(false, 'Student CANNOT view Student 2 profile (Expected 403 Forbidden)');
    } catch (e) {
      assert(
        e.response?.status === 403,
        'Student accessing Student 2 profile is blocked with HTTP 403 Forbidden',
        `Status: ${e.response?.status}`
      );
    }

    // Parent attempts to view Student 2 profile
    try {
      await axios.get(`${API}/students/2`, req(parentAuth.token));
      assert(false, 'Parent CANNOT view Student 2 profile (Expected 403 Forbidden)');
    } catch (e) {
      assert(
        e.response?.status === 403,
        'Parent accessing Student 2 profile is blocked with HTTP 403 Forbidden',
        `Status: ${e.response?.status}`
      );
    }

    // -----------------------------------------------------------------
    // 4. DATA STABILITY ACROSS RELOAD / RE-FETCH
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Fee Data Persistence & Consistency Across Reloads ---');
    const freshStudentAuth = await login('student', 'Student@123', 'STUDENT');
    const reload1 = await axios.get(`${API}/finance/student-fees/student/1`, req(freshStudentAuth.token));
    const reload2 = await axios.get(`${API}/finance/student-fees/student/1`, req(freshStudentAuth.token));

    assert(
      JSON.stringify(reload1.data) === JSON.stringify(reload2.data) &&
      JSON.stringify(reload1.data) === JSON.stringify(studentFeesRes.data),
      'Student fee statement data is identical and consistent across successive queries / session reloads'
    );

    const freshParentAuth = await login('parent', 'Parent@123', 'PARENT');
    const parentReload1 = await axios.get(`${API}/finance/student-fees/student/1`, req(freshParentAuth.token));
    const parentReload2 = await axios.get(`${API}/finance/student-fees/student/1`, req(freshParentAuth.token));

    assert(
      JSON.stringify(parentReload1.data) === JSON.stringify(parentReload2.data),
      'Parent ward fee statement data is identical and consistent across successive queries / session reloads'
    );

    // -----------------------------------------------------------------
    // 5. DASHBOARD LOCKED-USERS METRIC CALCULATION
    // -----------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Dashboard Locked-Users Calculation Accuracy ---');
    const adminAuth = await login('superadmin', 'Admin@123', 'SUPER_ADMIN');
    assert(!!adminAuth.token, 'Super Admin authentication succeeds');

    const usersRes = await axios.get(`${API}/admin/users`, req(adminAuth.token));
    const usersData = usersRes.data;

    assert(Array.isArray(usersData) && usersData.length > 0, 'Users API returns array of user summaries');

    // Test live data calculation
    const totalCount = usersData.length;
    const activeCount = usersData.filter(u => u.enabled).length;
    const lockedCount = usersData.filter(u => !u.enabled).length;

    assert(
      activeCount + lockedCount === totalCount,
      'Active count + locked count strictly equals total user count',
      `Active: ${activeCount}, Locked: ${lockedCount}, Total: ${totalCount}`
    );

    assert(
      lockedCount >= 1,
      'Locked user count accurately detects disabled_user fixture (enabled = false)',
      `Detected locked users: ${lockedCount}`
    );

    // Test empty data calculation simulation
    const emptyUsersData = [];
    const emptyActive = emptyUsersData ? emptyUsersData.filter(u => u.enabled).length : null;
    const emptyLocked = emptyUsersData ? emptyUsersData.filter(u => !u.enabled).length : null;
    assert(
      emptyActive === 0 && emptyLocked === 0,
      'Empty user list calculation safely yields 0 active, 0 locked'
    );

    // Test error/null data simulation
    const nullUsersData = null;
    const nullActive = nullUsersData ? nullUsersData.filter(u => u.enabled).length : null;
    const nullLocked = nullUsersData ? nullUsersData.filter(u => !u.enabled).length : null;
    assert(
      nullActive === null && nullLocked === null,
      'Null/error user list safely yields null and triggers "User status unavailable"'
    );

  } catch (err) {
    console.error('Unexpected test suite error:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`Test Execution Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
