"use client";

import { useEffect, useState } from "react";
import { NokiaScreen } from "@/features/nokia/NokiaScreen";
import { useSound } from "@/hooks/useSound";

const KEYPAD = ["1","2","3","4","5","6","7","8","9","*","0","#"];

export function NokiaDevice() {
  const [isBooting, setIsBooting] = useState(true);
  const playBoot = useSound("/sounds/nokia-boot.mp3");

  useEffect(() => {
    playBoot();
    const t = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(t);
  }, [playBoot]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-300">
      <div className="w-[260px] bg-gray-200 border border-gray-400 rounded-[40px] flex flex-col items-center py-6 px-4 gap-4">

        {/* Top — speaker + brand */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-gray-500" />
            ))}
          </div>
          <span className="text-xs font-semibold tracking-widest text-gray-700 font-mono">NOKIA</span>
        </div>

        {/* Screen */}
        <div className="w-full h-[220px] bg-green-200 border-4 border-gray-700 rounded-md overflow-hidden">
          {isBooting ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-green-200 font-mono text-black text-sm">
              <span className="font-bold tracking-widest">NOKIA</span>
              <span className="text-xs text-gray-600">connecting people...</span>
            </div>
          ) : (
            <NokiaScreen />
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 w-full px-2">
          {KEYPAD.map((key) => (
            <div
              key={key}
              className="bg-gray-100 border border-gray-300 rounded-lg text-center text-xs py-2 font-mono text-gray-700 select-none"
            >
              {key}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
