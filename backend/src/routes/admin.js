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
    const courses = await prisma.course.findMany({ orderBy: { name: 'asc' } });
    res.json(courses);
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

// User Management
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) { next(error); }
});

router.post('/users', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        role,
        status: 'ACTIVE',
        ...(role === 'TEACHER' && { teacherProfile: { create: {} } }),
        ...(role === 'STUDENT' && { studentProfile: { create: {} } })
      }
    });
    res.status(201).json(user);
  } catch (error) { next(error); }
});

router.put('/users/:id/role', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role }
    });
    res.json(user);
  } catch (error) { next(error); }
});

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
