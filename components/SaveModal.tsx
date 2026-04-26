"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface SaveModalProps {
  osId: string;
  onClose: () => void;
}

export function SaveModal({ osId, onClose }: SaveModalProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim()) return;
    setError(null);

    localStorage.setItem("pending_os_id", osId);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      setError("Failed to send magic link. Try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-5 rounded shadow-md w-72 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-800">Save your Life OS</h3>

        {!sent ? (
          <>
            <p className="text-xs text-gray-500">
              Enter your email to receive a magic link. Your OS will be saved to your account.
            </p>
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
              placeholder="you@example.com"
              className="border border-gray-300 w-full px-2 py-1 text-sm outline-none focus:border-blue-500"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="text-xs text-gray-500 px-3 py-1 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:brightness-110 active:scale-95 transition-all duration-100"
              >
                Send Link
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 text-center py-2">
              Magic link sent! Check your email.
            </p>
            <button
              onClick={onClose}
              className="text-xs text-gray-500 self-center hover:text-gray-700"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
