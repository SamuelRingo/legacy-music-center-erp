import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/public/events — Event banners for landing page
router.get('/events', async (req, res, next) => {
  try {
    const events = await prisma.eventBanner.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json(events);
  } catch (error) { next(error); }
});

// GET /api/public/schedules — Available schedules (for registration form)
router.get('/schedules', async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        course: true,
        classroom: true,
        teacher: { select: { name: true } },
        _count: { select: { enrollments: true } }
      }
    });

    // Filter yang masih ada slot
    const available = schedules.filter(
      s => s._count.enrollments < s.classroom.capacity
    );

    res.json(available);
  } catch (error) { next(error); }
});

export default router;
