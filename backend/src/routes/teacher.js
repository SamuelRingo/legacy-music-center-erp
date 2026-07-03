import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize('TEACHER'));

// GET /api/teacher/schedules — My teaching schedule
router.get('/schedules', async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { teacherId: req.user.id },
      include: {
        course: true,
        classroom: true,
        enrollments: {
          include: { student: { include: { user: { select: { name: true } } } } }
        }
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }]
    });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

// POST /api/teacher/attendance — Submit presensi + jurnal
router.post('/attendance', async (req, res, next) => {
  try {
    const { attendances, date } = req.body;
    // attendances: [{ enrollmentId, status, journal }]
    
    const attendanceDate = date ? new Date(date) : new Date();

    const created = await prisma.attendance.createMany({
      data: attendances.map(a => ({
        enrollmentId: a.enrollmentId,
        status: a.status,
        journal: a.journal || null,
        date: attendanceDate
      }))
    });

    res.status(201).json({ message: 'Presensi tersimpan', count: created.count });
  } catch (error) {
    next(error);
  }
});

// GET /api/teacher/enrollments/:scheduleId — Students and details for a schedule
router.get('/enrollments/:scheduleId', async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.scheduleId },
      include: { course: true }
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { scheduleId: req.params.scheduleId },
      include: { student: { include: { user: { select: { name: true } } } } }
    });

    res.json({ schedule, enrollments });
  } catch (error) {
    next(error);
  }
});

// POST /api/teacher/grades — Submit final grade
router.post('/grades', async (req, res, next) => {
  try {
    const { enrollmentId, score, evaluation } = req.body;

    if (score < 0 || score > 100) {
      return res.status(400).json({ message: 'Skor harus antara 0-100' });
    }

    const grade = await prisma.finalGrade.upsert({
      where: { enrollmentId },
      update: { score, evaluation },
      create: { enrollmentId, score, evaluation }
    });

    res.json({ message: 'Nilai tersimpan', grade });
  } catch (error) {
    next(error);
  }
});

export default router;
