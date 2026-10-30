// Semua data undangan ada di sini. Ganti sesuai kebutuhan.

export const wedding = {
  groom: {
    nickname: "Fadhlan",
    fullName: "Fadhlan Ambekan nan Tamvann",
    parents: "Putra dari Bapak Fulan & Ibu Fulanah",
  },
  bride: {
    nickname: "Dhea",
    fullName: "Dhea Baik Hati nan Cantikk",
    parents: "Putri dari Bapak Fulan & Ibu Fulanah",
  },
  greeting: "Assalamualaikum Wr. Wb.",
  quote:
    "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya. (QS. Ar-Rum: 21)",

  // Waktu pakai format ISO lengkap dengan zona waktu (+07:00 = WIB)
  events: [
    { name: "Akad Nikah", start: "2027-02-15T08:00:00+07:00", end: "2027-02-15T10:00:00+07:00" },
    { name: "Resepsi", start: "2027-02-15T11:00:00+07:00", end: "2027-02-15T14:00:00+07:00" },
  ],
  timeZone: "Asia/Jakarta",
  timeZoneLabel: "WIB",

  venue: {
    name: "Gedung Serbaguna Mantenan Dalem",
    address: "Jl. Contoh No. 123, Yogyakarta",
    mapsUrl: "https://maps.google.com/?q=Yogyakarta",
  },

  // Nomor WhatsApp penerima RSVP (format internasional tanpa +)
  rsvpWhatsApp: "6281234567890",

  // Amplop digital. Kosongkan array kalau tidak mau ditampilkan.
  gifts: [
    { bank: "BCA", number: "1234567890", holder: "Pocong Putra Pratama" },
    { bank: "DANA", number: "081234567890", holder: "Leak Ayu Lestari" },
  ],

  // Taruh file musik di folder public/music/. Kalau file tidak ada,
  // band otomatis memainkan melodi Canon in D versi chiptune.
  songs: [
    { title: "Lagu Pernikahan Kita", src: "/music/backsound.mp3" },
    { title: "Canon in D (chiptune)", src: "" },
  ],
};

export const coupleTitle = `${wedding.groom.nickname} & ${wedding.bride.nickname}`;
