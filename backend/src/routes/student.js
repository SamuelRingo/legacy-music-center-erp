import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize('STUDENT'));

// GET /api/student/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: profile.id },
      include: {
        schedule: {
          include: { course: true, classroom: true, teacher: { select: { name: true } } }
        }
      }
    });

    res.json({ user: req.user, enrollments });
  } catch (error) {
    next(error);
  }
});

// GET /api/student/invoices
router.get('/invoices', async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const invoices = await prisma.invoice.findMany({
      where: { studentId: profile.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// GET /api/student/progress — Attendance + journals
router.get('/progress', async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const attendances = await prisma.attendance.findMany({
      where: { enrollment: { studentId: profile.id } },
      include: {
        enrollment: {
          include: { schedule: { include: { course: true } } }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(attendances);
  } catch (error) {
    next(error);
  }
});

// GET /api/student/grades
router.get('/grades', async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const grades = await prisma.finalGrade.findMany({
      where: { enrollment: { studentId: profile.id } },
      include: {
        enrollment: {
          include: { schedule: { include: { course: true } } }
        }
      }
    });
    res.json(grades);
  } catch (error) {
    next(error);
  }
});

export default router;
