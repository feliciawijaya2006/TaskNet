# Perbaikan pengalaman pengguna baru TaskNest

## Tujuan
Membuat alur penggunaan pertama terasa jelas dan bertahap tanpa mengubah fungsi atau data yang sudah ada.

## Perubahan tampilan
- Tambahkan panduan tiga langkah di bagian atas: **Tambah tugas → Jadwalkan → Mulai fokus**.
- Tandai hanya satu langkah sebagai tindakan berikutnya berdasarkan kondisi pengguna; langkah yang belum tersedia dibuat lebih tenang.
- Pada kondisi kosong, tampilkan formulir tambah tugas sebagai fokus utama dan sembunyikan statistik yang masih bernilai nol.
- Gunakan Bahasa Indonesia yang konsisten dan ganti istilah teknis seperti “Task Inbox”, “Smart Task List”, dan “Daily Schedule” dengan label sehari-hari.
- Setelah tugas dibuat, tampilkan daftar tugas beserta satu tombol utama yang sesuai dengan tahapnya: **Jadwalkan** sebelum **Mulai fokus**.
- Tampilkan timer hanya sebagai panel aktif saat tugas dipilih; sebelum itu berikan petunjuk singkat, bukan deretan tombol nonaktif.
- Letakkan ringkasan progres di bagian bawah atau setelah pengguna memiliki tugas agar tidak mengalihkan perhatian saat pertama masuk.
- Pertahankan palet slate–indigo–emerald, tetapi terapkan komposisi guided dashboard yang dipilih dengan kontras dan hierarki lebih kuat.

## Interaksi
- Tombol pada panduan menggulirkan pengguna ke bagian tindakan yang relevan.
- Setelah menambah tugas, arahkan perhatian ke tombol **Jadwalkan** pada tugas tersebut.
- Setelah dijadwalkan, arahkan perhatian ke **Mulai fokus**; timer tetap otomatis berjalan saat tombol ditekan.
- Semua perilaku Pomodoro, prioritas otomatis, jadwal, dan penyimpanan lokal tetap dipertahankan.

## Pemeriksaan
- Uji alur pengguna baru dari kondisi kosong: tambah tugas, jadwalkan, mulai fokus.
- Pastikan tampilan tetap mudah dibaca pada desktop dan lebar ponsel 375px.
- Pastikan tidak ada pesan kesalahan pada aplikasi.
