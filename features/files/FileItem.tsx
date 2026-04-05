"use client";

import { useSound } from "@/hooks/useSound";

interface FileItemProps {
  name: string;
  onClick: () => void;
}

export function FileItem({ name, onClick }: FileItemProps) {
  const playClick = useSound("/sounds/windows-xp-click.mp3");

  function handleClick() {
    playClick();
    onClick();
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-3 py-2 rounded text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
    >
      📄 {name}
    </button>
  );
}
