# Legacy Musik ERP

Sistem Enterprise Resource Planning (ERP) khusus untuk manajemen Sekolah Musik. Memfasilitasi 4 peran utama (Admin, Staff, Guru, dan Siswa) dalam satu platform terpusat, mulai dari pendaftaran, penugasan jadwal, pencatatan absensi & nilai, hingga manajemen tagihan (invoicing).

## Teknologi Utama
- **Frontend**: React (Vite), Tailwind CSS, Shadcn UI, Recharts
- **Backend**: Node.js, Express, Prisma ORM, JWT
- **Database**: PostgreSQL (Supabase)
- **Penyimpanan**: Supabase Storage (Bukti Bayar, Banner Event)

## Persyaratan (Prerequisites)
- Node.js v18+
- npm (Node Package Manager)
- Database PostgreSQL (Supabase disarankan)

## Cara Instalasi & Menjalankan (Local Development)

### 1. Kloning & Instalasi
Buka terminal dan jalankan:
```bash
git clone https://github.com/your-org/legacy-musik-erp.git
cd legacy-musik-erp

# Install dependensi backend
cd backend
npm install

# Install dependensi frontend
cd ../frontend
npm install
```

### 2. Konfigurasi Environment
Salin file template `.env.example` ke `.env` di masing-masing folder (`backend` dan `frontend`), lalu sesuaikan nilainya.

**Di folder `backend/.env`:**
```env
DATABASE_URL="postgresql://postgres:PASSWORD@your_supabase_url:5432/postgres"
JWT_SECRET="super-secret-jwt-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
SUPABASE_URL="https://your_supabase_url.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
SUPABASE_STORAGE_BUCKET_EVENTS="event-banners"
SUPABASE_STORAGE_BUCKET_PROOFS="payment-proofs"
```

### 3. Setup Database (Prisma)
Di dalam folder `backend`, jalankan:
```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

### 4. Menjalankan Server
Buka 2 terminal terpisah.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Backend akan berjalan di http://localhost:3001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Frontend berjalan di http://localhost:5173
```
Akses `http://localhost:5173` melalui browser Anda.

---

## Akun Demo (Local / Staging)

Berikut adalah akun demonstrasi asli yang dihasilkan oleh `prisma:seed` untuk mencoba fitur per role:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@legacymusik.sch.id` | `admin123` |
| **Staff** | `staff@legacymusik.sch.id` | `staff123` |
| **Student** | `student@legacymusik.sch.id` | `student123` |
| **Teacher** | `teacher@legacymusik.sch.id` | `teacher123` |

> **Catatan**: Akun dengan role `STUDENT` yang mendaftar mandiri akan berstatus `PENDING` dan tidak bisa login sebelum diaktifkan via Approval Staff. Akun student demo (`student@legacymusik.sch.id`) otomatis aktif karena melalui seed.
