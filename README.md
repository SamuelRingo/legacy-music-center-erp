# Legacy Music Center ERP

Sistem Enterprise Resource Planning (ERP) khusus untuk manajemen **Legacy Music Center**. Platform ini dirancang secara terpusat untuk memfasilitasi 4 peran utama (Super Admin, Staff, Guru, dan Siswa) guna mengotomatisasi dan mengintegrasikan seluruh operasional akademik, keuangan, dan administratif sekolah musik.

## Fitur Utama
- **Multi-Role Dashboards**: Tampilan antarmuka khusus yang disesuaikan dengan kebutuhan setiap role (Super Admin, Staff, Teacher, dan Student).
- **Manajemen Akademik**: Manajemen kursus dengan penyesuaian harga, jadwal kelas interaktif, pencatatan absensi, dan perkembangan belajar siswa.
- **Manajemen Keuangan**: Sistem invoicing otomatis, pencatatan transaksi kas (Income/Expense), dan pelaporan keuangan.
- **Human Resources (HR)**: Sistem absensi staff harian, kalkulasi gaji, dan slip gaji bulanan.
- **Manajemen Inventaris**: Pendataan dan monitoring peralatan serta aset sekolah musik.
- **Content Management System (CMS)**: Pengaturan konten dinamis untuk Landing Page, banner event, dan informasi sekolah.
- **Customer Service AI**: Chatbot terintegrasi berbasis Google Gemini AI untuk membantu calon pendaftar.

## Teknologi Utama
- **Frontend**: React (Vite), Tailwind CSS, Shadcn UI, Recharts, Google Generative AI (Gemini)
- **Backend**: Node.js, Express, Prisma ORM, JWT, Google Generative AI (Gemini)
- **Database**: PostgreSQL (Supabase)
- **Penyimpanan**: Supabase Storage (Bukti Bayar, Banner Event)

## Persyaratan (Prerequisites)
- Node.js v18+
- npm (Node Package Manager)
- Database PostgreSQL (Supabase disarankan)
- API Key Google Gemini (untuk fitur Chatbot AI)

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
GEMINI_API_KEY="your_google_gemini_api_key"
```

### 3. Setup Database (Prisma)
Di dalam folder `backend`, jalankan:
```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```
*(Proses seed ini akan mengisi database dengan data demonstrasi yang lengkap untuk simulasi penggunaan selama beberapa bulan).*

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
