# User Flows (Alur Sistem Utama)

Berikut adalah diagram proses pendaftaran siswa yang benar sesuai implementasi sistem:

## 1. Alur Pendaftaran & Aktivasi Siswa (Registration Flow)

```mermaid
sequenceDiagram
    participant Public as Calon Siswa
    participant Staff as Staff / Admin
    participant System as Sistem

    Public->>System: Isi form di Halaman Register (Landing Page)
    System-->>Public: Akun terdaftar dengan status PENDING
    Note over Public: Siswa belum bisa login.<br/>Menghubungi WA Staff.
    Staff->>System: Buka Menu "Approval Pendaftaran"
    Staff->>System: Klik Siswa, Pilih Schedule Kelas
    Staff->>System: Klik tombol "Approve"
    System-->>System: Membuat Record Enrollment
    System-->>Staff: Status menjadi ACTIVE
    Note over System: Invoice otomatis dapat di-generate selanjutnya
    System-->>Public: Siswa kini bisa Login menggunakan email & password
```

## 2. Alur Pencatatan Akademik (Guru)
- Guru login dan membuka menu **Jadwal Mengajar**.
- Guru memilih kelas spesifik (Masuk ke *Class Detail*).
- Guru membuat/membuka pertemuan (Masuk ke *Meeting Detail*).
- Guru mengisi **Jurnal Mengajar** dan mencentang status presensi anak.
- Data tersimpan dan bisa dilihat oleh murid dari menu **Progress Belajar**.
