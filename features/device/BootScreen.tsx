"use client";

export function BootScreen() {
  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-6">
      <p className="text-white text-sm font-mono tracking-widest">Starting Windows XP...</p>
      {/* Loading bar track */}
      <div className="w-48 h-3 bg-gray-700 rounded overflow-hidden">
        <div className="h-full bg-blue-500 rounded animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes loading {
          0%   { width: 0% }
          50%  { width: 80% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  );
}
