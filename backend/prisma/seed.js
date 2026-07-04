import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  // Delete in reverse order of foreign keys
  await prisma.landingContent.deleteMany();
  await prisma.eventBanner.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.finalGrade.deleteMany();
  await prisma.meetingAttendance.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.course.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned. Seeding new data...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 1. COURSES
  console.log('Seeding Courses...');
  const coursesData = [
    { name: 'Piano', description: 'Pelajari teknik dasar hingga mahir bermain piano klasik dan pop.' },
    { name: 'Gitar', description: 'Kuasai berbagai teknik petikan dan chord gitar akustik maupun elektrik.' },
    { name: 'Drums', description: 'Tingkatkan kemampuan ritme dan koordinasi dengan kursus drum intensif.' },
    { name: 'Saxophone', description: 'Belajar meniup saxophone dengan teknik pernapasan yang benar.' },
    { name: 'Violin', description: 'Eksplorasi keindahan nada biola dengan metode pengajaran terbaik.' },
    { name: 'Vocal', description: 'Latih vokal Anda untuk mencapai jangkauan nada yang lebih luas dan stabil.' },
    { name: 'Combo Class', description: 'Kelas bermain dalam format band untuk melatih kerja sama tim.' },
    { name: 'Cello', description: 'Rasakan kedalaman suara instrumen string dari cello.' },
    { name: 'Music Production', description: 'Belajar merekam, mixing, dan mastering musik digital.' },
  ];
  
  const createdCourses = {};
  for (const c of coursesData) {
    createdCourses[c.name] = await prisma.course.create({ data: c });
  }

  // 2. CLASSROOMS
  console.log('Seeding Classrooms...');
  const roomsData = ['Studio A', 'Studio B', 'Studio C', 'Studio D', 'Studio E'];
  const createdRooms = {};
  for (const name of roomsData) {
    createdRooms[name] = await prisma.classroom.create({ data: { name, capacity: 8 } });
  }

  // 3. USERS
  console.log('Seeding Users...');
  
  // a. Super Admin
  await prisma.user.create({
    data: {
      email: 'admin@legacymusik.sch.id',
      password: adminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  // b. Staff
  await prisma.user.create({
    data: {
      email: 'staff@legacymusik.sch.id',
      password: staffPassword,
      name: 'Staff Resepsionis',
      role: 'STAFF',
      status: 'ACTIVE'
    }
  });

  // c. Teachers
  const teachers = [
    { email: 'stefan@legacymusik.sch.id', name: 'Stefan', specialization: 'Piano' },
    { email: 'rina@legacymusik.sch.id', name: 'Rina Maulina', specialization: 'Vocal' },
    { email: 'budi@legacymusik.sch.id', name: 'Budi Pratama', specialization: 'Drums' }
  ];
  const createdTeachers = {};
  for (const t of teachers) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        password: passwordHash,
        name: t.name,
        role: 'TEACHER',
        status: 'ACTIVE',
        teacherProfile: {
          create: { specialization: t.specialization }
        }
      }
    });
    createdTeachers[t.name] = user;
  }

  // d. Students
  const students = [
    { email: 'student1@legacymusik.sch.id', name: 'Ani Lestari', status: 'ACTIVE' },
    { email: 'student2@legacymusik.sch.id', name: 'Budi Santoso', status: 'ACTIVE' },
    { email: 'student3@legacymusik.sch.id', name: 'Cici Rahmawati', status: 'ACTIVE' },
    { email: 'student4@legacymusik.sch.id', name: 'Dodi Hermawan', status: 'PENDING' },
    { email: 'student5@legacymusik.sch.id', name: 'Eka Putri', status: 'ACTIVE' },
  ];
  const createdStudents = {};
  for (const s of students) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: studentPassword,
        name: s.name,
        role: 'STUDENT',
        status: s.status,
        studentProfile: {
          create: { parentPhone: '08123456789', address: 'Jl. Merdeka No. 10, Jakarta' }
        }
      },
      include: { studentProfile: true }
    });
    createdStudents[s.name] = user;
  }

  // 4. SCHEDULES
  console.log('Seeding Schedules...');
  const schedulesData = [
    { courseName: 'Piano', teacherName: 'Stefan', roomName: 'Studio A', day: 'SENIN', startTime: '14:00', endTime: '15:00' },
    { courseName: 'Vocal', teacherName: 'Rina Maulina', roomName: 'Studio B', day: 'RABU', startTime: '15:00', endTime: '16:00' },
    { courseName: 'Drums', teacherName: 'Budi Pratama', roomName: 'Studio C', day: 'JUMAT', startTime: '13:00', endTime: '14:00' },
    { courseName: 'Piano', teacherName: 'Stefan', roomName: 'Studio A', day: 'KAMIS', startTime: '16:00', endTime: '17:00' },
    { courseName: 'Vocal', teacherName: 'Rina Maulina', roomName: 'Studio B', day: 'SABTU', startTime: '10:00', endTime: '11:00' },
    { courseName: 'Drums', teacherName: 'Budi Pratama', roomName: 'Studio C', day: 'MINGGU', startTime: '14:00', endTime: '15:00' },
  ];
  
  const createdSchedules = {};
  for (const [index, sd] of schedulesData.entries()) {
    const course = createdCourses[sd.courseName];
    const teacher = createdTeachers[sd.teacherName];
    const room = createdRooms[sd.roomName];
    
    createdSchedules[`sch_${index}`] = await prisma.schedule.create({
      data: {
        courseId: course.id,
        teacherId: teacher.id,
        classroomId: room.id,
        day: sd.day,
        startTime: sd.startTime,
        endTime: sd.endTime
      }
    });
  }

  // 5. ENROLLMENTS
  console.log('Seeding Enrollments...');
  const enrollmentsData = [
    { studentName: 'Ani Lestari', schKey: 'sch_0' }, // Piano SENIN
    { studentName: 'Ani Lestari', schKey: 'sch_1' }, // Vocal RABU
    { studentName: 'Budi Santoso', schKey: 'sch_2' }, // Drums JUMAT
    { studentName: 'Cici Rahmawati', schKey: 'sch_0' }, // Piano SENIN
    { studentName: 'Eka Putri', schKey: 'sch_2' }, // Drums JUMAT
  ];

  const createdEnrollments = {};
  for (const [index, ed] of enrollmentsData.entries()) {
    const student = createdStudents[ed.studentName];
    const schedule = createdSchedules[ed.schKey];
    
    createdEnrollments[`enr_${index}`] = await prisma.enrollment.create({
      data: {
        studentId: student.studentProfile.id,
        scheduleId: schedule.id
      }
    });
  }

  // 6. MEETINGS & ATTENDANCES
  console.log('Seeding Meetings & Attendances...');
  
  // Piano Class (sch_0) -> Ani & Cici
  const meeting1 = await prisma.meeting.create({
    data: {
      scheduleId: createdSchedules['sch_0'].id,
      title: 'Pertemuan ke-1',
      meetingDate: new Date('2026-07-05T00:00:00Z'),
      journal: 'Hari ini belajar tangga nada dasar C dan G.'
    }
  });
  await prisma.meetingAttendance.create({ data: { meetingId: meeting1.id, enrollmentId: createdEnrollments['enr_0'].id, status: 'HADIR' }}); // Ani
  await prisma.meetingAttendance.create({ data: { meetingId: meeting1.id, enrollmentId: createdEnrollments['enr_3'].id, status: 'HADIR' }}); // Cici

  const meeting2 = await prisma.meeting.create({
    data: {
      scheduleId: createdSchedules['sch_0'].id,
      title: 'Pertemuan ke-2',
      meetingDate: new Date('2026-07-12T00:00:00Z'),
      journal: 'Latihan fingering dan sight reading.'
    }
  });
  await prisma.meetingAttendance.create({ data: { meetingId: meeting2.id, enrollmentId: createdEnrollments['enr_0'].id, status: 'HADIR' }}); // Ani
  await prisma.meetingAttendance.create({ data: { meetingId: meeting2.id, enrollmentId: createdEnrollments['enr_3'].id, status: 'ABSEN' }}); // Cici

  const meeting3 = await prisma.meeting.create({
    data: {
      scheduleId: createdSchedules['sch_0'].id,
      title: 'Pertemuan ke-3',
      meetingDate: new Date('2026-07-19T00:00:00Z'),
      journal: 'Review minggu lalu dan pengenalan chord dasar.'
    }
  });
  await prisma.meetingAttendance.create({ data: { meetingId: meeting3.id, enrollmentId: createdEnrollments['enr_0'].id, status: 'HADIR' }}); // Ani
  await prisma.meetingAttendance.create({ data: { meetingId: meeting3.id, enrollmentId: createdEnrollments['enr_3'].id, status: 'HADIR' }}); // Cici

  // Vocal Class (sch_1) -> Ani
  const meetingVocal = await prisma.meeting.create({
    data: {
      scheduleId: createdSchedules['sch_1'].id,
      title: 'Pertemuan ke-1',
      meetingDate: new Date('2026-07-08T00:00:00Z'),
      journal: 'Latihan pernapasan diafragma.'
    }
  });
  await prisma.meetingAttendance.create({ data: { meetingId: meetingVocal.id, enrollmentId: createdEnrollments['enr_1'].id, status: 'HADIR' }}); // Ani

  // Drums Class (sch_2) -> Budi & Eka
  const meetingDrums = await prisma.meeting.create({
    data: {
      scheduleId: createdSchedules['sch_2'].id,
      title: 'Pertemuan ke-1',
      meetingDate: new Date('2026-07-10T00:00:00Z'),
      journal: 'Pengenalan pola ritme dasar 4/4.'
    }
  });
  await prisma.meetingAttendance.create({ data: { meetingId: meetingDrums.id, enrollmentId: createdEnrollments['enr_2'].id, status: 'HADIR' }}); // Budi
  await prisma.meetingAttendance.create({ data: { meetingId: meetingDrums.id, enrollmentId: createdEnrollments['enr_4'].id, status: 'HADIR' }}); // Eka

  // 7. INVOICES
  console.log('Seeding Invoices...');
  const invoicesData = [
    { studentName: 'Ani Lestari', month: 6, year: 2026, status: 'PAID', paidAt: new Date('2026-06-05T00:00:00Z') },
    { studentName: 'Ani Lestari', month: 7, year: 2026, status: 'UNPAID', paidAt: null },
    { studentName: 'Budi Santoso', month: 6, year: 2026, status: 'PAID', paidAt: new Date('2026-06-05T00:00:00Z') },
    { studentName: 'Budi Santoso', month: 7, year: 2026, status: 'PAID', paidAt: new Date('2026-07-05T00:00:00Z') },
    { studentName: 'Cici Rahmawati', month: 6, year: 2026, status: 'UNPAID', paidAt: null },
    { studentName: 'Cici Rahmawati', month: 7, year: 2026, status: 'UNPAID', paidAt: null },
    { studentName: 'Eka Putri', month: 6, year: 2026, status: 'PAID', paidAt: new Date('2026-06-05T00:00:00Z') },
    { studentName: 'Eka Putri', month: 7, year: 2026, status: 'UNPAID', paidAt: null },
  ];

  for (const inv of invoicesData) {
    const student = createdStudents[inv.studentName];
    await prisma.invoice.create({
      data: {
        studentId: student.studentProfile.id,
        month: inv.month,
        year: inv.year,
        amount: 300000,
        status: inv.status,
        paidAt: inv.paidAt
      }
    });
  }

  // 8. FINAL GRADES
  console.log('Seeding Final Grades...');
  await prisma.finalGrade.create({
    data: {
      enrollmentId: createdEnrollments['enr_0'].id, // Ani -> Piano
      score: 85,
      evaluation: 'Progres sangat baik, terus latihan tangga nada.'
    }
  });

  await prisma.finalGrade.create({
    data: {
      enrollmentId: createdEnrollments['enr_2'].id, // Budi -> Drums
      score: 78,
      evaluation: 'Cukup baik, perlu lebih banyak latihan ritme.'
    }
  });

  // 9. EVENT BANNERS
  console.log('Seeding Event Banners...');
  await prisma.eventBanner.create({
    data: {
      title: 'Konser Akhir Tahun 2026',
      description: 'Pentas seni akhir tahun seluruh siswa.',
      imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070&auto=format&fit=crop'
    }
  });
  await prisma.eventBanner.create({
    data: {
      title: 'Workshop Piano Jazz',
      description: 'Belajar improvisasi jazz bersama instruktur tamu.',
      imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=2070&auto=format&fit=crop'
    }
  });

  // 10. LANDING CONTENT
  console.log('Seeding Landing Content...');
  const landingContents = [
    { section: 'hero', key: 'slider_1', value: '/Jumbotron1.webp' },
    { section: 'hero', key: 'slider_2', value: '/Jumbotron2.webp' },
    { section: 'hero', key: 'slider_3', value: '/Jumbotron3.webp' },
    { section: 'hero', key: 'slider_4', value: '/Jumbotron4.webp' },
    { section: 'hero', key: 'slider_5', value: '/Jumbotron5.webp' },
    { section: 'hero', key: 'slider_6', value: '/Jumbotron6.webp' },
    { section: 'hero', key: 'slider_7', value: '/Jumbotron7.webp' },
    { section: 'hero', key: 'slider_8', value: '/Jumbotron8.webp' },
    { section: 'hero', key: 'slider_9', value: '/Jumbotron9.webp' },
    
    { section: 'about', key: 'about_text', value: 'Legacy Music Center adalah institusi pendidikan musik terkemuka yang telah berdiri sejak tahun 2010. Kami berkomitmen untuk mencetak musisi-musisi berbakat dengan standar kurikulum internasional.' },
    { section: 'about', key: 'stats_students', value: '1500+' },
    { section: 'about', key: 'stats_teachers', value: '50+' },
    { section: 'about', key: 'stats_awards', value: '25+' },
    
    { section: 'facility', key: 'facility_1_title', value: 'Ruang Kelas Kedap Suara' },
    { section: 'facility', key: 'facility_1_desc', value: 'Fokus penuh dengan ruang kedap suara.' },
    { section: 'facility', key: 'facility_2_title', value: 'Alat Musik Premium' },
    { section: 'facility', key: 'facility_2_desc', value: 'Gunakan alat terbaik selama sesi latihan.' },
    { section: 'facility', key: 'facility_3_title', value: 'Studio Rekaman' },
    { section: 'facility', key: 'facility_3_desc', value: 'Rekam karyamu dengan standar industri.' },
    
    { section: 'footer', key: 'contact_address', value: 'Jl. Musik Harmoni No. 123, Jakarta Selatan' },
    { section: 'footer', key: 'contact_phone', value: '+62 21 555 1234' },
    { section: 'footer', key: 'contact_email', value: 'info@legacymusik.sch.id' },
    
    { section: 'chatbot', key: 'greeting', value: 'Halo! Selamat datang di Legacy Music Center. Ada yang bisa kami bantu?' }
  ];

  for (const content of landingContents) {
    await prisma.landingContent.create({ data: content });
  }

  console.log('✅ Seed data successfully generated!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
