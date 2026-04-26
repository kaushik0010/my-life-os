"use client";

import { useState } from "react";

interface TaskbarProps {
  onShutdown: () => void;
  onRestart: () => void;
  isTemporary: boolean;
  isOwner: boolean;
  onSave: () => void;
  onShare: () => void;
}

export function Taskbar({ onShutdown, onRestart, isTemporary, isOwner, onSave, onShare }: TaskbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function handleShutdown() {
    setMenuOpen(false);
    onShutdown();
  }

  function handleRestart() {
    setMenuOpen(false);
    onRestart();
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-r from-blue-500 via-blue-600 to-blue-700 border-t border-blue-800 flex items-center justify-between px-2">
      {/* Start button + menu */}
      <div className="relative">
        {menuOpen && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-300 shadow-md w-36 flex flex-col">
            <button
              onClick={handleShutdown}
              className="text-left text-sm px-4 py-2 hover:bg-gray-100 text-black cursor-pointer active:scale-95 transition-all duration-100"
            >
              🔴 Shut Down
            </button>
            <button
              onClick={handleRestart}
              className="text-left text-sm px-4 py-2 hover:bg-gray-100 text-black cursor-pointer active:scale-95 transition-all duration-100"
            >
              🔄 Restart
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="bg-linear-to-r from-green-500 to-green-600 text-white font-semibold text-sm px-4 py-1 rounded-full hover:brightness-110 active:scale-95 transition-all duration-100 focus:outline-none cursor-pointer"
        >
          start
        </button>
      </div>

      {/* System tray */}
      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            <button
              onClick={() => { if (isTemporary) onSave(); }}
              disabled={!isTemporary}
              className={`text-xs px-2 py-0.5 rounded transition-all duration-100 ${
                isTemporary
                  ? "text-white border border-white/30 hover:bg-white/10 active:scale-95 cursor-pointer"
                  : "text-gray-300 bg-transparent cursor-not-allowed"
              }`}
            >
              {isTemporary ? "💾 Save" : "✓ Saved"}
            </button>
            <button
              onClick={onShare}
              className="text-xs px-2 py-0.5 rounded text-white border border-white/30 hover:bg-white/10 active:scale-95 transition-all duration-100 cursor-pointer"
            >
              🔗 Share
            </button>
          </>
        )}
        <div className="text-white text-sm px-2">{time}</div>
      </div>
    </div>
  );
}
