import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { parse } from 'csv-parse/sync';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// CRUD Courses
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        schedules: {
          include: {
            teacher: { select: { id: true, name: true } }
          }
        }
      }
    });

    const formatted = courses.map(c => {
      const teacherMap = new Map();
      c.schedules.forEach(s => {
        if (s.teacher) teacherMap.set(s.teacher.id, s.teacher.name);
      });
      const { schedules, ...rest } = c;
      return {
        ...rest,
        teachers: Array.from(teacherMap.values())
      };
    });

    res.json(formatted);
  } catch (error) { next(error); }
});

router.post('/courses', async (req, res, next) => {
  try {
    const course = await prisma.course.create({ data: req.body });
    res.status(201).json(course);
  } catch (error) { next(error); }
});

router.put('/courses/:id', async (req, res, next) => {
  try {
    const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
    res.json(course);
  } catch (error) { next(error); }
});

router.delete('/courses/:id', async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
});

// CRUD Classrooms
router.get('/classrooms', async (req, res, next) => {
  try {
    const classrooms = await prisma.classroom.findMany({ orderBy: { name: 'asc' } });
    res.json(classrooms);
  } catch (error) { next(error); }
});

router.post('/classrooms', async (req, res, next) => {
  try {
    const classroom = await prisma.classroom.create({ data: req.body });
    res.status(201).json(classroom);
  } catch (error) { next(error); }
});

router.put('/classrooms/:id', async (req, res, next) => {
  try {
    const classroom = await prisma.classroom.update({ where: { id: req.params.id }, data: req.body });
    res.json(classroom);
  } catch (error) { next(error); }
});

router.delete('/classrooms/:id', async (req, res, next) => {
  try {
    await prisma.classroom.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
});

// Dashboard Stats
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const activeStudents = await prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER', status: 'ACTIVE' } });
    const pendingApprovals = await prisma.user.count({ where: { role: 'STUDENT', status: 'PENDING' } });
    
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const today = days[new Date().getDay()];
    const todaySchedules = await prisma.schedule.count({ where: { day: today } });

    res.json({ activeStudents, totalTeachers, pendingApprovals, todaySchedules });
  } catch (error) { next(error); }
});

// User Management
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, name: true, email: true, role: true, status: true, createdAt: true,
        studentProfile: { select: { parentPhone: true, address: true, _count: { select: { enrollments: true } } } },
        teacherProfile: { select: { specialization: true } },
        _count: { select: { schedules: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) { next(error); }
});

router.post('/users', async (req, res, next) => {
  try {
    const { name, email, password, role, status, parentPhone, address, specialization } = req.body;
    
    // Validasi
    if (role === 'STUDENT' && (!parentPhone || !address)) {
      return res.status(400).json({ message: 'No HP Orang Tua dan Alamat wajib diisi untuk Siswa.' });
    }
    if (role === 'TEACHER' && !specialization) {
      return res.status(400).json({ message: 'Spesialisasi wajib diisi untuk Guru.' });
    }

    const finalStatus = role === 'STUDENT' ? (status || 'ACTIVE') : 'ACTIVE';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        role,
        status: finalStatus,
        ...(role === 'TEACHER' && { teacherProfile: { create: { specialization } } }),
        ...(role === 'STUDENT' && { studentProfile: { create: { parentPhone, address } } })
      }
    });
    res.status(201).json(user);
  } catch (error) { next(error); }
});

router.put('/users/:id/role', async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const newRole = req.body.role;
    const currentAdminId = req.user.id;

    if (targetId === currentAdminId) {
      return res.status(400).json({ error: 'Tidak bisa mengubah role diri sendiri' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser) return res.status(404).json({ error: 'User tidak ditemukan' });

    if (targetUser.role === 'SUPER_ADMIN') {
      const saCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
      if (saCount <= 1) {
        return res.status(400).json({ error: 'Tidak bisa men-demote Super Admin terakhir' });
      }
      // Ensure only SUPER_ADMIN can demote another SUPER_ADMIN (already guarded by router.use(authorize('SUPER_ADMIN')))
    }

    // Validations
    if (targetUser.role === 'STUDENT' && newRole !== 'STUDENT') return res.status(400).json({ error: 'Role Siswa tidak bisa diubah ke role lain' });
    if (targetUser.role === 'TEACHER' && !['TEACHER', 'STAFF'].includes(newRole)) return res.status(400).json({ error: 'Guru hanya bisa menjadi Staff' });
    if (targetUser.role === 'STAFF' && !['STAFF', 'TEACHER'].includes(newRole)) return res.status(400).json({ error: 'Staff hanya bisa menjadi Guru' });

    const user = await prisma.user.update({
      where: { id: targetId },
      data: { role: newRole }
    });
    res.json(user);
  } catch (error) { next(error); }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const { name, email, status, parentPhone, address, specialization } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        status,
      },
      include: { studentProfile: true, teacherProfile: true }
    });

    if (user.role === 'STUDENT' && user.studentProfile) {
      await prisma.studentProfile.update({
        where: { userId: user.id },
        data: { parentPhone, address }
      });
    } else if (user.role === 'TEACHER' && user.teacherProfile) {
      await prisma.teacherProfile.update({
        where: { userId: user.id },
        data: { specialization }
      });
    }

    res.json({ message: 'User updated' });
  } catch (error) { next(error); }
});

// DELETE User
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Cannot delete self
    if (req.user.id === id) {
      return res.status(403).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri' });
    }

    // 2. Prevent deleting the last Super Admin
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (userToDelete.role === 'SUPER_ADMIN') {
      const saCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
      if (saCount <= 1) {
        return res.status(403).json({ message: 'Tidak dapat menghapus Super Admin terakhir' });
      }
    }

    // 3. Cascade Delete
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    next(error);
  }
});

// Admin Reset Password
router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword }
    });
    res.json({ message: 'Password direset' });
  } catch (error) { next(error); }
});

// Batch CSV Import Siswa
router.post('/import-csv', async (req, res, next) => {
  try {
    const { csvData } = req.body; // CSV as string

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const users = [];
    for (const row of records) {
      const hashedPassword = await bcrypt.hash(row.password || 'default123', 10);
      users.push({
        name: row.name,
        email: row.email,
        password: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        studentProfile: {
          create: {
            parentPhone: row.parentPhone || null,
            address: row.address || null
          }
        }
      });
    }

    // Gunakan createMany untuk efisiensi, tapi profile dibuat manual
    // Karena createMany tidak support nested create
    let created = 0;
    for (const userData of users) {
      const existing = await prisma.user.findUnique({ where: { email: userData.email } });
      if (!existing) {
        await prisma.user.create({ data: userData });
        created++;
      }
    }

    res.json({ message: `Berhasil import ${created} siswa` });
  } catch (error) {
    next(error);
  }
});

// CMS — Event Banners (placeholder — actual upload handled via Supabase SDK)
router.post('/events', async (req, res, next) => {
  try {
    const { title, description, imageUrl } = req.body;
    const event = await prisma.eventBanner.create({
      data: { title, description, imageUrl }
    });
    res.status(201).json(event);
  } catch (error) { next(error); }
});

router.get('/events', async (req, res, next) => {
  try {
    const events = await prisma.eventBanner.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(events);
  } catch (error) { next(error); }
});

router.delete('/events/:id', async (req, res, next) => {
  try {
    await prisma.eventBanner.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
});

export default router;
