/**
 * Comprehensive Automated Verification Suite for:
 * 1. Student Profile Editing Workflow
 * 2. Immutable Field Preservation (ID, ENR, Roll No, User ID)
 * 3. Validation Failure Handling (HTTP 400)
 * 4. Role-based Authorization Enforcement (HTTP 403 for Student)
 * 5. Dev-JSON Persistence Verification
 * 6. Authoritative Frontend Nonfunctional UI Cleanup Audit
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const BACKEND_BASE = 'http://localhost:8081';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSuite() {
  console.log('================================================================');
  console.log('STUDENT PROFILE EDITING & NONFUNCTIONAL UI CLEANUP AUDIT SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // --- STEP 1: AUTHENTICATION AS ADMIN ---
  console.log('--- Step 1: Admin Authentication ---');
  const loginRes = await request('POST', '/auth/login', {
    username: 'admin',
    password: 'Admin@123',
    role: 'ADMIN',
  });
  console.log('Admin login response:', loginRes.statusCode, JSON.stringify(loginRes.data));
  assert(loginRes.statusCode === 200, 'Admin login returns HTTP 200');
  const adminToken = loginRes.data?.accessToken;
  assert(!!adminToken, 'Admin access token obtained');

  // --- STEP 2: FETCH TARGET STUDENT PROFILE ---
  console.log('\n--- Step 2: Fetch Initial Student Profile ---');
  const studentsListRes = await request('GET', '/api/v1/students?page=0&size=5', null, adminToken);
  assert(studentsListRes.statusCode === 200, 'Fetch students list returns HTTP 200');
  const students = studentsListRes.data?.data?.content || [];
  assert(students.length > 0, `Found ${students.length} students in system`);

  const targetStudent = students[0];
  const targetId = targetStudent.id;
  const initialENR = targetStudent.enrollmentNumber;
  const initialRoll = targetStudent.rollNumber;
  const initialUserId = targetStudent.userId;

  console.log(`  Target Student ID: ${targetId}`);
  console.log(`  Target Canonical ENR: ${initialENR}`);
  console.log(`  Target Roll Number: ${initialRoll}`);

  // Fetch departments, programs, batches for relationships
  const deptsRes = await request('GET', '/api/v1/departments', null, adminToken);
  assert(deptsRes.statusCode === 200, 'Fetch departments returns HTTP 200');
  const departments = deptsRes.data || [];
  assert(departments.length > 0, `Departments count: ${departments.length}`);
  const sampleDept = departments[0];

  const progsRes = await request('GET', `/api/v1/programs?departmentId=${sampleDept.id}`, null, adminToken);
  assert(progsRes.statusCode === 200, 'Fetch programs returns HTTP 200');
  const programs = progsRes.data || [];

  const batchesRes = await request('GET', '/api/v1/batches', null, adminToken);
  assert(batchesRes.statusCode === 200, 'Fetch batches returns HTTP 200');
  const batches = batchesRes.data || [];
  const sampleBatch = batches[0];

  // --- STEP 3: SUCCESSFUL STUDENT PROFILE EDIT ---
  console.log('\n--- Step 3: Perform Legitimate Student Profile Edit ---');
  const editTimestamp = Date.now();
  let formattedEnrollmentDate = '2024-08-01';
  if (Array.isArray(targetStudent.enrollmentDate)) {
    const [y, m, d] = targetStudent.enrollmentDate;
    formattedEnrollmentDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  } else if (typeof targetStudent.enrollmentDate === 'string') {
    formattedEnrollmentDate = targetStudent.enrollmentDate.split('T')[0];
  }

  const updatePayload = {
    firstName: 'Aarav-Updated',
    lastName: 'Sharma-Verified',
    email: targetStudent.email, // preserve unique email
    phone: '+919876543299',
    dateOfBirth: '2004-05-15',
    gender: 'MALE',
    bloodGroup: 'B+',
    address: '742 Evergreen Terrace, Sector ' + (editTimestamp % 100),
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '400001',
    department: sampleDept.name,
    departmentId: sampleDept.id,
    program: programs.length > 0 ? programs[0].name : 'B.Tech Computer Science',
    programId: programs.length > 0 ? programs[0].id : null,
    batch: sampleBatch ? sampleBatch.name : '2023-2027',
    batchId: sampleBatch ? sampleBatch.id : 1,
    enrollmentDate: formattedEnrollmentDate,
    status: targetStudent.status || 'ACTIVE',
  };

  const updateRes = await request('PUT', `/api/v1/students/${targetId}`, updatePayload, adminToken);
  assert(updateRes.statusCode === 200, 'PUT /api/v1/students/{id} returns HTTP 200 OK');
  assert(updateRes.data?.success === true, 'Response indicates success = true');
  const updatedStudentData = updateRes.data?.data;
  assert(updatedStudentData.firstName === 'Aarav-Updated', 'Updated firstName reflected');
  assert(updatedStudentData.lastName === 'Sharma-Verified', 'Updated lastName reflected');
  assert(updatedStudentData.phone === '+919876543299', 'Updated phone reflected');
  assert(updatedStudentData.city === 'Mumbai', 'Updated city reflected');
  assert(updatedStudentData.bloodGroup === 'B+', 'Updated bloodGroup reflected');

  // Verify fetch immediately after update
  const getVerifyRes = await request('GET', `/api/v1/students/${targetId}`, null, adminToken);
  assert(getVerifyRes.statusCode === 200, 'GET /api/v1/students/{id} after update returns HTTP 200');
  assert(getVerifyRes.data?.data?.firstName === 'Aarav-Updated', 'Persisted firstName verified on re-fetch');
  assert(getVerifyRes.data?.data?.address === updatePayload.address, 'Persisted address verified on re-fetch');

  // --- STEP 4: STRICT IMMUTABILITY ENFORCEMENT ---
  console.log('\n--- Step 4: Strict Immutability Protection Against Request Manipulation ---');
  const forgedPayload = {
    ...updatePayload,
    enrollmentNumber: 'ENR-MALICIOUS-9999', // attempt to overwrite canonical ENR
    rollNumber: 'ROLL-MALICIOUS-999', // attempt to overwrite roll number
  };

  const forgeRes = await request('PUT', `/api/v1/students/${targetId}`, forgedPayload, adminToken);
  console.log('Forge attempt response:', forgeRes.statusCode, JSON.stringify(forgeRes.data));
  assert(forgeRes.statusCode === 200, 'Update with forged identifiers processed');
  const forgeResult = forgeRes.data?.data;
  assert(forgeResult.id === targetId, `Student ID remained unchanged: #${forgeResult.id}`);
  assert(forgeResult.enrollmentNumber === initialENR, `Canonical ENR strictly preserved: ${forgeResult.enrollmentNumber}`);
  assert(forgeResult.rollNumber === initialRoll, `Roll Number strictly preserved: ${forgeResult.rollNumber}`);

  // --- STEP 5: BACKEND VALIDATION FAILURES (HTTP 400) ---
  console.log('\n--- Step 5: Backend Field Validation Enforcement ---');
  // 5a. Missing/Blank First Name
  const invalidNamePayload = { ...updatePayload, firstName: '' };
  const failNameRes = await request('PUT', `/api/v1/students/${targetId}`, invalidNamePayload, adminToken);
  assert(failNameRes.statusCode === 400, 'Blank first name rejected with HTTP 400 Bad Request');

  // 5b. Invalid Email Format
  const invalidEmailPayload = { ...updatePayload, email: 'not-an-email-address' };
  const failEmailRes = await request('PUT', `/api/v1/students/${targetId}`, invalidEmailPayload, adminToken);
  assert(failEmailRes.statusCode === 400, 'Malformed email rejected with HTTP 400 Bad Request');

  // 5c. Invalid Phone (too short)
  const invalidPhonePayload = { ...updatePayload, phone: '123' };
  const failPhoneRes = await request('PUT', `/api/v1/students/${targetId}`, invalidPhonePayload, adminToken);
  assert(failPhoneRes.statusCode === 400, 'Invalid phone number rejected with HTTP 400 Bad Request');

  // --- STEP 6: ROLE-BASED ACCESS CONTROL (STUDENT FORBIDDEN HTTP 403) ---
  console.log('\n--- Step 6: Role-Based Authorization Enforcement ---');
  const studentLoginRes = await request('POST', '/auth/login', {
    username: 'student',
    password: 'Student@123',
    role: 'STUDENT',
  });
  assert(studentLoginRes.statusCode === 200, 'Student login returns HTTP 200');
  const studentToken = studentLoginRes.data?.accessToken;
  assert(!!studentToken, 'Student access token obtained');

  const studentAttemptRes = await request('PUT', `/api/v1/students/${targetId}`, updatePayload, studentToken);
  assert(studentAttemptRes.statusCode === 403, 'Unauthorized student profile edit rejected with HTTP 403 Forbidden');

  // --- STEP 7: DEV-JSON PERSISTENCE INSPECTION ---
  console.log('\n--- Step 7: Dev-JSON Storage Verification ---');
  const devJsonStudentsPath = path.resolve(__dirname, 'data/dev-json/students.json');
  assert(fs.existsSync(devJsonStudentsPath), `students.json exists at ${devJsonStudentsPath}`);
  const devJsonContent = JSON.parse(fs.readFileSync(devJsonStudentsPath, 'utf8'));
  const persistedStudent = devJsonContent.find((s) => s.id === targetId);
  assert(!!persistedStudent, `Student #${targetId} found in dev-json store`);
  assert(persistedStudent.firstName === 'Aarav-Updated', `dev-json file contains updated firstName: ${persistedStudent.firstName}`);
  assert(persistedStudent.phone === '+919876543299', `dev-json file contains updated phone: ${persistedStudent.phone}`);
  assert(persistedStudent.enrollmentNumber === initialENR, `dev-json file maintains canonical ENR: ${persistedStudent.enrollmentNumber}`);

  // --- STEP 8: FRONTEND NONFUNCTIONAL UI CLEANUP AUDIT ---
  console.log('\n--- Step 8: Frontend Nonfunctional UI Audit ---');
  const frontendSrcDir = path.resolve(__dirname, '../frontend-v2/src');

  function scanDir(dir, results = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath, results);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const allFrontendFiles = scanDir(frontendSrcDir);
  console.log(`  Audited ${allFrontendFiles.length} TypeScript / TSX source files in frontend-v2/src`);

  let comingSoonMatches = [];
  let placeholderMatches = [];

  for (const file of allFrontendFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.toLowerCase().includes('coming soon')) {
      comingSoonMatches.push(file);
    }
    if (content.includes('Edit mode not fully implemented yet')) {
      placeholderMatches.push(file);
    }
  }

  assert(comingSoonMatches.length === 0, `Zero 'coming soon' instances found across frontend (Found: ${comingSoonMatches.length})`);
  assert(placeholderMatches.length === 0, `Zero 'Edit mode not fully implemented yet' instances found across frontend (Found: ${placeholderMatches.length})`);

  // Verify EditStudentDialog exists and is imported into StudentProfile.tsx
  const studentProfileContent = fs.readFileSync(path.join(frontendSrcDir, 'pages/StudentProfile.tsx'), 'utf8');
  assert(studentProfileContent.includes('EditStudentDialog'), 'StudentProfile.tsx imports and uses EditStudentDialog');
  assert(studentProfileContent.includes('setIsEditDialogOpen(true)'), 'StudentProfile.tsx triggers edit modal via setIsEditDialogOpen(true)');
  assert(!studentProfileContent.includes('Edit profile functionality coming soon'), 'Old placeholder toast removed from StudentProfile.tsx');

  console.log('\n================================================================');
  console.log(`ALL CHECKS PASSED: ${passedTests} / ${totalTests} assertions verified!`);
  console.log('================================================================');
}

runSuite().catch((err) => {
  console.error('\nSUITE EXECUTION ERROR:', err);
  process.exit(1);
});
