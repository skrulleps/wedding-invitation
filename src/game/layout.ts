import type { Look } from "../components/look";
import type { Party } from "../lib/guest";

export interface Companion {
  look: Look;
  scale: number; // ukuran relatif terhadap pemain (anak lebih kecil)
}

// Pasangan dibuat serasi dengan busana pemain; keluarga = pasangan + 2 anak
export function companionsFor(look: Look, party: Party): Companion[] {
  if (party === "single") return [];
  const partner: Look =
    look.gender === "male"
      ? { gender: "female", outfit: "kebaya", color: look.color, headwear: look.headwear === "peci" ? "hijab" : "none", hair: "#3b2416" }
      : { gender: "male", outfit: "batik", color: look.color, headwear: look.headwear === "hijab" ? "peci" : "none" };
  const list: Companion[] = [{ look: partner, scale: 1 }];
  if (party === "keluarga") {
    list.push(
      { look: { gender: "male", outfit: "koko", color: "#e8dcc4", headwear: "none" }, scale: 0.66 },
      { look: { gender: "female", outfit: "dress", color: look.color, headwear: "none", hair: "#3b2416" }, scale: 0.6 },
    );
  }
  return list;
}

// Satuan koordinat "dunia" (akan di-scale sesuai layar)
export const WORLD_H = 540;
export const WORLD_W = 3400;
export const FLOOR = 50; // posisi kaki karakter dari bawah
export const PROP_BASE = 95; // dasar properti latar (gerbang, panggung, dll)
export const START_X = 80;
export const SPEED = 280;

export type StationId = "gate" | "time" | "reception" | "band" | "couple";

export interface Station {
  id: StationId;
  x: number;
  standX: number; // posisi berdiri pemain saat berinteraksi
  range: number;
  label: string;
  markerY: number; // tinggi tanda "!" dari bawah
}

export const STATIONS: Station[] = [
  { id: "gate", x: 560, standX: 560, range: 140, label: "Gerbang Pernikahan", markerY: 425 },
  { id: "time", x: 1060, standX: 960, range: 130, label: "Jam Acara", markerY: 420 },
  { id: "reception", x: 1520, standX: 1370, range: 170, label: "Resepsionis", markerY: 360 },
  { id: "band", x: 2150, standX: 2150, range: 220, label: "Band", markerY: 450 },
  { id: "couple", x: 2960, standX: 2840, range: 220, label: "Pengantin", markerY: 470 },
];

export const stationById = (id: StationId) => STATIONS.find((s) => s.id === id)!;

export const LOOKS = {
  groom: { gender: "male", outfit: "jas", color: "#efe6d2", headwear: "peci" },
  bride: { gender: "female", outfit: "kebaya", color: "#efe6d2", headwear: "siger" },
  receptionist: { gender: "female", outfit: "kebaya", color: "#9d174d", headwear: "hijab" },
  singer: { gender: "female", outfit: "dress", color: "#6d28d9", headwear: "none", hair: "#4a2511" },
  guitarist: { gender: "male", outfit: "batik", color: "#1e3a8a", headwear: "none" },
  keyboardist: { gender: "male", outfit: "koko", color: "#065f46", headwear: "peci" },
  drummer: { gender: "male", outfit: "jas", color: "#111827", headwear: "none", skin: "#c68b5d" },
} satisfies Record<string, Look>;
