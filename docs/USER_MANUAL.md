# Panduan Pengguna (User Manual)

Dokumen ini adalah panduan penggunaan sistem berdasarkan menu yang tersedia (sesuai *Sidebar* aplikasi).

---

## 1. Panduan Admin (Administrator)
Menu yang tersedia untuk **SUPER_ADMIN**:
* **Dashboard (`/admin`)**: Ringkasan sistem keseluruhan.
* **Manajemen Pengguna (`/admin/users`)**: Membuat/mengedit akun Staff, Guru, maupun Siswa.
* **Kepegawaian**: Absensi Staff harian (`/admin/staff-attendance`) dan Penggajian bulanan (`/admin/staff-salary`).
* **Kursus Musik (`/admin/courses`)**: Menambah atau mengedit pilihan Kursus.
* **Ruang Kelas (`/admin/classrooms`)**: Menambah ruangan beserta data kapasitas.
* **Menu Staff Tambahan**: Admin juga memiliki akses penuh ke menu-menu Staff (Approval, Jadwal, Tagihan, Laporan, CMS) sebagai *backup*.

---

## 2. Panduan Staff (Administrasi Operasional)
Menu yang tersedia untuk **STAFF**:
* **Dashboard (`/staff`)**: Info singkat hari ini.
* **Approval Pendaftaran (`/staff/approvals`)**: Memproses pendaftar (PENDING), mengklik tombol *Approve* agar siswa aktif dan kelas tersambung.
* **Jadwal & Kelas (`/staff/schedules`)**: Melihat dan mengatur jadwal pertemuan. Anda juga dapat masuk ke detail kelas (Mode Read-Only) untuk melihat daftar anggota kelas.
* **Tagihan & Pembayaran (`/staff/invoices`)**: Validasi transfer manual siswa dan menandainya lunas, serta mencetak Bukti Bayar Invoice (PDF).
* **Keuangan (`/staff/finances`)**: Pencatatan arus kas (pemasukan & pengeluaran).
* **Inventaris (`/staff/inventory`)**: Manajemen stok barang/aset sekolah.
* **Laporan (`/staff/reports`)**: Mencetak rekapan kelas dan transaksi.
* **CMS Event Banner (`/staff/events`)**: Menambah event untuk slider di halaman publik.
* **Konten Landing Page (`/staff/landing-cms`)**: Mengelola gambar dan konten depan.
* **Profil Saya (`/staff/profile`)**: Mengubah informasi data diri.

---

## 3. Panduan Guru (Teacher)
Menu yang tersedia untuk **TEACHER**:
* **Jadwal Mengajar (`/teacher`)**: Menampilkan daftar kelas yang ditugaskan kepada Anda. Anda bisa mengklik kelas tersebut (buka `ClassDetailPage`) untuk melihat murid. Dari sana, Anda masuk ke pertemuan (`MeetingDetailPage`) untuk melakukan absen, memasukkan jurnal materi, mengatur tingkatan (Grade System) kelas bulanan, dan memberikan nilai akhir (Grades).
* **Profil Saya (`/teacher/profile`)**: Mengubah informasi *password* dan data profil akun Anda.

---

## 4. Panduan Siswa (Student)
Menu yang tersedia untuk **STUDENT**:
* **Dashboard (`/student`)**: Ringkasan pengumuman, daftar Prestasi yang didapatkan, dan Lencana (Badge) tingkat/Grade saat ini.
* **Tagihan Saya (`/student/invoices`)**: Melihat status *Invoice* bulanan Anda dan lokasi untuk *upload* gambar bukti bayar.
* **Progress Belajar (`/student/progress`)**: Melihat rapor, rekapan nilai guru, status absensi (Hadir/Sakit), dan jurnal materi yang telah diinput guru.
* **Profil Saya (`/student/profile`)**: Mengelola data personal.
