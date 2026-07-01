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
    const { attendances } = req.body;
    // attendances: [{ enrollmentId, status, journal }]

    const created = await prisma.attendance.createMany({
      data: attendances.map(a => ({
        enrollmentId: a.enrollmentId,
        status: a.status,
        journal: a.journal || null,
        date: new Date()
      }))
    });

    res.status(201).json({ message: 'Presensi tersimpan', count: created.count });
  } catch (error) {
    next(error);
  }
});

// GET /api/teacher/enrollments/:scheduleId — Students in a schedule
router.get('/enrollments/:scheduleId', async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { scheduleId: req.params.scheduleId },
      include: { student: { include: { user: { select: { name: true } } } } }
    });
    res.json(enrollments);
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
