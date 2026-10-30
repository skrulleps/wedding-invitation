// Mengubah foto bersama pengantin (elemen DOM berisi SVG karakter) menjadi PNG 1080x1350.

const W = 1080;
const H = 1350;
const PAD = 54;
const PHOTO_W = W - PAD * 2;
const PHOTO_H = (PHOTO_W * 3) / 4;

const INK = "#141b2d";
const GOLD = "#b08d57";
const GOLD_LIGHT = "#d9c08f";
const MUTED = "#6f6758";

function loadSvg(svg: SVGSVGElement, width: number, height: number): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  const xml = new XMLSerializer().serializeToString(clone);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  });
}

function isFlipped(el: Element) {
  const s = getComputedStyle(el);
  return s.scale.startsWith("-1") || s.transform.startsWith("matrix(-1");
}

export async function renderPhoto(area: HTMLElement, lines: { title: string; guest: string; date: string; venue?: string }): Promise<Blob> {
  await Promise.all([
    document.fonts.load('96px "Great Vibes"'),
    document.fonts.load('italic 40px "Cormorant Garamond"'),
    document.fonts.load('28px "Jost"'),
  ]).catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // kertas
  ctx.fillStyle = "#fbf8f2";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // latar foto
  const bg = ctx.createLinearGradient(0, PAD, 0, PAD + PHOTO_H);
  bg.addColorStop(0, INK);
  bg.addColorStop(1, "#222b44");
  ctx.fillStyle = bg;
  ctx.fillRect(PAD, PAD, PHOTO_W, PHOTO_H);
  for (let i = 0; i < 9; i++) {
    const x = PAD + 60 + i * 107;
    const y = PAD + 50 + 30 * Math.sin(i * 0.9);
    ctx.fillStyle = "rgba(253,232,176,0.85)";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  const floorY = PAD + PHOTO_H * 0.75;
  ctx.fillStyle = "#5a1a26";
  ctx.fillRect(PAD, floorY, PHOTO_W, PHOTO_H * 0.25);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fillRect(PAD, floorY, PHOTO_W, 3);

  // karakter, diposisikan sesuai susunan di layar
  const box = area.getBoundingClientRect();
  const k = PHOTO_W / box.width;
  const svgs = Array.from(area.querySelectorAll<SVGSVGElement>("svg.char"));
  for (const svg of svgs) {
    const r = svg.getBoundingClientRect();
    const w = r.width * k;
    const h = r.height * k;
    const img = await loadSvg(svg, Math.round(w), Math.round(h));
    const x = PAD + (r.left - box.left) * k;
    const y = PAD + (r.top - box.top) * k;
    ctx.save();
    if (isFlipped(svg)) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
    ctx.restore();
  }

  // teks
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const cx = W / 2;
  let y = PAD + PHOTO_H + 80;

  ctx.fillStyle = GOLD;
  ctx.font = '500 22px "Jost", sans-serif';
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "8px";
  ctx.fillText("THE WEDDING OF", cx, y);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  y += 105;
  ctx.fillStyle = INK;
  ctx.font = '96px "Great Vibes", cursive';
  ctx.fillText(lines.title, cx, y, W - 160);

  y += 50;
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 140, y);
  ctx.lineTo(cx - 20, y);
  ctx.moveTo(cx + 20, y);
  ctx.lineTo(cx + 140, y);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, y - 8);
  ctx.lineTo(cx + 8, y);
  ctx.lineTo(cx, y + 8);
  ctx.lineTo(cx - 8, y);
  ctx.fill();

  y += 75;
  ctx.fillStyle = INK;
  ctx.font = 'italic 44px "Cormorant Garamond", serif';
  ctx.fillText(`bersama ${lines.guest}`, cx, y, W - 160);

  y += 55;
  ctx.fillStyle = MUTED;
  ctx.font = '300 28px "Jost", sans-serif';
  ctx.fillText(lines.date, cx, y, W - 160);

  if (lines.venue) {
    y += 42;
    ctx.fillText(lines.venue, cx, y, W - 160);
  }

  ctx.fillStyle = GOLD;
  ctx.font = 'italic 34px "Cormorant Garamond", serif';
  ctx.fillText("Sampai jumpa di hari bahagia", cx, H - 70, W - 160);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar"))), "image/png"));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// true = dibagikan lewat menu share, false = perangkat tidak mendukung berbagi file
export async function shareBlob(blob: Blob, filename: string, text: string): Promise<boolean> {
  const file = new File([blob], filename, { type: "image/png" });
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file], text });
  } catch {
    /* dibatalkan pengguna */
  }
  return true;
}
