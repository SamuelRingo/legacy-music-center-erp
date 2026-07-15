import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { parse } from 'csv-parse/sync';
import { getStudentDetail, getTransactions, createTransaction, updateTransaction, getInventory, createInventoryItem, updateInventoryItem } from './shared.js';

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
            teacher: { select: { id: true, name: true } },
            _count: { select: { enrollments: true } }
          }
        }
      }
    });

    const formatted = courses.map(c => {
      const teacherMap = new Map();
      let studentCount = 0;
      c.schedules.forEach(s => {
        if (s.teacher) teacherMap.set(s.teacher.id, s.teacher.name);
        studentCount += (s._count?.enrollments || 0);
      });
      const { schedules, ...rest } = c;
      return {
        ...rest,
        studentCount,
        teachers: Array.from(teacherMap.values())
      };
    });

    res.json(formatted);
  } catch (error) { next(error); }
});

router.get('/courses/:id/students', async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { courseId: req.params.id },
      include: {
        teacher: { select: { name: true } },
        enrollments: {
          include: {
            student: { select: { name: true } },
            finalGrade: true
          }
        }
      }
    });

    const students = [];
    schedules.forEach(sched => {
      sched.enrollments.forEach(enr => {
        students.push({
          enrollmentId: enr.id,
          studentName: enr.student?.name || 'Unknown',
          scheduleName: sched.name,
          teacherName: sched.teacher?.name || '-',
          grade: enr.finalGrade ? enr.finalGrade.score : '-'
        });
      });
    });

    res.json(students);
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

// ==================== PHASE 3 ====================

// Shared Endpoints
router.get('/students/:id', getStudentDetail);
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.get('/inventory', getInventory);
router.post('/inventory', createInventoryItem);
router.put('/inventory/:id', updateInventoryItem);

// Admin specific endpoints
router.get('/students/:id/achievements', async (req, res, next) => {
  try {
    const achievements = await prisma.studentAchievement.findMany({
      where: { student: { userId: req.params.id } },
      orderBy: { date: 'desc' }
    });
    res.json(achievements);
  } catch (error) { next(error); }
});

router.post('/students/:id/achievements', async (req, res, next) => {
  try {
    const { title, description, date } = req.body;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.params.id } });
    if (!profile) return res.status(404).json({ message: 'Profil siswa tidak ditemukan' });

    const achievement = await prisma.studentAchievement.create({
      data: {
        studentId: profile.id,
        title,
        description,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(achievement);
  } catch (error) { next(error); }
});

router.delete('/achievements/:id', async (req, res, next) => {
  try {
    await prisma.studentAchievement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) { next(error); }
});

// Get attendance by date
router.get('/staff-attendance', async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const targetDate = new Date(date);
    
    // Get all staff and teachers
    const users = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'TEACHER'] } },
      select: { id: true, name: true, role: true }
    });

    // Get attendance for this date
    const startOfDay = new Date(targetDate.setHours(0,0,0,0));
    const endOfDay = new Date(targetDate.setHours(23,59,59,999));
    
    const attendances = await prisma.staffAttendance.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } }
    });

    // Merge them
    const result = users.map(user => {
      const att = attendances.find(a => a.userId === user.id);
      return {
        userId: user.id,
        name: user.name,
        role: user.role,
        status: att ? att.status : 'PRESENT', // default to PRESENT in UI, but return actual from DB
        dbStatus: att ? att.status : null,
        note: att ? att.note : ''
      };
    });

    res.json(result);
  } catch (error) { next(error); }
});

// Upsert bulk attendance
router.post('/staff-attendance', async (req, res, next) => {
  try {
    const attendances = req.body; // Array of { userId, date, status, note }
    
    for (const item of attendances) {
      const targetDate = new Date(item.date);
      targetDate.setHours(12,0,0,0); // Ensure no timezone date shift issues

      await prisma.staffAttendance.upsert({
        where: {
          userId_date: {
            userId: item.userId,
            date: targetDate
          }
        },
        update: {
          status: item.status,
          note: item.note
        },
        create: {
          userId: item.userId,
          date: targetDate,
          status: item.status,
          note: item.note
        }
      });
    }
    
    res.json({ message: 'Success' });
  } catch (error) { next(error); }
});

// Get attendance history
router.get('/staff-attendance/history', async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const attendances = await prisma.staffAttendance.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { date: 'desc' }
    });
    
    res.json(attendances);
  } catch (error) { next(error); }
});

router.get('/staff-salaries', async (req, res, next) => {
  try {
    const { month, year } = req.query;
    let where = {};
    if (month && year) {
      where = { month: parseInt(month), year: parseInt(year) };
    }
    const salaries = await prisma.staffSalary.findMany({
      where,
      include: { user: { select: { name: true, role: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
    res.json(salaries);
  } catch (error) { next(error); }
});

router.post('/staff-salaries', async (req, res, next) => {
  try {
    const { userId, month, year, amount, bonus, note } = req.body;
    const salary = await prisma.staffSalary.upsert({
      where: {
        userId_month_year: {
          userId, month: parseInt(month), year: parseInt(year)
        }
      },
      update: { amount: parseFloat(amount), bonus: parseFloat(bonus || 0), note },
      create: { userId, month: parseInt(month), year: parseInt(year), amount: parseFloat(amount), bonus: parseFloat(bonus || 0), note }
    });
    res.status(201).json(salary);
  } catch (error) { next(error); }
});

export default router;
