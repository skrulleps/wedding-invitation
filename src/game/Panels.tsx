import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { CalendarPlus, Camera, Check, Copy, Download, MapPin, Music2, Pause, Send, Share2, Volume2, X } from "lucide-react";
import { downloadBlob, renderPhoto, shareBlob } from "../lib/photo";
import { Character, type Look } from "../components/Character";
import { Ornament } from "../components/CharacterSelect";
import { coupleTitle, wedding } from "../config";
import { playSong, stopSong, useMusic } from "../lib/music";
import { LOOKS, type Companion } from "./layout";

export function PanelShell({ eyebrow, title, onClose, children }: { eyebrow: string; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 font-game"
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="frame relative w-full max-w-md max-h-[88dvh] overflow-y-auto text-ink"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-muted hover:text-ink" aria-label="Tutup">
          <X size={18} strokeWidth={1.5} />
        </button>
        <div className="px-7 pt-9 text-center">
          <p className="label-caps">{eyebrow}</p>
          <h3 className="font-serif text-3xl mt-1.5">{title}</h3>
          <Ornament className="mt-4" />
        </div>
        <div className="px-7 pt-5 pb-8">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* ------------ Gerbang: ini pernikahan siapa ------------ */

function PersonCard({ look, person }: { look: Look; person: { nickname: string; fullName: string; parents: string } }) {
  return (
    <div className="flex-1 text-center">
      <div className="relative mx-auto w-24 h-24 rounded-full border border-gold-light bg-cream overflow-hidden">
        <Character look={look} className="absolute left-1/2 top-[6%] -translate-x-1/2 w-[130%] max-w-none" />
      </div>
      <p className="mt-3 font-display text-4xl">{person.nickname}</p>
      <p className="font-serif text-lg font-medium leading-tight mt-1">{person.fullName}</p>
      <p className="text-xs text-muted mt-1.5 font-light leading-relaxed">{person.parents}</p>
    </div>
  );
}

export function CoupleContent() {
  return (
    <>
      <p className="text-center font-serif italic text-lg">{wedding.greeting}</p>
      <p className="text-center text-sm text-muted mt-1 font-light">Dengan memohon rahmat Allah SWT, kami bermaksud menyelenggarakan pernikahan:</p>
      <div className="mt-6 flex items-start gap-1">
        <PersonCard look={LOOKS.groom} person={wedding.groom} />
        <div className="font-display text-3xl text-gold pt-9">&</div>
        <PersonCard look={LOOKS.bride} person={wedding.bride} />
      </div>
      <blockquote className="mt-7 border-y border-gold-light/60 py-4 text-center font-serif italic text-[15px] text-muted leading-relaxed">
        {wedding.quote}
      </blockquote>
    </>
  );
}

export function CouplePanel({ onClose }: { onClose: () => void }) {
  return (
    <PanelShell eyebrow="Kedua Mempelai" title="Pernikahan Siapa?" onClose={onClose}>
      <CoupleContent />
      <button onClick={onClose} className="btn btn-primary w-full mt-7">
        Lanjutkan
      </button>
    </PanelShell>
  );
}

/* ------------ Jam: waktu & tempat ------------ */

const fmtDate = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: wedding.timeZone });
const fmtTime = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: wedding.timeZone });

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    done: diff === 0,
    parts: [
      [Math.floor(diff / 86400000), "Hari"],
      [Math.floor(diff / 3600000) % 24, "Jam"],
      [Math.floor(diff / 60000) % 60, "Menit"],
      [Math.floor(diff / 1000) % 60, "Detik"],
    ] as const,
  };
}

const gcalDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");

function EventSchedule() {
  return (
    <div className="divide-y divide-gold-light/50 border-y border-gold-light/50">
      {wedding.events.map((e) => (
        <div key={e.name} className="flex items-baseline justify-between py-3">
          <span className="font-serif text-xl">{e.name}</span>
          <span className="text-sm tabular-nums text-muted">
            {fmtTime.format(new Date(e.start))} – {fmtTime.format(new Date(e.end))} {wedding.timeZoneLabel}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TimePanel({ onClose }: { onClose: () => void }) {
  return (
    <PanelShell eyebrow="Save the Date" title="Waktu & Tempat" onClose={onClose}>
      <TimeContent />
    </PanelShell>
  );
}

export function TimeContent() {
  const first = wedding.events[0];
  const last = wedding.events[wedding.events.length - 1];
  const { done, parts } = useCountdown(new Date(first.start).getTime());
  const calendarUrl = useMemo(() => {
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: `Pernikahan ${coupleTitle}`,
      dates: `${gcalDate(first.start)}/${gcalDate(last.end)}`,
      location: `${wedding.venue.name}, ${wedding.venue.address}`,
      details: wedding.events.map((e) => `${e.name}: ${fmtTime.format(new Date(e.start))} ${wedding.timeZoneLabel}`).join("\n"),
    });
    return `https://calendar.google.com/calendar/render?${p}`;
  }, [first, last]);

  return (
    <>
      <p className="text-center font-serif text-xl italic">{fmtDate.format(new Date(first.start))}</p>
      {done ? (
        <p className="mt-4 text-center text-sm text-muted">Hari bahagia telah tiba.</p>
      ) : (
        <div className="mt-5 grid grid-cols-4 divide-x divide-gold-light/60">
          {parts.map(([v, label]) => (
            <div key={label} className="text-center">
              <div className="font-serif text-4xl tabular-nums leading-none">{String(v).padStart(2, "0")}</div>
              <div className="label-caps mt-1.5 text-[0.6rem]!">{label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6">
        <EventSchedule />
      </div>
      <div className="mt-6 text-center">
        <MapPin size={18} strokeWidth={1.5} className="mx-auto text-gold" />
        <p className="mt-2 font-serif text-xl">{wedding.venue.name}</p>
        <p className="text-sm text-muted font-light">{wedding.venue.address}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <a href={wedding.venue.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
          <MapPin size={14} strokeWidth={1.5} /> Peta
        </a>
        <a href={calendarUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
          <CalendarPlus size={14} strokeWidth={1.5} /> Kalender
        </a>
      </div>
    </>
  );
}

/* ------------ Resepsionis: buku tamu & amplop ------------ */

export function ReceptionPanel({ guest, defaultCount, onClose }: { guest: string; defaultCount: number; onClose: () => void }) {
  return (
    <PanelShell eyebrow="Meja Resepsionis" title="Buku Tamu" onClose={onClose}>
      <ReceptionContent guest={guest} defaultCount={defaultCount} />
    </PanelShell>
  );
}

export function ReceptionContent({ guest, defaultCount }: { guest: string; defaultCount: number }) {
  const [tab, setTab] = useState<"rsvp" | "gift">("rsvp");
  const [name, setName] = useState(guest);
  const [attend, setAttend] = useState<"Hadir" | "Berhalangan hadir">("Hadir");
  const [count, setCount] = useState(defaultCount);
  const [wish, setWish] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const waUrl = () => {
    const lines = [`Halo, saya *${name || "Tamu"}*`, `Konfirmasi: *${attend}*${attend === "Hadir" ? ` (${count} orang)` : ""}`];
    if (wish.trim()) lines.push(`Ucapan & doa: ${wish.trim()}`);
    lines.push("", `— dikirim dari undangan ${coupleTitle}`);
    const msg = lines.join("\n");
    return `https://wa.me/${wedding.rsvpWhatsApp}?text=${encodeURIComponent(msg)}`;
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const tabs = wedding.gifts.length ? (["rsvp", "gift"] as const) : (["rsvp"] as const);

  return (
    <>
      {tabs.length > 1 && (
        <div className="flex justify-center gap-6 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-1 text-xs uppercase tracking-[0.2em] border-b transition ${tab === t ? "border-ink text-ink" : "border-transparent text-muted"}`}
            >
              {t === "rsvp" ? "Konfirmasi" : "Amplop Digital"}
            </button>
          ))}
        </div>
      )}

      {tab === "rsvp" ? (
        <div className="space-y-5">
          <label className="block">
            <span className="label-caps">Nama</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field font-serif text-lg" />
          </label>
          <div>
            <span className="label-caps">Kehadiran</span>
            <div className="mt-2 grid grid-cols-2">
              {(["Hadir", "Berhalangan hadir"] as const).map((a, i) => (
                <button
                  key={a}
                  onClick={() => setAttend(a)}
                  className={`py-2.5 text-sm border transition ${i ? "-ml-px" : ""} ${attend === a ? "border-ink bg-ink text-ivory" : "border-gold-light"}`}
                >
                  {a === "Hadir" ? "Akan hadir" : "Berhalangan"}
                </button>
              ))}
            </div>
          </div>
          {attend === "Hadir" && (
            <div className="flex items-center justify-between">
              <span className="label-caps">Jumlah tamu</span>
              <div className="flex items-center border border-gold-light">
                <button onClick={() => setCount((c) => Math.max(1, c - 1))} className="w-9 h-9 text-lg" aria-label="Kurangi">
                  −
                </button>
                <span className="w-8 text-center font-serif text-xl tabular-nums">{count}</span>
                <button onClick={() => setCount((c) => Math.min(10, c + 1))} className="w-9 h-9 text-lg" aria-label="Tambah">
                  +
                </button>
              </div>
            </div>
          )}
          <label className="block">
            <span className="label-caps">Ucapan & doa</span>
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              rows={3}
              placeholder="Tuliskan ucapan dan doa terbaik Anda"
              className="field resize-none font-light"
            />
          </label>
          <a href={waUrl()} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
            <Send size={14} strokeWidth={1.5} /> Kirim via WhatsApp
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted text-center font-light leading-relaxed">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, dapat melalui:
          </p>
          {wedding.gifts.map((g) => (
            <div key={g.number} className="border border-gold-light/70 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="label-caps">{g.bank}</p>
                <p className="font-serif text-2xl tabular-nums mt-0.5">{g.number}</p>
                <p className="text-xs text-muted">a.n. {g.holder}</p>
              </div>
              <button onClick={() => copy(g.number)} className="btn btn-outline px-3!">
                {copied === g.number ? <Check size={14} /> : <Copy size={14} strokeWidth={1.5} />}
                {copied === g.number ? "Tersalin" : "Salin"}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------ Band: request lagu ------------ */

export function BandPanel({ onClose }: { onClose: () => void }) {
  const music = useMusic();
  return (
    <PanelShell eyebrow="Live Music" title="Permintaan Lagu" onClose={onClose}>
      <p className="text-sm text-muted text-center font-light mb-5">Silakan pilih lagu yang ingin Anda dengarkan.</p>
      <div className="divide-y divide-gold-light/50 border-y border-gold-light/50">
        {wedding.songs.map((s) => {
          const active = music.playing && music.title === s.title;
          return (
            <button
              key={s.title}
              onClick={() => {
                void playSong(s.title, s.src);
                onClose();
              }}
              className="w-full flex items-center gap-4 py-4 text-left hover:bg-cream/60 transition"
            >
              {active ? <Volume2 size={18} className="text-gold" /> : <Music2 size={18} strokeWidth={1.5} className="text-muted" />}
              <span className="flex-1 font-serif text-xl">{s.title}</span>
              {active && <span className="label-caps">Diputar</span>}
            </button>
          );
        })}
      </div>
      {music.playing && (
        <button onClick={stopSong} className="btn btn-outline w-full mt-6">
          <Pause size={14} strokeWidth={1.5} /> Hentikan musik
        </button>
      )}
    </PanelShell>
  );
}

/* ------------ Pengantin: foto bersama & terima kasih ------------ */

export function FinalePanel({ guest, look, companions, onClose }: { guest: string; look: Look; companions: Companion[]; onClose: () => void }) {
  const [flash, setFlash] = useState(false);
  const [taken, setTaken] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const date = fmtDate.format(new Date(wedding.events[0].start));
  const filename = `foto-pernikahan-${coupleTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  // gambar disiapkan lebih dulu supaya menu share bisa langsung dibuka saat tombol ditekan
  useEffect(() => {
    if (!taken || !areaRef.current) return;
    renderPhoto(areaRef.current, { title: coupleTitle, guest, date, venue: wedding.venue.name })
      .then(setPhoto)
      .catch(() => setNote("Maaf, foto gagal dibuat di perangkat ini."));
  }, [taken, guest, date]);

  const snap = () => {
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setTaken(true);
    }, 350);
  };

  const save = () => {
    if (!photo) return;
    downloadBlob(photo, filename);
    setNote("Foto tersimpan.");
  };

  const share = async () => {
    if (!photo) return;
    const shared = await shareBlob(photo, filename, `Foto bersama di pernikahan ${coupleTitle} 💐`);
    if (!shared) {
      downloadBlob(photo, filename);
      setNote("Perangkat ini belum mendukung berbagi langsung. Foto sudah diunduh, silakan bagikan dari galeri.");
    }
  };

  return (
    <PanelShell eyebrow="Kenang-kenangan" title="Foto Bersama Mempelai" onClose={onClose}>
      {taken && <Petals />}
      <div className="mx-auto w-full max-w-xs bg-white p-3 pb-5 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)]">
        <div ref={areaRef} className="relative aspect-4/3 overflow-hidden bg-linear-to-b from-ink to-ink-soft">
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#5a1a26] border-t border-gold-light" />
          <div className="absolute inset-x-0 bottom-[12%] flex items-end justify-center">
            {/* lebar tiap karakter menyesuaikan jumlah orang di foto */}
            <Character look={LOOKS.groom} style={{ width: `${82 / (3 + companions.length)}%` }} />
            <Character look={look} className="mb-1" style={{ width: `${82 / (3 + companions.length)}%` }} />
            {companions.map((c, i) => (
              <Character key={i} look={c.look} className="mb-1" style={{ width: `${(82 / (3 + companions.length)) * c.scale}%` }} />
            ))}
            <Character look={LOOKS.bride} className="-scale-x-100" style={{ width: `${82 / (3 + companions.length)}%` }} />
          </div>
          {flash && <div className="absolute inset-0 bg-white" />}
        </div>
        <p className="mt-4 text-center font-display text-3xl leading-none">{coupleTitle}</p>
        <p className="text-center text-[11px] tracking-wide text-muted mt-2">
          bersama {guest} · {date}
        </p>
      </div>

      {!taken ? (
        <button onClick={snap} className="btn btn-primary w-full mt-7">
          <Camera size={14} strokeWidth={1.5} /> Ambil Foto
        </button>
      ) : (
        <div className="mt-6 text-center">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={save} disabled={!photo} className="btn btn-outline disabled:opacity-50">
              <Download size={14} strokeWidth={1.5} /> Simpan
            </button>
            <button onClick={share} disabled={!photo} className="btn btn-primary disabled:opacity-50">
              <Share2 size={14} strokeWidth={1.5} /> Bagikan
            </button>
          </div>
          {note && <p className="mt-2 text-xs text-muted">{note}</p>}
          <p className="mt-8 font-serif text-3xl italic">Sampai Jumpa di Hari Bahagia</p>
          <p className="mt-3 text-sm text-muted font-light leading-relaxed">
            Terima kasih, <span className="text-ink font-medium">{guest}</span>, atas kesediaan Anda untuk hadir. Kami menantikan kehadiran
            Anda secara langsung untuk berbagi kebahagiaan bersama kami.
          </p>
          <div className="mt-6 text-left">
            <p className="text-center font-serif text-lg italic mb-2">{date}</p>
            <EventSchedule />
            <p className="mt-3 text-center text-sm">
              <MapPin size={14} strokeWidth={1.5} className="inline -mt-0.5 mr-1 text-gold" />
              {wedding.venue.name}
            </p>
          </div>
          <p className="mt-6 font-serif italic text-muted">Kami yang berbahagia,</p>
          <p className="font-display text-3xl">{coupleTitle}</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <a href={wedding.venue.mapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              <MapPin size={14} strokeWidth={1.5} /> Lokasi
            </a>
            <button onClick={onClose} className="btn btn-outline">
              Kembali
            </button>
          </div>
        </div>
      )}
    </PanelShell>
  );
}

const PETALS = Array.from({ length: 36 }, (_, i) => ({
  left: Math.random() * 100,
  delay: Math.random() * 1.5,
  dur: 4 + Math.random() * 3,
  color: ["#d9c08f", "#f1e9da", "#e8cfc8", "#b08d57"][i % 4],
  rot: Math.random() * 360,
}));

function Petals() {
  return (
    <div className="pointer-events-none fixed inset-0 z-60 overflow-hidden">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="confetti absolute top-[-5%] w-2.5 h-3.5 rounded-[60%_0_60%_0] opacity-90"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, rotate: `${p.rot}deg` }}
        />
      ))}
    </div>
  );
}
