"use client";

import { useState } from "react";
import { DesktopIcon } from "@/features/os/DesktopIcon";
import { FileItem } from "@/features/files/FileItem";
import { FileViewer } from "@/features/files/FileViewer";
import { Taskbar } from "@/features/os/Taskbar";
import { useSound } from "@/hooks/useSound";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface File {
  name: string;
  content: string;
}

interface Folder {
  name: string;
  files: File[];
}

const FOLDERS: Folder[] = [
  {
    name: "Childhood",
    files: [
      { name: "first_crush.txt", content: "Had a crush in school but never said anything 💀" },
      { name: "school_memories.txt", content: "Lunch breaks, PT periods, and random chaos" },
      { name: "guest_arrival_panic_mode.txt", content: "when guests come and suddenly you become the most well-behaved kid" },
    ],
  },
  {
    name: "Cartoons",
    files: [
      { name: "tom_and_jerry.txt", content: "Woke up early just to watch this" },
      { name: "pokemon_obsession.txt", content: "Wanted to be a Pokemon trainer so bad" },
    ],
  },
  {
    name: "School",
    files: [
      { name: "last_bench.txt", content: "Best memories happened here" },
      { name: "roll_number_called_and_no_answer.txt", content: "when teacher called your roll number and you didn't realize it was yours 💀" },
      { name: "accidental_mom_moment.txt", content: `The moment when someone called the teacher "Mom" in class 😭` },
      { name: "homework_not_done_excuse_generator.txt", content: `"ma'am i forgot my notebook at home" worked way too many times` },
    ],
  },
  {
    name: "Random",
    files: [
      { name: "regret.log", content: "Why did I send that message..." },
      { name: "why_am_i_like_this.txt", content: "Still figuring this out" },
      { name: "checking_phone_every_2_minutes.txt", content: "checking phone again even though no new notification" },
      { name: "delete_for_me_mistake.txt", content: "that moment when you clicked “delete for me” instead of “delete for everyone” 💀" },
    ],
  },
];

// Combined icon list — system icons first, then user folders
type IconItem =
  | { kind: "system"; label: string; emoji: string }
  | { kind: "folder"; folder: Folder };

const SYSTEM_ICONS = [
  { label: "My Computer", emoji: "🖥️" },
  { label: "My Documents", emoji: "📁" },
  { label: "Internet Explorer", emoji: "🌐" },
  { label: "Recycle Bin", emoji: "🗑️" },
];

const ITEMS_PER_COLUMN = 5;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function Desktop({
  onShutdown,
  onRestart,
}: {
  onShutdown: () => void;
  onRestart: () => void;
}) {
  const [openFolder, setOpenFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const playClick = useSound("/sounds/windows-xp-click.mp3");

  function handleFolderClick(folder: Folder) {
    playClick();
    setOpenFolder(folder);
    setSelectedFile(null);
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setOpenFolder(null);
      setSelectedFile(null);
    }
  }

  const allIcons: IconItem[] = [
    ...SYSTEM_ICONS.map((s) => ({ kind: "system" as const, ...s })),
    ...FOLDERS.map((f) => ({ kind: "folder" as const, folder: f })),
  ];

  const columns = chunkArray(allIcons, ITEMS_PER_COLUMN);

  return (
    <div className="relative w-full h-full overflow-hidden bg-linear-to-br from-blue-400 via-blue-500 to-blue-700">
      {/* Icon columns — top-left, max 5 per column, padded above taskbar */}
      <div className="flex items-start gap-2 p-6 pb-14">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-2">
            {col.map((item) =>
              item.kind === "system" ? (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1 p-2 w-20 rounded-md select-none"
                >
                  <span className="text-4xl leading-none drop-shadow">{item.emoji}</span>
                  <span className="text-white text-xs text-center leading-tight drop-shadow">{item.label}</span>
                </div>
              ) : (
                <DesktopIcon
                  key={item.folder.name}
                  label={item.folder.name}
                  onClick={() => handleFolderClick(item.folder)}
                />
              )
            )}
          </div>
        ))}
      </div>

      <Dialog open={openFolder !== null} onOpenChange={handleDialogClose}>
        {/* [&>button]:hidden hides the default shadcn close button */}
        <DialogContent className="bg-white text-black p-0 rounded-none shadow-md border border-gray-400 overflow-hidden [&>button]:hidden">

          {/* XP-style title bar */}
          <div className="h-8 bg-blue-600 flex items-center justify-between px-3">
            <DialogTitle className="text-sm font-semibold text-white truncate">
              {selectedFile ? selectedFile.name : openFolder?.name}
            </DialogTitle>
            {/* Control buttons */}
            <div className="flex items-center gap-1">
              <button className="w-5 h-5 bg-gray-200 text-black text-xs border border-gray-400 flex items-center justify-center hover:brightness-110 leading-none">
                _
              </button>
              <button className="w-5 h-5 bg-gray-200 text-black text-xs border border-gray-400 flex items-center justify-center hover:brightness-110 leading-none">
                □
              </button>
              <DialogClose className="w-5 h-5 bg-red-500 text-white text-xs border border-red-700 flex items-center justify-center hover:brightness-110 leading-none">
                X
              </DialogClose>
            </div>
          </div>

          {/* Window body */}
          <div className="p-4 bg-white">
            {selectedFile ? (
              <FileViewer
                file={selectedFile}
                onBack={() => setSelectedFile(null)}
              />
            ) : (
              <div className="flex flex-col space-y-2">
                {openFolder?.files.map((file) => (
                  <FileItem
                    key={file.name}
                    name={file.name}
                    onClick={() => setSelectedFile(file)}
                  />
                ))}
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>

      <Taskbar onShutdown={onShutdown} onRestart={onRestart} />
    </div>
  );
}
