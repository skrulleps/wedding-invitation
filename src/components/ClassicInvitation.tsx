import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronDown, Gamepad2, Volume2, VolumeX } from "lucide-react";
import { Ornament } from "./CharacterSelect";
import { coupleTitle, wedding } from "../config";
import { playSong, stopSong, useMusic } from "../lib/music";
import { CoupleContent, ReceptionContent, TimeContent } from "../game/Panels";

const fmtDate = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: wedding.timeZone });

function Section({ eyebrow, title, children, dark = false }: { eyebrow: string; title: string; children: ReactNode; dark?: boolean }) {
  return (
    <section className={`px-6 py-20 ${dark ? "bg-ink text-ivory" : "bg-ivory text-ink"}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-md"
      >
        <div className="text-center mb-8">
          <p className="label-caps">{eyebrow}</p>
          <h2 className="font-serif text-4xl mt-2">{title}</h2>
          <Ornament className="mt-4" />
        </div>
        {children}
      </motion.div>
    </section>
  );
}

// Undangan versi biasa (tanpa game): halaman scroll klasik.
export function ClassicInvitation({ guest, partyCount, onGame }: { guest: string; partyCount: number; onGame?: () => void }) {
  const music = useMusic();
  return (
    <div className="min-h-screen bg-ivory font-game">
      {/* sampul */}
      <header className="relative min-h-dvh bg-ink text-ivory flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2a3556_0%,transparent_65%)]" />
        <div className="stars absolute inset-0 opacity-40!" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative">
          <p className="label-caps text-gold-light!">The Wedding of</p>
          <h1 className="font-display text-7xl mt-5 leading-tight">{coupleTitle}</h1>
          <p className="mt-4 font-serif text-xl italic text-ivory/70">{fmtDate.format(new Date(wedding.events[0].start))}</p>
          <Ornament className="my-10" />
          <p className="text-xs tracking-wide text-ivory/60">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p className="mt-2 font-serif text-3xl">{guest}</p>
        </motion.div>
        <ChevronDown className="absolute bottom-8 text-gold-light animate-bounce" strokeWidth={1.25} />
      </header>

      <Section eyebrow="Kedua Mempelai" title="Pernikahan Kami">
        <CoupleContent />
      </Section>

      <Section eyebrow="Save the Date" title="Waktu & Tempat">
        <TimeContent />
      </Section>

      <Section eyebrow="Buku Tamu" title="Konfirmasi Kehadiran">
        <ReceptionContent guest={guest} defaultCount={partyCount} />
      </Section>

      <Section eyebrow="Terima Kasih" title="Sampai Jumpa" dark>
        <p className="text-center text-sm text-ivory/70 font-light leading-relaxed">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila {guest} berkenan hadir dan memberikan doa restu.
        </p>
        <p className="mt-8 text-center font-serif italic text-ivory/60">Kami yang berbahagia,</p>
        <p className="text-center font-display text-5xl mt-1">{coupleTitle}</p>
        {onGame && (
          <button onClick={onGame} className="btn mt-10 w-full border border-gold-light/60 text-ivory hover:bg-ink-soft">
            <Gamepad2 size={16} strokeWidth={1.5} /> Coba Mode Game
          </button>
        )}
      </Section>

      <button
        onClick={() => (music.playing ? stopSong() : playSong(wedding.songs[0].title, wedding.songs[0].src))}
        className="fixed bottom-5 right-5 z-40 grid place-items-center w-11 h-11 rounded-full border border-gold-light/60 bg-ink/80 backdrop-blur text-ivory"
        aria-label="Musik"
      >
        {music.playing ? <Volume2 size={16} strokeWidth={1.5} /> : <VolumeX size={16} strokeWidth={1.5} />}
      </button>
    </div>
  );
}
