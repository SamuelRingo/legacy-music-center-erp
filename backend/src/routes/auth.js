import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/register (self-serve — status PENDING)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, scheduleId, parentPhone, address } = req.body;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Check phone number format
    if (parentPhone && !/^\+62[0-9]{9,13}$/.test(parentPhone)) {
      return res.status(400).json({ message: "Format nomor HP tidak valid (harus diawali +62 dan berisi 9-13 angka)" });
    }

    // Check schedule availability (Room conflict only)
    if (scheduleId) {
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { classroom: true, enrollments: true }
      });
      if (!schedule) {
        return res.status(400).json({ message: 'Jadwal tidak ditemukan' });
      }
      if (schedule.enrollments.length >= schedule.classroom.capacity) {
        return res.status(400).json({ message: 'Kelas sudah penuh' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user + student profile + enrollment in transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        status: 'PENDING',
        studentProfile: {
          create: { parentPhone, address }
        }
      }
    });

    // If schedule selected, create enrollment
    if (scheduleId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id }
      });
      await prisma.enrollment.create({
        data: {
          studentId: studentProfile.id,
          scheduleId
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Pendaftaran berhasil. Silakan lanjutkan pembayaran.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Check if PENDING students can login
    if (user.status === 'PENDING') {
      return res.status(403).json({ message: 'Akun masih menunggu validasi staff' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true, status: true,
      studentProfile: true,
      teacherProfile: true
    }
  });
  res.json(user);
});

export default router;
