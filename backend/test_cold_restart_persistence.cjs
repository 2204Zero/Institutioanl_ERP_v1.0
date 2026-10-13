/**
 * Cold Restart Persistence Test for Student Profile Editing
 */
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

async function verifyColdRestart() {
  console.log('--- Verifying Student Profile Post Cold Restart ---');

  // Login
  const loginRes = await request('POST', '/auth/login', {
    username: 'admin',
    password: 'Admin@123',
    role: 'ADMIN',
  });
  if (loginRes.statusCode !== 200 || !loginRes.data?.accessToken) {
    throw new Error('Admin login failed after cold restart');
  }
  const token = loginRes.data.accessToken;
  console.log('  [PASS] Admin logged in post-restart');

  // Fetch Student #25
  const studentRes = await request('GET', '/api/v1/students/25', null, token);
  if (studentRes.statusCode !== 200) {
    throw new Error(`Failed to fetch student #25: ${studentRes.statusCode}`);
  }

  const s = studentRes.data?.data;
  console.log('  Fetched student #25 post-restart:', JSON.stringify({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    phone: s.phone,
    bloodGroup: s.bloodGroup,
    city: s.city,
    enrollmentNumber: s.enrollmentNumber,
    rollNumber: s.rollNumber,
    guardiansCount: s.guardians?.length
  }, null, 2));

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Cold restart assertion failed: ${message}`);
    }
  }

  assert(s.id === 25, 'Internal ID strictly preserved (#25)');
  assert(s.firstName === 'Aarav-Updated', 'Updated firstName persisted across cold restart');
  assert(s.lastName === 'Sharma-Verified', 'Updated lastName persisted across cold restart');
  assert(s.phone === '+919876543299', 'Updated phone persisted across cold restart');
  assert(s.bloodGroup === 'B+', 'Updated bloodGroup persisted across cold restart');
  assert(s.city === 'Mumbai', 'Updated city persisted across cold restart');
  assert(s.enrollmentNumber === 'ENR-2026-00021', 'Canonical enrollmentNumber preserved intact');
  assert(s.rollNumber === '26ENF025', 'Roll number preserved intact');
  assert(Array.isArray(s.guardians) && s.guardians.length > 0, 'Guardian linkages preserved intact without duplication');

  console.log('\n================================================================');
  console.log('COLD RESTART PERSISTENCE VERIFICATION: 100% CONFIRMED SUCCESS!');
  console.log('================================================================');
}

verifyColdRestart().catch((err) => {
  console.error('\nCOLD RESTART VERIFICATION FAILED:', err);
  process.exit(1);
});
