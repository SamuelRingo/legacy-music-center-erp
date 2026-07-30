# Hasil Pengujian — Legacy Music Center ERP

Pengujian dilakukan secara manual dengan metode End-to-End, 
mencakup 5 role (Publik, Student, Teacher, Staff, Admin) 
dan 20 skenario utama.

---

## Ringkasan Hasil

| No | Skenario | Role | Hasil |
|---|---|---|---|
| 1 | Register murid baru | Public | Lolos |
| 2 | Auto-login setelah register | Student | Lolos |
| 3 | Chatbot membalas pertanyaan | Public | Lolos |
| 4 | Halaman /events menampilkan event | Public | Lolos |
| 5 | Tooltip Lupa Password muncul | Public | Lolos |
| 6 | Validasi nomor HP (+62) | Public | Lolos |
| 7 | Staff approve murid PENDING | Staff | Lolos |
| 8 | Staff generate tagihan bulanan | Staff | Lolos |
| 9 | Staff tandai lunas & cetak bukti | Staff | Lolos |
| 10 | Staff atur jadwal (deteksi bentrok) | Staff | Lolos |
| 11 | Staff catat transaksi kas | Staff | Lolos |
| 12 | Staff kelola inventaris | Staff | Lolos |
| 13 | Teacher buat meeting & absensi | Teacher | Lolos |
| 14 | Teacher beri nilai akhir | Teacher | Lolos |
| 15 | Teacher ubah grade & bulan | Teacher | Lolos |
| 16 | Student lihat progres & rapor | Student | Lolos |
| 17 | Student lihat tagihan & cetak | Student | Lolos |
| 18 | Admin kelola user & reset password | Admin | Lolos |
| 19 | Admin catat absensi & gaji staff | Admin | Lolos |
| 20 | Akses ilegal ditolak (403) | Staff | Lolos |

---

## Bug yang Ditemukan dan Diperbaiki

1. **Grade guru tidak bisa dibuka.** Komponen Select menyebabkan 
   silent crash. Diperbaiki dengan menambahkan handleUpdateGrade 
   dan event stopPropagation.

2. **Dropdown grade memanggil API berulang.** Setiap perubahan 
   dropdown memicu request. Diganti dengan dialog Edit Grade yang 
   hanya memanggil API sekali saat simpan.

3. **Format harga kursus tidak terbaca.** Input harga tanpa 
   pemisah ribuan. Ditambahkan thousand separator di form.

4. **Footer cetak invoice tidak sejajar.** Hook useFooterData 
   tidak memetakan data CMS dengan benar. Diperbaiki key mapping-nya.

5. **Halaman tagihan murid blank.** useAuth berjalan di luar 
   konteks. Diganti dengan pembacaan token langsung dari localStorage.

6. **Chatbot mengeluarkan teks analisis.** Model AI menampilkan 
   chain-of-thought. Ditambahkan filter untuk membuang teks 
   meta-analysis dan hanya menampilkan jawaban final.

---

## Kesimpulan

Seluruh 20 skenario pengujian lolos. Sistem siap digunakan 
untuk operasional sekolah musik.
