```markdown
# POST-MVP PHASES — Legacy Musik School ERP (Batch 2)

Fase 1-9 untuk 19 permintaan klien. Eksekusi berurutan.
Semua commit ke branch `beta`. JANGAN merge ke `main` sebelum disetujui.
Setiap fase HARUS diverifikasi sebelum lanjut.

---

## FASE 0: Setup Branch Beta & Environment

**Tujuan:** Buat branch `beta`, pastikan environment siap.

### Tasks:
1. **Buat branch beta:**
   ```bash
   git checkout -b beta
   git push origin beta
   ```
2. Semua pekerjaan dilakukan di branch `beta`.
3. Vercel TIDAK deploy branch `beta` (hanya `main` yang auto-deploy).

### Validation:
- [ ] `git branch` menunjukkan `* beta`.
- [ ] `git push origin beta` sukses.

**⚠️ JANGAN lanjut sebelum branch beta siap.**

---

## FASE 1: Bug Fixes — 5 Item

**Tujuan:** Perbaiki semua bug yang dilaporkan klien.

### Tasks:

**1. AI Chatbot (Fix)**
- Buka `backend/src/routes/public.js`, cek endpoint `POST /api/public/chatbot`.
- Pastikan `GEMINI_API_KEY` dibaca dari `process.env`.
- Tambahkan `try/catch` dengan log error detail.
- Test: `curl POST` dengan `{ "message": "Halo" }`.
- Kalau error, perbaiki: cek API key di Vercel env, cek package `@google/generative-ai` terinstall.

**2. Lupa Password (Simpel)**
- JANGAN buat endpoint reset password.
- Di halaman Login, tambahkan link kecil di bawah form:
  "Lupa password? Hubungi WA 0812-xxxx-xxxx"
- Klik link → buka `https://wa.me/62812xxxxxx`.
- Tidak ada backend, tidak ada token, tidak ada email.

**3. Hapus AI Background Login/Signup**
- Buka `LoginPage.jsx` dan `RegisterPage.jsx`.
- Hapus background image AI.
- Ganti dengan: `className="min-h-screen bg-gradient-to-br from-amber-500 via-amber-600 to-zinc-900"`
- Pastikan form card tetap kontras (gunakan `bg-white/10 backdrop-blur` atau `bg-zinc-900/80`).

**4. Validasi Nomor HP**
- Di `RegisterPage.jsx`, field nomor HP: tambahkan `inputMode="numeric" pattern="[0-9]*"`.
- Di backend `routes/auth.js` (POST `/register`), tambahkan:
  ```javascript
  if (parentPhone && !/^[0-9]+$/.test(parentPhone)) {
    return res.status(400).json({ message: "Nomor HP hanya boleh berisi angka" });
  }
  ```

**5. Jadwal Bentrok Guru**
- Di `routes/staff.js` (POST `/schedules`), TAMBAHKAN setelah pengecekan ruangan:
  ```javascript
  const teacherConflict = await prisma.schedule.findFirst({
    where: {
      teacherId,
      day,
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ]
    }
  });
  if (teacherConflict) {
    return res.status(409).json({
      message: `Guru sudah memiliki jadwal di hari ${day} jam ${startTime}-${endTime}`
    });
  }
  ```
- Frontend `SchedulingPage.jsx`: tangkap error 409, tampilkan `toast.error()`.

### Validation Checklist:
- [ ] Chatbot merespons pertanyaan via landing page.
- [ ] Link "Lupa password" muncul di bawah form login.
- [ ] Background login/signup sudah gradient, bukan AI image.
- [ ] Form nomor HP menolak input huruf.
- [ ] Buat jadwal dengan guru bentrok → error 409 + toast merah.
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum semua item checked.**

---

## FASE 2: Database Migration — Semua Model Baru

**Tujuan:** Tambahkan semua model baru untuk fitur Grade, Keuangan, Inventaris, Staff, Prestasi.

### Tasks:
1. Buka `backend/prisma/schema.prisma`.
2. **Tambahkan field di model yang sudah ada:**
   - `Enrollment`: `gradeLevel Int?` dan `currentMonth Int?`
   - `FinalGrade`: `gradedAt DateTime @default(now())`
3. **Tambahkan model baru:**
   ```prisma
   model StudentAchievement {
     id          String   @id @default(uuid())
     studentId   String
     title       String
     description String?
     date        DateTime
     createdAt   DateTime @default(now())
     student     StudentProfile @relation(fields: [studentId], references: [id])
     @@map("student_achievements")
   }

   model Transaction {
     id          String   @id @default(uuid())
     type        String   // INCOME, EXPENSE
     amount      Float
     category    String   // SPP, OPERATIONAL, MAINTENANCE, SALARY, OTHER
     description String?
     date        DateTime @default(now())
     createdAt   DateTime @default(now())
     @@map("transactions")
   }

   model InventoryItem {
     id          String   @id @default(uuid())
     name        String
     category    String   // INSTRUMENT, EQUIPMENT, FURNITURE, OTHER
     status      String   // AVAILABLE, DAMAGED, NEW
     quantity    Int      @default(1)
     description String?
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
     @@map("inventory_items")
   }

   model StaffAttendance {
     id        String   @id @default(uuid())
     userId    String
     date      DateTime
     status    String   // PRESENT, ABSENT, LATE
     note      String?
     createdAt DateTime @default(now())
     user      User     @relation(fields: [userId], references: [id])
     @@unique([userId, date])
     @@map("staff_attendance")
   }

   model StaffSalary {
     id        String   @id @default(uuid())
     userId    String
     month     Int      // 1-12
     year      Int
     amount    Float
     bonus     Float    @default(0)
     note      String?
     createdAt DateTime @default(now())
     user      User     @relation(fields: [userId], references: [id])
     @@unique([userId, month, year])
     @@map("staff_salaries")
   }
   ```
4. Jalankan: `npx prisma migrate dev --name add_post_mvp_models`.
5. **Update `seed.js`:**
   - Tambahkan 2-3 transaksi contoh (SPP masuk, operasional keluar).
   - Tambahkan 2-3 inventaris contoh (Gitar tersedia, Amplifier rusak).
   - Tambahkan 1 prestasi contoh untuk Ani.
   - Tambahkan `gradeLevel: 2, currentMonth: 2` di enrollment Ani (Piano).
6. Jalankan: `npx prisma db seed`.

### Validation Checklist:
- [ ] `prisma migrate dev` sukses tanpa error.
- [ ] Tabel baru muncul di Supabase Dashboard.
- [ ] `prisma db seed` sukses.
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum migration berhasil.**

---

## FASE 3: Backend API — Semua Endpoint Baru

**Tujuan:** Buat endpoint untuk semua model baru.

### Tasks:
1. **Tambahkan di `routes/admin.js`:**
   - `GET /api/admin/students/:id` — detail satu siswa (include enrollments, grades, achievements).
   - `GET /api/admin/students/:id/achievements` — list prestasi.
   - `POST /api/admin/students/:id/achievements` — tambah prestasi.
   - `DELETE /api/admin/achievements/:id` — hapus prestasi.
   - `GET /api/admin/transactions` — list transaksi (query: month, year).
   - `POST /api/admin/transactions` — tambah transaksi.
   - `GET /api/admin/inventory` — list inventaris.
   - `POST /api/admin/inventory` — tambah barang.
   - `PUT /api/admin/inventory/:id` — edit barang.
   - `GET /api/admin/staff-attendance` — list absensi staff (query: month, year).
   - `POST /api/admin/staff-attendance` — tambah absensi.
   - `GET /api/admin/staff-salaries` — list gaji (query: month, year).
   - `POST /api/admin/staff-salaries` — tambah/edit gaji.

2. **Tambahkan di `routes/staff.js`:**
   - `PUT /api/staff/enrollments/:id/grade` — update `gradeLevel` dan `currentMonth`.
   - `GET /api/staff/students/:id` — detail siswa (mirror admin).
   - Semua endpoint transaksi & inventaris (mirror admin, bisa diakses Staff).

3. **Tambahkan di `routes/student.js`:**
   - `GET /api/student/achievements` — lihat prestasi sendiri.

4. **Tambahkan di `routes/public.js`:**
   - `GET /api/public/events` — pastikan endpoint ini sudah ada dan merespons.

### Validation Checklist:
- [ ] Semua endpoint baru merespons dengan benar.
- [ ] Test dengan Postman atau curl: GET, POST, PUT, DELETE.
- [ ] RBAC: Staff tidak bisa akses endpoint Admin (403).
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum semua endpoint berfungsi.**

---

## FASE 4: Landing Page — Grade Section + Event Section + Event Page

**Tujuan:** Tambahkan section Grade di landing page, pindahkan section Event, buat halaman /events.

### Tasks:
1. **Grade Section di Landing Page:**
   - Di `LandingPage.jsx`, tambahkan section "Sistem Grade Pembelajaran" setelah About Us.
   - 5 card Grade 1-5 (pakai shadcn `<Card>`), grid `grid-cols-1 md:grid-cols-5 gap-4`.
   - Sub-section "Durasi 3 Bulan per Grade" dengan 3 card kecil (Bulan 1, 2, 3).
   - Semua teks dari CMS (`LandingContent`). Seed data default sesuai grade descriptions.

2. **Section Event di Landing Page:**
   - Pindahkan section Event ke posisi SEBELUM About Us.
   - Urutan baru: Hero → Event → About → Grade → Facility → Footer.
   - Judul section: "Acara & Event Terbaru".
   - Maksimal 3 event. Tombol "Lihat Semua Event" → `/events`.

3. **Halaman /events (publik):**
   - File: `frontend/src/pages/public/EventsPage.jsx`.
   - Route: `/events` di `App.jsx`.
   - Grid card semua event dari `GET /api/public/events`.
   - Navbar landing page: tambahkan link "Event" → `/events`.

### Validation Checklist:
- [ ] Section Grade muncul di landing page setelah About Us.
- [ ] Section Event muncul SEBELUM About Us.
- [ ] Halaman `/events` bisa diakses publik.
- [ ] Link "Event" di navbar berfungsi.
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum landing page beres.**

---

## FASE 5: Sidebar Kategori (Expandable) + Dashboard Widget

**Tujuan:** Rapikan sidebar dengan kategori expandable, tambahkan widget di dashboard.

### Tasks:
1. **Sidebar Kategori:**
   - Gunakan shadcn `<Collapsible>`.
   - Icon dari `lucide-react` (GraduationCap, DollarSign, Palette, Settings, User, Home, Clipboard, CreditCard).
   - Kategori untuk Staff/Admin:
     - 📊 Akademik: Approval, Jadwal, Data Siswa
     - 💰 Keuangan: Invoice, Transaksi, Laporan
     - 📦 Inventaris: Barang
     - 🎨 CMS: Landing Page, Event
     - ⚙️ Pengaturan: Profil
   - Simpan state expand/collapse di `localStorage`.

2. **Dashboard Widget:**
   - Di AdminHome dan StaffHome, tambahkan 3 widget:
     - **Kelas Hari Ini**: fetch dari schedules API, filter by today.
     - **Event Terbaru**: 3 event dari CMS.
     - **Statistik Cepat**: jumlah siswa, guru, pendapatan bulan ini.

### Validation Checklist:
- [ ] Sidebar kategori expandable berfungsi.
- [ ] State collapse tersimpan di localStorage (refresh tidak reset).
- [ ] Widget muncul di dashboard Admin & Staff.
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum sidebar dan widget beres.**

---

## FASE 6: Grade System + Detail Siswa + Prestasi

**Tujuan:** Implementasi grade level, halaman detail siswa, prestasi.

### Tasks:
1. **Grade System:**
   - Di `ClassDetailPage.jsx` (Teacher), tambahkan dropdown di samping nama murid: "Grade: [1-5]" dan "Bulan: [1-3]".
   - Panggil `PUT /api/staff/enrollments/:id/grade`.
   - Di Student Dashboard, tampilkan badge: "Grade 2 - Bulan 2 (Ujian)".

2. **Tanggal Pemberian Nilai:**
   - Di halaman grading dan rapor, tampilkan `gradedAt`: "Dinilai pada 15 Juli 2026".

3. **Detail Siswa (Admin/Staff):**
   - Buat halaman `/staff/students/:id`:
     - Info dasar: nama, email, status, no. HP ortu, alamat.
     - Kelas yang diikuti (list dengan grade).
     - Nilai akhir.
     - Tab Prestasi.
   - Akses dari tabel Users/Siswa (klik nama → detail).

4. **Prestasi:**
   - Di halaman detail siswa, tab "Prestasi": tabel + form tambah.
   - Di Student Dashboard, list prestasi (read-only).

### Validation Checklist:
- [ ] Teacher bisa update gradeLevel & currentMonth.
- [ ] Student melihat badge grade di dashboard.
- [ ] Halaman `/staff/students/:id` bisa diakses.
- [ ] Prestasi bisa ditambah dan dilihat.
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum grade & prestasi berfungsi.**

---

## FASE 7: Manajemen Keuangan + Inventaris (Versi Minimal)

**Tujuan:** Halaman CRUD untuk transaksi keuangan dan inventaris barang.

### Tasks:
1. **Manajemen Keuangan:**
   - Halaman `/staff/finance` (atau `/staff/transactions`).
   - Tabel transaksi (pemasukan/pengeluaran) dengan filter bulan/tahun.
   - Form tambah transaksi: type (INCOME/EXPENSE), amount, category, description, date.
   - Total pemasukan, pengeluaran, saldo di atas tabel.

2. **Inventaris:**
   - Halaman `/staff/inventory`.
   - Tabel barang: nama, kategori, status, jumlah.
   - Form tambah/edit barang.
   - Filter status (AVAILABLE/DAMAGED/NEW).

### Validation Checklist:
- [ ] Halaman `/staff/finance` bisa diakses.
- [ ] Tambah transaksi → muncul di tabel → total berubah.
- [ ] Halaman `/staff/inventory` bisa diakses.
- [ ] CRUD barang berfungsi.
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum keuangan & inventaris berfungsi.**

---

## FASE 8: Manajemen Staff (Absensi + Gaji)

**Tujuan:** Halaman CRUD untuk absensi dan gaji staff.

### Tasks:
1. **Absensi Staff:**
   - Halaman `/admin/staff-attendance`.
   - Tabel absensi (nama staff, tanggal, status PRESENT/ABSENT/LATE).
   - Form tambah: pilih staff, tanggal, status, note opsional.
   - Filter bulan/tahun.

2. **Gaji Staff:**
   - Halaman `/admin/staff-salary`.
   - Tabel gaji (nama staff, bulan, tahun, jumlah, bonus).
   - Form tambah/edit: pilih staff, bulan, tahun, amount, bonus.
   - Hanya bisa diakses Super Admin.

### Validation Checklist:
- [ ] Halaman absensi staff bisa diakses Admin.
- [ ] Tambah absensi → muncul di tabel.
- [ ] Halaman gaji staff bisa diakses Admin.
- [ ] Tambah gaji → muncul di tabel.
- [ ] Staff tidak bisa akses halaman ini (403).
- [ ] Commit dan push ke `beta`.

**⚠️ JANGAN lanjut sebelum manajemen staff berfungsi.**

---

## FASE 9: Final Polish, Testing, Merge ke Main

**Tujuan:** Polish semua halaman, test end-to-end, merge ke `main` untuk deploy.

### Tasks:
1. **Polish UI/UX:**
   - Cek semua halaman baru: responsive, spacing, warna konsisten.
   - Semua tabel baru pakai `DataTable` shared component.
   - Semua form baru pakai `ConfirmDialog` untuk delete.
   - Semua halaman baru ada `LoadingSkeleton`, `EmptyState`, `ErrorState`.

2. **Testing End-to-End:**
   - Login sebagai Admin → buka semua halaman baru.
   - Login sebagai Staff → buka semua halaman baru.
   - Login sebagai Teacher → update grade murid.
   - Login sebagai Student → lihat badge grade, prestasi.
   - Buka landing page → section Grade, Event, /events.
   - Test chatbot di landing page.
   - Test lupa password (link WA).

3. **Merge ke Main:**
   ```bash
   git checkout main
   git merge beta
   git push origin main
   ```
   - Vercel auto-deploy dari `main`.

4. **Update Dokumentasi:**
   - Update `docs/SRS_FINAL.md` — tambahkan fitur baru.
   - Update `docs/USER_MANUAL.md` — panduan fitur baru.
   - Update `docs/POST_MVP_ROADMAP.md` — centang yang sudah selesai.

### Validation Checklist:
- [ ] Semua halaman baru berfungsi di production (setelah merge).
- [ ] Tidak ada error console.
- [ ] Semua dokumen ter-update.
- [ ] Presentasi siap.

---

## ATURAN GLOBAL

1. **Semua commit ke branch `beta`.** JANGAN commit ke `main` sebelum Fase 9.
2. **GUNAKAN komponen shared** (DataTable, ActionMenu, ConfirmDialog, LoadingSkeleton, EmptyState, ErrorState).
3. **GUNAKAN shadcn/ui** + Tailwind. JANGAN buat CSS custom.
4. **JANGAN ubah logic bisnis yang sudah berfungsi.**
5. **SETIAP fase selesai, laporkan:** file yang diubah, hasil validasi.
6. **JIKA ragu, TANYA.** Jangan mengasumsikan.
```
