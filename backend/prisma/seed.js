import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    console.log('Cleaning up database...');
    // Delete in reverse order of foreign keys
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

    console.log('Database cleaned. Seeding Phase 1 data...');

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


  
  } else {
    console.log('Phase 1 data already exists. Skipping Phase 1 seed.');
  }

  // ==================== PHASE 2 SEEDING ====================
  console.log('Seeding Phase 2 Models...');
  await prisma.transaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.studentAchievement.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.staffSalary.deleteMany();

  // 1. TRANSACTIONS
  await prisma.transaction.create({
    data: {
      type: 'INCOME',
      amount: 600000,
      category: 'SPP',
      description: 'Pembayaran SPP Bulan Juli Ani & Budi',
      date: new Date()
    }
  });
  await prisma.transaction.create({
    data: {
      type: 'EXPENSE',
      amount: 150000,
      category: 'OPERATIONAL',
      description: 'Pembayaran Listrik Studio',
      date: new Date()
    }
  });

  // 2. INVENTORY ITEMS
  await prisma.inventoryItem.create({
    data: {
      name: 'Yamaha C3X Grand Piano',
      category: 'INSTRUMENT',
      status: 'AVAILABLE',
      quantity: 1,
      description: 'Piano utama di Studio A'
    }
  });
  await prisma.inventoryItem.create({
    data: {
      name: 'Fender Stratocaster',
      category: 'INSTRUMENT',
      status: 'AVAILABLE',
      quantity: 2
    }
  });
  await prisma.inventoryItem.create({
    data: {
      name: 'Marshall Amplifier 50W',
      category: 'EQUIPMENT',
      status: 'DAMAGED',
      quantity: 1,
      description: 'Kabel power putus'
    }
  });

  // 3. STUDENT ACHIEVEMENT & ENROLLMENT UPDATE (Ani)
  const aniUser = await prisma.user.findFirst({
    where: { email: 'student1@legacymusik.sch.id' },
    include: {
      studentProfile: {
        include: {
          enrollments: {
            include: { schedule: { include: { course: true } } }
          }
        }
      }
    }
  });

  if (aniUser && aniUser.studentProfile) {
    const profile = aniUser.studentProfile;
    
    // Achievement
    await prisma.studentAchievement.create({
      data: {
        studentId: profile.id,
        title: 'Juara 1 Lomba Piano Tingkat Kota',
        description: 'Berhasil membawakan Sonata Mozart dengan sempurna pada Festival Musik 2026.',
        date: new Date('2026-05-15T00:00:00Z')
      }
    });

    // Update Enrollment Grade
    const pianoEnr = profile.enrollments.find(e => e.schedule.course.name === 'Piano');
    if (pianoEnr) {
      await prisma.enrollment.update({
        where: { id: pianoEnr.id },
        data: { gradeLevel: 2, currentMonth: 2 }
      });
      console.log('Updated Ani Piano enrollment with gradeLevel 2, currentMonth 2');
    }
  }

  // ==================== PHASE 3 SEEDING ====================
  // 10. LANDING CONTENT (Always check & seed if missing)
  console.log('Seeding Landing Content...');
  const newLandingContents = [
    { section: 'hero', key: 'slider_1', value: '/Jumbotron1.webp' },
    { section: 'hero', key: 'slider_2', value: '/Jumbotron2.webp' },
    { section: 'hero', key: 'slider_3', value: '/Jumbotron3.webp' },
    { section: 'hero', key: 'slider_4', value: '/Jumbotron4.webp' },
    { section: 'hero', key: 'slider_5', value: '/Jumbotron5.webp' },
    { section: 'hero', key: 'slider_6', value: '/Jumbotron6.webp' },
    { section: 'hero', key: 'slider_7', value: '/Jumbotron7.webp' },
    { section: 'hero', key: 'slider_8', value: '/Jumbotron8.webp' },
    { section: 'hero', key: 'slider_9', value: '/Jumbotron9.webp' },

    { section: 'about', key: 'title', value: 'Tempat Di Mana Musik Hidup' },
    { section: 'about', key: 'description', value: 'Legacy Music Center membuka dunia musik melalui bimbingan dari guru yang berpengalaman, paparan program transformatif dan akses ke fasilitas yang modern dan ceria.\n\nFakultas kami mempunyai guru-guru yang berdedikasi dan seniman komunikatif. Mereka telah berkompeten dalam mengajar musik, melatih ansambel, dan memberikan arahan terbaik kepada murid-murid.' },
    { section: 'about', key: 'image_1', value: '/Admin1.webp' },
    { section: 'about', key: 'image_2', value: '/Admin2.webp' },
    { section: 'about', key: 'image_3', value: '/Admin3.webp' },
    { section: 'about', key: 'stat_courses', value: '9+' },
    { section: 'about', key: 'stat_grades', value: '5' },
    { section: 'about', key: 'stat_teachers', value: '10+' },

    { section: 'facility', key: 'f1_img', value: '/Piano.webp' },
    { section: 'facility', key: 'f1_title', value: 'Piano' },
    { section: 'facility', key: 'f1_desc', value: 'Fokus penuh dengan ruang kedap suara.' },
    { section: 'facility', key: 'f2_img', value: '/Gitar.webp' },
    { section: 'facility', key: 'f2_title', value: 'Alat Musik Premium' },
    { section: 'facility', key: 'f2_desc', value: 'Gunakan alat terbaik selama sesi latihan.' },
    { section: 'facility', key: 'f3_img', value: '/Drums.webp' },
    { section: 'facility', key: 'f3_title', value: 'Studio Rekaman' },
    { section: 'facility', key: 'f3_desc', value: 'Rekam karyamu dengan standar industri.' },
    { section: 'facility', key: 'f4_img', value: '/Saxophone.webp' },
    { section: 'facility', key: 'f4_title', value: 'Saxophone' },
    { section: 'facility', key: 'f4_desc', value: 'Belajar meniup saxophone dengan teknik pernapasan yang benar.' },
    { section: 'facility', key: 'f5_img', value: '/Biola.webp' },
    { section: 'facility', key: 'f5_title', value: 'Violin' },
    { section: 'facility', key: 'f5_desc', value: 'Eksplorasi keindahan nada biola dengan metode pengajaran terbaik.' },
    { section: 'facility', key: 'f6_img', value: '/Vokal.webp' },
    { section: 'facility', key: 'f6_title', value: 'Vocal' },
    { section: 'facility', key: 'f6_desc', value: 'Latih vokal Anda untuk mencapai jangkauan nada yang lebih luas dan stabil.' },

    { section: 'footer', key: 'email', value: 'info@legacymusik.sch.id' },
    { section: 'footer', key: 'phone', value: '0812-xxxx-xxxx' },
    { section: 'footer', key: 'hours', value: 'Senin - Sabtu, 09:00 - 18:00' },
    { section: 'footer', key: 'address', value: 'Jl. Dr. Setiabudi No.31-29, Kesambi, Cirebon' },
    { section: 'footer', key: 'maps_url', value: 'https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Legacy%20Music%20Center+(My%20Business%20Name)&t=&z=14&ie=UTF8&iwloc=B&output=embed' },
    { section: 'footer', key: 'instagram', value: 'https://instagram.com/legacymusiccenter' },
    { section: 'footer', key: 'youtube', value: 'https://youtube.com/@legacymusiccenter' },
    { section: 'footer', key: 'whatsapp', value: 'https://wa.me/6281200000000' },

    { section: 'chatbot', key: 'system_prompt', value: 'Anda adalah AI asisten untuk Legacy Music Center. Jawab pertanyaan pengguna dengan ramah dan informatif menggunakan bahasa Indonesia yang baik dan benar.' }
  ];

  for (const content of newLandingContents) {
    const existing = await prisma.landingContent.findFirst({
      where: { section: content.section, key: content.key }
    });
    if (!existing) {
      await prisma.landingContent.create({ data: content });
    }
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
