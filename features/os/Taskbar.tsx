"use client";

import { useState } from "react";

interface TaskbarProps {
  onShutdown: () => void;
  onRestart: () => void;
}

export function Taskbar({ onShutdown, onRestart }: TaskbarProps) {
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
              className="text-left text-sm px-4 py-2 hover:bg-gray-100 text-black"
            >
              🔴 Shut Down
            </button>
            <button
              onClick={handleRestart}
              className="text-left text-sm px-4 py-2 hover:bg-gray-100 text-black"
            >
              🔄 Restart
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="bg-linear-to-r from-green-500 to-green-600 text-white font-semibold text-sm px-4 py-1 rounded-full hover:brightness-110 focus:outline-none"
        >
          start
        </button>
      </div>

      {/* System tray */}
      <div className="text-white text-sm px-2">{time}</div>
    </div>
  );
}
