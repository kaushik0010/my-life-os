"use client";

import { Folder } from "lucide-react";

interface DesktopIconProps {
  label: string;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function DesktopIcon({ label, onClick, onContextMenu }: DesktopIconProps) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="flex flex-col items-center gap-1 p-2 w-20 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer active:scale-95 transition-all duration-100"
    >
      <Folder className="w-10 h-10 text-yellow-200 drop-shadow" />
      <span className="text-white text-xs text-center leading-tight drop-shadow">{label}</span>
    </button>
  );
}
