import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function login(email, password) {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return { token: res.data.token, user: res.data.user };
}

async function runTests() {
  try {
    console.log('--- LOGIN ---');
    const admin = await login('admin@legacymusik.sch.id', 'admin123');
    const staff = await login('staff@legacymusik.sch.id', 'staff123');
    const student = await login('student1@legacymusik.sch.id', 'student123');
    console.log('✅ Berhasil login sebagai Admin, Staff, dan Student.\n');

    console.log('--- TEST 1: GET /api/admin/transactions ---');
    const getTrx = await axios.get(`${BASE_URL}/admin/transactions`, {
      headers: { Authorization: `Bearer ${admin.token}` }
    });
    console.log(`✅ Sukses. Jumlah data: ${getTrx.data.length}\n`);

    console.log('--- TEST 2: POST /api/admin/transactions ---');
    const postTrx = await axios.post(`${BASE_URL}/admin/transactions`, {
      type: 'INCOME',
      amount: 50000,
      category: 'OTHER',
      description: 'Test post data'
    }, {
      headers: { Authorization: `Bearer ${admin.token}` }
    });
    console.log(`✅ Sukses. Data dibuat:\n`, postTrx.data, '\n');

    console.log('--- TEST 3: GET /api/staff/students/:id ---');
    const getStudent = await axios.get(`${BASE_URL}/staff/students/${student.user.id}`, {
      headers: { Authorization: `Bearer ${staff.token}` }
    });
    console.log(`✅ Sukses. Nama siswa: ${getStudent.data.name}, Jumlah enrollments: ${getStudent.data.studentProfile.enrollments.length}\n`);

    console.log('--- TEST 4: PUT /api/staff/enrollments/:id/grade ---');
    if (getStudent.data.studentProfile.enrollments.length > 0) {
      const enrId = getStudent.data.studentProfile.enrollments[0].id;
      const putGrade = await axios.put(`${BASE_URL}/staff/enrollments/${enrId}/grade`, {
        gradeLevel: 3,
        currentMonth: 1
      }, {
        headers: { Authorization: `Bearer ${staff.token}` }
      });
      console.log(`✅ Sukses. Grade baru: ${putGrade.data.gradeLevel}, Bulan: ${putGrade.data.currentMonth}\n`);
    } else {
      console.log('⚠️ Tidak ada enrollment untuk dites.\n');
    }

    console.log('--- TEST 5: GET /api/student/achievements ---');
    const getAchv = await axios.get(`${BASE_URL}/student/achievements`, {
      headers: { Authorization: `Bearer ${student.token}` }
    });
    console.log(`✅ Sukses. Daftar prestasi:\n`, getAchv.data, '\n');

  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
  }
}

runTests();
