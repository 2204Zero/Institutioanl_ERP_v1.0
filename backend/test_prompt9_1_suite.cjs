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
  console.log('=== EDU-PULSE PROMPT 9.1 REGRESSION & VERIFICATION SUITE ===\n');

  // Wait for Spring Boot to be ready
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await request({
        hostname: 'localhost',
        port: 8081,
        path: '/api/v1/admissions/public/programs',
        method: 'GET'
      });
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!ready) {
    console.error('Backend failed to start on port 8081 within 40 seconds.');
    process.exit(1);
  }

  console.log('Backend is alive on port 8081. Running test suites...\n');

  // ==========================================
  // SUITE 1: DEMO ACCOUNTS AUTHENTICATION (§14)
  // ==========================================
  console.log('--- 1. Demo Accounts Verification ---');
  const demoAccounts = [
    { user: 'superadmin', pass: 'Admin@123', role: 'SUPER_ADMIN' },
    { user: 'admin', pass: 'Admin@123', role: 'ADMIN' },
    { user: 'faculty', pass: 'Faculty@123', role: 'FACULTY' },
    { user: 'student', pass: 'Student@123', role: 'STUDENT' },
    { user: 'parent', pass: 'Parent@123', role: 'PARENT' },
    { user: 'finance', pass: 'Finance@123', role: 'FINANCE' },
  ];

  const tokens = {};
  for (const acc of demoAccounts) {
    const token = await login(acc.user, acc.pass, acc.role);
    tokens[acc.user] = token;
    assert(!!token, `Demo login for '${acc.user}' (${acc.role}) succeeded with valid JWT`);
  }

  // Verify wrong password rejects with 401
  const badLogin = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'faculty', password: 'WrongPassword@123', role: 'FACULTY' });
  assert(badLogin.status === 401, `Invalid password correctly returns HTTP 401 Unauthorized (received ${badLogin.status})`);

  // ==========================================
  // SUITE 2: STUDENT PROFILE & DATE FORMAT (§3)
  // ==========================================
  console.log('\n--- 2. Student Profile Serialization & Validation ---');
  const studentRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students/1',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.admin}` }
  });

  assert(studentRes.status === 200, `GET /api/v1/students/1 returned 200 OK`);
  const studentData = studentRes.data?.data || studentRes.data;
  assert(studentData && typeof studentData.id === 'number', `Student record has valid numeric id`);
  
  // Verify dateOfBirth is serialized as ISO string, not integer array
  if (studentData.dateOfBirth) {
    const isString = typeof studentData.dateOfBirth === 'string';
    const notArray = !Array.isArray(studentData.dateOfBirth);
    assert(isString && notArray, `dateOfBirth is serialized as ISO string (${studentData.dateOfBirth}), NOT integer array`);
  }

  // Non-numeric student ID returns 400 Bad Request
  const badIdRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students/invalid-string-id',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.admin}` }
  });
  assert(badIdRes.status === 400, `Non-numeric student ID returns HTTP 400 Bad Request (received ${badIdRes.status})`);

  // Nonexistent student ID returns 404 Not Found
  const notFoundRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students/99999999',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.admin}` }
  });
  assert(notFoundRes.status === 404, `Nonexistent student ID returns HTTP 404 Not Found (received ${notFoundRes.status})`);

  // ==========================================
  // SUITE 3: STUDENT SEARCH SEMANTICS (§10)
  // ==========================================
  console.log('\n--- 3. Student Search Semantics ---');
  const search25Res = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students?search=25',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.admin}` }
  });
  assert(search25Res.status === 200, `Search for '25' returned 200 OK`);
  const search25Content = search25Res.data?.data?.content || search25Res.data?.content || [];
  const hasAarav25 = search25Content.some(s => s.id === 25);
  const hasKabir9 = search25Content.some(s => s.id === 9);
  assert(hasAarav25, `Search for '25' matches student #25 (Aarav)`);
  assert(!hasKabir9, `Search for '25' does NOT produce false match for student #9 (Kabir Mehta)`);

  const searchEnrRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/students?search=ENR-2026-00021',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.admin}` }
  });
  assert(searchEnrRes.status === 200, `Search by ENR-2026-00021 returned 200 OK`);
  const enrMatches = searchEnrRes.data?.data?.content || searchEnrRes.data?.content || [];
  assert(enrMatches.length > 0 && enrMatches[0].enrollmentNumber === 'ENR-2026-00021', `Search matches student with exact enrollment number ENR-2026-00021`);

  // ==========================================
  // SUITE 4: CORS IDEMPOTENCY HEADER (§5)
  // ==========================================
  console.log('\n--- 4. CORS Idempotency Header Preflight ---');
  const corsPreflight = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/finance/payments/student-fee/1',
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Idempotency-Key, Content-Type, Authorization'
    }
  });
  assert(corsPreflight.status === 200, `CORS OPTIONS preflight returns HTTP 200 OK`);
  const allowedHeaders = corsPreflight.headers['access-control-allow-headers'] || '';
  const permitsIdempotency = allowedHeaders.includes('*') || allowedHeaders.toLowerCase().includes('idempotency-key');
  assert(permitsIdempotency, `CORS preflight permits 'Idempotency-Key' in allowed headers (${allowedHeaders})`);

  // ==========================================
  // SUITE 5: ACADEMIC YEAR OVERLAP & LABELS (§7, §8)
  // ==========================================
  console.log('\n--- 5. Academic Year Validation & RBAC ---');
  // Attempt to create overlapping year 2024-2028
  const overlapRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/academic-years',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.admin}`
    }
  }, {
    name: '2024-2028',
    startDate: '2024-08-28',
    endDate: '2028-05-15',
    isActive: false
  });
  assert(overlapRes.status === 400, `Overlapping academic year creation is rejected with HTTP 400 Bad Request`);
  const errorMsg = overlapRes.data?.message || overlapRes.data?.error || overlapRes.raw;
  assert(errorMsg && errorMsg.includes('Academic year dates cannot overlap with existing year'), `Overlap error explicitly identifies conflicting academic year (${errorMsg})`);

  // Test FINANCE user access to academic years (§6)
  const financeAYRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/academic-years',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.finance}` }
  });
  assert(financeAYRes.status === 200, `GET /api/v1/academic-years is accessible to FINANCE role (HTTP 200)`);
  const ayList = financeAYRes.data || [];
  assert(Array.isArray(ayList) && ayList.length > 0, `Academic years list returned to FINANCE user (${ayList.length} records)`);

  // ==========================================
  // SUITE 6: FINANCE SUMMARY & LEDGER (§4)
  // ==========================================
  console.log('\n--- 6. Finance Summary & Student Fees Ledger ---');
  const summaryRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/finance/reports/summary',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.finance}` }
  });
  assert(summaryRes.status === 200, `GET /api/v1/finance/reports/summary returns HTTP 200 for FINANCE role`);
  assert(summaryRes.data && summaryRes.data.totalGrossAssigned !== undefined, `Summary contains totalGrossAssigned`);
  assert(summaryRes.data && summaryRes.data.totalCollected !== undefined, `Summary contains totalCollected`);
  assert(summaryRes.data && summaryRes.data.totalOutstanding !== undefined, `Summary contains totalOutstanding`);

  const studentFeesRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/finance/student-fees',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.finance}` }
  });
  assert(studentFeesRes.status === 200, `GET /api/v1/finance/student-fees returns HTTP 200 for FINANCE role`);
  const allFees = studentFeesRes.data || [];
  assert(Array.isArray(allFees) && allFees.length > 0, `Student fees list has persisted records (${allFees.length} records)`);

  // ==========================================
  // SUITE 7: PAYMENT IDEMPOTENCY & INTEGRITY (§5)
  // ==========================================
  console.log('\n--- 7. Payment Idempotency & Processing ---');
  // Find a fee record with outstanding balance
  const targetFee = allFees.find(f => parseFloat(f.outstandingAmount) > 0);
  if (targetFee) {
    const idempotencyKey = `TEST-IDEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const paymentPayload = {
      studentFeeId: targetFee.id,
      amount: 100.00,
      paymentMethod: 'UPI',
      referenceNumber: `UPI-REF-${Date.now()}`,
      remarks: 'Automated regression test payment'
    };

    // First payment execution
    const pay1 = await request({
      hostname: 'localhost',
      port: 8081,
      path: `/api/v1/finance/payments/student-fee/${targetFee.id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.admin}`,
        'Idempotency-Key': idempotencyKey
      }
    }, paymentPayload);

    assert(pay1.status === 200, `First payment submission returns HTTP 200 OK with receipt`);
    const receipt1 = pay1.data?.data || pay1.data;
    assert(receipt1 && receipt1.receiptNumber, `Payment produced official receipt (${receipt1?.receiptNumber})`);

    // Duplicate submission with same Idempotency-Key
    const pay2 = await request({
      hostname: 'localhost',
      port: 8081,
      path: `/api/v1/finance/payments/student-fee/${targetFee.id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.admin}`,
        'Idempotency-Key': idempotencyKey
      }
    }, paymentPayload);

    assert(pay2.status === 200, `Replay with identical Idempotency-Key returns HTTP 200`);
    const receipt2 = pay2.data?.data || pay2.data;
    assert(receipt2?.receiptNumber === receipt1?.receiptNumber, `Idempotent replay returned identical receipt without duplicating payment`);
  } else {
    console.log('  ⚠ No unpaid fee record found to test live payment mutation.');
  }

  // ==========================================
  // SUITE 8: PUBLIC ADMISSIONS WORKFLOW (§13)
  // ==========================================
  console.log('\n--- 8. Public Admissions Portal Flow ---');
  // Public Programs
  const pubProgRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/admissions/public/programs',
    method: 'GET'
  });
  assert(pubProgRes.status === 200, `Public exploration GET /api/v1/admissions/public/programs returns HTTP 200 without auth`);
  const pubPrograms = pubProgRes.data || [];
  assert(pubPrograms.length > 0, `Public programs returns active offerings (${pubPrograms.length} programs)`);

  // Public Academic Years
  const pubAyRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/admissions/public/academic-years',
    method: 'GET'
  });
  assert(pubAyRes.status === 200, `Public exploration GET /api/v1/admissions/public/academic-years returns HTTP 200 without auth`);

  // Public Inquiry submission
  const testInquiryEmail = `prospect.${Date.now()}@testedu.org`;
  const pubInqRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/admissions/public/inquiries',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    prospectName: 'Priya Verma',
    email: testInquiryEmail,
    phone: '+91 9988776655',
    programOfInterest: 'Computer Science and Engineering',
    notes: 'Interested in Fall admissions'
  });
  assert(pubInqRes.status === 201 || pubInqRes.status === 200, `Public inquiry submission succeeded with HTTP ${pubInqRes.status}`);
  const inqData = pubInqRes.data?.data || pubInqRes.data;
  assert(inqData && inqData.id, `Inquiry generated registered applicant record #${inqData?.id}`);

  // Public Application submission
  const testAppEmail = `applicant.${Date.now()}@testedu.org`;
  const pubAppRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/admissions/public/applications',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    firstName: 'Rohan',
    lastName: 'Sharma',
    email: testAppEmail,
    phone: '+91 9876543210',
    dateOfBirth: '2006-05-15',
    gender: 'MALE',
    programId: pubPrograms[0]?.id || 1,
    academicYearId: 1
  });
  assert(pubAppRes.status === 201, `Public application submission succeeded with HTTP 201 Created`);
  const appData = pubAppRes.data?.data || pubAppRes.data;
  assert(appData && (appData.applicationNumber || appData.id), `Application returned official reference (${appData?.applicationNumber || '#' + appData?.id})`);

  // ==========================================
  // SUITE 9: NOTIFICATIONS RBAC & OWNERSHIP (§15)
  // ==========================================
  console.log('\n--- 9. Notifications Endpoint & Read State ---');
  const notifRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/notifications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.superadmin}` }
  });
  assert(notifRes.status === 200, `GET /api/v1/notifications returns HTTP 200 for authenticated user`);

  const unreadRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/notifications/unread-count',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.superadmin}` }
  });
  assert(unreadRes.status === 200, `GET /api/v1/notifications/unread-count returns HTTP 200`);

  // ==========================================
  // SUITE 10: ACADEMIC BATCH INTEGRITY (§12)
  // ==========================================
  console.log('\n--- 10. Academic Batch Integrity ---');
  const batchesRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/v1/batches',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokens.admin}` }
  });
  assert(batchesRes.status === 200, `GET /api/v1/batches returns HTTP 200 OK`);
  const batchesList = batchesRes.data || [];
  assert(batchesList.length > 0, `Batches table has persisted records (${batchesList.length} batches)`);
  const allBatchesHaveCodes = batchesList.every(b => b.code && b.code.trim().length > 0);
  assert(allBatchesHaveCodes, `Every batch record has a non-blank required batch code`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==========================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('==========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
