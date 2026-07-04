const fs = require('fs');

const API_URL = 'http://localhost:3001/api';

async function req(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}

async function runTest() {
  console.log('--- STARTING E2E TEST FLOW ---');
  let tokenStaff = '';
  let tokenTeacher = '';
  let tokenStudent = '';
  let studentId = '';
  let scheduleId = '';

  try {
    // 1. Login Admin (Staff)
    console.log('1. Login Staff');
    const resStaff = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'staff@legacymusik.sch.id', password: 'staff123' })
    });
    tokenStaff = resStaff.token;
    console.log('   ✅ Staff logged in');

    // 2. Login Teacher
    console.log('2. Login Teacher');
    const resTeacher = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'teacher@legacymusik.sch.id', password: 'teacher123' })
    });
    tokenTeacher = resTeacher.token;
    console.log('   ✅ Teacher logged in');

    // 3. Register Student with Schedule
    console.log('3. Register Student');
    const courses = await req('/public/courses').catch(() => []); // Might not exist, but let's just get schedules
    const schedules = await req('/public/schedules');
    if (schedules.length === 0) throw new Error('No schedules found');
    scheduleId = schedules[0].id;
    
    const studentEmail = `student_${Date.now()}@test.com`;
    await req('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Student E2E',
        email: studentEmail,
        password: 'password123',
        phone: '08123456789',
        parentName: 'Parent E2E',
        parentPhone: '08129876543',
        scheduleId: scheduleId
      })
    });
    console.log('   ✅ Student registered and enrolled');

    // 4. Approve Student
    console.log('4. Approve Student (by Staff)');
    const pendingStudents = await req('/staff/pending', {
      headers: { Authorization: `Bearer ${tokenStaff}` }
    });
    const pendingStudent = pendingStudents.find(s => s.email === studentEmail);
    if (!pendingStudent) throw new Error('Pending student not found');
    studentId = pendingStudent.id;
    await req(`/staff/approve/${studentId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStaff}` }
    });
    console.log('   ✅ Student approved');

    // 5. Login Student
    console.log('5. Login Student');
    const resStudent = await req('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: studentEmail, password: 'password123' })
    });
    tokenStudent = resStudent.token;
    console.log('   ✅ Student logged in');

    console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');

    console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');
  } catch (error) {
    console.error('❌ E2E TEST FAILED:', error.message);
    process.exit(1);
  }
}

runTest();
