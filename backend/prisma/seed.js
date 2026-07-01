import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@legacymusik.sch.id' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@legacymusik.sch.id',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  // Demo Staff
  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.upsert({
    where: { email: 'staff@legacymusik.sch.id' },
    update: {},
    create: {
      name: 'Staff Resepsionis',
      email: 'staff@legacymusik.sch.id',
      password: staffPassword,
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  // Demo Teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  await prisma.user.upsert({
    where: { email: 'teacher@legacymusik.sch.id' },
    update: {},
    create: {
      name: 'Budi Guru',
      email: 'teacher@legacymusik.sch.id',
      password: teacherPassword,
      role: 'TEACHER',
      status: 'ACTIVE',
      teacherProfile: { create: { specialization: 'Piano' } }
    }
  });

  // Demo Student
  const studentPassword = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({
    where: { email: 'student@legacymusik.sch.id' },
    update: {},
    create: {
      name: 'Ani Siswa',
      email: 'student@legacymusik.sch.id',
      password: studentPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      studentProfile: { create: { parentPhone: '08123456789', address: 'Tasikmalaya' } }
    }
  });

  // Demo Courses
  const courses = ['Piano Klasik', 'Gitar Akustik', 'Biola', 'Vokal', 'Drum'];
  for (const name of courses) {
    await prisma.course.upsert({
      where: { id: name },
      update: {},
      create: { id: name, name }
    });
  }

  // Demo Classrooms
  const rooms = ['Ruang 101', 'Ruang 102', 'Ruang 103', 'Studio A', 'Studio B'];
  for (const name of rooms) {
    await prisma.classroom.upsert({
      where: { id: name },
      update: {},
      create: { id: name, name, capacity: 10 }
    });
  }

  // Demo Event Banners
  await prisma.eventBanner.create({
    data: {
      title: 'Grand Concert 2026',
      description: 'Join us for our annual showcase featuring top students and faculty.',
      imageUrl: '/auth-bg.png'
    }
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 5. Create Dummy Teachers
  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@legacymusik.sch.id' },
    update: {},
    create: {
      email: 'teacher2@legacymusik.sch.id',
      name: 'Budi (Gitar)',
      password: hashedPassword,
      role: 'TEACHER',
      status: 'ACTIVE',
      teacherProfile: { create: {} }
    }
  });

  const teacher3 = await prisma.user.upsert({
    where: { email: 'teacher3@legacymusik.sch.id' },
    update: {},
    create: {
      email: 'teacher3@legacymusik.sch.id',
      name: 'Siti (Vokal)',
      password: hashedPassword,
      role: 'TEACHER',
      status: 'ACTIVE',
      teacherProfile: { create: {} }
    }
  });

  // 6. Create Courses
  const coursesData = [
    { name: 'Piano Klasik Dasar', description: 'Pengenalan piano klasik untuk pemula.' },
    { name: 'Gitar Akustik Fingerstyle', description: 'Teknik petikan gitar akustik lanjutan.' },
    { name: 'Vokal Masterclass', description: 'Latihan teknik vokal profesional.' }
  ];

  for (const c of coursesData) {
    const existing = await prisma.course.findFirst({ where: { name: c.name } });
    if (!existing) {
      await prisma.course.create({ data: c });
    }
  }

  // 7. Create Classrooms
  const roomsData = [
    { name: 'Ruang Beethoven', capacity: 1 },
    { name: 'Ruang Mozart', capacity: 1 },
    { name: 'Studio Band Utama', capacity: 5 }
  ];

  for (const r of roomsData) {
    const existing = await prisma.classroom.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.classroom.create({ data: r });
    }
  }

  // 8. Create Pending Students
  const pendingData = [
    { name: 'Andi Pratama', email: 'andi.pending@student.com', parentPhone: '081111111' },
    { name: 'Rina Kusuma', email: 'rina.pending@student.com', parentPhone: '082222222' },
    { name: 'Dimas Anggara', email: 'dimas.pending@student.com', parentPhone: '083333333' },
    { name: 'Siti Nurhaliza', email: 'siti.pending@student.com', parentPhone: '084444444' },
    { name: 'Bambang Pamungkas', email: 'bambang.pending@student.com', parentPhone: '085555555' },
    { name: 'Kevin Sanjaya', email: 'kevin.pending@student.com', parentPhone: '086666666' },
    { name: 'Jonathan Christie', email: 'jojo.pending@student.com', parentPhone: '087777777' },
  ];

  for (const p of pendingData) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        name: p.name,
        password: hashedPassword,
        role: 'STUDENT',
        status: 'PENDING',
        studentProfile: {
          create: {
            parentPhone: p.parentPhone,
            address: 'Jl. Merdeka No. ' + Math.floor(Math.random() * 100)
          }
        }
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
