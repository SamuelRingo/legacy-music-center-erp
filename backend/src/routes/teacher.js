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

// GET /api/teacher/schedules/:scheduleId/students — Students and details for a schedule
router.get('/schedules/:scheduleId/students', async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.scheduleId },
      include: { course: true }
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { scheduleId: req.params.scheduleId },
      include: { 
        student: { include: { user: { select: { name: true } } } },
        finalGrades: true
      }
    });

    res.json({ schedule, enrollments });
  } catch (error) {
    next(error);
  }
});

// GET /api/teacher/schedules/:scheduleId/meetings — List meetings
router.get('/schedules/:scheduleId/meetings', async (req, res, next) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { scheduleId: req.params.scheduleId },
      include: { attendances: true },
      orderBy: { meetingDate: 'asc' }
    });
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

// POST /api/teacher/schedules/:scheduleId/meetings — Create meeting
router.post('/schedules/:scheduleId/meetings', async (req, res, next) => {
  try {
    const { meetingDate } = req.body;
    const scheduleId = req.params.scheduleId;

    const count = await prisma.meeting.count({ where: { scheduleId } });
    
    const meeting = await prisma.meeting.create({
      data: {
        scheduleId,
        title: `Pertemuan ke-${count + 1}`,
        meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
      }
    });

    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/teacher/meetings/:meetingId — Delete a meeting
router.delete('/meetings/:meetingId', async (req, res, next) => {
  try {
    const meetingId = req.params.meetingId;
    
    await prisma.$transaction([
      prisma.meetingAttendance.deleteMany({ where: { meetingId } }),
      prisma.meeting.delete({ where: { id: meetingId } })
    ]);
    
    res.json({ message: 'Pertemuan berhasil dihapus' });
  } catch (error) {
    next(error);
  }
});

// GET /api/teacher/meetings/:meetingId — Detail meeting + attendance
router.get('/meetings/:meetingId', async (req, res, next) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.meetingId },
      include: {
        schedule: { 
          include: { 
            course: true,
            enrollments: {
              include: { student: { include: { user: { select: { name: true } } } } }
            }
          } 
        },
        attendances: {
          include: {
            enrollment: {
              include: { student: { include: { user: { select: { name: true } } } } }
            }
          }
        }
      }
    });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

// PUT /api/teacher/meetings/:meetingId/journal — Update journal
router.put('/meetings/:meetingId/journal', async (req, res, next) => {
  try {
    const { journal } = req.body;
    const meeting = await prisma.meeting.update({
      where: { id: req.params.meetingId },
      data: { journal }
    });
    res.json({ message: 'Jurnal diperbarui', meeting });
  } catch (error) {
    next(error);
  }
});

// POST /api/teacher/meetings/:meetingId/attendance — Bulk upsert attendance
router.post('/meetings/:meetingId/attendance', async (req, res, next) => {
  try {
    const { attendances } = req.body; // [{ enrollmentId, status, note }]
    const meetingId = req.params.meetingId;

    // Use a transaction to upsert multiple
    await prisma.$transaction(
      attendances.map(att => 
        prisma.meetingAttendance.upsert({
          where: {
            meetingId_enrollmentId: {
              meetingId,
              enrollmentId: att.enrollmentId
            }
          },
          update: { status: att.status, note: att.note },
          create: {
            meetingId,
            enrollmentId: att.enrollmentId,
            status: att.status,
            note: att.note || null
          }
        })
      )
    );

    res.json({ message: 'Presensi tersimpan' });
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
