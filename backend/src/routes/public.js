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
    let systemPrompt = `Kamu adalah asisten FAQ (Tanya Jawab) untuk Legacy Music Center,
sebuah sekolah musik di Cirebon.

ATURAN WAJIB:
- Jawab HANYA 1-2 kalimat singkat dalam bahasa Indonesia.
- Jika pengguna menyapa (Halo, Hai, dll), balas dengan sapaan singkat
  dan tawarkan bantuan.
- Jika pengguna bertanya tentang kursus yang tersedia, JAWAB:
  'Kami menyediakan kursus Piano, Gitar, Biola, Vokal, Drum, dan lainnya.
  Untuk info lengkap, klik menu Kursus di halaman utama.'
- Jika pengguna bertanya tentang biaya/harga, JAWAB:
  'Biaya kursus mulai dari Rp 300.000 per bulan. Untuk detailnya,
  silakan hubungi WA 0812-xxxx-xxxx atau klik Daftar di halaman utama.'
- Jika pengguna bertanya tentang cara daftar, JAWAB:
  'Anda bisa mendaftar langsung melalui menu Daftar di website kami.
  Setelah mendaftar, silakan hubungi WA 0812-xxxx-xxxx untuk konsultasi
  kelas dan jadwal.'
- Jika pengguna bertanya tentang jadwal, JAWAB:
  'Jadwal kelas fleksibel, Senin sampai Sabtu. Silakan hubungi
  WA 0812-xxxx-xxxx untuk menyesuaikan jadwal Anda.'
- Jika pertanyaan DI LUAR topik di atas (seperti instrumen dijual,
  model AI, cuaca, dll), JAWAB:
  'Maaf, saya hanya bisa membantu seputar kursus musik di Legacy Music
  Center. Silakan hubungi WA 0812-xxxx-xxxx untuk pertanyaan lainnya.'
- JANGAN menawarkan produk, instrumen untuk dijual, atau informasi
  di luar kursus musik.
- JANGAN menggunakan lebih dari 2 kalimat.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent',
      { 
        system_instruction: { parts: { text: systemPrompt } },
        contents: [{ parts: [{ text: message }] }]
      },
      { headers: { 'Content-Type': 'application/json' }, params: { key: apiKey } }
    );
    
    console.log('RAW MODEL RESPONSE:', JSON.stringify(response.data, null, 2));

    let replyText = response.data.candidates[0].content.parts[0].text;
    console.log('Raw response text:', replyText);

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

    // Filter baris yang berisi meta-thinking (chain of thought)
    const lines = reply.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const validLines = lines.filter(line => {
      const lower = line.toLowerCase();
      if (
        lower.includes('option') ||
        lower.includes('role:') ||
        lower.includes('tone:') ||
        lower.includes('user input') ||
        lower.includes('constraint') ||
        lower.includes('draft') ||
        lower.includes('meta-thinking') ||
        lower.includes('persona:') ||
        lower.includes('style:') ||
        lower.includes('target topic:') ||
        lower.includes('rule for') ||
        lower.includes('length:') ||
        lower.includes('language:') ||
        lower.includes('accuracy:') ||
        lower.includes('sentences?') ||
        lower.includes('does it') ||
        lower.includes('matches') ||
        lower.includes('instruction') ||
        lower.includes('rule') ||
        lower.includes('yes.') ||
        lower.includes('no.') ||
        lower.includes('content:') ||
        lower.includes('greeting') ||
        lower.includes('offer help')
      ) {
        return false;
      }
      return true;
    });

    if (validLines.length > 0) {
      // Ambil baris terakhir yang tersisa dan bersihkan dari asterisk, strip, spasi
      reply = validLines[validLines.length - 1].replace(/^[\*\-\s]+/, '');
      // Bersihkan catatan di akhir baris seperti "(Short, greets, offers help)."
      reply = reply.replace(/\s*\([^)]+\)\.?$/, '');
      // Bersihkan tanda kutip awal/akhir
      reply = reply.replace(/^["']|["']$/g, '').trim();
      // Bersihkan tanda kutip tertinggal jika polanya `?" (note)`
      reply = reply.replace(/["']$/, '').trim();
    } else {
      reply = "";
    }
    
    // Fallback jika jawaban kosong, "...", atau tidak ada yang tersisa setelah difilter
    if (!reply || reply === '...') {
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
