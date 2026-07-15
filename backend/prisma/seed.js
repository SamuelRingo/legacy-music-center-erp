import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with rich demo data...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // Helper to upsert User
  async function upsertUser(email, name, role, status, profileData = null) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { email },
        data: { name, role, status, password: passwordHash }
      });
    } else {
      const data = { email, name, role, status, password: passwordHash };
      if (role === 'STUDENT' && profileData) {
        data.studentProfile = { create: profileData };
      } else if (role === 'TEACHER' && profileData) {
        data.teacherProfile = { create: profileData };
      }
      user = await prisma.user.create({ data });
    }

    if (role === 'STUDENT' && profileData && existingUser) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: profileData,
        create: { userId: user.id, ...profileData }
      });
    } else if (role === 'TEACHER' && profileData && existingUser) {
      await prisma.teacherProfile.upsert({
        where: { userId: user.id },
        update: profileData,
        create: { userId: user.id, ...profileData }
      });
    }

    return await prisma.user.findUnique({ where: { id: user.id }, include: { studentProfile: true, teacherProfile: true } });
  }

  // 1. USERS
  console.log('Seeding Users...');
  const admin = await upsertUser('admin@legacymusik.sch.id', 'Super Admin', 'SUPER_ADMIN', 'ACTIVE');
  const staff1 = await upsertUser('staff1@legacymusik.sch.id', 'Staff Resepsionis', 'STAFF', 'ACTIVE');
  const staff2 = await upsertUser('staff2@legacymusik.sch.id', 'Staff Keuangan', 'STAFF', 'ACTIVE');
  
  const teacher1 = await upsertUser('teacher1@legacymusik.sch.id', 'Budi Pratama', 'TEACHER', 'ACTIVE', { specialization: 'Piano' });
  const teacher2 = await upsertUser('teacher2@legacymusik.sch.id', 'Rina Maulina', 'TEACHER', 'ACTIVE', { specialization: 'Vocal' });
  const teacher3 = await upsertUser('teacher3@legacymusik.sch.id', 'Stefan', 'TEACHER', 'ACTIVE', { specialization: 'Gitar' });

  const student1 = await upsertUser('murid1@legacymusik.sch.id', 'Ani Lestari', 'STUDENT', 'ACTIVE', { parentPhone: '+6281234567890', address: 'Jl. Merdeka No. 1, Cirebon' });
  const student2 = await upsertUser('murid2@legacymusik.sch.id', 'Budi Santoso', 'STUDENT', 'ACTIVE', { parentPhone: '+6281234567891', address: 'Jl. Pahlawan No. 2, Cirebon' });
  const student3 = await upsertUser('murid3@legacymusik.sch.id', 'Cici Rahmawati', 'STUDENT', 'ACTIVE', { parentPhone: '+6281234567892', address: 'Jl. Diponegoro No. 3, Cirebon' });
  const student4 = await upsertUser('murid4@legacymusik.sch.id', 'Dodi Hermawan', 'STUDENT', 'PENDING', { parentPhone: '+6281234567893', address: 'Jl. Sudirman No. 4, Cirebon' });
  const student5 = await upsertUser('murid5@legacymusik.sch.id', 'Eka Putri', 'STUDENT', 'ACTIVE', { parentPhone: '+6281234567894', address: 'Jl. Ahmad Yani No. 5, Cirebon' });

  // 2. COURSES
  console.log('Seeding Courses...');
  async function upsertCourse(name, price) {
    let course = await prisma.course.findFirst({ where: { name } });
    if (!course) course = await prisma.course.create({ data: { name, price, description: `Kursus ${name}` } });
    else course = await prisma.course.update({ where: { id: course.id }, data: { price } });
    return course;
  }
  const coursePiano = await upsertCourse('Piano', 350000);
  const courseGitar = await upsertCourse('Gitar', 300000);
  const courseBiola = await upsertCourse('Biola', 325000);
  const courseVokal = await upsertCourse('Vokal', 275000);
  const courseDrum = await upsertCourse('Drum', 350000);

  // 3. CLASSROOMS
  console.log('Seeding Classrooms...');
  async function upsertClassroom(name, capacity) {
    let room = await prisma.classroom.findFirst({ where: { name } });
    if (!room) room = await prisma.classroom.create({ data: { name, capacity } });
    else room = await prisma.classroom.update({ where: { id: room.id }, data: { capacity } });
    return room;
  }
  const roomA = await upsertClassroom('Studio A', 8);
  const roomB = await upsertClassroom('Studio B', 8);
  const roomC = await upsertClassroom('Studio C', 5);

  // 4. SCHEDULES
  console.log('Seeding Schedules...');
  async function upsertSchedule(courseId, teacherId, classroomId, day, startTime, endTime) {
    let sched = await prisma.schedule.findFirst({ where: { courseId, teacherId, classroomId, day, startTime } });
    if (!sched) sched = await prisma.schedule.create({ data: { courseId, teacherId, classroomId, day, startTime, endTime } });
    return sched;
  }
  const schPiano = await upsertSchedule(coursePiano.id, teacher1.id, roomA.id, 'SENIN', '14:00', '15:00');
  const schGitar = await upsertSchedule(courseGitar.id, teacher3.id, roomB.id, 'SELASA', '15:00', '16:00');
  const schBiola = await upsertSchedule(courseBiola.id, teacher3.id, roomA.id, 'RABU', '13:00', '14:00');
  const schVokal = await upsertSchedule(courseVokal.id, teacher2.id, roomB.id, 'KAMIS', '16:00', '17:00');
  const schDrum = await upsertSchedule(courseDrum.id, teacher1.id, roomC.id, 'JUMAT', '14:00', '15:00');

  // 5. ENROLLMENTS
  console.log('Seeding Enrollments...');
  async function upsertEnrollment(studentId, scheduleId) {
    let enr = await prisma.enrollment.findUnique({ where: { studentId_scheduleId: { studentId, scheduleId } } });
    if (!enr) enr = await prisma.enrollment.create({ data: { studentId, scheduleId } });
    return enr;
  }
  const enrAniPiano = await upsertEnrollment(student1.studentProfile.id, schPiano.id);
  const enrAniVokal = await upsertEnrollment(student1.studentProfile.id, schVokal.id);
  const enrBudiGitar = await upsertEnrollment(student2.studentProfile.id, schGitar.id);
  const enrCiciPiano = await upsertEnrollment(student3.studentProfile.id, schPiano.id);
  const enrEkaDrum = await upsertEnrollment(student5.studentProfile.id, schDrum.id);
  const enrEkaBiola = await upsertEnrollment(student5.studentProfile.id, schBiola.id);

  // 6. MEETINGS & 7. MEETING ATTENDANCES
  console.log('Seeding Meetings & Attendances for Piano...');
  const pianoDates = [
    new Date('2026-06-02T14:00:00Z'), new Date('2026-06-09T14:00:00Z'), new Date('2026-06-16T14:00:00Z'),
    new Date('2026-07-07T14:00:00Z'), new Date('2026-07-14T14:00:00Z'), new Date('2026-07-21T14:00:00Z'),
    new Date('2026-08-04T14:00:00Z'), new Date('2026-08-11T14:00:00Z'), new Date('2026-08-18T14:00:00Z')
  ];
  let meetingCounter = 1;
  const statuses = ['HADIR', 'ABSEN', 'IZIN', 'SAKIT'];
  
  for (const date of pianoDates) {
    let meet = await prisma.meeting.findFirst({ where: { scheduleId: schPiano.id, meetingDate: date } });
    if (!meet) {
      meet = await prisma.meeting.create({
        data: {
          scheduleId: schPiano.id,
          title: `Pertemuan ke-${meetingCounter}`,
          meetingDate: date,
          journal: `Materi Piano hari ini bagian ${meetingCounter}, fokus teknik dasar.`
        }
      });
    }

    // Attendance Ani
    const statusAni = statuses[Math.floor(Math.random() * statuses.length)];
    let attAni = await prisma.meetingAttendance.findUnique({ where: { meetingId_enrollmentId: { meetingId: meet.id, enrollmentId: enrAniPiano.id } } });
    if (!attAni) await prisma.meetingAttendance.create({ data: { meetingId: meet.id, enrollmentId: enrAniPiano.id, status: statusAni, note: statusAni !== 'HADIR' ? 'Ada keperluan keluarga' : '' } });

    // Attendance Cici
    const statusCici = statuses[Math.floor(Math.random() * statuses.length)];
    let attCici = await prisma.meetingAttendance.findUnique({ where: { meetingId_enrollmentId: { meetingId: meet.id, enrollmentId: enrCiciPiano.id } } });
    if (!attCici) await prisma.meetingAttendance.create({ data: { meetingId: meet.id, enrollmentId: enrCiciPiano.id, status: statusCici, note: statusCici !== 'HADIR' ? 'Sakit demam' : '' } });

    meetingCounter++;
  }

  // 8. INVOICES (Juni, Juli, Agustus)
  console.log('Seeding Invoices...');
  const studentsWithEnrollment = [student1, student2, student3, student5];
  
  async function upsertInvoice(studentId, month, year, status, paidAt = null) {
    // Get total amount for student's enrollments
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { enrollments: { include: { schedule: { include: { course: true } } } } }
    });
    const amount = profile.enrollments.reduce((sum, enr) => sum + enr.schedule.course.price, 0);

    let inv = await prisma.invoice.findUnique({ where: { studentId_month_year: { studentId, month, year } } });
    if (!inv) {
      inv = await prisma.invoice.create({
        data: { studentId, month, year, amount, status, paidAt }
      });
    } else {
      inv = await prisma.invoice.update({
        where: { id: inv.id },
        data: { amount, status, paidAt }
      });
    }
    return inv;
  }

  // Invoice scenario logic
  let lunasCountJune = 0;
  for (const st of studentsWithEnrollment) {
    const isLunas = lunasCountJune < 2;
    await upsertInvoice(st.studentProfile.id, 6, 2026, isLunas ? 'PAID' : 'UNPAID', isLunas ? new Date('2026-06-05T00:00:00Z') : null);
    if (isLunas) lunasCountJune++;
  }

  let lunasCountJuly = 0;
  for (const st of studentsWithEnrollment) {
    const isLunas = lunasCountJuly < 3;
    await upsertInvoice(st.studentProfile.id, 7, 2026, isLunas ? 'PAID' : 'UNPAID', isLunas ? new Date('2026-07-05T00:00:00Z') : null);
    if (isLunas) lunasCountJuly++;
  }

  for (const st of studentsWithEnrollment) {
    await upsertInvoice(st.studentProfile.id, 8, 2026, 'UNPAID', null);
  }

  // 9. FINAL GRADES
  console.log('Seeding Final Grades...');
  async function upsertFinalGrade(enrollmentId, score, evaluation) {
    let fg = await prisma.finalGrade.findUnique({ where: { enrollmentId } });
    if (!fg) await prisma.finalGrade.create({ data: { enrollmentId, score, evaluation } });
    else await prisma.finalGrade.update({ where: { id: fg.id }, data: { score, evaluation } });
  }
  await upsertFinalGrade(enrAniPiano.id, 85, 'Progres sangat baik, terus latihan tangga nada.');
  await upsertFinalGrade(enrBudiGitar.id, 78, 'Cukup baik, perlu lebih banyak latihan ritme.');
  await upsertFinalGrade(enrCiciPiano.id, 90, 'Sangat memuaskan, bakat alami dalam piano.');

  // 10. ACHIEVEMENTS
  console.log('Seeding Achievements...');
  async function upsertAchievement(studentId, title, description, date) {
    let ach = await prisma.studentAchievement.findFirst({ where: { studentId, title } });
    if (!ach) await prisma.studentAchievement.create({ data: { studentId, title, description, date } });
  }
  await upsertAchievement(student1.studentProfile.id, 'Juara 1 Lomba Piano Tingkat Kota', 'Pemenang lomba piano 2026', new Date('2026-05-15T00:00:00Z'));
  await upsertAchievement(student3.studentProfile.id, 'Peserta Terbaik Workshop Musik Klasik', 'Workshop musik klasik april 2026', new Date('2026-04-20T00:00:00Z'));

  // 11. TRANSACTIONS
  console.log('Seeding Transactions...');
  // Check if we already created these to avoid flooding on re-seed
  const existingTrxCount = await prisma.transaction.count();
  if (existingTrxCount < 15) {
    const trxData = [];
    for (const month of [6, 7, 8]) {
      const numTrx = Math.floor(Math.random() * 4) + 5; // 5 to 8
      for (let i = 0; i < numTrx; i++) {
        const isIncome = Math.random() > 0.5;
        trxData.push({
          type: isIncome ? 'INCOME' : 'EXPENSE',
          amount: Math.floor(Math.random() * 1900000) + 100000,
          category: isIncome ? (Math.random() > 0.5 ? 'SPP' : 'Pendaftaran Murid Baru') : ['Listrik', 'Internet', 'Peralatan Musik', 'Kebersihan'][Math.floor(Math.random() * 4)],
          description: `Transaksi demo bulan ${month}`,
          date: new Date(`2026-0${month}-15T12:00:00Z`)
        });
      }
    }
    await prisma.transaction.createMany({ data: trxData });
  }

  // 12. INVENTORY
  console.log('Seeding Inventory...');
  async function upsertInventory(name, status) {
    let inv = await prisma.inventoryItem.findFirst({ where: { name } });
    if (!inv) await prisma.inventoryItem.create({ data: { name, status, category: 'EQUIPMENT', quantity: 1 } });
    else await prisma.inventoryItem.update({ where: { id: inv.id }, data: { status } });
  }
  await upsertInventory('Piano Yamaha U1', 'AVAILABLE');
  await upsertInventory('Gitar Akustik Yamaha F310', 'AVAILABLE');
  await upsertInventory('Amplifier Roland', 'DAMAGED');
  await upsertInventory('Speaker Monitor', 'AVAILABLE');
  await upsertInventory('Stand Mic', 'NEW');

  // 13. STAFF ATTENDANCE
  console.log('Seeding Staff Attendance...');
  const staffIds = [staff1.id, staff2.id];
  const saStatuses = ['PRESENT', 'LATE', 'ABSENT'];
  for (const sid of staffIds) {
    const existingSaCount = await prisma.staffAttendance.count({ where: { userId: sid } });
    if (existingSaCount < 10) {
      for (let i = 0; i < 12; i++) {
        const month = [6, 7, 8][Math.floor(Math.random() * 3)];
        const day = Math.floor(Math.random() * 28) + 1;
        const date = new Date(`2026-0${month}-${day.toString().padStart(2, '0')}T08:00:00Z`);
        const status = saStatuses[Math.floor(Math.random() * saStatuses.length)];
        let existing = await prisma.staffAttendance.findUnique({ where: { userId_date: { userId: sid, date } } });
        if (!existing) {
          await prisma.staffAttendance.create({ data: { userId: sid, date, status, note: '' } });
        }
      }
    }
  }

  // 14. STAFF SALARIES
  console.log('Seeding Staff Salaries...');
  async function upsertSalary(userId, month, amount) {
    let sal = await prisma.staffSalary.findUnique({ where: { userId_month_year: { userId, month, year: 2026 } } });
    if (!sal) await prisma.staffSalary.create({ data: { userId, month, year: 2026, amount } });
  }
  await upsertSalary(staff1.id, 6, 2500000);
  await upsertSalary(staff1.id, 7, 2500000);
  await upsertSalary(staff2.id, 6, 2000000);
  await upsertSalary(staff2.id, 7, 2000000);

  // 15. LANDING CONTENT
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
    { section: 'footer', key: 'phone', value: '+6281234567890' },
    { section: 'footer', key: 'hours', value: 'Senin - Sabtu, 09:00 - 18:00' },
    { section: 'footer', key: 'address', value: 'Jl. Dr. Setiabudi No.31-29, Kesambi, Cirebon' },
    { section: 'footer', key: 'maps_url', value: 'https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Legacy%20Music%20Center+(My%20Business%20Name)&t=&z=14&ie=UTF8&iwloc=B&output=embed' },
    { section: 'footer', key: 'instagram', value: 'https://instagram.com/legacymusiccenter' },
    { section: 'footer', key: 'youtube', value: 'https://youtube.com/@legacymusiccenter' },
    { section: 'footer', key: 'whatsapp', value: 'https://wa.me/6281234567890' },
    { section: 'chatbot', key: 'system_prompt', value: 'Anda adalah AI asisten untuk Legacy Music Center. Jawab pertanyaan pengguna dengan ramah dan informatif menggunakan bahasa Indonesia yang baik dan benar.' }
  ];

  for (const c of landingContents) {
    const existing = await prisma.landingContent.findUnique({
      where: { section_key: { section: c.section, key: c.key } }
    });
    if (existing) {
      await prisma.landingContent.update({
        where: { id: existing.id },
        data: { value: c.value }
      });
    } else {
      await prisma.landingContent.create({ data: c });
    }
  }

  // 16. EVENT BANNERS
  console.log('Seeding Event Banners...');
  async function upsertBanner(title, description, imageUrl) {
    let ban = await prisma.eventBanner.findFirst({ where: { title } });
    if (!ban) await prisma.eventBanner.create({ data: { title, description, imageUrl } });
  }
  await upsertBanner('Konser Akhir Tahun 2026', 'Pentas seni akhir tahun seluruh siswa.', 'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070');
  await upsertBanner('Workshop Piano Jazz', 'Belajar improvisasi jazz bersama instruktur tamu.', 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=2070');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
