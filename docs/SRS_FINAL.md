# Software Requirements Specification (SRS) - Final MVP

## 1. Pendahuluan
Legacy Musik ERP adalah sistem administrasi sekolah musik berbasis web terintegrasi. Dokumen ini mendeskripsikan spesifikasi akhir untuk fase Minimum Viable Product (MVP).

## 2. Matriks Role-Based Access Control (RBAC)

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

*1 = Full Access, 2 = View Only, 3 = No Access*

## 3. Fitur Utama per Modul
1. **Modul Autentikasi & Otorisasi**: Register mandiri, Login JWT, Middleware RBAC.
2. **Modul Manajemen Kurikulum**: CRUD Kursus dan CRUD Ruang Kelas.
3. **Modul Manajemen Pengguna**: CRUD Users, Approval pendaftaran, Penjadwalan (Scheduling).
4. **Modul Akademik**: Jurnal, Presensi (Kehadiran), Nilai Akhir kelas.
5. **Modul Keuangan (Invoicing)**: Generate invoice otomatis, validasi bukti transfer.
6. **Modul Event/Informasi**: CMS pengelolaan konten Banner halaman Landing.
