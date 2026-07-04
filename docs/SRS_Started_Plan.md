# SOFTWARE REQUIREMENT SPECIFICATION (MVP) — FINAL REVISED

**Project:** Legacy Musik School ERP (Tasikmalaya)
**Target:** 11 Hari (Juli 2026)
**Status:** FINAL — Semua revisi telah di-incorporate
**Testing:** Vercel (Serverless) + Supabase
**Production:** Docker

---

## 1. TECH STACK & ARCHITECTURE

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + TailwindCSS + shadcn/ui |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | JWT Access Token (24h expiry) + RBAC |
| File Storage | Supabase Storage (`payment-proofs`, `event-banners`) |
| PDF Reports | react-to-print (frontend only — backend tidak parsing PDF) |
| Batch Import | CSV upload → `prisma.createMany()` |
| Shared UI | Komponen Table dipakai bersama Admin & Staff, action buttons disembunyikan berdasarkan role |

### Strategic Constraints (MVP)
- **Tidak ada Gantt Chart.** Semua jadwal ditampilkan dalam tabel biasa.
- **Tidak ada dynamic columns.** Skema tabel fixed, tambah data = tambah baris via form atau CSV import.
- **Tidak ada Refresh Token.** Access token 24 jam, expired → login ulang.
- **Conflict check sederhana.** Hanya cek Room overlap (tidak cek Teacher/Student overlap).
- **Generate Tagihan manual.** Staff klik tombol, tidak ada cron job.
- **Template CSV (bukan XLSX).** Disediakan file CSV template untuk import siswa.

---

## 2. ROLE DEFINITIONS (OWNER-CENTRIC)

| Role | Filosofi Bisnis | Deskripsi |
|---|---|---|
| **SUPER ADMIN** | Owner / Kepala Sekolah | Kontrol penuh atas sistem & data master. Bisa melihat semua laporan dan bertindak sebagai backup Staff. |
| **STAFF** | Resepsionis / Operasional | **Primary executor** semua tugas administratif harian: approval, scheduling, invoice, pembayaran. |
| **TEACHER** | Guru | Eksekusi akademik: presensi, jurnal harian, penilaian akhir. |
| **STUDENT** | Murid | Konsumsi data: lihat jadwal, tagihan, progres belajar, rapor. |

### Boundary Rules
- **Staff** menjalankan operasional penuh: approval siswa, scheduling lengkap (guru + ruangan + jam + murid), invoice, pembayaran.
- **Super Admin** bisa semua yang Staff bisa (sebagai backup), plus akses data master & manajemen akun (bikin/hapus akun guru/staff, reset password, struktur data).
- **Teacher** hanya mengelola kelasnya sendiri, tidak bisa melihat data teacher lain.
- **Student** hanya melihat data miliknya sendiri.

---

## 3. ROLE-BASED ACCESS CONTROL MATRIX

| No | Tugas | SA | Staff | Guru | Murid |
|---|---|---|---|---|---|
| 1 | Approval Pendaftaran Siswa | 1 | 1 | 3 | 3 |
| 2 | Atur Jadwal Kelas + Guru | 1 | 1 | 3 | 3 |
| 3 | Kelola Tagihan (Generate + Tandai Lunas) | 1 | 1 | 3 | 3 |
| 4 | Upload Event + CMS Landing Page | 1 | 1 | 3 | 3 |
| 5 | Bikin Akun Guru/Staff | 1 | 3 | 3 | 3 |
| 6 | Reset Password Pengguna | 1 | 1 | 3 | 3 |
| 7 | Atur Struktur Data Master (Courses, Rooms) | 1 | 3 | 3 | 3 |
| 8 | Akses Laporan Keuangan | 1 | 1 | 3 | 3 |
| 9 | Lihat Jadwal | 1 | 1 | 1 | 1 |
| 10 | Presensi & Jurnal (Input) | 2 | 2 | 1 | 3 |
| 11 | Penilaian & Rapor (Input) | 2 | 2 | 1 | 3 |
| 12 | Atur Profil Sendiri | 1 | 1 | 1 | 1 |
| 13 | Lihat Tagihan Sendiri | 1 | 1 | 3 | 1 |
| 14 | Lihat Jurnal & Progres Belajar | 1 | 1 | 1 | 1 |

### Access Level Key
| Kode | Level | Warna | Arti |
|---|---|---|---|
| 1 | Full Access | 🟢 Hijau | Bisa lihat, tambah, edit, hapus |
| 2 | View Only | 🟡 Kuning | Hanya bisa melihat data terkait |
| 3 | No Access | 🔴 Merah | Tidak bisa mengakses sama sekali |

### Catatan Matrix
- **Row 6 (Reset Password):** Staff = 1 untuk MVP. Idealnya nanti Staff hanya bisa reset password murid, bukan guru/staff lain. Refine post-MVP.
- **Row 10-11 (Presensi, Penilaian):** SA & Staff = 2 (view only rekap). Guru = 1 (input & edit). Ini sudah benar — yang mengisi hanya guru.
- **Row 13-14:** Dua baris ini yang membuat Student Dashboard bermakna. Tanpa ini, murid login hanya melihat jadwal kosong.

---

## 4. FEATURES LIST

### 0. Public Facing (The Front Door)
- **Landing Page:** UI statis dengan informasi sekolah dan section Event/Acara terbaru.
- **Self-Serve Registration:** Form publik (Nama, Email, Password).
  - Tidak memilih kelas saat daftar.
  - Setelah submit → akun status **PENDING**.
  - Siswa melihat layar: "Hubungi WA 08xxx untuk konsultasi kelas dan pembayaran."
- **Event Banners:** Read-only dari database (di-upload oleh Staff/SA via CMS).

### 1. Super Admin / Owner
- **Dashboard:** Ringkasan statistik (total siswa aktif, total guru, jadwal hari ini, pemasukan bulan ini).
- **User Management:** Tambah akun Staff atau Guru secara manual. Reset password pengguna. Ubah role pengguna.
- **Master Data:** CRUD Courses (Mata Pelajaran) dan Classrooms (Ruangan Fisik).
- **Batch Import:** Upload CSV untuk memasukkan siswa ACTIVE sekaligus (template CSV disediakan).
- **CMS Landing Page:** Upload gambar event (ke Supabase Storage) + deskripsi.
- **Laporan Keuangan:** Akses penuh ke laporan (react-to-print).
- **Backup Staff:** Bisa melakukan semua tugas Staff (approval, scheduling, invoice, pembayaran).

### 2. Staff (Primary Operational)
- **Dashboard:** Ringkasan tugas harian (pending approvals, jadwal hari ini, tagihan belum lunas).
- **Approval Pendaftaran:**
  - Tabel pendaftar PENDING.
  - Staff komunikasi dengan calon siswa/orang tua via WA (di luar sistem).
  - Staff tentukan kelas, jadwal, guru, dan biaya.
  - Staff generate invoice manual (1 klik).
  - Setelah konfirmasi pembayaran → Staff klik **"Aktifkan"** → status siswa berubah ACTIVE.
- **Class Scheduling:** CRUD jadwal — pilih Course, Teacher, Classroom, Day, Time. Conflict check Room overlap.
- **Tuition Ledger:** Tabel Invoices. Tombol **"Generate Tagihan Bulan Ini"** (manual) + tombol **"Tandai Lunas"** per invoice.
- **Laporan:** Tombol "Generate Laporan" (react-to-print) — rekap siswa aktif + status pembayaran.
- **CMS Event:** Upload banner event + deskripsi (sama dengan akses Super Admin).

### 3. Teacher
- **My Schedule:** Dashboard tabel read-only jadwal mengajar personal (hari ini & besok disorot).
- **Presensi & Jurnal (Gabung):**
  - Pilih kelas → muncul daftar siswa.
  - Centang status: Hadir / Absen / Izin / Sakit.
  - Text area untuk Jurnal Mengajar harian (per kelas, bukan per siswa).
  - Simpan.
- **Final Grading:**
  - Pilih enrollment siswa → form input skor (0-100) + teks evaluasi semester.
  - Upsert (create or update).
- **Profil Saya:** Ubah password sendiri (foto di-cut untuk MVP).

### 4. Student
- **My Dashboard:** Sapaan personal + jadwal kelas mendatang.
- **Tagihan & SPP:** Daftar riwayat Invoice (Lunas/Belum Lunas) milik sendiri.
- **Progres Belajar:** Read-only rekapan kehadiran + jurnal harian dari guru.
- **Rapor:** Nilai akhir (0-100) + evaluasi semester.
- **Profil:** Ubah password sendiri.

---

## 5. USER FLOWS (FINAL)

### Flow 1: Pendaftaran Siswa (Self-Serve → Staff-Mediated)
1. Siswa kunjungi Landing Page → klik **"Daftar"**.
2. Isi form: Nama, Email, Password, No. HP Orang Tua, Alamat.
3. Submit → akun tersimpan dengan status **PENDING**.
4. Siswa melihat layar:
   > "Pendaftaran berhasil! Silakan hubungi WA **08xxx** untuk konsultasi kelas dan pembayaran."
5. **Di luar sistem:** Siswa/orang tua chat Staff via WhatsApp.
6. Staff dan calon siswa mencapai kesepakatan: kelas, jadwal, guru, biaya.
7. **Di dalam sistem:** Staff buka menu Approval → klik siswa → assign kelas & jadwal → generate invoice.
8. Siswa transfer (di luar sistem).
9. Staff verifikasi → klik **"Aktifkan"** → status berubah **ACTIVE**.
10. Siswa bisa login dan melihat dashboard.

### Flow 2: Penagihan Bulanan (Staff)
1. Awal bulan → Staff buka menu Pembayaran.
2. Klik **"Generate Tagihan Bulan Ini"**.
3. Backend membuat invoice UNPAID untuk semua siswa ACTIVE bulan tersebut.
4. Siswa/orang tua transfer (di luar sistem).
5. Staff mencari nama siswa → klik **"Tandai Lunas"**.
6. Status invoice berubah PAID.

### Flow 3: Kegiatan Akademik (Teacher)
1. Guru login → buka **Jadwal Saya**.
2. Klik kelas hari ini → muncul daftar siswa.
3. Centang status kehadiran (Hadir/Absen/Izin/Sakit).
4. Ketik **Jurnal Mengajar** (satu jurnal per kelas per hari):
   > "Hari ini Budi belajar kunci dasar C dan G. Progres baik."
5. Klik **Simpan**.
6. Akhir semester → buka **Penilaian Akhir** → pilih siswa → input skor (0-100) + evaluasi → Simpan.

### Flow 4: Konsumsi Data (Student)
1. Budi login → Dashboard: "Besok kelas Piano jam 14:00 dengan Pak Budi."
2. Buka **Tagihan SPP** → lihat status pembayaran.
3. Buka **Progres Belajar** → baca jurnal guru: "Hari ini Budi belajar kunci dasar..."
4. Buka **Rapor** → lihat nilai akhir semester dan evaluasi.

---

## 6. DATABASE ENTITIES

| Model | Key Fields | Relations |
|---|---|---|
| **User** | id, email, password, name, role (SUPER_ADMIN/STAFF/TEACHER/STUDENT), status (PENDING/ACTIVE/INACTIVE) | → StudentProfile, TeacherProfile |
| **StudentProfile** | id, userId, parentPhone, address | → User, Enrollments |
| **TeacherProfile** | id, userId, specialization | → User, Schedules |
| **Course** | id, name, description | → Schedules |
| **Classroom** | id, name, capacity | → Schedules |
| **Schedule** | id, courseId, teacherId, classroomId, day (SENIN-MINGGU), startTime, endTime | → Course, User(Teacher), Classroom, Enrollments |
| **Enrollment** | id, studentId, scheduleId, enrolledAt | → StudentProfile, Schedule, Attendance, FinalGrade |
| **Attendance** | id, enrollmentId, date, status (HADIR/ABSEN/IZIN/SAKIT), journal | → Enrollment |
| **Invoice** | id, studentId, month, year, amount, status (UNPAID/PAID), paidAt | → StudentProfile |
| **FinalGrade** | id, enrollmentId, score (0-100), evaluation | → Enrollment |
| **EventBanner** | id, title, description, imageUrl, createdAt | — (standalone) |

---

## 7. API ENDPOINTS

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Self-register (status PENDING) |
| POST | `/api/auth/login` | Public | Login → return JWT |
| GET | `/api/auth/me` | All | Get current user profile |
| GET | `/api/admin/users` | SUPER_ADMIN | List all users |
| POST | `/api/admin/users` | SUPER_ADMIN | Create Staff/Teacher |
| PUT | `/api/admin/users/:id/role` | SUPER_ADMIN | Change user role |
| POST | `/api/admin/users/:id/reset-password` | SUPER_ADMIN | Reset user password |
| GET | `/api/admin/courses` | SUPER_ADMIN | List courses |
| POST | `/api/admin/courses` | SUPER_ADMIN | Create course |
| PUT | `/api/admin/courses/:id` | SUPER_ADMIN | Update course |
| DELETE | `/api/admin/courses/:id` | SUPER_ADMIN | Delete course |
| GET | `/api/admin/classrooms` | SUPER_ADMIN | List classrooms |
| POST | `/api/admin/classrooms` | SUPER_ADMIN | Create classroom |
| PUT | `/api/admin/classrooms/:id` | SUPER_ADMIN | Update classroom |
| DELETE | `/api/admin/classrooms/:id` | SUPER_ADMIN | Delete classroom |
| POST | `/api/admin/import-csv` | SUPER_ADMIN | Batch import siswa via CSV |
| POST | `/api/admin/events` | SUPER_ADMIN | Upload event banner |
| GET | `/api/admin/events` | SUPER_ADMIN | List all events |
| DELETE | `/api/admin/events/:id` | SUPER_ADMIN | Delete event |
| GET | `/api/staff/pending` | STAFF, SUPER_ADMIN | List PENDING registrations |
| POST | `/api/staff/approve/:userId` | STAFF, SUPER_ADMIN | Activate PENDING → ACTIVE |
| GET | `/api/staff/schedules` | STAFF, SUPER_ADMIN | List all schedules |
| POST | `/api/staff/schedules` | STAFF, SUPER_ADMIN | Create schedule (dengan Room conflict check) |
| PUT | `/api/staff/schedules/:id` | STAFF, SUPER_ADMIN | Update schedule |
| DELETE | `/api/staff/schedules/:id` | STAFF, SUPER_ADMIN | Delete schedule |
| GET | `/api/staff/invoices` | STAFF, SUPER_ADMIN | List all invoices |
| POST | `/api/staff/invoices/generate` | STAFF, SUPER_ADMIN | Generate tagihan bulan ini (manual) |
| POST | `/api/staff/invoices/:id/pay` | STAFF, SUPER_ADMIN | Tandai Lunas |
| GET | `/api/teacher/schedules` | TEACHER | My teaching schedule |
| GET | `/api/teacher/enrollments/:scheduleId` | TEACHER | Students in a schedule |
| POST | `/api/teacher/attendance` | TEACHER | Submit presensi + jurnal (bulk) |
| POST | `/api/teacher/grades` | TEACHER | Submit final grade (upsert) |
| GET | `/api/student/dashboard` | STUDENT | My dashboard + upcoming classes |
| GET | `/api/student/invoices` | STUDENT | My invoices |
| GET | `/api/student/progress` | STUDENT | Attendance + journals |
| GET | `/api/student/grades` | STUDENT | My final grades |
| GET | `/api/public/events` | Public | Event banners for landing page |

---

## 8. RENCANA 11 HARI

| Hari | Fokus | Output |
|---|---|---|
| 1 | Setup & review code existing. Fix bug. Pastikan seed data jalan. | Lingkungan siap. |
| 2 | Auth JWT + RBAC. Login page semua role. Register → PENDING flow. | Bisa login 4 role. Publik bisa daftar. |
| 3 | Landing page statis + Register + halaman "Hubungi WA". | Publik selesai. |
| 4 | Staff: Approval pendaftaran + Assign kelas & guru + Generate invoice. | Flow 1 selesai. |
| 5 | Staff: Tandai Lunas. Student: Lihat tagihan sendiri + dashboard. | Flow 2 selesai. |
| 6 | Teacher: My schedule + Presensi + Jurnal harian. | Flow 3 (presensi) selesai. |
| 7 | Teacher: Penilaian akhir. Student: Lihat progres + rapor. | Flow 3 & 4 selesai. |
| 8 | Super Admin: Akun guru/staff, reset password, data master (CRUD courses & rooms). | Owner panel selesai. |
| 9 | Super Admin: CMS event, laporan keuangan, CSV import. | CMS & reporting selesai. |
| 10 | Bug fixing, integrasi penuh, edge cases. | Semua flow tersambung. |
| 11 | Final testing, deploy Vercel + Supabase, siapkan demo. | **LIVE & READY.** |

---

## 9. SECURITY

- JWT Access Token — expiry 24 jam (tanpa Refresh Token untuk MVP).
- Password di-hash dengan bcrypt sebelum disimpan.
- RBAC middleware di setiap endpoint API.
- Supabase Storage bucket: `event-banners` & `payment-proofs` — private, accessed via signed URLs.
- CSV upload divalidasi (format, required fields) sebelum diproses.

---

## 10. CHANGELOG REVISI (DARI SRS AWAL)

| No | SRS Awal | Revisi Final | Alasan |
|---|---|---|---|
| 1 | Docker Volume + multer | Supabase Storage | Vercel serverless tidak punya persistent filesystem |
| 2 | Gantt Chart untuk Kelas & Mapel | Tabel biasa | Kompleksitas tinggi, bukan MVP |
| 3 | Tabel adaptif tambah kolom dinamis | Fixed columns + tambah baris via form/CSV | Dynamic columns = mengubah skema DB runtime |
| 4 | Generate tagihan otomatis (cron) | Tombol manual oleh Staff | Vercel tidak punya cron native |
| 5 | Self-service pilih kelas + upload bukti | Konsultasi via WA + Staff yang atur | Lebih realistis untuk sekolah musik, zero error |
| 6 | Conflict check penuh (Room+Teacher+Student) | Room overlap only | Kompleksitas query tinggi |
| 7 | JWT Refresh Token + Access Token | Access Token only (24h) | Implementasi refresh token makan 0.5-1 hari |
| 8 | Template XLSX + CSV | CSV only | Konsistensi format |
| 9 | Admin & Staff = dua role terpisah tidak jelas | Super Admin = Owner, Staff = Primary Operator | Boundary bisnis lebih masuk akal |
| 10 | Staff tidak bisa assign guru | Staff bisa assign guru ke jadwal | Operasional tidak utuh |

---

## 11. DOKUMEN TERKAIT

| Dokumen | Format | Status |
|---|---|---|
| SRS Final (this document) | Markdown | ✅ Final |
| AI Agent Prompt (Fase + Validasi) | Markdown | ✅ Final |
| Prisma Schema | schema.prisma | ✅ Scaffolded |
| Project Scaffolding (Frontend + Backend) | ZIP | ✅ Scaffolded |
| CSV Template Import Siswa | .csv | ✅ Ready |
| Slide Presentasi | .pptx | 🔜 To be generated |
| User Manual | .docx | 🔜 To be generated |
| Surat Serah Terima | .docx | 🔜 To be generated |
