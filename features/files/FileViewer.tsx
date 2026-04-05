"use client";

interface File {
  name: string;
  content: string;
}

interface FileViewerProps {
  file: File;
  onBack: () => void;
}

export function FileViewer({ file, onBack }: FileViewerProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onBack}
        className="self-start text-xs text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
      >
        ← Back
      </button>
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <p className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">{file.content}</p>
      </div>
    </div>
  );
}
