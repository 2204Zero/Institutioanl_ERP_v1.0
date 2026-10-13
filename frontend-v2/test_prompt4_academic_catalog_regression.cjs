const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function runAcademicCatalogRegression() {
  console.log('================================================================');
  console.log('PROMPT 4 ACCEPTANCE: Academic Catalog, Prerequisites & Workflows');
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

  // Helper login
  async function login(username, password, role) {
    const res = await axios.post(`${BASE_URL}/auth/login`, { username, password, role });
    return res.data.accessToken;
  }

  try {
    const adminToken = await login('admin', 'Admin@123', 'ADMIN');
    const studentToken = await login('student', 'Student@123', 'STUDENT');
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    console.log('--- 1. Academic Prerequisite Security Verification ---');
    // 1. Unauthenticated blocked
    try {
      await axios.get(`${BASE_URL}/api/v1/courses/1/prerequisites`);
      assert(false, 'Unauthenticated access should be blocked');
    } catch (err) {
      assert(err.response?.status === 401 || err.response?.status === 403, 'Unauthenticated GET /courses/1/prerequisites rejected (401/403)');
    }

    // 2. Student blocked from adding prerequisite
    try {
      await axios.post(`${BASE_URL}/api/v1/courses/1/prerequisites/2`, {}, { headers: studentHeaders });
      assert(false, 'Student should be blocked from adding prerequisites');
    } catch (err) {
      assert(err.response?.status === 403, 'Student POST /courses/1/prerequisites/2 rejected with 403 Forbidden');
    }

    console.log('\n--- 2. End-to-End Academic Entity Graph Creation ---');
    const timestamp = Date.now();

    // Step A: Department
    const deptRes = await axios.post(`${BASE_URL}/api/v1/departments`, {
      name: `Dept CSE ${timestamp}`,
      code: `CSE_${timestamp}`
    }, { headers: adminHeaders });
    const deptId = deptRes.data.id;
    assert(deptId != null, `Department created (ID: ${deptId}, code: CSE_${timestamp})`);

    // Step B: Academic Year (dates cannot overlap with existing years; isActive: false for non-primary years)
    const baseYear = 2050 + Math.floor((timestamp % 10000) / 2) * 2;
    const ayRes = await axios.post(`${BASE_URL}/api/v1/academic-years`, {
      name: `AY ${timestamp}`,
      startDate: `${baseYear}-08-01`,
      endDate: `${baseYear + 1}-05-31`,
      isActive: false
    }, { headers: adminHeaders });
    const ayId = ayRes.data.id;
    assert(ayId != null, `Academic Year created (ID: ${ayId})`);

    // Step C: Program (depends on Department)
    const progRes = await axios.post(`${BASE_URL}/api/v1/programs`, {
      code: `PROG_${timestamp}`,
      name: `B.Tech Computer Science ${timestamp}`,
      degree: 'B.Tech',
      departmentId: deptId,
      duration: 4,
      isActive: true
    }, { headers: adminHeaders });
    const progId = progRes.data.id;
    assert(progId != null, `Program created (ID: ${progId})`);

    // Step D: Courses (Course 1: CS101, Course 2: CS201)
    const c1Res = await axios.post(`${BASE_URL}/api/v1/courses`, {
      code: `CS101_${timestamp}`,
      name: `Programming Fundamentals ${timestamp}`,
      courseType: 'THEORY',
      credits: 3,
      departmentId: deptId,
      programId: progId,
      isActive: true
    }, { headers: adminHeaders });
    const c1Id = c1Res.data.id;
    assert(c1Id != null, `Course 1 created (ID: ${c1Id}, CS101_${timestamp})`);

    const c2Res = await axios.post(`${BASE_URL}/api/v1/courses`, {
      code: `CS201_${timestamp}`,
      name: `Data Structures ${timestamp}`,
      courseType: 'THEORY',
      credits: 4,
      departmentId: deptId,
      programId: progId,
      isActive: true
    }, { headers: adminHeaders });
    const c2Id = c2Res.data.id;
    assert(c2Id != null, `Course 2 created (ID: ${c2Id}, CS201_${timestamp})`);

    console.log('\n--- 3. Prerequisite Business Rules & Validation ---');
    // Step E: Self-prerequisite rejection
    try {
      await axios.post(`${BASE_URL}/api/v1/courses/${c1Id}/prerequisites/${c1Id}`, {}, { headers: adminHeaders });
      assert(false, 'Self-prerequisite should be rejected');
    } catch (err) {
      assert(err.response?.status === 400, 'Self-prerequisite rejected with 400 Bad Request');
    }

    // Step F: Add valid prerequisite: CS201 requires CS101
    const addPrereqRes = await axios.post(`${BASE_URL}/api/v1/courses/${c2Id}/prerequisites/${c1Id}`, {}, { headers: adminHeaders });
    assert(addPrereqRes.status === 201 && addPrereqRes.data.prerequisiteCourseId === c1Id, `Prerequisite added: CS201 requires CS101`);

    // Step G: Circular prerequisite rejection: CS101 cannot require CS201
    try {
      await axios.post(`${BASE_URL}/api/v1/courses/${c1Id}/prerequisites/${c2Id}`, {}, { headers: adminHeaders });
      assert(false, 'Circular prerequisite should be rejected');
    } catch (err) {
      assert(err.response?.status === 409 && err.response?.data?.message?.includes('Circular dependency'), 'Circular prerequisite rejected with 409 Conflict ("Circular dependency detected")');
    }

    // Step H: Query prerequisites (both admin and student can view)
    const listPrereqRes = await axios.get(`${BASE_URL}/api/v1/courses/${c2Id}/prerequisites`, { headers: studentHeaders });
    assert(listPrereqRes.data.length === 1 && listPrereqRes.data[0].prerequisiteCourseId === c1Id, 'Student can view course prerequisites');

    console.log('\n--- 4. Batch, Semester, Offering & Section Hierarchy ---');
    // Step I: Batch
    const batchRes = await axios.post(`${BASE_URL}/api/v1/batches`, {
      name: `Batch ${timestamp}`,
      code: `BATCH_${timestamp}`,
      programId: progId,
      admissionYear: 2026,
      graduationYear: 2030,
      academicYearId: ayId,
      isActive: true
    }, { headers: adminHeaders });
    assert(batchRes.data.id != null, `Batch created (ID: ${batchRes.data.id})`);

    // Step J: Semester (active, with future end date)
    const semRes = await axios.post(`${BASE_URL}/api/v1/semesters`, {
      name: `Semester 1 ${timestamp}`,
      semesterNumber: 1,
      academicYearId: ayId,
      startDate: `${baseYear}-08-15`,
      endDate: `${baseYear + 1}-01-15`,
      isActive: true
    }, { headers: adminHeaders });
    const semId = semRes.data.id;
    assert(semId != null, `Semester created (ID: ${semId})`);


    // Step K: Course Offerings & Sections
    const off1Res = await axios.post(`${BASE_URL}/api/v1/course-offerings`, {
      courseId: c1Id,
      semesterId: semId,
      maxCapacity: 60,
      isPublished: true
    }, { headers: adminHeaders });
    const off1Id = off1Res.data.id;

    const sec1Res = await axios.post(`${BASE_URL}/api/v1/sections`, {
      name: 'A',
      courseOfferingId: off1Id,
      capacity: 30
    }, { headers: adminHeaders });
    const sec1Id = sec1Res.data.id;
    assert(sec1Id != null, `Offering & Section created for Course 1 (Sec ID: ${sec1Id})`);

    const off2Res = await axios.post(`${BASE_URL}/api/v1/course-offerings`, {
      courseId: c2Id,
      semesterId: semId,
      maxCapacity: 60,
      isPublished: true
    }, { headers: adminHeaders });
    const off2Id = off2Res.data.id;

    const sec2Res = await axios.post(`${BASE_URL}/api/v1/sections`, {
      name: 'A',
      courseOfferingId: off2Id,
      capacity: 30
    }, { headers: adminHeaders });
    const sec2Id = sec2Res.data.id;
    assert(sec2Id != null, `Offering & Section created for Course 2 (Sec ID: ${sec2Id})`);

    console.log('\n--- 5. Course Registration Prerequisite Enforcement ---');
    // Student attempts to register for Course 2 (which requires Course 1)
    try {
      await axios.post(`${BASE_URL}/api/v1/students/me/course-registrations`, {
        courseOfferingId: off2Id,
        sectionId: sec2Id
      }, { headers: studentHeaders });
      assert(false, 'Registration for Course 2 should have failed due to missing prerequisite');
    } catch (err) {
      assert(err.response?.status === 409 && err.response?.data?.message?.includes('Prerequisite not satisfied'), 'Registration for Course 2 rejected with 409 Conflict ("Prerequisite not satisfied")');
    }

    // Student registers for prerequisite Course 1
    const reg1Res = await axios.post(`${BASE_URL}/api/v1/students/me/course-registrations`, {
      courseOfferingId: off1Id,
      sectionId: sec1Id
    }, { headers: studentHeaders });
    assert(reg1Res.status === 201 && reg1Res.data.status === 'REGISTERED', 'Student successfully registered for prerequisite Course 1');

    // Student registers for Course 2 now: must succeed!
    const reg2Res = await axios.post(`${BASE_URL}/api/v1/students/me/course-registrations`, {
      courseOfferingId: off2Id,
      sectionId: sec2Id
    }, { headers: studentHeaders });
    assert(reg2Res.status === 201 && reg2Res.data.status === 'REGISTERED', 'Student successfully registered for Course 2 after satisfying prerequisite');


    // Step L: Clean up / remove prerequisite
    const delPrereqRes = await axios.delete(`${BASE_URL}/api/v1/courses/${c2Id}/prerequisites/${c1Id}`, { headers: adminHeaders });
    assert(delPrereqRes.status === 204, 'Admin successfully deleted prerequisite mapping (204 No Content)');

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

runAcademicCatalogRegression();
