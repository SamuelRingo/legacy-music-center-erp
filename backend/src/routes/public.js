import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

// GET /api/public/courses
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        schedules: {
          include: {
            teacher: { select: { name: true } }
          }
        }
      }
    });

    const formatted = courses.map(c => {
      const teacherMap = new Map();
      c.schedules.forEach(s => {
        if (s.teacher) {
          teacherMap.set(s.teacher.name, { name: s.teacher.name });
        }
      });
      return {
        ...c,
        teachers: Array.from(teacherMap.values())
      };
    });

    res.json(formatted);
  } catch (error) { next(error); }
});

// POST /api/public/chatbot
router.post('/chatbot', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    if (!genAI) return res.status(500).json({ error: 'Gemini not configured' });

    let systemPrompt = 'Kamu adalah asisten Legacy Musik School. Jawab pertanyaan dengan ramah.';
    try {
      const dbPrompt = await prisma.landingContent.findUnique({
        where: { section_key: { section: 'chatbot', key: 'system_prompt' } }
      });
      if (dbPrompt && dbPrompt.value) systemPrompt = dbPrompt.value;
    } catch (e) {
      console.warn('Failed to fetch chatbot prompt from DB, using fallback');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `${systemPrompt}\nPertanyaan: ${message}`;
    
    const result = await model.generateContent(prompt);
    const reply = await result.response.text();
    res.json({ reply });
  } catch (error) {
    console.error('ChatBot Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process message', details: error.toString() });
  }
});

// GET /api/public/landing-content
router.get('/landing-content', async (req, res, next) => {
  try {
    const { section } = req.query;
    const where = section ? { section } : {};
    
    const contents = await prisma.landingContent.findMany({ where });
    res.json(contents);
  } catch (error) { next(error); }
});

export default router;
