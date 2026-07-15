import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY || '';

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
    if (!apiKey) return res.status(500).json({ error: 'Gemini not configured' });
    let systemPrompt = `Kamu adalah Customer Service Legacy Musik School. TUGAS UTAMA: Jawab pesan pengguna langsung ke intinya.

ATURAN SUPER KETAT:
1. JANGAN PERNAH menampilkan proses berpikir, analisis, opsi, persona, tone, atau terjemahan.
2. LANGSUNG tulis teks balasan akhir yang siap dibaca oleh pengguna.
3. Maksimal 1-3 kalimat saja.
4. Gunakan bahasa Indonesia yang ramah.
5. Jika bertanya tentang kursus/biaya, jawab singkat dan arahkan ke WA 0812-xxxx-xxxx.
6. DILARANG KERAS menggunakan format bullet points atau awalan seperti "User input", "Option", atau "Tone".`;

    try {
      const dbPrompt = await prisma.landingContent.findUnique({
        where: { section_key: { section: 'chatbot', key: 'system_prompt' } }
      });
      if (dbPrompt && dbPrompt.value) {
        systemPrompt = dbPrompt.value + `\n\nATURAN SISTEM (WAJIB DIIKUTI):
1. JANGAN PERNAH menampilkan proses berpikir, analisis, atau opsi.
2. LANGSUNG berikan teks balasan akhir.
3. Maksimal 1-3 kalimat.
4. DILARANG menggunakan awalan seperti "User input", "Option", atau "Tone".`;
      }
    } catch (e) {
      console.warn('Failed to fetch chatbot prompt from DB, using fallback');
    }

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent',
      { 
        system_instruction: { parts: { text: systemPrompt } },
        contents: [{ parts: [{ text: message }] }]
      },
      { headers: { 'Content-Type': 'application/json' }, params: { key: apiKey } }
    );
    
    let replyText = response.data.candidates[0].content.parts[0].text;
    console.log('Raw response:', replyText);

    let reply = replyText.trim();
    
    // Cleanup if model accidentally outputs markdown json block
    if (reply.startsWith('```json')) {
      try {
        const jsonStr = reply.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        reply = parsed.response || jsonStr;
      } catch (e) {}
    } else if (reply.startsWith('{') && reply.endsWith('}')) {
      try {
        const parsed = JSON.parse(reply);
        reply = parsed.response || reply;
      } catch (e) {}
    }
    
    // Fallback jika jawaban kosong, "...", atau berisi meta-thinking
    const isGarbage = reply.includes('*   ') || reply.includes('Option') || reply.includes('Tone:') || reply.includes('Persona:') || reply.includes("User's input");
    if (!reply || reply === '...' || isGarbage) {
      reply = "Maaf, saya tidak mengerti. Silakan hubungi WA 0812-xxxx-xxxx untuk bantuan langsung.";
    }

    res.json({ reply });
  } catch (error) {
    console.error('ChatBot Error:', error?.response?.data || error);
    
    let userMessage = "Terjadi kesalahan pada server.";
    const status = error?.response?.status;
    
    if (status === 400 || status === 403 || status === 404) {
      userMessage = "Kunci API tidak valid. Hubungi administrator.";
    } else if (status === 429) {
      userMessage = "Maaf, sistem sedang sibuk. Silakan coba lagi nanti.";
    } else if (error.request && !error.response) {
      userMessage = "Gagal terhubung ke server AI. Periksa koneksi internet.";
    } else {
      userMessage = error.message;
    }
    
    res.status(500).json({ 
      error: userMessage, 
      details: error?.response?.data || error.toString() 
    });
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
