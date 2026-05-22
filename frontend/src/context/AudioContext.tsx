import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playingId: number | null;
  setPlayingId: (id: number | null) => void;
  stopAudio: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingId(null);
  };

  return (
    <AudioContext.Provider
      value={{ audioRef, playingId, setPlayingId, stopAudio }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
