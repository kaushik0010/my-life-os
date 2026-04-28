"use client";

import { useState, useEffect } from "react";

interface File {
  id: string;
  name: string;
  content: string;
}

interface FileViewerProps {
  file: File;
  isOwner?: boolean;
  onBack: () => void;
  onFileSaved?: (fileId: string, content: string) => void;
}

export function FileViewer({ file, isOwner = true, onBack, onFileSaved }: FileViewerProps) {
  const [content, setContent] = useState(file.content);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setContent(file.content);
  }, [file.content]);

  async function handleSave() {
    if (!isOwner) return;
    setStatus("saving");

    try {
      const res = await fetch("/api/files/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: file.id, content }),
      });
      if (res.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
        onFileSaved?.(file.id, content);
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error("Failed to save file:", err);
      setStatus("idle");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onBack}
        className="self-start text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none cursor-pointer active:scale-95 transition-all duration-100"
      >
        ← Back
      </button>
      {isOwner ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 p-2 text-sm border border-gray-300 bg-white resize-none outline-none focus:border-blue-500"
          />
          <div className="flex items-center justify-between">
            <div>
              {status === "saving" && <span className="text-xs text-gray-500">Saving...</span>}
              {status === "saved" && <span className="text-xs text-green-600">Saved</span>}
            </div>
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:brightness-110 active:scale-95 transition-all duration-100 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <p className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">
            {file.content || <span className="text-gray-400 italic">Empty file</span>}
          </p>
        </div>
      )}
    </div>
  );
}
