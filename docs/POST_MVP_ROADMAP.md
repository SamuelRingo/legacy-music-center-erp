# Post-MVP Roadmap

Setelah Minimum Viable Product (MVP) ini diluncurkan secara stabil, pengembangan Tahap 2 (Phase 2) akan langsung berfokus pada 3 fitur esensial berikut:

## 1. Multiple Enrollment (Satu Siswa, Banyak Kelas)
**Konteks**: Di skema saat ini, alur approval mengasumsikan siswa mendaftar satu kelas pada satu waktu, atau staf mendaftarkan siswa secara manual ke kelas-kelas baru.
**Tujuan**: Menyediakan antarmuka pendaftaran *(enrollment)* multi-kelas yang terintegrasi, memungkinkan satu Siswa (StudentProfile) bisa masuk ke 2 kelas atau lebih dalam satu keranjang tagihan sekaligus tanpa harus melakukan Approval berulang-ulang dari tabel Pending.

## 2. Sub-Penilaian Guru (Komponen Nilai Rinci)
**Konteks**: Saat ini fitur **Grades** dari Guru hanya meminta satu skor mentah mutlak (0-100) sebagai nilai akhir *(Final Grade)* semester.
**Tujuan**: Mengizinkan Guru memecah *Final Grade* ke dalam komponen sub-penilaian terstruktur. Misalnya:
- Nilai Praktik (40%)
- Nilai Teori (30%)
- Nilai Sikap/Kedisiplinan (30%)
Hal ini akan meningkatkan kredibilitas rapor sekolah.

## 3. Unggah Foto Profil (Avatar)
**Konteks**: Dashboard, header profil, maupun detil guru di Landing Page saat ini menggunakan foto avatar statis atau huruf inisial sederhana.
**Tujuan**: Menambahkan antarmuka pengunggahan berkas gambar ke *Supabase Storage*, lalu menautkan URL publiknya ke dalam skema *User* dan *TeacherProfile*. Hal ini akan memberi personalisasi bagi akun Siswa, serta menyegarkan wajah Guru di *Landing Page* sekolah.

---

*(Catatan Teknis)*: Seiring pengembangan fitur di atas, **Technical Debt** berupa kerentanan paket *(vulnerabilities)* di frontend (`esbuild`) maupun backend (`tar/bcrypt`) wajib diselesaikan melalui proses `npm audit fix --force` di masa post-MVP, yang mana membutuhkan tes integrasi ketat *(E2E)* agar tidak merusak fungsionalitas.
