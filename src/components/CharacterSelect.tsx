import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, Gamepad2, MailOpen } from "lucide-react";
import { Character } from "./Character";
import { COLORS, HEADWEARS, HONORIFICS, OUTFITS, defaultHonorific, type Gender, type Look } from "./look";
import { coupleTitle, wedding } from "../config";
import { PARTIES, withHonorific, withParty, type Party, type Version } from "../lib/guest";
import { companionsFor } from "../game/layout";

const fmtDate = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: wedding.timeZone });

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-12 bg-linear-to-r from-transparent to-gold-light" />
      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5">
        <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="currentColor" />
      </svg>
      <span className="h-px w-12 bg-linear-to-l from-transparent to-gold-light" />
    </div>
  );
}

const option = (on: boolean) =>
  `py-2.5 text-sm tracking-wide border transition ${on ? "border-ink bg-ink text-ivory" : "border-gold-light/70 text-ink hover:border-gold"}`;

interface Props {
  guest: string | null;
  initial: Look;
  initialParty: Party;
  version: Version | null;
  onStart: (look: Look, party: Party) => void;
  onClassic: () => void;
  initialStep?: "cover" | "pick";
}

export function CharacterSelect({ guest, initial, initialParty, version, onStart, onClassic, initialStep = "cover" }: Props) {
  const [look, setLook] = useState<Look>(initial);
  const [party, setParty] = useState<Party>(initialParty);
  const [step, setStep] = useState<"cover" | "pick">(initialStep);

  const setGender = (gender: Gender) =>
    setLook((l) =>
      l.gender === gender ? l : { ...l, gender, outfit: OUTFITS[gender][0].id, headwear: "none", honorific: defaultHonorific(gender) },
    );
  const displayName = guest ? withParty(withHonorific(guest, look.honorific), party) : "Tamu Undangan";
  const companions = companionsFor(look, party);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-ink font-game text-ink">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,#2a3556_0%,transparent_60%)]" />
      <div className="stars fixed inset-0 pointer-events-none opacity-40!" />
      <div className="relative min-h-full flex items-center justify-center p-5">
        {step === "cover" ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="frame w-full max-w-sm px-8 py-12 text-center"
          >
            <p className="label-caps">The Wedding of</p>
            <h1 className="font-display text-6xl mt-4 leading-tight text-ink">{coupleTitle}</h1>
            <p className="mt-3 font-serif text-lg italic text-muted">{fmtDate.format(new Date(wedding.events[0].start))}</p>

            <Ornament className="my-8" />

            <p className="font-serif text-2xl italic text-gold">Selamat Datang</p>
            <p className="mt-1 text-xs tracking-wide text-muted">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <p className="mt-3 font-serif text-3xl font-medium wrap-break-word">{guest ? withParty(guest, initialParty) : "Tamu Undangan"}</p>

            <p className="mt-8 text-sm leading-relaxed text-muted font-light">
              {version === "biasa"
                ? "Dengan penuh sukacita, kami mengundang Anda untuk hadir di hari bahagia kami."
                : "Dengan penuh sukacita, kami mengundang Anda. Undangan dapat dibuka sebagai perjalanan interaktif atau versi biasa."}
            </p>
            {version !== "biasa" && (
              <button onClick={() => setStep("pick")} className="btn btn-primary mt-8 w-full">
                <Gamepad2 size={16} strokeWidth={1.5} />
                {version === "game" ? "Buka Undangan" : "Mode Game"}
              </button>
            )}
            {version !== "game" && (
              <button onClick={onClassic} className={`btn mt-2 w-full ${version === "biasa" ? "btn-primary mt-8!" : "btn-outline"}`}>
                <MailOpen size={16} strokeWidth={1.5} />
                {version === "biasa" ? "Buka Undangan" : "Versi Biasa"}
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="frame w-full max-w-md overflow-hidden"
          >
            <div className="px-7 pt-8 text-center">
              <p className="label-caps">Langkah Pertama</p>
              <h2 className="font-serif text-3xl mt-2">Pilih Penampilan Anda</h2>
            </div>

            <div className="relative mx-7 mt-6 h-52 overflow-hidden bg-linear-to-b from-ink to-ink-soft flex items-end justify-center">
              <div className="absolute bottom-0 inset-x-0 h-9 bg-[#5a1a26] border-t border-gold-light" />
              <motion.div key={look.gender + look.outfit + party} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="relative mb-3 flex items-end">
                <Character look={look} className="w-24" />
                {companions.map((c, i) => (
                  <Character key={i} look={c.look} className="-ml-4" style={{ width: 88 * c.scale }} />
                ))}
              </motion.div>
              <span className="absolute top-3 label-caps text-gold-light!">{displayName}</span>
            </div>

            <div className="px-7 py-6 space-y-5">
              <Section label="Karakter">
                <div className="grid grid-cols-2">
                  <button className={option(look.gender === "male")} onClick={() => setGender("male")}>
                    Pria
                  </button>
                  <button className={`${option(look.gender === "female")} -ml-px`} onClick={() => setGender("female")}>
                    Wanita
                  </button>
                </div>
              </Section>

              <Section label="Datang Bersama">
                <div className="grid grid-cols-3">
                  {PARTIES.map((p, i) => (
                    <button key={p.id} className={`${option(party === p.id)} ${i ? "-ml-px" : ""}`} onClick={() => setParty(p.id)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </Section>

              {guest && (
                <Section label="Sapaan">
                  <div className="grid grid-cols-4">
                    {HONORIFICS[look.gender].map((h, i) => (
                      <button
                        key={h.label}
                        className={`${option((look.honorific ?? "") === h.id)} ${i ? "-ml-px" : ""}`}
                        onClick={() => setLook({ ...look, honorific: h.id })}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              <Section label="Busana">
                <div className="grid grid-cols-3">
                  {OUTFITS[look.gender].map((o, i) => (
                    <button key={o.id} className={`${option(look.outfit === o.id)} ${i ? "-ml-px" : ""}`} onClick={() => setLook({ ...look, outfit: o.id })}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </Section>

              <Section label="Kepala">
                <div className="grid grid-cols-2">
                  {HEADWEARS[look.gender].map((hw, i) => (
                    <button key={hw.id} className={`${option(look.headwear === hw.id)} ${i ? "-ml-px" : ""}`} onClick={() => setLook({ ...look, headwear: hw.id })}>
                      {hw.label}
                    </button>
                  ))}
                </div>
              </Section>

              <Section label="Warna">
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setLook({ ...look, color: c })}
                      className={`w-8 h-8 rounded-full ring-offset-2 ring-offset-ivory transition ${look.color === c ? "ring-1 ring-ink" : "ring-1 ring-transparent"}`}
                      style={{ background: c }}
                      aria-label={`Warna ${c}`}
                    />
                  ))}
                </div>
              </Section>

              <button onClick={() => onStart(look, party)} className="btn btn-primary w-full mt-2">
                Masuk ke Pesta
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="label-caps mb-2">{label}</p>
      {children}
    </div>
  );
}
