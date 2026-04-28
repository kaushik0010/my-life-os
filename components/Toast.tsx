"use client";

import { useEffect, useState } from "react";

export function Toast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleError(e: Event) {
      const detail = (e as CustomEvent).detail;
      setMessage(detail?.message ?? "Something went wrong");
    }

    window.addEventListener("auth-error", handleError);
    return () => window.removeEventListener("auth-error", handleError);
  }, []);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#fbf5e6]/95 backdrop-blur-md border border-[#e8d5b5] shadow-[0_8px_24px_rgba(0,0,0,0.1)] rounded-xl px-5 py-3 flex items-center gap-3 max-w-sm">
      <span className="text-sm text-gray-800">{message}</span>
      <button
        onClick={() => setMessage(null)}
        className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
