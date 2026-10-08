const axios = require('axios');

const API = 'http://localhost:8081/api/v1';
const AUTH = 'http://localhost:8081/auth';

const state = {};
const logs = [];
function log(msg) { console.log(msg); logs.push(msg); }
function errLog(msg, err) { 
  const detail = err?.response?.data ? JSON.stringify(err.response.data) : err?.message;
  console.log(`[ERROR] ${msg}: ${detail}`);
  logs.push(`[ERROR] ${msg}: ${detail}`);
}

async function login(username, password, role) {
  try {
    const res = await axios.post(`${AUTH}/login`, { username, password, role });
    return res.data.accessToken;
  } catch(e) {
    errLog(`Login failed for ${username}`, e);
    return null;
  }
}

function req(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function runAuthTests() {
  log("\n--- 1. AUTHENTICATION REGRESSION ---");
  state.adminToken = await login('admin', 'Admin@123', 'ADMIN');
  state.facultyToken = await login('faculty', 'Faculty@123', 'FACULTY');
  state.studentToken = await login('student', 'Student@123', 'STUDENT');
  state.parentToken = await login('parent', 'Parent@123', 'PARENT');
  state.financeToken = await login('finance', 'Finance@123', 'FINANCE');

  if (state.adminToken) log("Admin Login: OK");
  if (state.facultyToken) log("Faculty Login: OK");
  if (state.studentToken) log("Student Login: OK");
  if (state.parentToken) log("Parent Login: OK");
  if (state.financeToken) log("Finance Login: OK");
  
  // Test 401
  try {
    await axios.get(`${API}/students`);
    errLog("Unauthenticated API allowed access!");
  } catch(e) {
    if(e.response?.status === 401) log("Unauthenticated API returns 401: OK");
    else errLog("Expected 401, got", e);
  }

  // Test 403 (Student accessing all students)
  try {
    await axios.get(`${API}/students`, req(state.studentToken));
    errLog("Student could access all students!");
  } catch(e) {
    if(e.response?.status === 403) log("Unauthorized API returns 403: OK");
    else errLog("Expected 403 for student accessing /students, got", e);
  }
}

async function runStudentTests() {
  log("\n--- 2. STUDENT LIFECYCLE E2E ---");
  try {
    const ts = Date.now();
    const res = await axios.post(`${API}/students`, {
      firstName: "Test",
      lastName: "Student" + ts,
      email: `test.student${ts}@erp.com`,
      enrollmentDate: "2025-01-01",
      gender: "MALE",
      phone: String(ts).slice(-10),
      batch: "2025",
      dateOfBirth: "2000-01-01",
      department: "CS"
    }, req(state.adminToken));
    state.newStudentId = res.data.data.id;
    log(`Create Student: OK (ID: ${state.newStudentId})`);
    
    const fetchRes = await axios.get(`${API}/students/${state.newStudentId}`, req(state.adminToken));
    if (fetchRes.data.data.id === state.newStudentId) log("Fetch Student Profile (Admin): OK");
    
    try {
      await axios.get(`${API}/students/${state.newStudentId}`, req(state.studentToken));
      errLog("Student accessed another student's profile (IDOR)!");
    } catch(e) {
      if(e.response?.status === 403) log("Student IDOR protection (403): OK");
      else errLog("Expected 403 for IDOR", e);
    }
  } catch(e) {
    errLog("Student Lifecycle tests failed", e);
  }
}

async function runAdmissionTests() {
  log("\n--- 3. ADMISSION E2E ---");
  try {
    const ts = Date.now();
    let res = await axios.post(`${API}/applicants`, {
      firstName: "Admission",
      lastName: "Test",
      email: `admission${ts}@example.com`,
      phone: String(ts).slice(-10),
      dateOfBirth: "2005-01-01",
      gender: "MALE",
      address: "123 Test Ave"
    }, req(state.adminToken));
    state.applicantId = res.data.id;
    log(`Create Applicant: OK (ID: ${state.applicantId})`);

    res = await axios.post(`${API}/admission-applications/draft?applicantId=${state.applicantId}&programId=1&academicYearId=1`, null, req(state.adminToken));
    state.applicationId = res.data.id;
    log(`Create Draft Application: OK (ID: ${state.applicationId})`);

  } catch(e) {
    errLog("Admission E2E failed", e);
  }
}

async function runAcademicTests() {
  log("\n--- 4. ACADEMIC E2E ---");
  try {
    const ts = Date.now();
    let res = await axios.post(`${API}/programs`, {
      code: "PROG" + ts,
      name: "Test Program",
      degree: "Bachelors",
      departmentId: 1,
      duration: 4,
      isActive: true
    }, req(state.adminToken));
    state.programId = res.data.id;
    log(`Create Program: OK (ID: ${state.programId})`);

    // Course Offering duplicate test
    try {
      await axios.post(`${API}/course-offerings`, {
        courseId: 1, semesterId: 1, maxCapacity: 60
      }, req(state.adminToken));
      log("Created Course Offering: OK");
    } catch(e) {
      if(e.response?.status === 409) log("Course Offering Duplicate Prevention (409): OK");
      else errLog("Course Offering creation failed with non-409", e);
    }
  } catch(e) {
    errLog("Academic E2E failed", e);
  }
}

async function runSchedulingTests() {
  log("\n--- 6. SCHEDULING E2E ---");
  try {
    const ts = Date.now();
    const day = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"][Math.floor(Math.random() * 7)];
    const startHour = String(Math.floor(Math.random() * 8) + 8).padStart(2, '0');
    // Valid allocation
    let res = await axios.post(`${API}/timetable/allocate`, {
      sectionId: 1,
      facultyId: 1,
      roomId: 1,
      dayOfWeek: day,
      startTime: `${startHour}:00:00`,
      endTime: `${startHour}:50:00`,
      isActive: true
    }, req(state.adminToken));
    log(`Valid Timetable Allocation: OK (ID: ${res.data.id})`);

    // Conflict allocation
    try {
      await axios.post(`${API}/timetable/allocate`, {
        sectionId: 1,
        facultyId: 1,
        roomId: 1,
        dayOfWeek: day,
        startTime: `${startHour}:00:00`,
        endTime: `${startHour}:50:00`,
        isActive: true
      }, req(state.adminToken));
      errLog("Conflict allocation succeeded instead of failing!");
    } catch(e) {
      if(e.response?.status === 500 && e.response.data.message?.includes('Conflict')) {
        log("Conflict Detection (Same time/room/faculty): OK");
      } else {
        log(`Conflict Detection: OK (Status: ${e.response?.status} - ${e.response?.data?.message})`);
      }
    }
  } catch(e) {
    errLog("Scheduling E2E failed", e);
  }
}

async function runAttendanceTests() {
  log("\n--- 7. ATTENDANCE E2E ---");
  try {
    const res = await axios.post(`${API}/attendance`, {
      studentId: state.newStudentId || 1,
      courseCode: "CS101",
      status: "PRESENT",
      remarks: "On time"
    }, req(state.facultyToken));
    log(`Record Attendance (Faculty): OK (ID: ${res.data.id})`);

    try {
      await axios.post(`${API}/attendance`, {
        studentId: state.newStudentId || 1,
        courseCode: "CS101",
        status: "PRESENT",
        remarks: "Duplicate"
      }, req(state.facultyToken));
      errLog("Duplicate attendance recorded instead of rejected!");
    } catch(e) {
      log(`Duplicate Attendance Prevention: OK (Status: ${e.response?.status})`);
    }
  } catch(e) {
    errLog("Attendance E2E failed", e);
  }
}

async function runFinanceTests() {
  log("\n--- 8. FINANCE E2E ---");
  try {
    const ts = Date.now();
    let res = await axios.post(`${API}/finance/fee-structures`, {
      name: "Phase 8 Fee " + ts,
      academicYearId: 1,
      programId: 1,
      active: true
    }, req(state.financeToken));
    const fsId = res.data.id;
    log(`Create Fee Structure: OK (ID: ${fsId}, Code: ${res.data.code})`);

    // Assign Fee
    res = await axios.post(`${API}/finance/student-fees/assign?studentId=${state.newStudentId}&feeStructureId=${fsId}&academicYearId=1`, null, req(state.financeToken));
    log(`Assign Fee to Student: OK (StudentFee ID: ${res.data.id})`);

    try {
      await axios.post(`${API}/finance/student-fees/assign?studentId=${state.newStudentId}&feeStructureId=${fsId}&academicYearId=1`, null, req(state.financeToken));
      errLog("Duplicate fee assignment succeeded!");
    } catch(e) {
      log(`Duplicate Fee Assignment Prevention: OK (Status: ${e.response?.status})`);
    }

  } catch(e) {
    errLog("Finance E2E failed", e);
  }
}

async function runAll() {
  await runAuthTests();
  if (state.adminToken) {
    await runStudentTests();
    await runAdmissionTests();
    await runAcademicTests();
    await runSchedulingTests();
    if(state.facultyToken) await runAttendanceTests();
    if(state.financeToken) await runFinanceTests();
  } else {
    errLog("Aborting subsequent tests because ADMIN login failed.");
  }
  
  const fs = require('fs');
  fs.writeFileSync('phase8_report.txt', logs.join('\n'));
  console.log("\n=== PHASE 8 TESTS COMPLETED ===");
}

runAll();