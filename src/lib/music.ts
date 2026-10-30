import { useSyncExternalStore } from "react";

// Pemutar musik global: coba putar file audio, kalau gagal pakai synth Canon in D.

type State = { playing: boolean; title: string | null };

let state: State = { playing: false, title: null };
const listeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;
let stopSynth: (() => void) | null = null;

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function stopAll() {
  audio?.pause();
  audio = null;
  stopSynth?.();
  stopSynth = null;
}

export async function playSong(title: string, src: string) {
  stopAll();
  setState({ playing: true, title });
  if (src) {
    const el = new Audio(src);
    el.loop = true;
    el.volume = 0.7;
    audio = el;
    try {
      await el.play();
      return;
    } catch {
      if (audio !== el) return;
      audio = null;
    }
  }
  stopSynth = startSynth();
}

export function stopSong() {
  stopAll();
  setState({ playing: false, title: null });
}

export function useMusic() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

// Pachelbel - Canon in D (public domain), versi 8-bit sederhana.
function startSynth(): () => void {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);

  const beat = 60 / 76;
  const chords = [
    [50, 57, 62, 66], // D
    [45, 52, 57, 61], // A
    [47, 54, 59, 62], // Bm
    [42, 49, 54, 57], // F#m
    [43, 50, 55, 59], // G
    [38, 45, 50, 54], // D
    [43, 50, 55, 59], // G
    [45, 52, 57, 61], // A
  ];
  const melodies = [
    [78, 76, 74, 73, 71, 69, 71, 73],
    [74, 73, 71, 74, 74, 69, 71, 73],
  ];

  const note = (midi: number, t: number, dur: number, type: OscillatorType, gain: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  };

  let step = 0;
  let next = ctx.currentTime + 0.1;
  const tick = () => {
    while (next < ctx.currentTime + 0.3) {
      const ci = Math.floor(step / 4) % 8;
      const melody = melodies[Math.floor(step / 32) % melodies.length];
      const chord = chords[ci];
      const pos = step % 4;
      if (pos === 0) {
        note(chord[0] - 12, next, beat * 2, "triangle", 0.6);
        note(melody[ci], next, beat * 1.9, "square", 0.12);
      }
      note(chord[1 + (pos % 3)], next, beat / 2, "triangle", 0.18);
      next += beat / 2;
      step++;
    }
  };
  const id = window.setInterval(tick, 50);
  tick();
  return () => {
    window.clearInterval(id);
    void ctx.close();
  };
}
