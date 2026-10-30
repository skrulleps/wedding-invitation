import { memo, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Character, type Look } from "../components/Character";
import { coupleTitle } from "../config";
import { LOOKS, PROP_BASE, STATIONS, WORLD_W, stationById, type StationId } from "./layout";

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

// Posisikan elemen dengan titik tengah di x (koordinat dunia)
function At({
  x,
  bottom = PROP_BASE,
  width,
  children,
  station,
  className = "",
}: {
  x: number;
  bottom?: number;
  width: number;
  children: ReactNode;
  station?: StationId;
  className?: string;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: x - width / 2, bottom, width }}
      data-station={station}
    >
      {children}
    </div>
  );
}

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "Jost, sans-serif";

function Flowers({ cx, cy, r = 8, colors = ["#fbf8f2", "#ead2cb", "#f3e3c3"] }: { cx: number; cy: number; r?: number; colors?: string[] }) {
  const pts = [
    [0, 0],
    [-r * 1.2, r * 0.4],
    [r * 1.2, r * 0.4],
    [-r * 0.6, -r * 0.9],
    [r * 0.6, -r * 0.9],
  ];
  return (
    <g>
      <ellipse cx={cx - r * 1.6} cy={cy + r * 0.6} rx={r} ry={r * 0.45} fill="#5b6b4a" />
      <ellipse cx={cx + r * 1.6} cy={cy + r * 0.6} rx={r} ry={r * 0.45} fill="#5b6b4a" />
      {pts.map(([dx, dy], i) => (
        <g key={i}>
          <circle cx={cx + dx} cy={cy + dy} r={r * 0.8} fill={colors[i % colors.length]} />
          <circle cx={cx + dx} cy={cy + dy} r={r * 0.45} fill="none" stroke="#000" strokeOpacity="0.08" />
        </g>
      ))}
    </g>
  );
}

/* ---------------- Latar ---------------- */

function StringLights() {
  const span = 320;
  const count = Math.ceil(WORLD_W / span);
  const bulbs = ["#fde8b0", "#fff4d6", "#f6d58e"];
  return (
    <svg className="absolute top-0 left-0" width={WORLD_W} height={140} viewBox={`0 0 ${WORLD_W} 140`}>
      {Array.from({ length: count }, (_, i) => {
        const x0 = i * span;
        const x1 = x0 + span;
        return (
          <g key={i}>
            <path d={`M${x0} 20 Q${x0 + span / 2} 100 ${x1} 20`} fill="none" stroke="#3f3f46" strokeWidth="2" />
            {Array.from({ length: 9 }, (_, j) => {
              const t = (j + 1) / 10;
              const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * (x0 + span / 2) + t * t * x1;
              const y = (1 - t) ** 2 * 20 + 2 * (1 - t) * t * 100 + t * t * 20;
              return (
                <circle
                  key={j}
                  className="twinkle"
                  style={delay(-((i * 9 + j) % 7) * 0.4)}
                  cx={x}
                  cy={y + 6}
                  r={4}
                  fill={bulbs[(i + j) % bulbs.length]}
                  filter="drop-shadow(0 0 4px rgba(253,232,176,0.9))"
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Hedge() {
  return (
    <div
      className="absolute left-0"
      style={{
        bottom: PROP_BASE + 15,
        width: WORLD_W,
        height: 70,
        background:
          "radial-gradient(circle at 30px 40px, #2f5d3a 28px, transparent 29px) 0 0/60px 70px repeat-x, linear-gradient(#1f3b2d, #1f3b2d) 0 40px/100% 30px no-repeat",
      }}
    />
  );
}

function Floor() {
  const gate = stationById("gate").x;
  return (
    <>
      <div
        className="absolute left-0 bottom-0"
        style={{
          width: WORLD_W,
          height: PROP_BASE + 15,
          background: "repeating-linear-gradient(90deg, #d9c7a5 0 78px, #cbb690 78px 80px), #d9c7a5",
          borderTop: "4px solid #a8916a",
        }}
      />
      {/* jalan setapak sebelum gerbang */}
      <div className="absolute bottom-[28px] left-0 h-[44px] rounded-r-full bg-stone-400/70" style={{ width: gate }} />
      {/* karpet merah */}
      <div
        className="absolute bottom-[28px] h-[44px] bg-[#5a1a26]"
        style={{ left: gate - 130, width: WORLD_W - gate + 30, borderTop: "3px solid #d9c08f", borderBottom: "3px solid #d9c08f" }}
      />
    </>
  );
}

function DiningTable({ x, guests }: { x: number; guests: [Look, Look] }) {
  return (
    <At x={x} width={200} bottom={PROP_BASE + 5} className="opacity-90">
      <div className="relative h-[150px]">
        <Character look={guests[0]} className="absolute left-0 bottom-0 w-[62px]" style={delay(-0.8)} />
        <Character look={guests[1]} className="absolute right-0 bottom-0 w-[62px] -scale-x-100" style={delay(-1.7)} />
        <svg viewBox="0 0 110 70" className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[110px]">
          <rect x="52" y="30" width="6" height="40" fill="#78716c" />
          <ellipse cx="55" cy="30" rx="50" ry="10" fill="#fafaf9" />
          <path d="M5 30 Q55 50 105 30 L100 52 Q55 66 10 52 Z" fill="#f5f5f4" stroke="#e7e5e4" />
          <path d="M10 52 Q55 66 100 52" fill="none" stroke="#d9c08f" strokeWidth="2" />
          <Flowers cx={55} cy={18} r={5} />
        </svg>
      </div>
    </At>
  );
}

function Buffet({ x }: { x: number }) {
  return (
    <At x={x} width={260} bottom={PROP_BASE + 5}>
      <svg viewBox="0 0 260 130" className="w-full">
        <rect x="70" y="0" width="120" height="30" fill="#141b2d" stroke="#d9c08f" strokeWidth="1.5" />
        <text x="130" y="20" textAnchor="middle" fill="#d9c08f" fontSize="11" letterSpacing="3" fontFamily={SANS}>PRASMANAN</text>
        <line x1="90" y1="30" x2="90" y2="60" stroke="#78716c" strokeWidth="2" />
        <line x1="170" y1="30" x2="170" y2="60" stroke="#78716c" strokeWidth="2" />
        <rect x="10" y="78" width="240" height="52" fill="#fafaf9" />
        <path d="M10 78 Q40 92 70 78 Q100 92 130 78 Q160 92 190 78 Q220 92 250 78" fill="none" stroke="#d9c08f" strokeWidth="3" />
        {[45, 105, 165, 220].map((cx, i) => (
          <g key={cx}>
            <ellipse cx={cx} cy={76} rx={24} ry={6} fill="#a8a29e" />
            <path d={`M${cx - 22} 74 Q${cx} ${50 - (i % 2) * 6} ${cx + 22} 74 Z`} fill="#d6d3d1" stroke="#a8a29e" />
            <circle cx={cx} cy={56 - (i % 2) * 6} r={3} fill="#a8a29e" />
          </g>
        ))}
      </svg>
    </At>
  );
}

function Moon() {
  return <div className="absolute top-[60px] right-[18%] w-24 h-24 rounded-full bg-amber-50 shadow-[0_0_60px_20px_rgba(254,243,199,0.35)]" />;
}

/* ---------------- Gerbang ---------------- */

function Janur({ x, flip = false }: { x: number; flip?: boolean }) {
  return (
    <At x={x} width={90} bottom={PROP_BASE}>
      <svg viewBox="0 0 90 340" className={`w-full sway ${flip ? "-scale-x-100" : ""}`}>
        <path d="M70 340 C70 220 66 110 22 40" fill="none" stroke="#8a6a3e" strokeWidth="6" strokeLinecap="round" />
        {Array.from({ length: 14 }, (_, i) => {
          const t = i / 14;
          const px = 70 - 48 * t ** 2;
          const py = 300 - 260 * t;
          return <path key={i} d={`M${px} ${py} q-16 10 -10 34`} fill="none" stroke="#d9c08f" strokeWidth="3" strokeLinecap="round" />;
        })}
        <path d="M22 40 q-8 20 -2 60 M22 40 q4 22 0 70 M22 40 q10 18 10 52" fill="none" stroke="#e9d7a8" strokeWidth="3" />
        <Flowers cx={22} cy={40} r={6} colors={["#e9d7a8", "#fff"]} />
      </svg>
    </At>
  );
}

function Gate() {
  const s = stationById("gate");
  const flowersOnArch = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    return { x: (1 - t) ** 2 * 40 + 2 * (1 - t) * t * 200 + t * t * 360, y: (1 - t) ** 2 * 120 + 2 * (1 - t) * t * -10 + t * t * 120 };
  });
  const nameSize = Math.min(30, 380 / coupleTitle.length);
  return (
    // gerbang berdiri di karpet supaya pemain terlihat lewat di antara tiangnya
    <At x={s.x} width={400} bottom={30} station="gate" className="cursor-pointer">
      <svg viewBox="0 0 400 380" className="w-full overflow-visible">
        <path d="M40 120 Q200 -10 360 120" fill="none" stroke="#8a6a3e" strokeWidth="36" />
        <path d="M40 120 Q200 -10 360 120" fill="none" stroke="#fbf8f2" strokeWidth="26" />
        {flowersOnArch.map((p, i) => (
          <Flowers key={i} cx={p.x} cy={p.y} r={6} colors={i % 2 ? ["#fbf8f2", "#ead2cb"] : ["#f3e3c3", "#fbf8f2"]} />
        ))}
        {[20, 330].map((px) => (
          <g key={px}>
            <rect x={px} y="110" width="50" height="250" fill="#fbf8f2" stroke="#8a6a3e" strokeWidth="4" />
            <rect x={px + 12} y="130" width="26" height="210" fill="none" stroke="#b08d57" strokeWidth="2" />
            <path d={`M${px + 25} 150 l10 20 l-10 20 l-10 -20 Z`} fill="#d9c08f" />
            <rect x={px - 8} y="98" width="66" height="18" rx="3" fill="#b08d57" />
            <rect x={px - 8} y="350" width="66" height="30" rx="3" fill="#b08d57" />
            <Flowers cx={px + 25} cy={92} r={10} />
          </g>
        ))}
        <path d="M70 160 Q200 220 330 160" fill="none" stroke="#ead2cb" strokeWidth="4" />
        <path d="M70 160 Q200 200 330 160" fill="none" stroke="#fbf8f2" strokeWidth="2" strokeDasharray="2 6" />
        <rect x="80" y="60" width="240" height="78" fill="#141b2d" stroke="#d9c08f" strokeWidth="2" />
        <rect x="85" y="65" width="230" height="68" fill="none" stroke="#d9c08f" strokeWidth="0.75" opacity="0.7" />
        <text x="200" y="84" textAnchor="middle" fill="#d9c08f" fontSize="10" fontFamily={SANS} letterSpacing="4">
          THE WEDDING OF
        </text>
        <text x="200" y="122" textAnchor="middle" fill="#fbf8f2" fontSize={nameSize} fontFamily="'Great Vibes', cursive">
          {coupleTitle}
        </text>
      </svg>
    </At>
  );
}

/* ---------------- Jam ---------------- */

function BigClock() {
  const s = stationById("time");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const sec = now.getSeconds();
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;
  return (
    <At x={s.x} width={150} station="time" className="cursor-pointer">
      <svg viewBox="0 0 150 310" className="w-full">
        <path d="M40 310 L52 280 L98 280 L110 310 Z" fill="#5c4a36" />
        <rect x="66" y="120" width="18" height="165" fill="#6b5232" />
        <rect x="30" y="160" width="90" height="46" rx="8" fill="#fbf8f2" stroke="#b08d57" strokeWidth="3" />
        <text x="75" y="180" textAnchor="middle" fontSize="16" fontStyle="italic" fill="#141b2d" fontFamily={SERIF}>Waktu</text>
        <text x="75" y="198" textAnchor="middle" fontSize="16" fontStyle="italic" fill="#141b2d" fontFamily={SERIF}>Acara</text>
        <circle cx="75" cy="70" r="64" fill="#141b2d" stroke="#d9c08f" strokeWidth="5" />
        <circle cx="75" cy="70" r="52" fill="#fbf8f2" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="75" y1="22" x2="75" y2={i % 3 ? 27 : 31} stroke="#141b2d" strokeWidth={i % 3 ? 2 : 4} transform={`rotate(${i * 30} 75 70)`} />
        ))}
        <line x1="75" y1="70" x2="75" y2="42" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hr * 30} 75 70)`} />
        <line x1="75" y1="70" x2="75" y2="30" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" transform={`rotate(${min * 6} 75 70)`} />
        <line x1="75" y1="78" x2="75" y2="26" stroke="#dc2626" strokeWidth="1.5" transform={`rotate(${sec * 6} 75 70)`} />
        <circle cx="75" cy="70" r="4" fill="#dc2626" />
        <Flowers cx={75} cy={8} r={8} />
      </svg>
    </At>
  );
}

/* ---------------- Resepsionis ---------------- */

function Reception() {
  const s = stationById("reception");
  return (
    <At x={s.x} width={300} station="reception" className="cursor-pointer">
      <div className="relative h-[240px]">
        <svg viewBox="0 0 70 150" className="absolute left-0 bottom-0 w-[70px]">
          <line x1="10" y1="150" x2="30" y2="20" stroke="#5c4a36" strokeWidth="4" />
          <line x1="60" y1="150" x2="40" y2="20" stroke="#5c4a36" strokeWidth="4" />
          <rect x="4" y="16" width="62" height="70" rx="6" fill="#fbf8f2" stroke="#b08d57" strokeWidth="3" />
          <text x="35" y="44" textAnchor="middle" fontSize="15" fontStyle="italic" fill="#141b2d" fontFamily={SERIF}>Buku</text>
          <text x="35" y="60" textAnchor="middle" fontSize="15" fontStyle="italic" fill="#141b2d" fontFamily={SERIF}>Tamu</text>
          <Flowers cx={35} cy={78} r={4} />
        </svg>
        <Character look={LOOKS.receptionist} className="absolute left-[150px] bottom-[30px] w-[80px]" style={delay(-0.4)} />
        <svg viewBox="0 0 220 90" className="absolute right-0 bottom-0 w-[220px] overflow-visible">
          <rect x="0" y="10" width="220" height="80" rx="4" fill="#fafaf9" />
          <rect x="0" y="10" width="220" height="10" fill="#d9c08f" />
          <path d="M0 20 Q27 40 55 20 Q82 40 110 20 Q137 40 165 20 Q192 40 220 20" fill="#ead2cb" />
          <path d="M60 10 L100 4 L100 12 L60 16 Z M140 10 L100 4 L100 12 L140 16 Z" fill="#fff" stroke="#a8a29e" />
          <line x1="112" y1="8" x2="132" y2="2" stroke="#1d4ed8" strokeWidth="2" />
          <rect x="182" y="-8" width="14" height="18" rx="3" fill="#a5f3fc" opacity="0.8" />
          <Flowers cx={189} cy={-12} r={6} />
        </svg>
      </div>
    </At>
  );
}

/* ---------------- Band ---------------- */

function BandStage({ playing }: { playing: boolean }) {
  const s = stationById("band");
  const pose = playing ? "dance" : "idle";
  return (
    <At x={s.x} width={560} station="band" className={`cursor-pointer ${playing ? "band-on" : ""}`}>
      <div className="relative h-[340px]">
        {/* backdrop */}
        <svg viewBox="0 0 560 340" className="absolute inset-0 w-full h-full">
          <rect x="30" y="20" width="500" height="290" fill="#1c2540" />
          <path d="M30 20 Q90 150 60 310 L30 310 Z M530 20 Q470 150 500 310 L530 310 Z" fill="#5a1a26" />
          <path d="M30 20 L530 20 L530 50 Q280 90 30 50 Z" fill="#6b2030" />
          <rect x="200" y="58" width="160" height="34" rx="8" fill="#1e1b4b" stroke="#d9c08f" strokeWidth="2" />
          <text x="280" y="82" textAnchor="middle" fontSize="13" letterSpacing="5" fill="#d9c08f" fontFamily={SANS} className="neon">
            LIVE MUSIC
          </text>
          {[60, 500].map((x) => (
            <g key={x}>
              <rect x={x - 26} y="200" width="52" height="96" rx="4" fill="#18181b" />
              <circle cx={x} cy="230" r="13" fill="#3f3f46" className="speaker" />
              <circle cx={x} cy="270" r="18" fill="#3f3f46" className="speaker" />
            </g>
          ))}
          <rect x="0" y="296" width="560" height="44" fill="#57534e" />
          <rect x="0" y="296" width="560" height="8" fill="#a8a29e" />
        </svg>

        {/* drummer + drum */}
        <Character look={LOOKS.drummer} pose={pose} className="absolute left-[408px] bottom-[60px] w-[72px]" style={delay(-0.2)} />
        <svg viewBox="0 0 120 80" className="absolute left-[385px] bottom-[42px] w-[120px]">
          <g className="cymbal">
            <line x1="12" y1="10" x2="12" y2="70" stroke="#a1a1aa" strokeWidth="2" />
            <ellipse cx="12" cy="10" rx="14" ry="3" fill="#d9c08f" />
          </g>
          <ellipse cx="38" cy="38" rx="14" ry="6" fill="#e5e7eb" stroke="#6b2030" strokeWidth="3" />
          <ellipse cx="82" cy="38" rx="14" ry="6" fill="#e5e7eb" stroke="#6b2030" strokeWidth="3" />
          <circle cx="60" cy="56" r="24" fill="#6b2030" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="60" cy="56" r="15" fill="#fbf8f2" />
          <text x="60" y="61" textAnchor="middle" fontSize="12" fill="#5a1a26" fontFamily={SERIF} fontStyle="italic">{coupleTitle[0]}</text>
          <g className="cymbal" style={delay(-0.25)}>
            <line x1="108" y1="16" x2="108" y2="70" stroke="#a1a1aa" strokeWidth="2" />
            <ellipse cx="108" cy="16" rx="12" ry="3" fill="#d9c08f" />
          </g>
        </svg>

        {/* keyboardist */}
        <Character look={LOOKS.keyboardist} pose={pose} className="absolute left-[78px] bottom-[44px] w-[76px]" style={delay(-0.6)} />
        <svg viewBox="0 0 100 70" className="absolute left-[66px] bottom-[44px] w-[100px]">
          <line x1="20" y1="70" x2="80" y2="24" stroke="#27272a" strokeWidth="4" />
          <line x1="80" y1="70" x2="20" y2="24" stroke="#27272a" strokeWidth="4" />
          <rect x="2" y="14" width="96" height="14" rx="2" fill="#18181b" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={6 + i * 7.5} y="17" width="6.5" height="9" fill="#fafafa" className="key" style={delay(-i * 0.13)} />
          ))}
        </svg>

        {/* gitaris */}
        <div className="absolute left-[190px] bottom-[44px] w-[78px]">
          <Character look={LOOKS.guitarist} pose={pose} className="w-full" style={delay(-0.9)} />
          <svg viewBox="0 0 90 34" className="absolute left-[-4px] bottom-[34px] w-[86px] guitar">
            <rect x="34" y="14" width="54" height="6" rx="2" fill="#5c4a36" />
            <rect x="82" y="11" width="8" height="12" rx="2" fill="#451a03" />
            <ellipse cx="18" cy="17" rx="17" ry="15" fill="#b08d57" stroke="#141b2d" strokeWidth="2" />
            <ellipse cx="34" cy="17" rx="10" ry="10" fill="#b08d57" />
            <circle cx="22" cy="17" r="5" fill="#451a03" />
            <line x1="10" y1="17" x2="88" y2="17" stroke="#fbf8f2" strokeWidth="0.6" />
          </svg>
        </div>

        {/* vokalis */}
        <Character look={LOOKS.singer} pose={pose} className="absolute left-[292px] bottom-[44px] w-[80px]" style={delay(-0.3)} />
        <svg viewBox="0 0 40 130" className="absolute left-[262px] bottom-[44px] w-[40px]">
          <line x1="20" y1="130" x2="20" y2="40" stroke="#3f3f46" strokeWidth="3" />
          <line x1="20" y1="40" x2="34" y2="22" stroke="#3f3f46" strokeWidth="3" />
          <ellipse cx="35" cy="20" rx="4" ry="6" fill="#18181b" transform="rotate(35 35 20)" />
          <ellipse cx="20" cy="128" rx="14" ry="3" fill="#3f3f46" />
        </svg>

        {playing &&
          ["♪", "♫", "♬", "♪", "♫"].map((n, i) => (
            <span key={i} className="note absolute text-3xl text-yellow-200" style={{ left: 90 + i * 90, bottom: 200, ...delay(-i * 0.6) }}>
              {n}
            </span>
          ))}
      </div>
    </At>
  );
}

/* ---------------- Pelaminan ---------------- */

function Pelaminan() {
  const s = stationById("couple");
  return (
    <At x={s.x} width={520} station="couple" className="cursor-pointer">
      <div className="relative h-[370px]">
        <svg viewBox="0 0 520 370" className="absolute inset-0 w-full h-full">
          <path d="M20 370 L20 120 Q20 80 60 80 L120 80 L120 370 Z" fill="#fbf8f2" stroke="#b08d57" strokeWidth="4" />
          <path d="M500 370 L500 120 Q500 80 460 80 L400 80 L400 370 Z" fill="#fbf8f2" stroke="#b08d57" strokeWidth="4" />
          <path d="M110 370 L110 90 Q110 20 260 14 Q410 20 410 90 L410 370 Z" fill="#fbf8f2" stroke="#b08d57" strokeWidth="5" />
          <path d="M140 370 L140 110 Q140 50 260 44 Q380 50 380 110 L380 370 Z" fill="none" stroke="#d9c08f" strokeWidth="3" />
          <path d="M150 60 Q260 140 370 60 L370 100 Q260 170 150 100 Z" fill="#ead2cb" opacity="0.6" />
          <path d="M160 360 Q160 210 130 150 M360 360 Q360 210 390 150" fill="none" stroke="#ead2cb" strokeWidth="10" opacity="0.6" />
          {[70, 450].map((x) => (
            <path key={x} d={`M${x} 120 l12 22 l-12 22 l-12 -22 Z`} fill="#d9c08f" />
          ))}
          <Flowers cx={260} cy={22} r={14} />
          <Flowers cx={150} cy={74} r={10} />
          <Flowers cx={370} cy={74} r={10} />
          <Flowers cx={70} cy={84} r={9} />
          <Flowers cx={450} cy={84} r={9} />
          <text x="260" y="120" textAnchor="middle" fontSize="26" fill="#b08d57" fontFamily="'Great Vibes', cursive">
            {coupleTitle}
          </text>
          {/* sofa */}
          <path d="M150 300 Q150 220 200 220 L320 220 Q370 220 370 300 Z" fill="#d9c08f" stroke="#6b5232" strokeWidth="3" />
          <rect x="140" y="290" width="240" height="50" rx="12" fill="#5a1a26" stroke="#6b5232" strokeWidth="3" />
          <rect x="150" y="340" width="12" height="20" fill="#6b5232" />
          <rect x="358" y="340" width="12" height="20" fill="#6b5232" />
          {/* standing flowers */}
          {[60, 460].map((x) => (
            <g key={x}>
              <path d={`M${x - 14} 370 L${x - 8} 300 L${x + 8} 300 L${x + 14} 370 Z`} fill="#b08d57" />
              <Flowers cx={x} cy={290} r={12} />
            </g>
          ))}
        </svg>
        <Character look={LOOKS.groom} className="absolute left-[178px] bottom-[16px] w-[84px]" style={delay(-0.5)} />
        <Character look={LOOKS.bride} className="absolute left-[262px] bottom-[16px] w-[84px] -scale-x-100" style={delay(-1.1)} />
        {[0, 1, 2].map((i) => (
          <span key={i} className="note absolute text-xl text-[#d9c08f]" style={{ left: 200 + i * 50, bottom: 200, ...delay(-i * 1.1) }}>
            ✦
          </span>
        ))}
      </div>
    </At>
  );
}

/* ---------------- Ekspor ---------------- */

const guestLooks: Look[] = [
  { gender: "male", outfit: "batik", color: "#141b2d", headwear: "none" },
  { gender: "female", outfit: "gamis", color: "#0e7490", headwear: "hijab" },
  { gender: "female", outfit: "dress", color: "#be185d", headwear: "none", hair: "#57301b" },
  { gender: "male", outfit: "koko", color: "#e8dcc4", headwear: "peci", skin: "#d9a066" },
  { gender: "male", outfit: "jas", color: "#334155", headwear: "none" },
  { gender: "female", outfit: "kebaya", color: "#ca8a04", headwear: "none" },
  { gender: "female", outfit: "gamis", color: "#9d174d", headwear: "hijab", skin: "#c68b5d" },
  { gender: "male", outfit: "batik", color: "#065f46", headwear: "peci" },
];

export const WorldFar = memo(function WorldFar() {
  return (
    <div className="absolute inset-0">
      <Moon />
      <svg className="absolute bottom-[150px] left-0" width={WORLD_W} height={160} viewBox={`0 0 ${WORLD_W} 160`} preserveAspectRatio="none">
        <path
          d={`M0 160 L0 90 ${Array.from({ length: 16 }, (_, i) => `Q${i * 200 + 100} ${i % 2 ? 20 : 60} ${(i + 1) * 200} 90`).join(" ")} L${WORLD_W} 160 Z`}
          fill="#182038"
          opacity="0.9"
        />
      </svg>
    </div>
  );
});

export const WorldBack = memo(function WorldBack({
  bandPlaying,
  visited,
  guest,
}: {
  bandPlaying: boolean;
  visited: ReadonlySet<StationId>;
  guest: string;
}) {
  const gateX = stationById("gate").x;
  return (
    <>
      <Hedge />
      <StringLights />
      <Floor />
      <Janur x={gateX - 260} />
      <Janur x={gateX + 260} flip />
      <WelcomeSign guest={guest} />
      <BigClock />
      <DiningTable x={1260} guests={[guestLooks[2], guestLooks[3]]} />
      <Reception />
      <DiningTable x={1770} guests={[guestLooks[4], guestLooks[5]]} />
      <BandStage playing={bandPlaying} />
      <Buffet x={2565} />
      <Pelaminan />
      <DiningTable x={3290} guests={[guestLooks[6], guestLooks[7]]} />
      {STATIONS.filter((st) => !visited.has(st.id) && st.id !== "gate").map((st) => (
        <Marker key={st.id} x={st.x} y={st.markerY} />
      ))}
    </>
  );
});

export const WorldFront = memo(function WorldFront({ visited }: { visited: ReadonlySet<StationId> }) {
  const gate = stationById("gate");
  return (
    <>
      <Gate />
      {!visited.has("gate") && <Marker x={gate.x} y={gate.markerY} />}
    </>
  );
});

function Marker({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute marker pointer-events-none" style={{ left: x - 14, bottom: y }}>
      <svg viewBox="0 0 28 28" className="w-7 h-7 drop-shadow-[0_0_8px_rgba(217,192,143,0.9)]">
        <circle cx="14" cy="14" r="12" fill="none" stroke="#d9c08f" strokeWidth="1" opacity="0.6" />
        <path d="M14 5 L17 14 L14 23 L11 14 Z M5 14 L14 11 L23 14 L14 17 Z" fill="#f3e3c3" />
      </svg>
    </div>
  );
}

/* ---------------- Papan selamat datang ---------------- */

function WelcomeSign({ guest }: { guest: string }) {
  const nameSize = Math.max(9, Math.min(19, 190 / guest.length));
  return (
    <At x={200} width={140} bottom={PROP_BASE}>
      <svg viewBox="0 0 140 230" className="w-full">
        <line x1="30" y1="230" x2="55" y2="20" stroke="#5c4a36" strokeWidth="4" />
        <line x1="110" y1="230" x2="85" y2="20" stroke="#5c4a36" strokeWidth="4" />
        <line x1="70" y1="230" x2="70" y2="130" stroke="#4a3b2b" strokeWidth="3" />
        <rect x="6" y="14" width="128" height="122" fill="#fbf8f2" stroke="#b08d57" strokeWidth="1.5" />
        <rect x="11" y="19" width="118" height="112" fill="none" stroke="#d9c08f" strokeWidth="0.75" />
        <text x="70" y="44" textAnchor="middle" fontSize="15" fontStyle="italic" fill="#b08d57" fontFamily={SERIF}>
          Selamat Datang
        </text>
        <text x="70" y="70" textAnchor="middle" fontSize={nameSize} fontWeight="600" fill="#141b2d" fontFamily={SERIF}>
          {guest}
        </text>
        <path d="M45 82 L95 82" stroke="#d9c08f" strokeWidth="0.75" />
        <path d="M70 79 L73 82 L70 85 L67 82 Z" fill="#b08d57" />
        <text x="70" y="99" textAnchor="middle" fontSize="6" letterSpacing="2.5" fill="#6f6758" fontFamily={SANS}>
          THE WEDDING OF
        </text>
        <text x="70" y="121" textAnchor="middle" fontSize={Math.min(18, 260 / coupleTitle.length)} fill="#141b2d" fontFamily="'Great Vibes', cursive">
          {coupleTitle}
        </text>
        <Flowers cx={18} cy={18} r={5} />
        <Flowers cx={122} cy={132} r={5} />
      </svg>
    </At>
  );
}
