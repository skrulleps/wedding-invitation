# Undangan Pernikahan Interaktif

Undangan berbentuk game 2D: tamu memilih karakter dan outfit, lalu berjalan melewati gerbang pernikahan, jam acara, meja resepsionis, panggung band, dan pelaminan.

## Mengatur isi undangan

Semua data ada di `src/config.ts`: nama mempelai, orang tua, jadwal acara, lokasi, nomor WhatsApp RSVP, rekening amplop digital, dan daftar lagu.

Musik: taruh file di `public/music/backsound.mp3` (atau ubah `src` di `songs`). Kalau file tidak ditemukan, band memainkan Canon in D versi chiptune.

## Membagikan undangan

Nama tamu diambil dari URL:

```
https://domain-kamu.com/adnan                          -> Adnan
https://domain-kamu.com/budi-santoso?ajak=pasangan     -> Budi Santoso & Pasangan
https://domain-kamu.com/siti-aminah?ajak=keluarga      -> Siti Aminah & Keluarga
https://domain-kamu.com/adnan?versi=biasa              -> langsung versi biasa (tanpa game)
https://domain-kamu.com/adnan?versi=game               -> langsung mode game
```

Tanpa `versi`, tamu memilih sendiri di sampul: Mode Game atau Versi Biasa. Di mode game, tamu memilih sapaan (Bapak/Mas/Kak, Ibu/Mbak/Kak, atau tanpa sapaan) dan bisa mengubah datang sendiri/pasangan/keluarga.

Untuk membuat banyak link sekaligus, buka `https://domain-kamu.com/?generate`. Tulis satu nama per baris, tambahkan `, pasangan` atau `, keluarga` bila perlu, lalu salin pesan atau kirim langsung via WhatsApp.

Hosting harus mengarahkan semua path ke `index.html`. Konfigurasi untuk Vercel (`vercel.json`) dan Netlify (`public/_redirects`) sudah disertakan.

## Development

```
npm install
npm run dev
npm run build
```

Hasil `dist/` bisa di-deploy ke hosting statis seperti Vercel, Netlify, atau GitHub Pages.
