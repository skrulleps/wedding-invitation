import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { Character, type Look } from "../components/Character";

export interface Line {
  speaker: string;
  text: string;
  avatar?: Look;
  icon?: ReactNode;
}

// Kotak dialog ala RPG dengan efek mengetik. Tap untuk mempercepat / lanjut.
export function DialogBox({ lines, onDone, onClose }: { lines: Line[]; onDone: () => void; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const line = lines[index];
  const typing = shown < line.text.length;

  useEffect(() => {
    if (!typing) return;
    const id = setTimeout(() => setShown((n) => n + 1), 22);
    return () => clearTimeout(id);
  }, [shown, typing]);

  const advance = () => {
    if (typing) return setShown(line.text.length);
    if (index + 1 < lines.length) {
      setIndex(index + 1);
      setShown(0);
    } else onDone();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (["Enter", " ", "e", "E"].includes(e.key)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-6 flex justify-center"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        onClick={advance}
        className="relative w-full max-w-2xl cursor-pointer select-none border border-gold-light/50 bg-ink/90 backdrop-blur-md shadow-2xl p-5 pr-8 flex gap-4 items-start font-game text-ivory"
      >
        <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gold-light/70 bg-ink-soft overflow-hidden grid place-items-center text-gold-light">
          {line.avatar ? (
            <Character look={line.avatar} className="absolute left-1/2 top-[-6%] -translate-x-1/2 w-[140%] max-w-none" />
          ) : (
            line.icon
          )}
        </div>
        <div className="flex-1 min-h-14">
          <p className="font-serif text-lg italic text-gold-light leading-none mb-1.5">{line.speaker}</p>
          <p className="text-[15px] sm:text-base font-light leading-relaxed text-ivory/90">{line.text.slice(0, shown)}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 text-ivory/40 hover:text-ivory"
          aria-label="Tutup"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
        {!typing && <ChevronDown size={16} className="absolute bottom-3 right-3 text-gold-light animate-bounce" />}
      </div>
    </motion.div>
  );
}
