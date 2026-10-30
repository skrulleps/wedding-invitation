import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Clock, Flower2, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { Character, type Look } from "../components/Character";
import { coupleTitle, wedding } from "../config";
import { playSong, stopSong, useMusic } from "../lib/music";
import { DialogBox, type Line } from "./DialogBox";
import { BandPanel, CouplePanel, FinalePanel, ReceptionPanel, TimePanel } from "./Panels";
import { FLOOR, LOOKS, SPEED, START_X, STATIONS, WORLD_H, WORLD_W, stationById, type Companion, type StationId } from "./layout";
import { WorldBack, WorldFar, WorldFront } from "./World";

const PLAYER_W = 84;
const followGap = (i: number) => (i === 0 ? 50 : 40);
const startFollowerX = (i: number) => {
  let x = START_X;
  for (let j = 0; j <= i; j++) x -= followGap(j);
  return Math.max(20, x);
};

const fmtDay = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: wedding.timeZone });
const fmtTime = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: wedding.timeZone });

const icon = (Icon: typeof Flower2) => <Icon size={24} strokeWidth={1.25} />;

function scriptFor(id: StationId, guest: string, bandPlaying: boolean): Line[] {
  const { groom, bride } = wedding;
  switch (id) {
    case "gate":
      return [
        { speaker: "Gerbang Pernikahan", icon: icon(Flower2), text: `Selamat datang, ${guest}. Anda kini berada di depan gerbang sebuah hari yang istimewa.` },
        { speaker: "Gerbang Pernikahan", icon: icon(Flower2), text: "Izinkan kami memperkenalkan kedua mempelai." },
      ];
    case "time":
      return [
        { speaker: "Penunjuk Waktu", icon: icon(Clock), text: `${guest}, mohon luangkan waktu sejenak untuk mencatat jadwal acara kami.` },
        { speaker: "Penunjuk Waktu", icon: icon(Clock), text: "Berikut tanggal, waktu, dan lokasi pelaksanaannya." },
      ];
    case "reception":
      return [
        { speaker: "Penerima Tamu", avatar: LOOKS.receptionist, text: `Selamat datang, ${guest}. Terima kasih telah berkenan hadir.` },
        { speaker: "Penerima Tamu", avatar: LOOKS.receptionist, text: "Silakan mengisi buku tamu untuk konfirmasi kehadiran. Amplop digital juga tersedia di sini." },
      ];
    case "band":
      return bandPlaying
        ? [{ speaker: "Penyanyi", avatar: LOOKS.singer, text: `Semoga Anda menikmati alunan musiknya, ${guest}. Ingin mendengar lagu lain?` }]
        : [
            { speaker: "Penyanyi", avatar: LOOKS.singer, text: `Selamat malam, ${guest}. Kami akan mengiringi malam bahagia ${coupleTitle}.` },
            { speaker: "Penyanyi", avatar: LOOKS.singer, text: "Silakan pilih lagu yang ingin Anda dengarkan." },
          ];
    case "couple": {
      const reception = wedding.events[wedding.events.length - 1];
      const when = `${fmtDay.format(new Date(reception.start))} pukul ${fmtTime.format(new Date(reception.start))} ${wedding.timeZoneLabel}`;
      return [
        { speaker: groom.nickname, avatar: LOOKS.groom, text: `${guest}, terima kasih telah singgah di pesta kecil kami ini.` },
        { speaker: bride.nickname, avatar: LOOKS.bride, text: "Namun kebahagiaan yang sesungguhnya ingin kami bagikan secara langsung. Kami sangat berharap Anda dapat hadir." },
        { speaker: groom.nickname, avatar: LOOKS.groom, text: `Resepsi kami akan digelar ${when}, bertempat di ${wedding.venue.name}.` },
        { speaker: bride.nickname, avatar: LOOKS.bride, text: `Terima kasih atas kesediaan Anda untuk hadir, ${guest}. Kehadiran dan doa restu Anda sangat berarti bagi kami.` },
        { speaker: groom.nickname, avatar: LOOKS.groom, text: "Sampai jumpa di hari bahagia kami. Sebelum itu, mari berfoto bersama." },
      ];
    }
  }
}

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

export function GameScene({ look, guest, companions, partyCount }: { look: Look; guest: string; companions: Companion[]; partyCount: number }) {
  const { w, h } = useViewport();
  // di layar portrait, dunia dinaikkan supaya tidak tertutup tombol kontrol
  const padBottom = w < h ? 100 : 0;
  const scale = Math.min((h - padBottom) / WORLD_H, w / 380, 2.2);
  const viewW = w / scale;

  const music = useMusic();
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [near, setNear] = useState<StationId | null>(null);
  const [active, setActive] = useState<StationId | null>(null);
  const [phase, setPhase] = useState<"talk" | "panel">("talk");
  const [visited, setVisited] = useState<ReadonlySet<StationId>>(() => new Set());
  const [hintDir, setHintDir] = useState<-1 | 0 | 1>(1);
  const [showHelp, setShowHelp] = useState(true);

  const px = useRef(START_X);
  const keys = useRef({ left: false, right: false });
  const target = useRef<{ x: number; station?: StationId } | null>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  // pasangan / anak mengikuti di belakang pemain
  const followerX = useRef(companions.map((_, i) => startFollowerX(i)));
  const followerRefs = useRef<(HTMLDivElement | null)[]>([]);
  // state terbaru untuk dibaca game loop tanpa re-subscribe
  const live = useRef({ viewW, active, near, facing, walking, visited, hintDir });
  useLayoutEffect(() => {
    Object.assign(live.current, { viewW, active, near, visited });
  }, [viewW, active, near, visited]);

  const open = useCallback((id: StationId) => {
    keys.current = { left: false, right: false };
    target.current = null;
    setPhase("talk");
    setActive(id);
    setShowHelp(false);
  }, []);

  const close = () => {
    if (active) setVisited((v) => new Set(v).add(active));
    setActive(null);
  };

  // game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      const L = live.current;
      let dir = 0;
      if (!L.active) {
        if (keys.current.left !== keys.current.right) {
          dir = keys.current.left ? -1 : 1;
          target.current = null;
        } else if (target.current) {
          const d = target.current.x - px.current;
          if (Math.abs(d) < 6) {
            const st = target.current.station;
            target.current = null;
            if (st) open(st);
          } else dir = Math.sign(d);
        }
      }
      px.current = Math.max(40, Math.min(WORLD_W - 40, px.current + dir * SPEED * dt));
      const x = px.current;

      const isWalking = dir !== 0;
      if (isWalking !== L.walking) {
        setWalking((L.walking = isWalking));
        if (isWalking) setShowHelp(false);
      }
      if (dir && dir !== L.facing) setFacing((L.facing = dir as 1 | -1));

      let nearest: StationId | null = null;
      let best = Infinity;
      for (const s of STATIONS) {
        const d = Math.abs(s.x - x);
        if (d < s.range && d < best) {
          best = d;
          nearest = s.id;
        }
      }
      if (nearest !== L.near) setNear((L.near = nearest));

      const next = STATIONS.find((s) => !L.visited.has(s.id));
      const hd = !next || nearest === next.id ? 0 : next.x > x ? 1 : -1;
      if (hd !== L.hintDir) setHintDir((L.hintDir = hd));

      const cam = Math.max(0, Math.min(WORLD_W - L.viewW, x - L.viewW / 2));
      if (worldRef.current) worldRef.current.style.transform = `translateX(${-cam}px)`;
      if (farRef.current) farRef.current.style.transform = `translateX(${-cam * 0.3}px)`;
      if (playerRef.current) playerRef.current.style.left = `${x - PLAYER_W / 2}px`;
      if (promptRef.current) promptRef.current.style.left = `${x}px`;
      let leader = x;
      followerX.current.forEach((fx, i) => {
        const d = leader - L.facing * followGap(i) - fx;
        if (Math.abs(d) > 3) followerX.current[i] = fx + Math.sign(d) * Math.min(Math.abs(d), SPEED * 1.15 * dt);
        leader = followerX.current[i];
        const el = followerRefs.current[i];
        if (el) el.style.left = `${leader - PLAYER_W / 2}px`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // keyboard
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.current.left = down;
      else if (k === "arrowright" || k === "d") keys.current.right = down;
      else if (down && ["e", "enter", " "].includes(k) && !live.current.active && live.current.near) {
        e.preventDefault();
        open(live.current.near);
      }
    };
    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp = (e: KeyboardEvent) => set(e, false);
    const reset = () => (keys.current = { left: false, right: false });
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", reset);
    };
  }, [open]);

  // tap untuk berjalan / tap objek untuk menghampiri
  const onScenePointer = (e: PointerEvent<HTMLDivElement>) => {
    if (active) return;
    const el = (e.target as Element).closest("[data-station]");
    const id = el?.getAttribute("data-station") as StationId | null;
    if (id) {
      const s = stationById(id);
      if (near === id) open(id);
      else target.current = { x: s.standX, station: id };
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const cam = Math.max(0, Math.min(WORLD_W - viewW, px.current - viewW / 2));
    target.current = { x: (e.clientX - rect.left) / scale + cam };
  };

  const hold = (dir: "left" | "right") => ({
    onPointerDown: (e: PointerEvent) => {
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      keys.current[dir] = true;
    },
    onPointerUp: () => (keys.current[dir] = false),
    onPointerCancel: () => (keys.current[dir] = false),
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  });

  const nextStation = STATIONS.find((s) => !visited.has(s.id));
  const nearStation = near ? stationById(near) : null;

  return (
    <div className="fixed inset-0 overflow-hidden select-none font-game bg-linear-to-b from-[#0e1424] via-[#1c2540] to-[#3d3550]">
      <div className="stars absolute inset-0" />

      {/* dunia */}
      <div className="absolute inset-x-0 bottom-0 bg-[#d9c7a5]" style={{ height: padBottom }} />
      <div
        className="absolute left-0 origin-bottom-left touch-none"
        style={{ bottom: padBottom, width: viewW, height: WORLD_H, transform: `scale(${scale})` }}
        onPointerDown={onScenePointer}
      >
        <div ref={farRef} className="absolute top-0 left-0 h-full will-change-transform" style={{ width: WORLD_W }}>
          <WorldFar />
        </div>
        <div ref={worldRef} className="absolute top-0 left-0 h-full will-change-transform" style={{ width: WORLD_W }}>
          <WorldBack bandPlaying={music.playing} visited={visited} guest={guest} />
          {companions.map((c, i) => (
            <div
              key={i}
              ref={(el) => {
                followerRefs.current[i] = el;
              }}
              className="absolute flex justify-center"
              style={{ left: startFollowerX(i) - PLAYER_W / 2, bottom: FLOOR + 6, width: PLAYER_W }}
            >
              <Character look={c.look} pose={walking ? "walk" : "idle"} style={{ width: PLAYER_W * 0.92 * c.scale, transform: `scaleX(${facing})`, ["--d" as string]: `${-0.3 * (i + 1)}s` }} />
            </div>
          ))}
          <div ref={playerRef} className="absolute" style={{ left: START_X - PLAYER_W / 2, bottom: FLOOR, width: PLAYER_W }}>
            <Character look={look} pose={walking ? "walk" : "idle"} className="w-full" style={{ transform: `scaleX(${facing})` }} />
          </div>
          <WorldFront visited={visited} />
          {/* label di atas kepala, di layer paling depan supaya tidak tertutup gerbang */}
          <div ref={promptRef} className="absolute w-0" style={{ left: START_X, bottom: FLOOR + 152 }}>
            <AnimatePresence mode="wait">
              {nearStation && !active ? (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 -translate-x-1/2 whitespace-nowrap flex items-center gap-1.5 bg-ivory px-3.5 py-1.5 text-[13px] tracking-wide text-ink shadow-lg border border-gold-light cursor-pointer"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    open(nearStation.id);
                  }}
                >
                  <MessageCircle size={13} strokeWidth={1.5} className="text-gold" /> {nearStation.label}
                </motion.div>
              ) : (
                <motion.div
                  key="name"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 -translate-x-1/2 text-[11px] tracking-[0.15em] uppercase text-ivory bg-ink/60 px-2 py-0.5 whitespace-nowrap max-w-48 truncate pointer-events-none"
                >
                  {guest}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* HUD atas */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto text-ivory">
          <p className="label-caps text-gold-light! text-[0.6rem]!">The Wedding of</p>
          <p className="font-display text-3xl leading-tight">{coupleTitle}</p>
          <div className="mt-1 flex gap-1.5">
            {STATIONS.map((s) => (
              <span key={s.id} title={s.label} className={`h-px w-6 ${visited.has(s.id) ? "bg-gold-light" : "bg-ivory/25"}`} />
            ))}
          </div>
        </div>
        <button
          className="pointer-events-auto grid place-items-center rounded-full border border-gold-light/60 bg-ink/50 backdrop-blur w-10 h-10 text-ivory"
          onClick={() => (music.playing ? stopSong() : playSong(wedding.songs[0].title, wedding.songs[0].src))}
          aria-label="Musik"
        >
          {music.playing ? <Volume2 size={16} strokeWidth={1.5} /> : <VolumeX size={16} strokeWidth={1.5} />}
        </button>
      </div>

      {nextStation && hintDir !== 0 && !active && !showHelp && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap flex items-center gap-2 border border-gold-light/50 bg-ink/60 backdrop-blur px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ivory/90">
          {hintDir < 0 && <ChevronLeft size={14} className="hint-l text-gold-light" />}
          {nextStation.label}
          {hintDir > 0 && <ChevronRight size={14} className="hint-r text-gold-light" />}
        </div>
      )}

      {/* sambutan */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-30 grid place-items-center bg-ink/55 backdrop-blur-[2px] p-6"
            onPointerDown={(e) => {
              e.stopPropagation();
              setShowHelp(false);
            }}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="frame w-full max-w-sm px-8 py-10 text-center text-ink"
            >
              <p className="font-serif text-2xl italic text-gold">Selamat Datang</p>
              <p className="mt-2 font-serif text-4xl font-medium wrap-break-word">{guest}</p>
              <p className="mt-3 text-sm text-muted font-light">di pesta pernikahan</p>
              <p className="font-display text-4xl mt-1">{coupleTitle}</p>
              <div className="my-6 h-px bg-gold-light/60" />
              <p className="text-[13px] text-muted font-light leading-relaxed">
                Berjalanlah dengan tombol arah atau ketuk tujuan. Hampiri titik bercahaya untuk berinteraksi.
              </p>
              <button className="btn btn-primary w-full mt-6">Mulai</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* kontrol sentuh */}
      {!active && (
        <div className="absolute bottom-5 inset-x-0 px-5 flex justify-between items-end pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
            <button {...hold("left")} className="ctrl-btn" aria-label="Kiri">
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <button {...hold("right")} className="ctrl-btn" aria-label="Kanan">
              <ChevronRight size={22} strokeWidth={1.5} />
            </button>
          </div>
          <button
            className={`ctrl-btn pointer-events-auto transition ${near ? "bg-gold/80! border-gold-light!" : "opacity-40"}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (near) open(near);
            }}
            aria-label="Interaksi"
          >
            <MessageCircle size={20} strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* dialog & panel */}
      {active && phase === "talk" && (
        <DialogBox key={active} lines={scriptFor(active, guest, music.playing)} onDone={() => setPhase("panel")} onClose={close} />
      )}
      {active && phase === "panel" && (
        <>
          {active === "gate" && <CouplePanel onClose={close} />}
          {active === "time" && <TimePanel onClose={close} />}
          {active === "reception" && <ReceptionPanel guest={guest} defaultCount={partyCount} onClose={close} />}
          {active === "band" && <BandPanel onClose={close} />}
          {active === "couple" && <FinalePanel guest={guest} look={look} companions={companions} onClose={close} />}
        </>
      )}
    </div>
  );
}
