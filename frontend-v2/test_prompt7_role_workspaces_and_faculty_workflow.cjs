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

async function runPrompt7AcceptanceSuite() {
  console.log('================================================================');
  console.log('PROMPT 7 ACCEPTANCE: Role Workspaces, Faculty Flow & Auth Audit');
  console.log('================================================================\n');

  try {
    // -----------------------------------------------------------------
    // 1. ANONYMOUS DIRECT ACCESS AUDIT
    // -----------------------------------------------------------------
    console.log('--- 1. Anonymous Direct Access Security Audit ---');
    const protectedUrls = [
      { method: 'get', url: `${API}/admin/users` },
      { method: 'get', url: `${API}/faculty/me` },
      { method: 'get', url: `${API}/students/me` },
      { method: 'get', url: `${API}/guardians/me` },
      { method: 'get', url: `${API}/finance/reports/summary` },
      { method: 'post', url: `${API}/attendance/bulk`, data: { sectionId: 1, date: '2026-10-13', records: [] } }
    ];

    for (const endpoint of protectedUrls) {
      try {
        await axios[endpoint.method](endpoint.url, endpoint.data || {});
        assert(false, `Anonymous rejected for ${endpoint.method.toUpperCase()} ${endpoint.url}`, 'Allowed anonymously (200 OK)');
      } catch (e) {
        const status = e.response?.status;
        assert(status === 401 || status === 403, `Anonymous rejected for ${endpoint.method.toUpperCase()} ${endpoint.url} (${status})`);
      }
    }

    // -----------------------------------------------------------------
    // 2. COMPLETE FACULTY WORKFLOW AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 2. End-to-End Faculty Lifecycle & Operations Workflow ---');
    const adminAuth = await login('admin', 'Admin@123', 'ADMIN');
    assert(!!adminAuth.token, 'Admin authenticated successfully');

    // 2.1 Fetch or create a department for assignment
    const deptRes = await axios.get(`${API}/departments`, req(adminAuth.token));
    const deptList = deptRes.data?.data || deptRes.data || [];
    assert(deptList.length > 0, `Departments found (${deptList.length} total)`);
    const targetDeptId = deptList[0].id;
    const targetDeptName = deptList[0].name;

    // 2.2 Admin creates a new faculty member with auto-provisioned user account
    const timestamp = Date.now();
    const facultyEmail = `prof.curie.${timestamp}@institution.edu`;
    const facultyUsername = `curie_${timestamp}`;
    const newFacultyPayload = {
      firstName: 'Marie',
      lastName: 'Curie',
      officialEmail: facultyEmail,
      departmentId: targetDeptId,
      designation: 'Professor',
      phone: '+919876543299',
      username: facultyUsername,
      password: 'Faculty@123'
    };

    const createFacultyRes = await axios.post(`${API}/admin/faculty`, newFacultyPayload, req(adminAuth.token));
    assert(createFacultyRes.status === 201 || createFacultyRes.status === 200, 'Admin successfully created faculty member with account provisioning');
    const createdFacultyData = createFacultyRes.data?.data || createFacultyRes.data;
    const createdFacultyId = createdFacultyData.id;
    assert(createdFacultyId > 0, `Provisioned Faculty ID #${createdFacultyId}`);

    // 2.3 Verify Admin Faculty Retrieval & Department Assignment Update
    const getFacRes = await axios.get(`${API}/admin/faculty/${createdFacultyId}`, req(adminAuth.token));
    const facRecord = getFacRes.data?.data || getFacRes.data;
    assert(getFacRes.status === 200 && (facRecord?.email === facultyEmail || facRecord?.officialEmail === facultyEmail), 'Admin can retrieve created faculty details');

    // 2.4 Faculty Logs In with Newly Provisioned Account
    const newFacultyAuth = await login(facultyUsername, 'Faculty@123', 'FACULTY');
    assert(!!newFacultyAuth.token, `New faculty member (${facultyUsername}) authenticated successfully`);

    // 2.5 Faculty Profile Self-Resolution (/api/v1/faculty/me)
    const facultyMeRes = await axios.get(`${API}/faculty/me`, req(newFacultyAuth.token));
    assert(facultyMeRes.status === 200, 'Faculty resolves own profile (/api/v1/faculty/me)');
    assert(facultyMeRes.data?.officialEmail === facultyEmail, `Profile email matches official email (${facultyEmail})`);
    assert(facultyMeRes.data?.departmentId === targetDeptId, `Profile reflects department ID #${targetDeptId}`);

    // 2.6 Teaching Responsibilities Assignment
    // Link created faculty to an active section
    const sectionsRes = await axios.get(`${API}/sections`, req(adminAuth.token));
    const sectionList = Array.isArray(sectionsRes.data?.data?.content) 
      ? sectionsRes.data.data.content 
      : (Array.isArray(sectionsRes.data?.data) ? sectionsRes.data.data : (Array.isArray(sectionsRes.data) ? sectionsRes.data : []));
    assert(sectionList.length > 0, `Sections available for assignment (${sectionList.length} sections found)`);
    const assignedSectionId = sectionList[0].id;

    // Assign faculty to section via SectionFaculty
    const assignPayload = {
      facultyId: createdFacultyId,
      role: 'CLASS_TEACHER'
    };
    const assignRes = await axios.post(`${API}/sections/${assignedSectionId}/faculty`, assignPayload, req(adminAuth.token));
    assert(assignRes.status === 200 || assignRes.status === 201, `Admin assigned faculty to Section #${assignedSectionId}`);

    // 2.7 Faculty Views Assigned Sections and Timetable
    const mySectionsRes = await axios.get(`${API}/faculty/me/sections`, req(newFacultyAuth.token));
    assert(mySectionsRes.status === 200, 'Faculty retrieves assigned sections');

    const myTimetableRes = await axios.get(`${API}/faculty/me/timetable`, req(newFacultyAuth.token));
    assert(myTimetableRes.status === 200, 'Faculty retrieves timetable slots');

    // 2.8 Faculty Accesses Section Roster
    const rosterRes = await axios.get(`${API}/sections/${assignedSectionId}/students`, req(newFacultyAuth.token));
    assert(rosterRes.status === 200, `Faculty retrieves student roster for assigned Section #${assignedSectionId}`);
    const roster = Array.isArray(rosterRes.data?.data) ? rosterRes.data.data : (Array.isArray(rosterRes.data) ? rosterRes.data : []);

    // 2.9 Faculty Records Bulk Attendance
    const testDate = new Date(Date.now() + (Math.floor(Math.random() * 10000) + 10) * 86400000).toISOString().split('T')[0];
    const attendanceRecords = roster.length > 0 ? [{
      studentId: roster[0].studentId || roster[0].id,
      status: 'PRESENT',
      remarks: 'Present on time'
    }] : [{
      studentId: 1,
      status: 'PRESENT',
      remarks: 'Present on time'
    }];

    const bulkPayload = {
      sectionId: assignedSectionId,
      scheduleId: 1,
      date: testDate,
      records: attendanceRecords
    };

    try {
      const bulkRes = await axios.post(`${API}/attendance/bulk`, bulkPayload, req(newFacultyAuth.token));
      assert(bulkRes.status === 200 || bulkRes.status === 201, 'Faculty successfully recorded bulk attendance');
    } catch (e) {
      if (e.response?.status === 409) {
        assert(true, 'Attendance submission handled idempotently/conflict for existing date (409 Conflict)');
      } else {
        assert(false, 'Faculty recorded bulk attendance', e.response?.data?.message || e.message);
      }
    }

    // 2.10 Faculty Negative Security Checks
    // Try to access an unassigned section (e.g. ID 9999)
    try {
      await axios.get(`${API}/sections/9999/students`, req(newFacultyAuth.token));
      assert(false, 'Faculty accessing unassigned section roster blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403 || e.response?.status === 404, `Faculty blocked from unassigned section roster (${e.response?.status})`);
    }

    // Try to record attendance for unassigned section (e.g. ID 9999)
    try {
      await axios.post(`${API}/attendance/bulk`, {
        sectionId: 9999,
        scheduleId: 1,
        date: testDate,
        records: [{ studentId: 1, status: 'PRESENT', remarks: 'Unassigned test' }]
      }, req(newFacultyAuth.token));
      assert(false, 'Faculty submitting attendance for unassigned section blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403 || e.response?.status === 404, `Faculty blocked from unassigned attendance (${e.response?.status})`);
    }

    // -----------------------------------------------------------------
    // 3. STUDENT WORKSPACE & CROSS-STUDENT BOUNDARIES
    // -----------------------------------------------------------------
    console.log('\n--- 3. Student Workspace Privacy & Ownership Enforcement ---');
    const studentAuth = await login('student', 'Student@123', 'STUDENT');
    assert(!!studentAuth.token, 'Student authenticated successfully');

    const stuMeRes = await axios.get(`${API}/students/me`, req(studentAuth.token));
    assert(stuMeRes.status === 200, 'Student resolves own profile (/api/v1/students/me)');
    const ownStudentId = stuMeRes.data?.data?.id || stuMeRes.data?.id;

    // Student checks own attendance
    const ownAttRes = await axios.get(`${API}/attendance/student/${ownStudentId}`, req(studentAuth.token));
    assert(ownAttRes.status === 200, `Student views own attendance records for ID #${ownStudentId}`);

    // Student checks own fees
    const ownFeeRes = await axios.get(`${API}/finance/student-fees/student/${ownStudentId}`, req(studentAuth.token));
    assert(ownFeeRes.status === 200, `Student views own fee records for ID #${ownStudentId}`);

    // Cross-student privacy attacks (Target Student ID 2)
    const otherStudentId = ownStudentId === 1 ? 2 : 1;
    try {
      await axios.get(`${API}/students/${otherStudentId}`, req(studentAuth.token));
      assert(false, 'Cross-student profile access blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, `Cross-student profile blocked with 403 Forbidden`);
    }

    try {
      await axios.get(`${API}/attendance/student/${otherStudentId}`, req(studentAuth.token));
      assert(false, 'Cross-student attendance access blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, `Cross-student attendance blocked with 403 Forbidden`);
    }

    try {
      await axios.get(`${API}/finance/student-fees/student/${otherStudentId}`, req(studentAuth.token));
      assert(false, 'Cross-student fees access blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, `Cross-student fees blocked with 403 Forbidden`);
    }

    // Student cannot record attendance
    try {
      await axios.post(`${API}/attendance/bulk`, {
        sectionId: assignedSectionId,
        scheduleId: 1,
        date: testDate,
        records: [{ studentId: ownStudentId, status: 'PRESENT', remarks: 'Unauthorized' }]
      }, req(studentAuth.token));
      assert(false, 'Student submitting attendance blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, 'Student blocked from recording attendance (403 Forbidden)');
    }

    // -----------------------------------------------------------------
    // 4. PARENT WORKSPACE & WARD BOUNDARIES
    // -----------------------------------------------------------------
    console.log('\n--- 4. Parent Workspace & Ward Boundary Audit ---');
    const parentAuth = await login('parent', 'Parent@123', 'PARENT');
    assert(!!parentAuth.token, 'Parent authenticated successfully');

    const wardsRes = await axios.get(`${API}/guardians/me`, req(parentAuth.token));
    const wardList = Array.isArray(wardsRes.data?.data) ? wardsRes.data.data : (Array.isArray(wardsRes.data) ? wardsRes.data : []);
    assert(wardsRes.status === 200 && wardList.length > 0, `Parent resolves linked wards (${wardList.length} wards)`);
    const linkedWardId = wardList[0].studentId;

    const wardProfileRes = await axios.get(`${API}/students/${linkedWardId}`, req(parentAuth.token));
    assert(wardProfileRes.status === 200, `Parent views linked ward #${linkedWardId} profile`);

    const wardAttRes = await axios.get(`${API}/attendance/student/${linkedWardId}`, req(parentAuth.token));
    assert(wardAttRes.status === 200, `Parent views linked ward #${linkedWardId} attendance`);

    const wardFeeRes = await axios.get(`${API}/finance/student-fees/student/${linkedWardId}`, req(parentAuth.token));
    assert(wardFeeRes.status === 200, `Parent views linked ward #${linkedWardId} fee records`);

    // Parent accessing unlinked student (Student ID 2)
    const unlinkedStudentId = linkedWardId === 1 ? 2 : 1;
    try {
      await axios.get(`${API}/students/${unlinkedStudentId}`, req(parentAuth.token));
      assert(false, 'Parent accessing unlinked ward profile blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, 'Parent blocked from unlinked student profile (403 Forbidden)');
    }

    try {
      await axios.get(`${API}/finance/student-fees/student/${unlinkedStudentId}`, req(parentAuth.token));
      assert(false, 'Parent accessing unlinked ward fees blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, 'Parent blocked from unlinked student fees (403 Forbidden)');
    }

    // -----------------------------------------------------------------
    // 5. FINANCE WORKSPACE & ADMINISTRATIVE BOUNDARIES
    // -----------------------------------------------------------------
    console.log('\n--- 5. Finance Workspace & Administrative Boundaries ---');
    const finAuth = await login('finance', 'Finance@123', 'FINANCE');
    assert(!!finAuth.token, 'Finance user authenticated successfully');

    const summaryRes = await axios.get(`${API}/finance/reports/summary`, req(finAuth.token));
    assert(summaryRes.status === 200, 'Finance user calculates institutional financial summary');

    const allFeesRes = await axios.get(`${API}/finance/student-fees`, req(finAuth.token));
    assert(allFeesRes.status === 200, 'Finance user queries all institutional student fees');

    // Finance user boundary enforcement: blocked from administrative mutations
    try {
      await axios.post(`${API}/admin/faculty`, { firstName: 'Test', lastName: 'Fac', officialEmail: 'test@fac.com' }, req(finAuth.token));
      assert(false, 'Finance user creating faculty blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, 'Finance user blocked from creating faculty (403 Forbidden)');
    }

    try {
      await axios.post(`${API}/attendance/bulk`, {
        sectionId: assignedSectionId,
        scheduleId: 1,
        date: testDate,
        records: [{ studentId: 1, status: 'PRESENT', remarks: 'Finance test' }]
      }, req(finAuth.token));
      assert(false, 'Finance user recording bulk attendance blocked', 'Allowed 200 OK');
    } catch (e) {
      assert(e.response?.status === 403, 'Finance user blocked from recording attendance (403 Forbidden)');
    }

    // -----------------------------------------------------------------
    // 6. JSON STORAGE INTEGRITY & PERSISTENCE VERIFICATION
    // -----------------------------------------------------------------
    console.log('\n--- 6. DevJson Persistence & Storage Verification ---');
    const devJsonDir = path.resolve(__dirname, '..', 'backend', 'data', 'dev-json');
    assert(fs.existsSync(devJsonDir), `DevJson data directory exists at ${devJsonDir}`);

    const criticalFiles = [
      'users.json',
      'faculty.json',
      'students.json',
      'departments.json',
      'attendance_records.json',
      'student_fees.json'
    ];

    for (const f of criticalFiles) {
      const filePath = path.join(devJsonDir, f);
      const exists = fs.existsSync(filePath);
      let count = 0;
      if (exists) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          count = Array.isArray(content) ? content.length : 1;
        } catch (e) {}
      }
      assert(exists && count > 0, `JSON file ${f} persisted and non-empty (${count} records)`);
    }

  } catch (err) {
    console.error('Unexpected error during test execution:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPrompt7AcceptanceSuite();
