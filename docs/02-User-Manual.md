# Panduan Pengguna — Legacy Music Center ERP

URL: https://legacy-musik-app.vercel.app

---

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@legacymusik.sch.id | password123 |
| Staff | staff1@legacymusik.sch.id | password123 |
| Teacher | teacher1@legacymusik.sch.id | password123 |
| Student | murid1@legacymusik.sch.id | password123 |
| Student (Pending) | murid4@legacymusik.sch.id | password123 |

---

## Super Admin (Owner)

**Menu yang tersedia:**
Dashboard, Manajemen Pengguna, Kursus Musik, Manajemen Ruangan, 
Panel Staff (submenu), Kepegawaian (Absensi & Gaji), Profil Saya.

**Tugas utama:**

1. Menambah akun Staff atau Guru
   - Buka Manajemen Pengguna > tab "Staff & Admin" atau "Guru"
   - Klik "Tambah", isi data, pilih role, simpan

2. Mencatat absensi staff
   - Buka Kepegawaian > Absensi Staff
   - Pilih tanggal, tandai status (Hadir/Terlambat/Absen)
   - Klik "Simpan Absensi Hari Ini"

3. Mencatat gaji bulanan
   - Buka Kepegawaian > Gaji Staff
   - Klik "Tambah", pilih staff, bulan, nominal, simpan

---

## Staff (Operasional)

**Menu yang tersedia:**
Dashboard, Approval Pendaftaran, Manajemen Jadwal & Kelas, 
Tagihan & Pembayaran, Transaksi Kas, Inventaris, Laporan, 
CMS (Event & Konten Landing), Profil Saya.

**Tugas utama:**

1. Approval murid baru
   - Buka Approval Pendaftaran
   - Klik tombol action di baris murid PENDING
   - Pilih kelas dan jadwal, klik "Aktifkan & Buat Tagihan"

2. Membuat tagihan bulanan
   - Buka Tagihan & Pembayaran
   - Klik "Generate Tagihan Bulan Ini"
   - Untuk menandai lunas: klik action > "Tandai Lunas"

3. Mencetak bukti bayar
   - Di Tagihan & Pembayaran, cari invoice berstatus LUNAS
   - Klik action > "Cetak Bukti Bayar"

4. Mengatur jadwal kelas
   - Buka Manajemen Jadwal & Kelas
   - Klik "Tambah Jadwal", pilih kursus, guru, ruangan, hari, jam
   - Jika bentrok, sistem akan memberi peringatan

---

## Teacher (Guru)

**Menu yang tersedia:**
Jadwal Mengajar, Profil Saya.

**Tugas utama:**

1. Membuat pertemuan dan mengisi absensi
   - Buka Jadwal Mengajar > klik salah satu kelas
   - Tab "Pertemuan" > "Buat Pertemuan Baru" > pilih tanggal
   - Klik pertemuan yang dibuat
   - Isi jurnal, tandai kehadiran murid, klik "Simpan"

2. Memberikan nilai akhir
   - Di halaman kelas, tab "Anggota Kelas"
   - Klik "Beri Nilai", masukkan skor (0-100) dan evaluasi
   - Klik "Simpan"

3. Mengatur grade murid
   - Di tab "Anggota Kelas", klik "Edit Grade"
   - Pilih Grade (1-5) dan Bulan (1-3), klik "Simpan"

---

## Student (Murid)

**Menu yang tersedia:**
Dashboard, Tagihan Saya, Progres Belajar, Profil Saya.

**Tugas utama:**

1. Melihat jadwal dan progres
   - Dashboard menampilkan jadwal kelas dan badge Grade
   - Progres Belajar menampilkan riwayat absensi dan jurnal guru

2. Mengecek tagihan
   - Buka Tagihan Saya
   - Status hijau = Lunas, status merah = Belum Lunas
   - Invoice lunas bisa dicetak: klik "Cetak Bukti Bayar"

3. Mendaftar sebagai murid baru
   - Buka halaman utama, klik "Daftar"
   - Isi form, submit, otomatis masuk dashboard
   - Status awal: PENDING. Hubungi WA Staff untuk aktivasi
