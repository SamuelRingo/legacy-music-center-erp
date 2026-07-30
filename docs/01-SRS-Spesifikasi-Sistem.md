# Spesifikasi Sistem — Legacy Music Center ERP

Sistem ERP berbasis web untuk manajemen operasional sekolah musik. 
Mencakup pendaftaran murid, penjadwalan kelas, pencatatan akademik, 
pengelolaan keuangan, inventaris, kepegawaian, dan CMS landing page.

---

## Role Pengguna

**Super Admin (Owner/Kepala Sekolah)**
Kontrol penuh atas sistem. Mengelola data master (kursus, ruangan, pengguna), 
mencatat absensi dan gaji staff, serta bertindak sebagai backup untuk 
semua tugas Staff.

**Staff (Resepsionis/Operasional)**
Menangani operasional harian: approval pendaftaran murid baru, pengaturan 
jadwal kelas, pembuatan invoice, pencatatan transaksi keuangan, pengelolaan 
inventaris, dan pembaruan konten landing page melalui CMS.

**Teacher (Guru)**
Mengelola kegiatan akademik: membuat pertemuan kelas, mencatat presensi 
dan jurnal harian, memberikan penilaian akhir, serta mengatur level grade 
dan fase pembelajaran murid.

**Student (Murid)**
Melihat jadwal kelas, riwayat tagihan, progres belajar (absensi dan jurnal), 
nilai akhir, dan prestasi pribadi. Mendaftar secara mandiri melalui 
halaman publik.

---

## Matriks RBAC

Keterangan: 1 = Akses penuh, 2 = Hanya melihat, 3 = Tidak ada akses

| No | Tugas | Admin | Staff | Guru | Murid |
|---|---|---|---|---|---|
| 1 | Approval Pendaftaran Siswa | 1 | 1 | 3 | 3 |
| 2 | Atur Jadwal Kelas & Guru | 1 | 1 | 3 | 3 |
| 3 | Kelola Tagihan & Pembayaran | 1 | 1 | 3 | 3 |
| 4 | Upload Event & CMS Landing Page | 1 | 1 | 3 | 3 |
| 5 | Buat Akun Guru/Staff | 1 | 3 | 3 | 3 |
| 6 | Reset Password Pengguna | 1 | 1 | 3 | 3 |
| 7 | Atur Data Master (Kursus, Ruangan) | 1 | 3 | 3 | 3 |
| 8 | Akses Laporan Keuangan | 1 | 1 | 3 | 3 |
| 9 | Lihat Jadwal | 1 | 1 | 1 | 1 |
| 10 | Presensi & Jurnal (Input) | 2 | 2 | 1 | 3 |
| 11 | Penilaian & Rapor (Input) | 2 | 2 | 1 | 3 |
| 12 | Atur Profil Sendiri | 1 | 1 | 1 | 1 |
| 13 | Lihat Tagihan Sendiri | 1 | 1 | 3 | 1 |
| 14 | Lihat Jurnal & Progres Belajar | 1 | 1 | 1 | 1 |

---

## Daftar Endpoint API

Semua endpoint menggunakan prefix `/api`.

### Autentikasi & Publik
| Method | Path | Role |
|---|---|---|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| GET | /auth/me | Semua role |
| GET | /public/events | Public |
| GET | /public/schedules | Public |
| GET | /public/courses | Public |
| GET | /public/landing-content | Public |
| POST | /public/chatbot | Public |

### Super Admin
| Method | Path | Deskripsi |
|---|---|---|
| GET | /admin/dashboard-stats | Statistik dashboard |
| GET/POST | /admin/users | Manajemen pengguna |
| PUT | /admin/users/:id/role | Ubah role |
| POST | /admin/users/:id/reset-password | Reset password |
| POST | /admin/import-csv | Impor CSV siswa |
| GET/POST/PUT/DEL | /admin/courses | Kelola kursus |
| GET/POST/PUT/DEL | /admin/classrooms | Kelola ruangan |

### Staff
| Method | Path | Deskripsi |
|---|---|---|
| GET | /staff/pending | Daftar pendaftar PENDING |
| POST | /staff/approve/:userId | Approve & aktivasi siswa |
| GET/POST/PUT/DEL | /staff/schedules | Kelola jadwal |
| GET/POST | /staff/enroll | Daftarkan siswa ke kelas |
| GET/POST/PUT/DEL | /staff/invoices | Kelola tagihan |
| GET/POST/PUT | /staff/transactions | Transaksi keuangan |
| GET/POST/PUT | /staff/inventory | Inventaris barang |
| GET/POST/DEL | /staff/events | CMS banner event |
| PUT | /staff/landing-content | CMS konten landing |
| GET/POST | /staff/staff-attendance | Absensi staff |
| GET/POST | /staff/staff-salaries | Gaji staff |
| POST/DEL | /staff/achievements | Prestasi siswa |

### Teacher
| Method | Path | Deskripsi |
|---|---|---|
| GET | /teacher/schedules | Jadwal mengajar |
| GET | /teacher/schedules/:id/students | Daftar murid |
| GET/POST | /teacher/schedules/:id/meetings | Pertemuan kelas |
| POST | /teacher/meetings/:id/attendance | Presensi |
| PUT | /teacher/meetings/:id/journal | Jurnal mengajar |
| POST | /teacher/grades | Nilai akhir |
| PUT | /teacher/enrollments/:id/grade | Update grade & fase |

### Student
| Method | Path | Deskripsi |
|---|---|---|
| GET | /student/dashboard | Dashboard |
| GET | /student/invoices | Riwayat tagihan |
| GET | /student/progress | Progres belajar |
| GET | /student/grades | Nilai akhir |
| GET | /student/achievements | Daftar prestasi |

---

## Skema Database

18 model dalam database PostgreSQL.

**Model Utama:**
User, StudentProfile, TeacherProfile, Course, Classroom, Schedule, 
Enrollment, Meeting, MeetingAttendance, FinalGrade, Invoice, 
EventBanner, LandingContent, StudentAchievement, Transaction, 
InventoryItem, StaffAttendance, StaffSalary.

**Relasi Kunci:**
- User memiliki StudentProfile atau TeacherProfile (one-to-one)
- Schedule terhubung ke Course, Teacher (User), dan Classroom
- Enrollment menghubungkan StudentProfile ke Schedule
- Meeting dan MeetingAttendance mencatat presensi per pertemuan
- FinalGrade tersimpan per Enrollment
- Invoice terkait ke StudentProfile per bulan/tahun
- StaffAttendance dan StaffSalary terkait ke User (role STAFF/TEACHER)

---

## Fitur Utama

Sistem mencakup 19 fitur utama, antara lain:
autentikasi multi-role, manajemen pengguna, approval pendaftaran, 
penjadwalan kelas, presensi dan jurnal, penilaian dan sistem grade, 
tagihan SPP, transaksi keuangan, inventaris, absensi dan gaji staff, 
CMS landing page, chatbot AI, cetak dokumen, dan pencatatan prestasi.
