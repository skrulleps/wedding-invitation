export type Gender = "male" | "female";
export type Outfit = "batik" | "jas" | "koko" | "kebaya" | "gamis" | "dress";
export type Headwear = "none" | "peci" | "hijab" | "siger";
export type Pose = "idle" | "walk" | "dance";

export interface Look {
  gender: Gender;
  outfit: Outfit;
  color: string;
  headwear: Headwear;
  skin?: string;
  hair?: string;
  honorific?: string; // sapaan untuk tamu, "" = tanpa sapaan
}

export const HONORIFICS: Record<Gender, { id: string; label: string }[]> = {
  male: [
    { id: "Bapak", label: "Bapak" },
    { id: "Mas", label: "Mas" },
    { id: "Kak", label: "Kak" },
    { id: "", label: "Tanpa" },
  ],
  female: [
    { id: "Ibu", label: "Ibu" },
    { id: "Mbak", label: "Mbak" },
    { id: "Kak", label: "Kak" },
    { id: "", label: "Tanpa" },
  ],
};

export const defaultHonorific = (gender: Gender) => HONORIFICS[gender][0].id;

export const OUTFITS: Record<Gender, { id: Outfit; label: string }[]> = {
  male: [
    { id: "batik", label: "Batik" },
    { id: "jas", label: "Jas" },
    { id: "koko", label: "Koko" },
  ],
  female: [
    { id: "kebaya", label: "Kebaya" },
    { id: "gamis", label: "Gamis" },
    { id: "dress", label: "Dress" },
  ],
};

export const HEADWEARS: Record<Gender, { id: Headwear; label: string }[]> = {
  male: [
    { id: "none", label: "Rambut" },
    { id: "peci", label: "Peci" },
  ],
  female: [
    { id: "none", label: "Rambut" },
    { id: "hijab", label: "Hijab" },
  ],
};

export const COLORS = ["#b45309", "#1e3a8a", "#065f46", "#9d174d", "#6d28d9", "#334155", "#e8dcc4"];
