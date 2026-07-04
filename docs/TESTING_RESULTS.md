# Laporan Pengujian (Testing & Bug Fixes)

Dokumen ini berisi rangkuman perbaikan *bug* spesifik yang telah dilakukan berdasarkan pengujian di tahap akhir MVP.

## 1. Perbaikan Bug Utama
Empat isu spesifik berikut telah berhasil ditangani dan dikonfirmasi stabil:

1. **[FIXED] Double Enrollment (Duplikasi Pendaftaran)**
   - **Isu**: Jika tombol *Approve* diklik secara brutal (*spam-click*) oleh Staff, satu siswa bisa didaftarkan berkali-kali pada satu kelas/schedule yang sama.
   - **Solusi**: Diimplementasikan proteksi di backend pada rute `POST /enroll` menggunakan *guard* `prisma.enrollment.findUnique` berbasis *composite key* `studentId_scheduleId`. Jika sudah ada, transaksi dibatalkan dengan respons HTTP 409 Conflict.
2. **[FIXED] Blue Outline Focus Ring**
   - **Isu**: Muncul garis tepi *(outline)* biru mencolok dari properti bawaan Shadcn Dialog saat `EventPopup.jsx` (Landing Page) atau `CourseModal.jsx` dibuka.
   - **Solusi**: Kelas `outline-none focus:outline-none focus:ring-0 focus-visible:ring-0` ditambahkan pada kontainer popup untuk mematikan *focus ring* kaku tersebut.
3. **[FIXED] Dialog Approval Nyangkut**
   - **Isu**: Di halaman *ApprovalPage*, dialog persetujuan (konfirmasi) tidak tertutup otomatis usai pendaftaran berhasil di-submit.
   - **Solusi**: State *closing* dipaksa aktif dengan `setOpen(false)` segera sesudah API sukses mengembalikan 200 OK.
4. **[FIXED] Pengembalian Warna (Emerald Revert)**
   - **Isu**: 7 komponen halaman Staff/Guru sempat secara keliru dimodifikasi warna tombolnya menjadi `bg-emerald-600`.
   - **Solusi**: Warna dikembalikan secara total sesuai desain orisinal proyek yakni *Gold/Amber* (`bg-amber-600`) menggunakan skrip *batch-revert*.

## 2. Uji Keamanan (Security Checks)
Sistem lolos dalam simulasi standar keamanan RBAC.
- Panggilan API Admin tanpa token memunculkan `401 Unauthorized`.
- Panggilan API Admin menggunakan token Staff memunculkan `403 Forbidden` (`Insufficient permissions`).
