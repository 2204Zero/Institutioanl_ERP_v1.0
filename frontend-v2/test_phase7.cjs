const axios = require('axios');

const API = 'http://localhost:8081/api/v1';
const AUTH = 'http://localhost:8081/auth';

async function runTest() {
  console.log("=== PHASE 7: NEW CAPABILITIES VERIFICATION ===");
  try {
    // 1. ADMIN LOGIN
    console.log("[1] Logging in as ADMIN...");
    let res = await axios.post(`${AUTH}/login`, { username: 'admin', password: 'Admin@123', role: 'ADMIN' });
    const adminToken = res.data.accessToken;

    console.log("[1.5] Setting up Prerequisites...");
    try {
      await axios.post(`${API}/departments`, { code: 'CS', name: 'Computer Science' }, { headers: { Authorization: `Bearer ${adminToken}` }});
    } catch(e) { }
    try {
      await axios.post(`${API}/programs`, { code: 'BTECH' + Date.now(), name: 'B.Tech', degree: 'Bachelors', departmentId: 1, duration: 4, isActive: true }, { headers: { Authorization: `Bearer ${adminToken}` }});
    } catch(e) { console.error('Error creating program:', e.response?.data) }
    try {
      await axios.post(`${API}/academic-years`, { name: '2025-2026', startDate: '2025-06-01', endDate: '2026-05-31', isActive: true }, { headers: { Authorization: `Bearer ${adminToken}` }});
    } catch(e) { }
    try {
      await axios.post(`${API}/courses`, { code: 'CS101', name: 'Intro', departmentId: 1, courseType: 'CORE', credits: 4, isActive: true }, { headers: { Authorization: `Bearer ${adminToken}` }});
    } catch(e) { }
    try {
      await axios.post(`${API}/semesters`, { name: 'Fall 2025', academicYearId: 1, semesterNumber: 1, startDate: '2025-06-01', endDate: '2025-12-31', isActive: true }, { headers: { Authorization: `Bearer ${adminToken}` }});
    } catch(e) { }
    try {
      await axios.post(`${API}/rooms`, { name: 'Room 101', capacity: 60, isActive: true }, { headers: { Authorization: `Bearer ${adminToken}` }});
    } catch(e) { }
    
    // Create Section to allocate timetable
    try {
      await axios.post(`${API}/sections`, { name: 'A', programId: 1, batchId: 1, semesterId: 1, maxStudents: 60 }, { headers: { Authorization: `Bearer ${adminToken}` }});
    } catch(e) {}

    // 2. CREATE ADMISSION APPLICANT
    console.log("[2] Testing Admissions API - Create Applicant...");
    res = await axios.post(`${API}/applicants`, {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe" + Date.now() + "@example.com",
      phone: String(Date.now()).slice(-10),
      dateOfBirth: "2005-01-01",
      gender: "FEMALE",
      address: "123 Street"
    }, { headers: { Authorization: `Bearer ${adminToken}` }});
    const applicantId = res.data.id;
    console.log(`    -> Applicant created successfully. ID: ${applicantId}`);

    // 3. CREATE ADMISSION APPLICATION (Draft)
    console.log("[3] Testing Admissions API - Create Application...");
    res = await axios.post(`${API}/admission-applications/draft?applicantId=${applicantId}&programId=1&academicYearId=1`, null, { headers: { Authorization: `Bearer ${adminToken}` }});
    console.log(`    -> Application drafted successfully. ID: ${res.data.id}`);

    // 4. CREATE COURSE OFFERING
    console.log("[4] Testing Course Offering API...");
    try {
      res = await axios.post(`${API}/course-offerings`, {
        courseId: 1,
        semesterId: 1,
        maxCapacity: 60
      }, { headers: { Authorization: `Bearer ${adminToken}` }});
      console.log(`    -> Course Offering created successfully. ID: ${res.data.id}`);
    } catch(e) {
      console.log(`    -> Course Offering creation failed: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }

    // 5. TIMETABLE ALLOCATION
    console.log("[5] Testing Timetable API - Allocation...");
    try {
      res = await axios.post(`${API}/timetable/allocate`, {
        sectionId: 1,
        
        facultyId: 1,
        roomId: 1,
        dayOfWeek: "MONDAY",
        startTime: "14:00:00",
        endTime: "15:30:00",
        isActive: true
      }, { headers: { Authorization: `Bearer ${adminToken}` }});
      console.log(`    -> Timetable slot allocated successfully. ID: ${res.data.id}`);
    } catch (e) {
      console.log(`    -> Timetable allocation failed: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }

    // 6. TIMETABLE FETCH
    console.log("[6] Testing Timetable API - Fetch...");
    try {
      res = await axios.get(`${API}/timetable/section/1`, { headers: { Authorization: `Bearer ${adminToken}` }});
      console.log(`    -> Timetable slots fetched: ${res.data.length}`);
    } catch(e) {
      console.log(`    -> Timetable fetch failed: ${e.response?.status}`);
    }

    // 7. FINANCE LOGIN
    console.log("[7] Logging in as FINANCE...");
    res = await axios.post(`${AUTH}/login`, { username: 'finance', password: 'Finance@123', role: 'FINANCE' });
    const financeToken = res.data.accessToken;

    // 8. CREATE FEE STRUCTURE (Fixed version)
    console.log("[8] Testing Finance API - Create Fee Structure...");
    let feeStructureId = 1;
    try {
      res = await axios.post(`${API}/finance/fee-structures`, {
          name: "B.Tech Tuition 2025",
          academicYearId: 1,
          programId: 1,
          active: true
      }, { headers: { Authorization: `Bearer ${financeToken}` }});
      feeStructureId = res.data.id;
      console.log(`    -> Fee structure created with auto-code! ID: ${feeStructureId}, Code: ${res.data.code}`);
    } catch(e) {
      console.log(`    -> Fee structure creation failed: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }

    // 9. ASSIGN FEE TO STUDENT
    console.log("[9] Testing Finance API - Assign Fee...");
    try {
      res = await axios.post(`${API}/finance/student-fees/assign?studentId=1&feeStructureId=${feeStructureId}&academicYearId=1`, null, { headers: { Authorization: `Bearer ${financeToken}` }});
      console.log(`    -> Fee assigned successfully! StudentFee ID: ${res.data.id}`);
    } catch(e) {
      console.log(`    -> Fee assignment failed: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }

    console.log("=== ALL PHASE 7 TESTS COMPLETED ===");
  } catch (error) {
    console.error("TEST FAILED:", error.response?.data || error.message);
  }
}

runTest();