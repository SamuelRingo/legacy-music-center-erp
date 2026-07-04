import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  // Super Admin
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

  // Demo Student
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

  // Demo Teacher
  await prisma.user.upsert({
    where: { email: 'teacher@legacymusik.sch.id' },
    update: {},
    create: {
      name: 'Guru Demo',
      email: 'teacher@legacymusik.sch.id',
      password: teacherPassword,
      role: 'TEACHER',
      status: 'ACTIVE',
      teacherProfile: { create: { specialization: 'Umum' } }
    }
  });

  // Demo Classrooms
  const rooms = ['Ruang 101', 'Ruang 102', 'Ruang 103', 'Studio A', 'Studio B', 'Ruang Beethoven', 'Ruang Mozart', 'Studio Band Utama'];
  for (const name of rooms) {
    const existing = await prisma.classroom.findFirst({ where: { name } });
    if (!existing) {
      await prisma.classroom.create({ data: { name, capacity: 10 } });
    }
  }

  // Demo Event Banners
  const existingEvent = await prisma.eventBanner.findFirst({ where: { title: 'Grand Concert 2026' } });
  if (!existingEvent) {
    await prisma.eventBanner.create({
      data: {
        title: 'Grand Concert 2026',
        description: 'Join us for our annual showcase featuring top students and faculty.',
        imageUrl: '/auth-bg.png'
      }
    });
  }

  // ==========================================
  // LANDING PAGE SEED DATA (Courses & Teachers)
  // ==========================================

  const teacherData = [
    { name: 'Stefan', photo: '/Stefan.webp' },
    { name: 'Rizky', photo: '/Rizky.webp' },
    { name: 'Afif', photo: '/Afif.webp' },
    { name: 'Budi', photo: '/Budi.webp' },
    { name: 'Umae', photo: '/Umae.webp' },
    { name: 'Egi', photo: '/Egi.webp' },
    { name: 'Iwan', photo: '/Iwan.webp' },
    { name: 'Angel', photo: '/Angel.webp' },
    { name: 'Betha', photo: '/Betha.webp' }
  ];

  // Upsert Teachers
  for (const t of teacherData) {
    const email = `${t.name.toLowerCase()}@legacymusik.sch.id`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: t.name,
        email: email,
        password: hashedPassword,
        role: 'TEACHER',
        status: 'ACTIVE',
        teacherProfile: { create: { specialization: 'Music' } }
      }
    });
  }

  const landingCourses = [
    { name: 'Piano', teachers: ['Stefan', 'Rizky'] },
    { name: 'Gitar', teachers: ['Afif'] },
    { name: 'Drums', teachers: ['Budi', 'Umae'] },
    { name: 'Saxophone', teachers: ['Egi'] },
    { name: 'Violin', teachers: ['Iwan'] },
    { name: 'Vocal', teachers: ['Egi', 'Angel', 'Betha', 'Rizky'] },
    { name: 'Combo Class', teachers: [] },
    { name: 'Cello', teachers: ['Stefan'] },
    { name: 'Music Production', teachers: [] }
  ];

  const defaultClassroom = await prisma.classroom.findFirst();

  for (const c of landingCourses) {
    let course = await prisma.course.findFirst({ where: { name: c.name } });
    if (!course) {
      course = await prisma.course.create({
        data: { name: c.name, description: `Kursus ${c.name} di Legacy Music Center.` }
      });
    }

    for (const tName of c.teachers) {
      const email = `${tName.toLowerCase()}@legacymusik.sch.id`;
      const teacher = await prisma.user.findUnique({ where: { email } });
      if (teacher && defaultClassroom) {
        const existingSchedule = await prisma.schedule.findFirst({
          where: { courseId: course.id, teacherId: teacher.id }
        });

        if (!existingSchedule) {
          await prisma.schedule.create({
            data: {
              courseId: course.id,
              teacherId: teacher.id,
              classroomId: defaultClassroom.id,
              day: 'SENIN',
              startTime: '08:00',
              endTime: '09:00'
            }
          });
        }
      }
    }
  }

  // Pending Students
  const pendingData = [
    { name: 'Andi Pratama', email: 'andi.pending@student.com', parentPhone: '081111111' },
    { name: 'Rina Kusuma', email: 'rina.pending@student.com', parentPhone: '082222222' }
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
            address: 'Jl. Merdeka'
          }
        }
      }
    });
  }

  console.log('Landing page courses and schedules seeded! 🎵');

  // ==========================================
  // LANDING CONTENT SEED DATA
  // ==========================================
  const defaultLandingContent = [
    // HERO
    { section: 'hero', key: 'slider_1', value: '/Jumbotron1.webp' },
    { section: 'hero', key: 'slider_2', value: '/Jumbotron2.webp' },
    { section: 'hero', key: 'slider_3', value: '/Jumbotron3.webp' },
    { section: 'hero', key: 'slider_4', value: '/Jumbotron4.webp' },
    { section: 'hero', key: 'slider_5', value: '/Jumbotron5.webp' },
    { section: 'hero', key: 'slider_6', value: '/Jumbotron6.webp' },
    { section: 'hero', key: 'slider_7', value: '/Jumbotron7.webp' },
    { section: 'hero', key: 'slider_8', value: '/Jumbotron8.webp' },
    { section: 'hero', key: 'slider_9', value: '/Jumbotron9.webp' },
    
    // ABOUT
    { section: 'about', key: 'title', value: 'Tempat Di Mana Musik Hidup' },
    { section: 'about', key: 'description', value: 'Legacy Music Center bukan sekadar tempat kursus, melainkan rumah bagi kreativitas dan ekspresi musikal.' },
    { section: 'about', key: 'stat_courses', value: '9+' },
    { section: 'about', key: 'stat_grades', value: '5' },
    { section: 'about', key: 'stat_teachers', value: '10+' },
    { section: 'about', key: 'image_1', value: '/Jumbotron8.webp' },
    { section: 'about', key: 'image_2', value: '/Admin1.webp' },
    { section: 'about', key: 'image_3', value: '/Admin2.webp' },
    
    // FACILITY
    { section: 'facility', key: 'f1_title', value: 'Piano Lounge' },
    { section: 'facility', key: 'f1_desc', value: 'Ruangan akustik premium dengan Grand Piano.' },
    { section: 'facility', key: 'f1_img', value: '/Piano1.jpg' },
    { section: 'facility', key: 'f2_title', value: 'Violin Studio' },
    { section: 'facility', key: 'f2_desc', value: 'Ruang kedap suara khusus gesek.' },
    { section: 'facility', key: 'f2_img', value: '/Violin1.jpg' },
    { section: 'facility', key: 'f3_title', value: 'Vocal Room' },
    { section: 'facility', key: 'f3_desc', value: 'Fasilitas recording standar industri.' },
    { section: 'facility', key: 'f3_img', value: '/Vocal1.jpg' },
    { section: 'facility', key: 'f4_title', value: 'Guitar Station' },
    { section: 'facility', key: 'f4_desc', value: 'Koleksi ampli dan instrumen lengkap.' },
    { section: 'facility', key: 'f4_img', value: '/Gitar1.jpg' },
    { section: 'facility', key: 'f5_title', value: 'Drum Area' },
    { section: 'facility', key: 'f5_desc', value: 'Drum akustik & elektrik untuk sesi intens.' },
    { section: 'facility', key: 'f5_img', value: '/Drums1.jpg' },
    { section: 'facility', key: 'f6_title', value: 'Waiting Area' },
    { section: 'facility', key: 'f6_desc', value: 'Sofa nyaman untuk orang tua dan siswa.' },
    { section: 'facility', key: 'f6_img', value: '/Sofa.webp' },
    
    // FOOTER
    { section: 'footer', key: 'email', value: 'info@legacymusik.sch.id' },
    { section: 'footer', key: 'hours', value: 'Senin - Sabtu <br/> 09.00 - 20.00 WIB' },
    { section: 'footer', key: 'phone', value: '(+62) 812-xxxx-xxxx' },
    { section: 'footer', key: 'address', value: 'Jl. Dr. Setiabudi No.31-29, Kesambi, <br/>Kec. Kesambi, Kota Cirebon, <br/>Jawa Barat 45134' },
    { section: 'footer', key: 'maps_url', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.339591456561!2d108.552994775042!3d-6.728286993268153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6ee268c17ec703%3A0xc3b8a1c97034b0bd!2sLegacy%20Music%20Center!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid' },
    { section: 'footer', key: 'instagram', value: 'https://www.instagram.com/legacy_music_center' },
    { section: 'footer', key: 'youtube', value: 'https://youtube.com/@LegacyMusicCenter' },
    { section: 'footer', key: 'whatsapp', value: 'https://api.whatsapp.com/send/?phone=62812xxxxxxxx' },

    // CHATBOT
    { section: 'chatbot', key: 'system_prompt', value: 'Kamu adalah asisten Legacy Musik School Tasikmalaya. Jawab pertanyaan calon siswa dengan ramah, singkat, dan persuasif tentang kursus musik yang tersedia. Jika ditanya di luar topik, arahkan kembali ke topik sekolah musik.' }
  ];

  for (const content of defaultLandingContent) {
    await prisma.landingContent.upsert({
      where: {
        section_key: {
          section: content.section,
          key: content.key
        }
      },
      update: {}, // Don't override if user already edited
      create: {
        section: content.section,
        key: content.key,
        value: content.value
      }
    });
  }

  console.log('Landing Content seeded! 🎨');
  console.log('Database has been completely seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
