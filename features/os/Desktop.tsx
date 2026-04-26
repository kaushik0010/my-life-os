"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DesktopIcon } from "@/features/os/DesktopIcon";
import { FileItem } from "@/features/files/FileItem";
import { FileViewer } from "@/features/files/FileViewer";
import { Taskbar } from "@/features/os/Taskbar";
import { InlineInput } from "@/components/ui/InlineInput";
import { SaveModal } from "@/components/SaveModal";
import { useSound } from "@/hooks/useSound";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface File {
  id: string;
  name: string;
  content: string;
}

interface Folder {
  id: string;
  name: string;
  files: File[];
}

interface ContextMenu {
  x: number;
  y: number;
  type: "desktop" | "folder" | "file";
  targetId?: string;
}

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

function buildFolders(
  dbFolders: Array<{ id: string; name: string; os_id: string }>,
  dbFiles: Array<{ id: string; name: string; content: string; folder_id: string }>
): Folder[] {
  return dbFolders.map((f) => ({
    id: f.id,
    name: f.name,
    files: dbFiles
      .filter((file) => file.folder_id === f.id)
      .map((file) => ({ id: file.id, name: file.name, content: file.content })),
  }));
}

export function Desktop({
  onShutdown,
  onRestart,
  osId,
  isTemporary = true,
  isOwner = true,
  dbFolders = [],
  dbFiles = [],
}: {
  onShutdown: () => void;
  onRestart: () => void;
  osId: string;
  isTemporary?: boolean;
  isOwner?: boolean;
  dbFolders?: Array<{ id: string; name: string; os_id: string }>;
  dbFiles?: Array<{ id: string; name: string; content: string; folder_id: string }>;
}) {
  const router = useRouter();
  const playClick = useSound("/sounds/windows-xp-click.mp3");

  const [folders, setFolders] = useState<Folder[]>(() => buildFolders(dbFolders, dbFiles));
  const [openFolder, setOpenFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  // Inline input states
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFile, setCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameFileName, setRenameFileName] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFolders(buildFolders(dbFolders, dbFiles));
  }, [dbFolders, dbFiles]);

  useEffect(() => {
    function handleClick() { setContextMenu(null); }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Listen for share event from AuthHandler
  useEffect(() => {
    function openShare() { setShowShareModal(true); }
    window.addEventListener("open-share", openShare);
    return () => window.removeEventListener("open-share", openShare);
  }, []);

  // --- Click handlers ---

  function handleFolderClick(folder: Folder) {
    playClick();
    setOpenFolder(folder);
    setSelectedFile(null);
    setCreatingFile(false);
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setOpenFolder(null);
      setSelectedFile(null);
      setCreatingFile(false);
    }
  }

  // --- Share ---

  function handleShare() {
    if (isTemporary) {
      // Require login first, then auto-share
      localStorage.setItem("pending_os_id", osId);
      localStorage.setItem("pending_share", "true");
      setShowSave(true);
      return;
    }
    setShowShareModal(true);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/os/${osId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // --- Context menu ---

  function getMenuPosition(x: number, y: number) {
    const menuWidth = 150;
    const menuHeight = 100;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let posX = x + 4;
    let posY = y + 4;
    if (posX + menuWidth > screenWidth) posX = screenWidth - menuWidth - 8;
    if (posY + menuHeight > screenHeight) posY = screenHeight - menuHeight - 8;
    return { x: posX, y: posY };
  }

  function handleDesktopContextMenu(e: React.MouseEvent) {
    if (!isOwner) return;
    e.preventDefault();
    const pos = getMenuPosition(e.clientX, e.clientY);
    setContextMenu({ x: pos.x, y: pos.y, type: "desktop" });
  }

  function handleFolderContextMenu(e: React.MouseEvent, folderId: string) {
    if (!isOwner) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = getMenuPosition(e.clientX, e.clientY);
    setContextMenu({ x: pos.x, y: pos.y, type: "folder", targetId: folderId });
  }

  function handleFileContextMenu(e: React.MouseEvent, fileId: string) {
    if (!isOwner) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = getMenuPosition(e.clientX, e.clientY);
    setContextMenu({ x: pos.x, y: pos.y, type: "file", targetId: fileId });
  }

  // --- Create folder ---

  function startCreateFolder() {
    if (!isOwner) return;
    setContextMenu(null);
    setCreatingFolder(true);
    setNewFolderName("");
  }

  async function submitCreateFolder() {
    if (!newFolderName.trim()) { setCreatingFolder(false); return; }
    try {
      const res = await fetch("/api/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ os_id: osId, name: newFolderName.trim() }),
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
    setCreatingFolder(false);
  }

  // --- Create file ---

  function startCreateFile() {
    if (!isOwner) return;
    setCreatingFile(true);
    setNewFileName("");
  }

  async function submitCreateFile() {
    if (!newFileName.trim() || !openFolder) { setCreatingFile(false); return; }
    try {
      const res = await fetch("/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: openFolder.id, name: newFileName.trim(), content: "" }),
      });
      if (res.ok) {
        setOpenFolder(null);
        setSelectedFile(null);
        setCreatingFile(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to create file:", err);
    }
    setCreatingFile(false);
  }

  // --- Rename folder ---

  function startRenameFolder(folderId: string) {
    if (!isOwner) return;
    setContextMenu(null);
    const folder = folders.find((f) => f.id === folderId);
    setRenamingFolderId(folderId);
    setRenameFolderName(folder?.name ?? "");
  }

  async function submitRenameFolder() {
    if (!renamingFolderId || !renameFolderName.trim()) { setRenamingFolderId(null); return; }
    const name = renameFolderName.trim();
    setFolders((prev) => prev.map((f) => (f.id === renamingFolderId ? { ...f, name } : f)));
    setRenamingFolderId(null);
    await fetch("/api/folders/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_id: renamingFolderId, name }),
    });
  }

  // --- Rename file ---

  function startRenameFile(fileId: string) {
    if (!isOwner) return;
    setContextMenu(null);
    let fileName = "";
    for (const folder of folders) {
      const file = folder.files.find((f) => f.id === fileId);
      if (file) { fileName = file.name; break; }
    }
    setRenamingFileId(fileId);
    setRenameFileName(fileName);
  }

  async function submitRenameFile() {
    if (!renamingFileId || !renameFileName.trim()) { setRenamingFileId(null); return; }
    const name = renameFileName.trim();
    setFolders((prev) =>
      prev.map((folder) => ({
        ...folder,
        files: folder.files.map((file) => (file.id === renamingFileId ? { ...file, name } : file)),
      }))
    );
    if (openFolder) {
      setOpenFolder((prev) =>
        prev ? { ...prev, files: prev.files.map((file) => (file.id === renamingFileId ? { ...file, name } : file)) } : null
      );
    }
    setRenamingFileId(null);
    await fetch("/api/files/update-name", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: renamingFileId, name }),
    });
  }

  // --- Render ---

  const allIcons: IconItem[] = [
    ...SYSTEM_ICONS.map((s) => ({ kind: "system" as const, ...s })),
    ...folders.map((f) => ({ kind: "folder" as const, folder: f })),
  ];

  const columns = chunkArray(allIcons, ITEMS_PER_COLUMN);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-linear-to-br from-blue-400 via-blue-500 to-blue-700"
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Icon columns */}
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
              ) : renamingFolderId === item.folder.id ? (
                <div key={item.folder.id} className="w-20 p-1">
                  <InlineInput
                    value={renameFolderName}
                    onChange={setRenameFolderName}
                    onSubmit={submitRenameFolder}
                    onCancel={() => setRenamingFolderId(null)}
                    placeholder="Folder name"
                  />
                </div>
              ) : (
                <DesktopIcon
                  key={item.folder.id}
                  label={item.folder.name}
                  onClick={() => handleFolderClick(item.folder)}
                  onContextMenu={(e) => handleFolderContextMenu(e, item.folder.id)}
                />
              )
            )}
          </div>
        ))}

        {creatingFolder && (
          <div className="w-20 p-1">
            <InlineInput
              value={newFolderName}
              onChange={setNewFolderName}
              onSubmit={submitCreateFolder}
              onCancel={() => setCreatingFolder(false)}
              placeholder="New Folder"
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {folders.length === 0 && !creatingFolder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1">
          <p className="text-white/60 text-sm">No folders yet</p>
          {isOwner && <p className="text-white/40 text-xs">Right-click to create a folder</p>}
        </div>
      )}

      {/* Context menu (owner only) */}
      {contextMenu && isOwner && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }}
          className="bg-gray-100 border border-gray-400 shadow-md min-w-[140px] py-1"
        >
          {contextMenu.type === "desktop" && (
            <button onClick={startCreateFolder} className="w-full text-left px-3 py-1 text-sm text-black hover:bg-blue-500 hover:text-white">
              New Folder
            </button>
          )}
          {contextMenu.type === "folder" && contextMenu.targetId && (
            <button onClick={() => startRenameFolder(contextMenu.targetId!)} className="w-full text-left px-3 py-1 text-sm text-black hover:bg-blue-500 hover:text-white">
              Rename
            </button>
          )}
          {contextMenu.type === "file" && contextMenu.targetId && (
            <button onClick={() => startRenameFile(contextMenu.targetId!)} className="w-full text-left px-3 py-1 text-sm text-black hover:bg-blue-500 hover:text-white">
              Rename
            </button>
          )}
        </div>
      )}

      {/* Folder dialog */}
      <Dialog open={openFolder !== null} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-white text-black p-0 rounded-none shadow-md border border-gray-400 overflow-hidden [&>button]:hidden">
          <div className="h-8 bg-blue-600 flex items-center justify-between px-3">
            <DialogTitle className="text-sm font-semibold text-white truncate">
              {selectedFile ? selectedFile.name : openFolder?.name}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <button className="w-5 h-5 bg-gray-200 text-black text-xs border border-gray-400 flex items-center justify-center hover:brightness-110 leading-none">_</button>
              <button className="w-5 h-5 bg-gray-200 text-black text-xs border border-gray-400 flex items-center justify-center hover:brightness-110 leading-none">□</button>
              <DialogClose className="w-5 h-5 bg-red-500 text-white text-xs border border-red-700 flex items-center justify-center hover:brightness-110 leading-none">X</DialogClose>
            </div>
          </div>
          <div className="p-4 bg-white">
            {selectedFile ? (
              <FileViewer file={selectedFile} isOwner={isOwner} onBack={() => setSelectedFile(null)} />
            ) : (
              <div className="flex flex-col space-y-2">
                {openFolder?.files.map((file) => (
                  <div key={file.id} onContextMenu={(e) => handleFileContextMenu(e, file.id)}>
                    {renamingFileId === file.id ? (
                      <InlineInput
                        value={renameFileName}
                        onChange={setRenameFileName}
                        onSubmit={submitRenameFile}
                        onCancel={() => setRenamingFileId(null)}
                        placeholder="File name"
                      />
                    ) : (
                      <FileItem name={file.name} onClick={() => setSelectedFile(file)} />
                    )}
                  </div>
                ))}
                {isOwner && (
                  creatingFile ? (
                    <InlineInput
                      value={newFileName}
                      onChange={setNewFileName}
                      onSubmit={submitCreateFile}
                      onCancel={() => setCreatingFile(false)}
                      placeholder="new_file.txt"
                    />
                  ) : (
                    <button onClick={startCreateFile} className="text-left px-3 py-2 rounded text-sm text-blue-600 hover:bg-gray-100 focus:outline-none cursor-pointer">
                      + New File
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Taskbar
        onShutdown={onShutdown}
        onRestart={onRestart}
        isTemporary={isTemporary}
        isOwner={isOwner}
        onSave={() => setShowSave(true)}
        onShare={handleShare}
      />

      {/* Save modal */}
      {showSave && <SaveModal osId={osId} onClose={() => setShowSave(false)} />}

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white p-5 rounded shadow-md w-80 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-800">Share your Life OS</h3>
            <input
              readOnly
              value={`${window.location.origin}/os/${osId}`}
              className="border border-gray-300 w-full px-2 py-1 text-sm bg-gray-50 outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="w-full bg-blue-600 text-white py-1 text-sm rounded hover:brightness-110 active:scale-95 transition-all duration-100"
            >
              {copied ? "✓ Copied" : "Copy link"}
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="text-xs text-gray-500 self-center hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
