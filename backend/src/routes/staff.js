import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize('STAFF', 'SUPER_ADMIN'));

// GET /api/staff/pending — List PENDING registrations
router.get('/pending', async (req, res, next) => {
  try {
    const pending = await prisma.user.findMany({
      where: { status: 'PENDING', role: 'STUDENT' },
      include: {
        studentProfile: {
          include: { enrollments: { include: { schedule: { include: { course: true } } } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pending);
  } catch (error) {
    next(error);
  }
});

// POST /api/staff/approve/:id — Approve PENDING → ACTIVE
router.post('/approve/:userId', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { status: 'ACTIVE' }
    });
    res.json({ message: 'Siswa berhasil di-approve', user });
  } catch (error) {
    next(error);
  }
});

// POST /api/staff/invoices/generate — Generate tagihan bulan ini
router.post('/invoices/generate', async (req, res, next) => {
  try {
    const { studentId } = req.body || {};
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const whereClause = {};
    if (studentId) {
      whereClause.id = studentId;
    } else {
      whereClause.user = { status: 'ACTIVE' };
    }

    const activeStudents = await prisma.studentProfile.findMany({
      where: whereClause,
      include: { 
        user: true,
        enrollments: {
          include: {
            schedule: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    let created = 0;
    for (const student of activeStudents) {
      const existing = await prisma.invoice.findUnique({
        where: { studentId_month_year: { studentId: student.id, month, year } }
      });
      
      let totalAmount = 0;
      if (student.enrollments && student.enrollments.length > 0) {
        totalAmount = student.enrollments.reduce((sum, enr) => sum + (enr.schedule?.course?.price || 0), 0);
      }
      
      if (!existing && totalAmount > 0) {
        await prisma.invoice.create({
          data: {
            studentId: student.id,
            month,
            year,
            amount: totalAmount,
            status: 'UNPAID'
          }
        });
        created++;
      }
    }

    res.json({ message: `Tagihan berhasil digenerate`, totalCreated: created });
  } catch (error) {
    next(error);
  }
});

// POST /api/staff/invoices/:id/pay — Tandai Lunas
router.post('/invoices/:id/pay', async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'PAID', paidAt: new Date() }
    });
    res.json({ message: 'Pembayaran ditandai lunas', invoice });
  } catch (error) {
    next(error);
  }
});

// GET /api/staff/invoices — All invoices
router.get('/invoices', async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { student: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// POST /api/staff/schedules — Create schedule (dengan conflict check Room)
router.post('/schedules', async (req, res, next) => {
  try {
    const { courseId, teacherId, classroomId, day, startTime, endTime } = req.body;

    // Room conflict check
    const conflict = await prisma.schedule.findFirst({
      where: {
        classroomId,
        day,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({
        message: `Ruangan bentrok di hari ${day} jam ${startTime}-${endTime}`,
        conflict
      });
    }

    const schedule = await prisma.schedule.create({
      data: { courseId, teacherId, classroomId, day, startTime, endTime }
    });
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

// GET /api/staff/schedules
router.get('/schedules', async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        course: true,
        teacher: { select: { id: true, name: true } },
        classroom: true,
        enrollments: { include: { student: { include: { user: { select: { name: true } } } } } }
      }
    });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

// GET /api/staff/dashboard-stats
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const pendingCount = await prisma.user.count({ where: { status: 'PENDING', role: 'STUDENT' } });
    
    // Get day name in indonesian (enum Day)
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const today = days[new Date().getDay()];
    
    const todaySchedules = await prisma.schedule.count({ where: { day: today } });
    const unpaidInvoices = await prisma.invoice.count({ where: { status: 'UNPAID' } });

    res.json({ pendingCount, todaySchedules, unpaidInvoices });
  } catch (error) { next(error); }
});

// POST /api/staff/enroll
router.post('/enroll', async (req, res, next) => {
  try {
    const { studentUserId, scheduleId } = req.body;
    
    // Get student profile
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId }
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        scheduleId
      }
    });
    res.status(201).json({ message: 'Student enrolled successfully', enrollment });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Student already enrolled in this schedule' });
    next(error);
  }
});

// PUT /api/staff/schedules/:id
router.put('/schedules/:id', async (req, res, next) => {
  try {
    const { courseId, teacherId, classroomId, day, startTime, endTime } = req.body;

    // Room conflict check excluding self
    const conflict = await prisma.schedule.findFirst({
      where: {
        classroomId,
        day,
        id: { not: req.params.id },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({
        message: `Ruangan bentrok di hari ${day} jam ${startTime}-${endTime}`
      });
    }

    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: { courseId, teacherId, classroomId, day, startTime, endTime }
    });
    res.json(schedule);
  } catch (error) { next(error); }
});

// DELETE /api/staff/schedules/:id
router.delete('/schedules/:id', async (req, res, next) => {
  try {
    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Schedule deleted' });
  } catch (error) { 
    if (error.code === 'P2003' || (error.message && error.message.includes('foreign key constraint'))) {
      return res.status(409).json({ message: 'Tidak dapat menghapus jadwal ini karena masih ada siswa yang terdaftar di dalamnya.' });
    }
    next(error); 
  }
});

// GET lookups for scheduling
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { name: 'asc' } });
    res.json(courses);
  } catch (error) { next(error); }
});

router.get('/classrooms', async (req, res, next) => {
  try {
    const classrooms = await prisma.classroom.findMany({ orderBy: { name: 'asc' } });
    res.json(classrooms);
  } catch (error) { next(error); }
});

router.get('/teachers', async (req, res, next) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER', status: 'ACTIVE' },
      select: { id: true, name: true }
    });
    res.json(teachers);
  } catch (error) { next(error); }
});

export default router;
