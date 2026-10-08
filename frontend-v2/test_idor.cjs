const axios = require('axios');

const API = 'http://localhost:8081/api/v1';
const AUTH = 'http://localhost:8081/auth';

async function runTest() {
  console.log("=== RE-TESTING IDOR ===");
  try {
    const res = await axios.post(`${AUTH}/login`, { username: 'student', password: 'Student@123', role: 'STUDENT' });
    const studentToken = res.data.accessToken;

    try {
      await axios.get(`${API}/attendance/student/1`, { headers: { Authorization: `Bearer ${studentToken}` }});
      console.log(`    -> VULNERABILITY! Student accessed Attendance for Student 1`);
    } catch (e) {
      console.log(`    -> IDOR blocked: ${e.response?.status}`);
    }
  } catch (e) {
    console.error(e.message);
  }
}

runTest();