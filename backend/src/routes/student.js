import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { supabase, getSignedUrl } from '../lib/supabase.js';

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

    for (const inv of invoices) {
      if (inv.proofUrl && supabase && !inv.proofUrl.startsWith('http')) {
        const signedUrl = await getSignedUrl('payment-proofs', inv.proofUrl);
        if (signedUrl) inv.proofUrl = signedUrl;
      }
    }

    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

// GET /api/student/progress — Consolidated progress (meetings + final grade)
router.get('/progress', async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: profile.id },
      include: {
        schedule: {
          include: { 
            course: true,
            teacher: { select: { name: true } }
          }
        },
        meetingAttendances: {
          include: { meeting: true },
          orderBy: { meeting: { meetingDate: 'asc' } }
        },
        finalGrades: true
      }
    });
    res.json(enrollments);
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

// POST /api/student/invoices/:id/proof — Upload bukti transfer
router.post('/invoices/:id/proof', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Bukti transfer wajib diisi' });

    let filePath = null;
    if (supabase) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      filePath = `proofs/${req.user.id}/${Date.now()}.jpg`;
      
      const { error } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, buffer, { contentType: 'image/jpeg' });
        
      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ message: 'Gagal upload bukti transfer ke storage' });
      }
    } else {
      filePath = 'mock-path.jpg';
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { proofUrl: filePath }
    });

    res.json(invoice);
  } catch (error) { next(error); }
});

// ==================== PHASE 3 ====================

// GET /api/student/achievements
router.get('/achievements', async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const achievements = await prisma.studentAchievement.findMany({
      where: { studentId: profile.id },
      orderBy: { date: 'desc' }
    });
    res.json(achievements);
  } catch (error) {
    next(error);
  }
});

export default router;
