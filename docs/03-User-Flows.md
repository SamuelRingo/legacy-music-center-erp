# Alur Pengguna — Legacy Music Center ERP

---

## 1. Pendaftaran Murid Baru

1. Calon murid membuka halaman utama, klik "Daftar".
2. Mengisi form: nama lengkap, email, password, nomor HP orang tua, alamat.
3. Submit formulir.
4. Akun terdaftar dengan status PENDING.
5. Calon murid otomatis masuk ke dashboard.
6. Dashboard menampilkan badge PENDING dan pesan untuk menghubungi WA Staff.
7. Staff membuka menu "Approval Pendaftaran".
8. Staff memilih murid dari daftar PENDING.
9. Staff memilih kelas, jadwal, dan guru untuk murid tersebut.
10. Staff mengklik "Aktifkan dan Buat Tagihan".
11. Status murid berubah menjadi ACTIVE. Tagihan pertama otomatis terbuat.

---

## 2. Pembayaran dan Invoice

1. Staff membuka menu "Tagihan dan Pembayaran".
2. Staff mengklik "Generate Tagihan Bulan Ini".
3. Sistem membuat invoice untuk semua murid yang aktif.
4. Murid melakukan pembayaran di luar sistem (transfer bank).
5. Staff mencari invoice murid yang sudah membayar.
6. Staff mengklik "Tandai Lunas".
7. Status invoice berubah dari UNPAID menjadi PAID.
8. Staff dapat mencetak bukti bayar dengan mengklik "Cetak Bukti Bayar".
9. Murid dapat melihat status tagihan di menu "Tagihan Saya".
10. Untuk invoice yang sudah LUNAS, murid dapat mengunduh bukti bayar.

---

## 3. Kegiatan Akademik

1. Guru membuka menu "Jadwal Mengajar".
2. Guru memilih kelas yang akan diajar.
3. Guru membuka tab "Pertemuan" dan mengklik "Buat Pertemuan Baru".
4. Guru memilih tanggal pertemuan.
5. Guru membuka pertemuan yang baru dibuat.
6. Guru menulis jurnal mengajar.
7. Guru menandai status kehadiran setiap murid (Hadir/Absen/Izin/Sakit).
8. Guru mengklik "Simpan".
9. Di akhir semester, guru membuka tab "Anggota Kelas".
10. Guru mengklik "Beri Nilai" untuk setiap murid.
11. Guru memasukkan skor (0-100) dan evaluasi.
12. Guru mengklik "Simpan".
13. Murid membuka "Progres Belajar" untuk melihat riwayat absensi dan jurnal.
14. Murid membuka "Rapor" untuk melihat nilai akhir.

---

## 4. Laporan dan Cetak

1. Staff atau Admin membuka menu "Laporan".
2. Memilih tab "Keuangan" atau "Akademik".
3. Memilih bulan dan tahun dari dropdown filter.
4. Grafik dan metrik diperbarui sesuai periode yang dipilih.
5. Mengklik "Cetak Laporan".
6. Print dialog muncul dengan kop surat resmi.
7. Dokumen siap dicetak atau disimpan sebagai PDF.

---

## 5. Approval dan Aktivasi Murid

1. Staff membuka menu "Approval Pendaftaran".
2. Staff melihat daftar murid dengan status PENDING.
3. Staff mengklik tombol action di baris murid yang akan diproses.
4. Staff memilih satu atau lebih kelas untuk murid tersebut.
5. Sistem menampilkan total biaya yang akan ditagihkan.
6. Staff mengklik "Aktifkan dan Buat Tagihan".
7. Murid langsung aktif dan tagihan pertama terbuat.
8. Staff dapat langsung menandai lunas jika pembayaran sudah diterima.
