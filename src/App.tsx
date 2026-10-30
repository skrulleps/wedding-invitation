import { useEffect, useState } from "react";
import { CharacterSelect } from "./components/CharacterSelect";
import { ClassicInvitation } from "./components/ClassicInvitation";
import { LinkGenerator } from "./components/LinkGenerator";
import { defaultHonorific, type Look } from "./components/look";
import { GameScene } from "./game/GameScene";
import { companionsFor } from "./game/layout";
import { coupleTitle, wedding } from "./config";
import { getGuestName, getParty, getVersion, partySize, withHonorific, withParty, type Party } from "./lib/guest";
import { playSong } from "./lib/music";

const LOOK_KEY = "wedding-look";
const DEFAULT_LOOK: Look = { gender: "male", outfit: "batik", color: "#b45309", headwear: "none" };

function loadLook(): Look {
  let look = DEFAULT_LOOK;
  try {
    const saved = localStorage.getItem(LOOK_KEY);
    if (saved) look = { ...DEFAULT_LOOK, ...JSON.parse(saved) };
  } catch {
    /* storage tidak tersedia */
  }
  return { ...look, honorific: look.honorific ?? defaultHonorific(look.gender) };
}

const isGenerator = new URLSearchParams(window.location.search).has("generate");
const guest = getGuestName();
const urlParty = getParty();
const version = getVersion();

type Screen = { kind: "cover"; pick?: boolean } | { kind: "classic" } | { kind: "game"; look: Look; party: Party };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "cover" });

  useEffect(() => {
    document.title = guest ? `Undangan ${coupleTitle} untuk ${guest}` : `Undangan Pernikahan ${coupleTitle}`;
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen.kind]);

  if (isGenerator) return <LinkGenerator />;

  if (screen.kind === "classic") {
    return (
      <ClassicInvitation
        guest={guest ? withParty(guest, urlParty) : "Tamu Undangan"}
        partyCount={partySize(urlParty)}
        onGame={version === "biasa" ? undefined : () => setScreen({ kind: "cover", pick: true })}
      />
    );
  }

  if (screen.kind === "game") {
    const { look, party } = screen;
    const name = guest ? withParty(withHonorific(guest, look.honorific), party) : "Tamu Undangan";
    return <GameScene look={look} guest={name} companions={companionsFor(look, party)} partyCount={partySize(party)} />;
  }

  return (
    <CharacterSelect
      key={screen.pick ? "pick" : "cover"}
      initialStep={screen.pick ? "pick" : "cover"}
      guest={guest}
      initial={loadLook()}
      initialParty={urlParty}
      version={version}
      onClassic={() => {
        // klik ini adalah gesture pengguna, jadi musik boleh langsung diputar
        void playSong(wedding.songs[0].title, wedding.songs[0].src);
        setScreen({ kind: "classic" });
      }}
      onStart={(look, party) => {
        try {
          localStorage.setItem(LOOK_KEY, JSON.stringify(look));
        } catch {
          /* storage tidak tersedia */
        }
        setScreen({ kind: "game", look, party });
      }}
    />
  );
}
