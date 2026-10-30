import { useId, type CSSProperties } from "react";
import type { Look, Pose } from "./look";

export type { Look } from "./look";

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

interface Props {
  look: Look;
  pose?: Pose;
  className?: string;
  style?: CSSProperties;
}

export function Character({ look, pose = "idle", className = "", style }: Props) {
  // id harus aman untuk XML supaya pola tetap tampil saat SVG diekspor jadi gambar
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { gender, outfit, color, headwear } = look;
  const skin = look.skin ?? "#f2c79b";
  const hair = look.hair ?? "#2b1d14";
  const dark = shade(color, -0.15);
  const light = shade(color, 0.25);
  const trouser = outfit === "jas" ? dark : outfit === "koko" ? "#f5f5f4" : "#1f2937";
  const sleeve = outfit === "kebaya" ? light : color;
  const batikId = `batik-${uid}`;

  return (
    <svg
      viewBox="0 0 64 112"
      className={`char char-${pose} ${className}`}
      style={style}
      aria-hidden
    >
      <defs>
        <pattern id={batikId} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={outfit === "kebaya" ? "#7c4a21" : color} />
          <path d="M4 0 L8 4 L4 8 L0 4 Z" fill="none" stroke="#f5d48a" strokeWidth="0.8" opacity="0.8" />
          <circle cx="4" cy="4" r="1" fill="#f5d48a" />
        </pattern>
      </defs>

      {/* bayangan */}
      <ellipse cx="32" cy="110" rx="18" ry="2.5" fill="#000" opacity="0.18" />

      <g className="char-body">
        {/* rambut panjang di belakang */}
        {gender === "female" && headwear !== "hijab" && (
          <path d="M14 26 C13 10 51 10 50 26 L52 58 C44 62 20 62 12 58 Z" fill={hair} />
        )}

        {/* kaki */}
        <g className="leg leg-l">
          <rect x="23" y="76" width="8" height="30" rx="3" fill={gender === "female" ? skin : trouser} />
          <rect x="21" y="103" width="11" height="6" rx="3" fill="#3f2a1d" />
        </g>
        <g className="leg leg-r">
          <rect x="33" y="76" width="8" height="30" rx="3" fill={gender === "female" ? skin : trouser} />
          <rect x="32" y="103" width="11" height="6" rx="3" fill="#3f2a1d" />
        </g>

        {/* tangan belakang */}
        <g className="arm arm-r">
          <rect x="42" y="47" width="7" height="27" rx="3.5" fill={sleeve} />
          <circle cx="45.5" cy="75" r="3.5" fill={skin} />
        </g>

        {/* badan */}
        {outfit === "batik" && (
          <>
            <rect x="19" y="45" width="26" height="36" rx="6" fill={`url(#${batikId})`} />
            <path d="M27 45 L32 51 L37 45" fill="none" stroke="#f5d48a" strokeWidth="1.5" />
          </>
        )}
        {outfit === "jas" && (
          <>
            <rect x="19" y="45" width="26" height="36" rx="6" fill={color} />
            <path d="M26 45 L32 62 L38 45 Z" fill="#fafafa" />
            <path d="M31 48 L33 48 L34 60 L32 63 L30 60 Z" fill="#b91c1c" />
            <path d="M26 45 L30 58 L24 52 Z M38 45 L34 58 L40 52 Z" fill={dark} />
          </>
        )}
        {outfit === "koko" && (
          <>
            <rect x="18" y="45" width="28" height="40" rx="6" fill={color} />
            <rect x="29" y="45" width="6" height="22" fill={light} />
            <circle cx="32" cy="52" r="1" fill="#fff" />
            <circle cx="32" cy="58" r="1" fill="#fff" />
            <circle cx="32" cy="64" r="1" fill="#fff" />
            <path d="M18 80 L46 80" stroke={light} strokeWidth="2" />
          </>
        )}
        {outfit === "kebaya" && (
          <>
            <path className="skirt" d="M19 73 L45 73 L48 106 L16 106 Z" fill={`url(#${batikId})`} />
            <rect x="19" y="45" width="26" height="32" rx="6" fill={light} />
            <path d="M28 45 L32 56 L36 45" fill="none" stroke={dark} strokeWidth="1.5" />
            <path d="M19 70 Q32 74 45 70" fill="none" stroke={dark} strokeWidth="1.5" />
            <circle cx="32" cy="60" r="1.6" fill="#f5d48a" />
          </>
        )}
        {outfit === "gamis" && (
          <>
            <path className="skirt" d="M20 46 L44 46 L50 106 L14 106 Z" fill={color} />
            <path d="M20 46 L44 46 L45 52 L19 52 Z" fill={dark} />
            <path d="M18 70 Q32 74 46 70" fill="none" stroke={light} strokeWidth="1.5" />
          </>
        )}
        {outfit === "dress" && (
          <>
            <rect x="20" y="45" width="24" height="28" rx="6" fill={color} />
            <path className="skirt" d="M20 68 L44 68 L53 92 Q32 97 11 92 Z" fill={color} />
            <path d="M20 69 Q32 73 44 69" fill="none" stroke={light} strokeWidth="2" />
          </>
        )}

        {/* tangan depan */}
        <g className="arm arm-l">
          <rect x="15" y="47" width="7" height="27" rx="3.5" fill={sleeve} />
          <circle cx="18.5" cy="75" r="3.5" fill={skin} />
        </g>

        {/* kepala */}
        {headwear === "hijab" ? (
          <>
            <path d="M32 8 C15 8 11 22 12 34 C13 46 11 54 13 60 L51 60 C53 54 51 46 52 34 C53 22 49 8 32 8 Z" fill={light} />
            <path d="M13 60 L51 60 L49 64 L15 64 Z" fill={color} opacity="0.6" />
            <ellipse cx="32" cy="31" rx="12.5" ry="14" fill={skin} />
          </>
        ) : (
          <>
            <rect x="28" y="40" width="8" height="8" fill={skin} />
            {gender === "male" && (
              <>
                <ellipse cx="15.5" cy="31" rx="2.8" ry="4" fill={skin} />
                <ellipse cx="48.5" cy="31" rx="2.8" ry="4" fill={skin} />
                <path d="M15.2 29.5 Q16.5 31 15.4 32.5 M48.8 29.5 Q47.5 31 48.6 32.5" fill="none" stroke={shade(skin, -0.15)} strokeWidth="0.8" />
              </>
            )}
            <circle cx="32" cy="28" r="17" fill={skin} />
          </>
        )}
        {gender === "male" && (
          <path d="M23.5 25.5 Q26.5 23.6 29.5 25 M34.5 25 Q37.5 23.6 40.5 25.5" fill="none" stroke={hair} strokeWidth="1.4" strokeLinecap="round" />
        )}

        {/* wajah */}
        <ellipse cx="26.5" cy="30" rx="1.8" ry="2.4" fill="#1c1917" />
        <ellipse cx="37.5" cy="30" rx="1.8" ry="2.4" fill="#1c1917" />
        <circle cx="27" cy="29" r="0.6" fill="#fff" />
        <circle cx="38" cy="29" r="0.6" fill="#fff" />
        <circle cx="22.5" cy="35" r="2.6" fill="#e8a0a0" opacity="0.18" />
        <circle cx="41.5" cy="35" r="2.6" fill="#e8a0a0" opacity="0.18" />
        <path d="M29.5 36.8 Q32 38.4 34.5 36.8" fill="none" stroke="#7c3a22" strokeWidth="1.1" strokeLinecap="round" />

        {/* rambut / penutup kepala */}
        {gender === "male" && headwear !== "peci" && (
          <>
            {/* rambut pendek bervolume dengan belahan samping + jambang */}
            <path
              d="M15.4 30 C13.8 21 16 12.5 23.5 9 C29.5 6.4 39 6.8 44.5 10.4 C50 14 51 21.5 48.7 30 L47.1 30 C46.9 25.5 46 22.2 43.8 20 L21.2 20 C18.9 22.4 17.9 25.6 17.6 30 Z"
              fill={hair}
            />
            <path
              d="M20 14.5 C25.5 8.6 40.5 8.4 46.8 15.2 C48.8 17.8 49.2 21 48.2 24.2 L45.8 20.6 L44.8 23.2 L41.8 19.6 L40.2 22 L36.8 18.8 L34.2 21 L31.6 19 L28.6 21.8 L27 20 L22.4 24.6 C19.6 21.4 19 17.6 20 14.5 Z"
              fill={hair}
            />
            <path d="M24.4 10.2 C25.4 12.4 25.6 14.8 24.9 17.4" fill="none" stroke={shade(hair, -0.08)} strokeWidth="1" strokeLinecap="round" />
            <path d="M29.5 11 C35.5 9.6 41.5 11.2 44.6 14.8 M31 14.4 C36 13.2 40.5 14.4 43 16.8" fill="none" stroke={shade(hair, 0.18)} strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
            <path d="M15.6 26 L17.8 25.6 L18 32.5 L16.4 32.5 Z M48.4 26 L46.2 25.6 L46 32.5 L47.6 32.5 Z" fill={hair} />
          </>
        )}
        {gender === "male" && headwear === "peci" && (
          <>
            <path d="M15 26 C14.6 20 16.6 15.5 21 15 L43 15 C47.4 15.5 49.4 20 49 26 L46.2 26 C45.6 21.6 44 19.6 41 19 L23 19 C20 19.6 18.4 21.6 17.8 26 Z" fill={hair} />
            <path d="M15 25 L18 24.6 L18.4 33.5 L16 33.5 Z M49 25 L46 24.6 L45.6 33.5 L48 33.5 Z" fill={hair} />
            <path d="M17 17 L19 5 L45 5 L47 17 C40 14 24 14 17 17 Z" fill="#111" />
            <path d="M18 14 C26 12 38 12 46 14" fill="none" stroke="#fbbf24" strokeWidth="0.8" />
          </>
        )}
        {gender === "female" && (headwear === "none" || headwear === "siger") && (
          <path d="M15 27 C15 10 49 10 49 27 C45 18 37 16 31 20 C27 16 20 19 15 27 Z" fill={hair} />
        )}
        {headwear === "siger" && (
          <>
            <path d="M16 15 L21 1 L26 9 L32 -2 L38 9 L43 1 L48 15 C40 11 24 11 16 15 Z" fill="#eab308" stroke="#a16207" strokeWidth="0.8" />
            <circle cx="32" cy="7" r="1.6" fill="#dc2626" />
            <circle cx="22" cy="9" r="1" fill="#fff" />
            <circle cx="42" cy="9" r="1" fill="#fff" />
          </>
        )}
      </g>
    </svg>
  );
}
