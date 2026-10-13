const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8081';

function postJson(endpoint, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const url = new URL(endpoint, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, {
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(endpoint, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, {
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runRegressionSuite() {
  console.log('================================================================');
  console.log('PROMPT 3 REGRESSION SUITE: Dashboards, Navigation & Auth Matrix');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // 1. Navigation & Route Access Matrix Static Verification
  console.log('--- 1. Route & Sidebar Consistency Verification ---');
  const appTsx = fs.readFileSync(path.join(__dirname, 'src', 'App.tsx'), 'utf8');
  const layoutTsx = fs.readFileSync(path.join(__dirname, 'src', 'components', 'Layout.tsx'), 'utf8');
  const dashboardTsx = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Dashboard.tsx'), 'utf8');
  const attendanceTsx = fs.readFileSync(path.join(__dirname, 'src', 'pages', 'Attendance.tsx'), 'utf8');

  // Verify Dashboard multiplexer
  assert(
    dashboardTsx.includes('StudentDashboard') &&
    dashboardTsx.includes('ParentDashboard') &&
    dashboardTsx.includes('FinanceDashboardHome') &&
    dashboardTsx.includes('ManagementDashboard') &&
    dashboardTsx.includes('FacultyDashboard'),
    'Dashboard.tsx delegates cleanly to all 5 role-specific components'
  );

  assert(
    !dashboardTsx.includes('useQuery'),
    'Dashboard.tsx has 0 useQuery hooks (Rules-of-Hooks compliant multiplexer)'
  );

  // Verify Attendance delegation
  assert(
    attendanceTsx.includes('FacultyAttendance') && attendanceTsx.includes('StandardAttendance'),
    'Attendance.tsx separates FacultyAttendance from StandardAttendance'
  );

  // Verify Role protections in App.tsx
  assert(
    appTsx.includes("allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT', 'PARENT']}") &&
    appTsx.includes("allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT']}"),
    'App.tsx enforces strict RoleProtectedRoute for finance and attendance'
  );

  // 2. Behavioral API Testing for Each Role
  console.log('\n--- 2. Role-by-Role API & Auth Contract Acceptance ---');

  // First authenticate as superadmin to ensure required test user fixtures exist
  let superadminToken = null;
  try {
    const saLogin = await postJson('/auth/login', {
      username: 'superadmin',
      password: 'Admin@123',
      role: 'SUPER_ADMIN'
    });
    if (saLogin.status === 200 && (saLogin.data?.accessToken || saLogin.data?.token)) {
      superadminToken = saLogin.data.accessToken || saLogin.data.token;
      assert(true, 'Bootstrap SUPER_ADMIN authenticated successfully');
    }
  } catch (e) {
    console.warn('SuperAdmin login warning:', e.message);
  }

  if (superadminToken) {
    try {
      const existingUsersRes = await getJson('/api/v1/admin/users', superadminToken);
      const existingUsers = Array.isArray(existingUsersRes.data) ? existingUsersRes.data : [];
      const userMap = new Set(existingUsers.map(u => u.username.toLowerCase()));

      const neededUsers = [
        { username: 'admin', password: 'Admin@123', email: 'admin@erp.com', role: 'ADMIN' },
        { username: 'faculty', password: 'Faculty@123', email: 'faculty@erp.com', role: 'FACULTY', firstName: 'Faculty', lastName: 'Member' },
        { username: 'finance', password: 'Finance@123', email: 'finance@erp.com', role: 'FINANCE' },
        { username: 'student', password: 'Student@123', email: 'manish@erp.com', role: 'STUDENT' },
        { username: 'parent', password: 'Parent@123', email: 'mahesh.patel@example.com', role: 'PARENT' },
      ];

      for (const u of neededUsers) {
        if (!userMap.has(u.username.toLowerCase())) {
          await postJson('/api/v1/admin/users', u, superadminToken);
        }
      }
    } catch (e) {
      console.warn('User setup warning:', e.message);
    }
  }

  const credentials = [
    { role: 'ADMIN', user: 'admin', pass: 'Admin@123' },
    { role: 'FACULTY', user: 'faculty', pass: 'Faculty@123' },
    { role: 'STUDENT', user: 'student', pass: 'Student@123' },
    { role: 'PARENT', user: 'parent', pass: 'Parent@123' },
    { role: 'FINANCE', user: 'finance', pass: 'Finance@123' }
  ];

  const tokens = {};

  for (const cred of credentials) {
    try {
      const loginRes = await postJson('/auth/login', {
        username: cred.user,
        password: cred.pass,
        role: cred.role
      });
      if (loginRes.status === 200 && (loginRes.data?.accessToken || loginRes.data?.token)) {
        tokens[cred.role] = loginRes.data.accessToken || loginRes.data.token;
        assert(true, `Login successful for ${cred.role} (${cred.user})`);
      } else {
        assert(false, `Login for ${cred.role}`, `Status: ${loginRes.status}`);
      }
    } catch (e) {
      assert(false, `Login connection for ${cred.role}`, e.message);
    }
  }

  // 2.1 STUDENT Dashboard Data Flow
  if (tokens['STUDENT']) {
    console.log('\n--- 2.1 Testing STUDENT Dashboard Data Flow ---');
    const profileRes = await getJson('/api/v1/students/me', tokens['STUDENT']);
    assert(profileRes.status === 200, 'Student can resolve own profile (/api/v1/students/me)');
    const studentData = profileRes.data?.data || profileRes.data;
    const studentId = studentData?.id;

    if (studentId) {
      const coursesRes = await getJson('/api/v1/students/me/course-registrations', tokens['STUDENT']);
      assert(coursesRes.status === 200, 'Student can fetch registered courses');

      const attendanceRes = await getJson(`/api/v1/attendance/student/${studentId}`, tokens['STUDENT']);
      assert(attendanceRes.status === 200, 'Student can fetch personal attendance history');

      const feesRes = await getJson(`/api/v1/finance/student-fees/student/${studentId}`, tokens['STUDENT']);
      assert(feesRes.status === 200, 'Student can query personal fee invoice records');
    }

    // Security check: Student cannot access admin endpoints
    const forbiddenAdmin = await getJson('/api/v1/admin/users', tokens['STUDENT']);
    assert(forbiddenAdmin.status === 403, 'Student blocked from /api/v1/admin/users (403 Forbidden)');

    const forbiddenFinanceSummary = await getJson('/api/v1/finance/reports/summary', tokens['STUDENT']);
    assert(forbiddenFinanceSummary.status === 403, 'Student blocked from /api/v1/finance/reports/summary (403 Forbidden)');
  }

  // 2.2 PARENT Dashboard Data Flow
  if (tokens['PARENT']) {
    console.log('\n--- 2.2 Testing PARENT Dashboard Data Flow ---');
    const guardianRes = await getJson('/api/v1/guardians/me', tokens['PARENT']);
    const guardianList = Array.isArray(guardianRes.data) ? guardianRes.data : (guardianRes.data?.data || []);
    assert(guardianRes.status === 200 && Array.isArray(guardianList), 'Parent can fetch linked wards (/api/v1/guardians/me)');

    if (guardianList && guardianList.length > 0) {
      const wardId = guardianList[0].studentId;
      assert(wardId > 0, `Parent ward link resolved to Student ID #${wardId}`);

      const wardProfile = await getJson(`/api/v1/students/${wardId}`, tokens['PARENT']);
      assert(wardProfile.status === 200, 'Parent can fetch ward student profile');

      const wardAttendance = await getJson(`/api/v1/attendance/student/${wardId}`, tokens['PARENT']);
      assert(wardAttendance.status === 200, 'Parent can fetch ward attendance records');

      const wardFees = await getJson(`/api/v1/finance/student-fees/student/${wardId}`, tokens['PARENT']);
      assert(wardFees.status === 200, 'Parent can fetch ward fee invoices');
    }

    // Security check: Parent cannot access admin users
    const parentForbiddenAdmin = await getJson('/api/v1/admin/users', tokens['PARENT']);
    assert(parentForbiddenAdmin.status === 403, 'Parent blocked from /api/v1/admin/users (403 Forbidden)');
  }

  // 2.3 FINANCE Dashboard Data Flow
  if (tokens['FINANCE']) {
    console.log('\n--- 2.3 Testing FINANCE Dashboard Data Flow ---');
    const summaryRes = await getJson('/api/v1/finance/reports/summary', tokens['FINANCE']);
    assert(summaryRes.status === 200, 'Finance user can fetch summary report (/api/v1/finance/reports/summary)');

    const allFeesRes = await getJson('/api/v1/finance/student-fees', tokens['FINANCE']);
    assert(allFeesRes.status === 200, 'Finance user can query all student fees (/api/v1/finance/student-fees)');

    // Security check: Finance cannot manage users
    const financeForbiddenAdmin = await getJson('/api/v1/admin/users', tokens['FINANCE']);
    assert(financeForbiddenAdmin.status === 403, 'Finance blocked from /api/v1/admin/users (403 Forbidden)');
  }

  // 2.4 ADMIN Dashboard Data Flow
  if (tokens['ADMIN']) {
    console.log('\n--- 2.4 Testing ADMIN Dashboard Data Flow ---');
    const deptsRes = await getJson('/api/v1/departments', tokens['ADMIN']);
    assert(deptsRes.status === 200, 'Admin can fetch departments (/api/v1/departments)');

    const studentsRes = await getJson('/api/v1/students?page=0&size=5', tokens['ADMIN']);
    assert(studentsRes.status === 200, 'Admin can fetch paginated students (/api/v1/students)');

    const appsRes = await getJson('/api/v1/admission-applications', tokens['ADMIN']);
    assert(appsRes.status === 200, 'Admin can fetch admission applications (/api/v1/admission-applications)');
  }

  // 2.5 FACULTY Dashboard Data Flow
  if (tokens['FACULTY']) {
    console.log('\n--- 2.5 Testing FACULTY Dashboard Data Flow ---');
    const sectionsRes = await getJson('/api/v1/faculty/me/sections', tokens['FACULTY']);
    assert(sectionsRes.status === 200, 'Faculty can fetch assigned sections (/api/v1/faculty/me/sections)');

    const timetableRes = await getJson('/api/v1/faculty/me/timetable', tokens['FACULTY']);
    assert(timetableRes.status === 200, 'Faculty can fetch assigned timetable (/api/v1/faculty/me/timetable)');
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRegressionSuite().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
