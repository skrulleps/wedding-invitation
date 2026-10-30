import { useMemo, useState } from "react";
import { coupleTitle } from "../config";
import { buildGuestLink, withParty, type Party, type Version } from "../lib/guest";

const DEFAULT_TEMPLATE = `Kepada Yth.
Bapak/Ibu/Saudara/i *{nama}*

Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di acara pernikahan kami.

Silakan buka undangan kami melalui tautan berikut:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.

Terima kasih.
${coupleTitle}`;

// Buka dengan ?generate untuk membuat link undangan per tamu.
export function LinkGenerator() {
  const [base, setBase] = useState(() => window.location.origin);
  const [names, setNames] = useState("Adnan\nBudi Santoso, pasangan\nSiti Aminah, keluarga");
  const [version, setVersion] = useState<Version | "">("");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [copied, setCopied] = useState<number | null>(null);

  const rows = useMemo(() => {
    const list = names
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    return list.map((line) => {
      // format baris: "Nama" atau "Nama, pasangan" / "Nama, keluarga"
      const [rawName, rawParty = ""] = line.split(",").map((s) => s.trim());
      const p = rawParty.toLowerCase();
      const party: Party = p.startsWith("pas") ? "pasangan" : p.startsWith("kel") ? "keluarga" : "single";
      const name = withParty(rawName, party);
      let link = "";
      try {
        link = buildGuestLink(base, rawName, party, version || undefined);
      } catch {
        /* base URL belum valid */
      }
      return { name, link, message: template.replaceAll("{nama}", name).replaceAll("{link}", link) };
    });
  }, [base, names, template, version]);

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const input = "w-full rounded-xl border-2 border-amber-300 bg-white px-3 py-2 outline-none focus:border-amber-600";

  return (
    <div className="min-h-screen bg-amber-50 font-game text-stone-800 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-amber-800">Generator Link Undangan</h1>
          <p className="text-sm text-stone-600">Tulis nama tamu satu per baris, lalu salin atau kirim langsung via WhatsApp.</p>
        </header>

        <label className="block">
          <span className="text-sm font-semibold">URL undangan (setelah di-deploy)</span>
          <input value={base} onChange={(e) => setBase(e.target.value)} className={`${input} mt-1`} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Versi undangan</span>
          <select value={version} onChange={(e) => setVersion(e.target.value as Version | "")} className={`${input} mt-1`}>
            <option value="">Tamu memilih sendiri (game atau biasa)</option>
            <option value="game">Langsung mode game</option>
            <option value="biasa">Langsung versi biasa (cocok untuk orang tua)</option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">
              Daftar nama tamu <span className="font-normal text-stone-500">(tambahkan ", pasangan" atau ", keluarga")</span>
            </span>
            <textarea value={names} onChange={(e) => setNames(e.target.value)} rows={10} className={`${input} mt-1 font-mono text-sm`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">
              Template pesan <span className="font-normal text-stone-500">({"{nama}"} dan {"{link}"})</span>
            </span>
            <textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={10} className={`${input} mt-1 text-sm`} />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{rows.length} tamu</h2>
          <button
            onClick={() => copy(rows.map((r) => `${r.name}\t${r.link}`).join("\n"), -1)}
            className="rounded-xl border-2 border-amber-600 px-3 py-1.5 text-sm font-semibold text-amber-800"
          >
            {copied === -1 ? "Tersalin ✓" : "Salin semua link"}
          </button>
        </div>

        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="rounded-xl border-2 border-amber-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{r.name}</p>
                <a href={r.link} target="_blank" rel="noreferrer" className="block truncate text-xs text-amber-700 underline">
                  {r.link}
                </a>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => copy(r.message, i)} className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900">
                  {copied === i ? "Tersalin ✓" : "Salin pesan"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(r.message)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
