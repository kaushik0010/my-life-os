"use client";

import { useCallback, useRef } from "react";

export function useSound(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    // Lazily create the Audio instance on first play (avoids SSR issues)
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Silently ignore errors (e.g. browser autoplay policy before user gesture)
    });
  }, [src]);

  return play;
}
