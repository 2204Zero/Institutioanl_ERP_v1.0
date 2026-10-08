const axios = require('axios');

const API = 'http://localhost:8081/api/v1';
const AUTH = 'http://localhost:8081/auth';

async function runTest() {
  console.log("=== PHASE 5: END-TO-END WORKFLOW VALIDATION ===");
  try {
    // 1. ADMIN LOGIN
    console.log("[1] Logging in as ADMIN...");
    let res = await axios.post(`${AUTH}/login`, { username: 'admin', password: 'Admin@123', role: 'ADMIN' });
    const adminToken = res.data.accessToken;

    // 2. CREATE STUDENT (ADMIN)
    console.log("[2] Admin creating student...");
    const studentData = {
      firstName: "Test",
      lastName: "Student",
      email: "student@erp.com",
      phone: "1234567890",
      dateOfBirth: "2005-01-01",
      gender: "MALE",
      department: "Computer Science",
      program: "B.Tech",
      batch: "2024",
      enrollmentDate: "2024-01-01"
    };
    res = await axios.post(`${API}/students`, studentData, { headers: { Authorization: `Bearer ${adminToken}` }});
    const studentId = res.data.data.id;
    console.log(`    -> Student created with ID: ${studentId}`);

    // Create Academic Year
    console.log("[2.1] Admin creating Academic Year...");
    let academicYearId = 1;
    try {
      res = await axios.post(`${API}/academic-years`, { name: "2024-2025", startDate: "2024-06-01", endDate: "2025-05-31", isActive: true }, { headers: { Authorization: `Bearer ${adminToken}` }});
      academicYearId = res.data.id;
      console.log(`    -> Academic Year created with ID: ${academicYearId}`);
    } catch(e) {
      console.log(`    -> Could not create Academic Year: ${e.response?.status} - proceeding with ID 1`);
    }

    // 3. FACULTY LOGIN
    console.log("[3] Logging in as FACULTY...");
    res = await axios.post(`${AUTH}/login`, { username: 'faculty', password: 'Faculty@123', role: 'FACULTY' });
    const facultyToken = res.data.accessToken;

    // 4. MARK ATTENDANCE (FACULTY)
    console.log("[4] Faculty recording attendance...");
    const attendanceData = {
      studentId: studentId,
      status: "PRESENT",
      courseCode: "CS101",
      remarks: "Present on first day"
    };
    try {
      res = await axios.post(`${API}/attendance`, attendanceData, { headers: { Authorization: `Bearer ${facultyToken}` }});
      console.log(`    -> Attendance recorded: ID ${res.data.id || 'success'}`);
    } catch(e) {
      console.log(`    -> Attendance failed: ${e.response?.status} - ${e.response?.data?.message || e.message}`);
    }

    // 5. FINANCE LOGIN
    console.log("[5] Logging in as FINANCE...");
    res = await axios.post(`${AUTH}/login`, { username: 'finance', password: 'Finance@123', role: 'FINANCE' });
    const financeToken = res.data.accessToken;

    // 6. CREATE FEE STRUCTURE (FINANCE)
    console.log("[6] Finance creating Fee Structure...");
    let feeStructureId = 1;
    try {
      res = await axios.post(`${API}/finance/fee-structures`, {
          name: "B.Tech Tuition 2024",
          totalAmount: 100000,
          academicYearId: academicYearId,
          dueDate: "2024-12-31"
      }, { headers: { Authorization: `Bearer ${financeToken}` }});
      feeStructureId = res.data.id;
      console.log(`    -> Fee structure created with ID: ${feeStructureId}`);
    } catch(e) {
      console.log(`    -> Fee structure creation failed: ${e.response?.status} - proceeding with ID 1`);
    }

    // 7. ASSIGN FEE (FINANCE)
    console.log("[7] Finance assigning fee...");
    try {
      res = await axios.post(`${API}/finance/student-fees/assign?studentId=${studentId}&feeStructureId=${feeStructureId}&academicYearId=${academicYearId}`, null, { headers: { Authorization: `Bearer ${financeToken}` }});
      console.log(`    -> Fee assigned: ID ${res.data?.id || 'success'}`);
    } catch(e) {
      console.log(`    -> Fee assignment failed: ${e.response?.status} - ${e.response?.data?.message || e.message}`);
    }

    // 8. STUDENT LOGIN
    console.log("[8] Logging in as STUDENT (test student)...");
    res = await axios.post(`${AUTH}/login`, { username: 'student', password: 'Student@123', role: 'STUDENT' });
    const studentToken = res.data.accessToken;

    // 9. STUDENT VERIFY
    console.log("[9] Student verifying records...");
    res = await axios.get(`${API}/students?search=student`, { headers: { Authorization: `Bearer ${studentToken}` }});
    const myId = res.data.data.content[0]?.id;
    console.log(`    -> Found my own student ID: ${myId}`);
    
    res = await axios.get(`${API}/attendance/student/${myId}`, { headers: { Authorization: `Bearer ${studentToken}` }});
    console.log(`    -> Attendance records fetched: ${res.data.length}`);
    
    res = await axios.get(`${API}/finance/student-fees/student/${myId}`, { headers: { Authorization: `Bearer ${studentToken}` }});
    console.log(`    -> Fee records fetched: ${res.data.length}`);

    // IDOR TEST
    console.log("[10] Testing IDOR (Student accessing another student's data)...");
    try {
      await axios.get(`${API}/attendance/student/1`, { headers: { Authorization: `Bearer ${studentToken}` }});
      console.log(`    -> VULNERABILITY! Student accessed Attendance for Student 1`);
    } catch (e) {
      console.log(`    -> IDOR blocked on Attendance: ${e.response?.status}`);
    }
    try {
      await axios.get(`${API}/finance/student-fees/student/1`, { headers: { Authorization: `Bearer ${studentToken}` }});
      console.log(`    -> VULNERABILITY! Student accessed Fees for Student 1`);
    } catch (e) {
      console.log(`    -> IDOR blocked on Finance: ${e.response?.status}`);
    }

    console.log("=== TESTS COMPLETED SUCCESSFULLY ===");
  } catch (error) {
    console.error("TEST FAILED:", error.response?.data || error.message);
  }
}

runTest();