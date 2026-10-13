const axios = require('axios');

const BASE_URL = 'http://localhost:8081';
const API = `${BASE_URL}/api/v1`;
const AUTH = `${BASE_URL}/auth`;

async function login(username, password, role) {
  const res = await axios.post(`${AUTH}/login`, { username, password, role });
  return { token: res.data.accessToken || res.data.token, user: res.data.user };
}

function req(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

async function verifyColdRestart() {
  console.log('========================================================================');
  console.log('PROMPT 8 VERIFICATION: Cold-Restart Persistence Validation');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  }

  try {
    const admin = await login('admin', 'Admin@123', 'ADMIN');
    const finance = await login('finance', 'Finance@123', 'FINANCE');

    // 1. Verify Canonical Student Identity Hydration
    console.log('--- 1. Cold-Restart Student Identity & Enrollment ---');
    const studentRes = await axios.get(`${API}/students/enrollment/ENR-2026-00020`, req(admin.token));
    const student = studentRes.data?.data;
    assert(!!student, 'Student retrieved by enrollment number ENR-2026-00020 after restart');
    assert(student?.id === 24, `Student preserved internal ID #24 (actual #${student?.id})`);
    assert(student?.rollNumber === '26ENM024', `Roll number 26ENM024 preserved (actual ${student?.rollNumber})`);
    assert(student?.firstName === 'Aarav', `First name Aarav preserved`);

    // 2. Verify Sibling & Guardian Linkage Hydration
    console.log('\n--- 2. Cold-Restart Guardian & Multi-Ward Model ---');
    const siblingRes = await axios.get(`${API}/students/enrollment/ENR-2026-00021`, req(admin.token));
    const sibling = siblingRes.data?.data;
    assert(sibling?.id === 25, `Sibling preserved internal ID #25 (actual #${sibling?.id})`);

    const wardsRes = await axios.get(`${API}/guardians/23/students`, req(admin.token));
    const wards = wardsRes.data?.data || wardsRes.data || [];
    assert(wards.length >= 2, `Guardian #23 preserved multi-ward model (${wards.length} wards found)`);

    // 3. Verify Finance Lifecycle Hydration
    console.log('\n--- 3. Cold-Restart Finance & Payments ---');
    const feeRes = await axios.get(`${API}/finance/student-fees/6`, req(finance.token));
    const fee = feeRes.data;
    assert(fee?.id === 6, `Student fee #6 preserved after restart`);
    assert(fee?.status === 'PAID', `Student fee status remains PAID after restart`);
    assert(Number(fee?.outstandingAmount) === 0, `Outstanding balance remains 0 after restart`);

    // 4. Verify Receipt Hydration
    console.log('\n--- 4. Cold-Restart Receipt Verification ---');
    const receiptRes = await axios.get(`${API}/finance/payments/receipts/number/REC-1791903292378-FF4D1013`, req(finance.token));
    const receipt = receiptRes.data;
    assert(!!receipt, `Receipt REC-1791903292378-FF4D1013 retrieved after restart`);
    assert(receipt?.studentId === 24, `Receipt linked to student #24 (actual #${receipt?.studentId})`);

    // 5. Verify Student Document Generation After Restart
    console.log('\n--- 5. Cold-Restart Document Generation ---');
    const idCardRes = await axios.get(`${API}/students/24/id-card`, req(admin.token));
    const idCard = idCardRes.data?.data;
    assert(idCard?.enrollmentNumber === 'ENR-2026-00020', `ID Card generated with canonical enrollment number`);
    assert(!!idCard?.verificationCode, `ID Card contains cryptographic verification code (${idCard?.verificationCode})`);

    console.log('\n========================================================================');
    console.log(`COLD-RESTART VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Cold-restart verification failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

verifyColdRestart();
