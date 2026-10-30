// Nama tamu dibaca dari URL, contoh:
//   https://domain.com/adnan            -> "Adnan"
//   https://domain.com/budi-santoso     -> "Budi Santoso"
//   https://domain.com/?to=Budi+Santoso -> "Budi Santoso"
export function getGuestName(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("to") ?? params.get("kepada") ?? params.get("nama");
  const raw = fromQuery ?? fromPath(window.location.pathname);
  if (!raw) return null;
  const name = raw.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  if (!name) return null;
  // huruf kecil semua dianggap slug: kapitalkan tiap kata
  return name === name.toLowerCase() ? name.replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : name;
}

function fromPath(pathname: string): string | null {
  const last = pathname.split("/").filter(Boolean).pop();
  if (!last || last.includes(".")) return null;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

const KNOWN_HONORIFICS = /^(bapak|pak|ibu|bu|mas|mbak|mba|kak|kakak|bang|abang|dik|adik|tuan|nyonya|nona|sdr|sdri|dr|drs|prof|ir|h|hj)\.?\s/i;

// "Adnan" + "Bapak" -> "Bapak Adnan"; nama yang sudah bersapaan tidak diubah
export function withHonorific(name: string, honorific?: string): string {
  if (!honorific || KNOWN_HONORIFICS.test(name)) return name;
  return `${honorific} ${name}`;
}

export type Party = "single" | "pasangan" | "keluarga";
export type Version = "game" | "biasa";

export const PARTIES: { id: Party; label: string }[] = [
  { id: "single", label: "Sendiri" },
  { id: "pasangan", label: "Pasangan" },
  { id: "keluarga", label: "Keluarga" },
];

// ?ajak=pasangan / ?ajak=keluarga
export function getParty(): Party {
  const v = new URLSearchParams(window.location.search).get("ajak")?.toLowerCase();
  return v === "pasangan" || v === "keluarga" ? v : "single";
}

// ?versi=game / ?versi=biasa untuk memaksa satu versi
export function getVersion(): Version | null {
  const v = new URLSearchParams(window.location.search).get("versi")?.toLowerCase();
  return v === "game" || v === "biasa" ? v : null;
}

export function withParty(name: string, party: Party): string {
  if (party === "pasangan") return `${name} & Pasangan`;
  if (party === "keluarga") return `${name} & Keluarga`;
  return name;
}

export const partySize = (party: Party) => (party === "keluarga" ? 4 : party === "pasangan" ? 2 : 1);

export function buildGuestLink(base: string, name: string, party: Party = "single", version?: Version): string {
  const url = new URL(base);
  const slug = encodeURIComponent(name.trim().replace(/\s+/g, "-"));
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${slug}`;
  url.search = "";
  url.hash = "";
  if (party !== "single") url.searchParams.set("ajak", party);
  if (version) url.searchParams.set("versi", version);
  return url.toString();
}
