"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { authFetch } from "@/lib/api-client";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInState, setSignInState] = useState<"idle" | "input" | "sending" | "sent">("idle");
  const [signInError, setSignInError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      setSignInState("idle");
      setSignInEmail("");
      setSignInError(null);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  async function handleSignOut() {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.refresh();
  }

  async function handleDropdownSignIn() {
    if (!signInEmail.trim() || signInState === "sending") return;
    setSignInError(null);
    setSignInState("sending");
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: signInEmail.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (authError) {
      if (authError.status === 429) {
        setSignInError("Too many attempts. Please wait a moment.");
      } else {
        setSignInError("Failed to send login link. Try again.");
      }
      setSignInState("input");
    } else {
      setSignInState("sent");
    }
  }

  async function handleSelect(deviceId: string) {
    setLoading(true);
    setError(null);

    try {
      if (user) {
        const { data: existingOs } = await supabase
          .from("life_os")
          .select("id")
          .eq("user_id", user!.id)
          .eq("device_type", deviceId)
          .limit(1)
          .single();

        if (existingOs) {
          router.push(`/os/${existingOs.id}?device=${deviceId}`);
          return;
        }
      }

      const res = await authFetch("/api/os/create", {
        method: "POST",
        body: JSON.stringify({ device_type: deviceId }),
      });

      if (res.ok) {
        const { id } = await res.json();
        router.push(`/os/${id}?device=${deviceId}`);
      } else {
        setError("Failed to create OS. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to create OS. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden font-sans text-gray-900 selection:bg-blue-200 selection:text-blue-900" 
      style={{ background: "radial-gradient(circle at 50% 0%, #fffbf2 0%, #fef4e0 50%, #f4e6cd 100%)" }}
    >
      {/* Grain overlay */}
      <div 
        className="fixed inset-0 opacity-[0.06] mix-blend-multiply pointer-events-none z-0" 
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} 
      />

      {/* ===== NAVBAR ===== */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 sm:px-6 pt-5 pb-2">
        <div className="w-full max-w-[960px] bg-[#fcf9f2]/65 backdrop-blur-xl rounded-[24px] border border-[#f0e4cd]/60 shadow-[0_2px_16px_rgba(0,0,0,0.04)] px-5 py-3.5 flex justify-between items-center transition-all">
          <div className="flex items-center gap-3 cursor-pointer group">
            <Image src="/assets/icons/folder.png" alt="Life OS" width={24} height={24} className="group-hover:scale-105 transition-transform" />
            <span className="font-bold text-[#1c202a] text-base tracking-tight">Life OS</span>
          </div>
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer group hover:bg-[#f2ead9]/80 px-2 py-1 rounded-full transition-colors"
            >
              {user ? (
                <div className="w-8 h-8 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user.email?.charAt(0).toUpperCase() ?? "U"}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1d4ed8] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  P
                </div>
              )}
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#fbf5e6]/95 backdrop-blur-md rounded-xl border border-[#e8d5b5] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm text-gray-800 font-medium truncate">{user.email}</p>
                    </div>
                    <div className="border-t border-[#e8d5b5] my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f2ead9] cursor-pointer transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2">
                    {signInState === "idle" && (
                      <button
                        onClick={() => setSignInState("input")}
                        className="w-full text-left text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                      >
                        Sign in to save your OS
                      </button>
                    )}
                    {signInState === "input" && (
                      <div className="flex flex-col gap-2">
                        <input
                          autoFocus
                          type="email"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleDropdownSignIn(); }}
                          placeholder="you@example.com"
                          className="border border-[#e8d5b5] w-full px-2 py-1.5 text-sm rounded-lg outline-none focus:border-blue-400 bg-white"
                        />
                        {signInError && <p className="text-xs text-red-500">{signInError}</p>}
                        <button
                          onClick={handleDropdownSignIn}
                          className="w-full bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-100 cursor-pointer font-medium"
                        >
                          Send magic link
                        </button>
                      </div>
                    )}
                    {signInState === "sending" && (
                      <p className="text-xs text-gray-500 text-center py-1">Sending…</p>
                    )}
                    {signInState === "sent" && (
                      <p className="text-xs text-gray-600 text-center py-1">
                        Magic link sent! Check your email.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 w-full max-w-[960px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-4">
          
          {/* Left — text */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left relative z-20">
            {/* Sparkle top-left */}
            <svg className="absolute -top-10 -left-6 w-6 h-6 text-amber-300 hidden lg:block opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>

            {/* Badge */}
            <div className="flex items-center gap-2 border border-[#e8d5b5] bg-[#fbf4e6]/60 backdrop-blur-sm rounded-full px-4 py-1.5 mb-7 shadow-sm">
              <Image src="/assets/icons/folder.png" alt="" width={16} height={16} />
              <span className="text-[13px] text-gray-700 font-semibold tracking-wide">Your memories. Your way.</span>
            </div>

            {/* Heading */}
            <h1 className="text-[3.25rem] sm:text-[4.75rem] font-extrabold text-[#111827] leading-[1.05] tracking-tight">
              Your life...<br />
              inside <span className="text-[#3B82F6] font-mono font-bold tracking-tight lowercase text-[2.75rem] sm:text-[4.25rem] inline-block" style={{ imageRendering: "pixelated" }}>old</span><br />
              <span className="text-[#3B82F6] font-mono font-bold tracking-tight lowercase text-[3rem] sm:text-[4.5rem] drop-shadow-sm inline-block -mt-1" style={{ imageRendering: "pixelated" }}>
                devices
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-[1.1rem] sm:text-[1.15rem] text-gray-600 max-w-[380px] mt-5 leading-relaxed font-medium">
              Store your memories as folders and files, just like your old computer.
            </p>

            {/* Info points */}
            <div className="flex flex-col gap-3 mt-7 text-[15px] text-gray-700 font-medium">
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                No login. Just start.
              </span>
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Best on desktop for Windows XP experience
              </span>
            </div>

            {/* Hourglass - anchor directly to text block now */}
            <Image
              src="/assets/icons/hourglass.png"
              alt=""
              width={40}
              height={40}
              className="absolute -bottom-16 left-6 opacity-75 hidden lg:block drop-shadow-lg"
            />
          </div>

          {/* Right — hero image */}
          <div className="flex-1 flex justify-center lg:justify-end relative w-full mt-4 lg:mt-0">
            <div className="relative w-full max-w-[440px] sm:max-w-[580px]">
              <Image
                src="/assets/hero/monitor-device.png"
                alt="Life OS Monitor"
                width={620}
                height={520}
                className="drop-shadow-[0_25px_35px_rgba(0,0,0,0.2)] w-full h-auto object-contain relative z-10 scale-[1.08] origin-bottom"
                priority
              />
              
              {/* Decorative floating icons bound to image container - refined positions */}
              <Image
                src="/assets/icons/folder.png"
                alt=""
                width={60}
                height={60}
                className="absolute -top-4 right-2 sm:right-6 opacity-90 drop-shadow-xl animate-bounce-slow z-20"
                style={{ animationDuration: '4s' }}
              />
              <Image
                src="/assets/icons/heart.png"
                alt=""
                width={52}
                height={52}
                className="absolute top-[45%] -right-8 sm:-right-4 opacity-85 drop-shadow-xl z-20"
              />
              {/* Sparkle top-right */}
              <svg className="absolute top-8 -right-12 w-5 h-5 text-amber-300 hidden sm:block opacity-70 z-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CHOOSE YOUR DEVICE ===== */}
      <section className="relative z-10 w-full max-w-[960px] mx-auto px-4 sm:px-6 pt-14 pb-12">
        <div className="flex items-center justify-center gap-4 mb-8">
          <svg className="w-4 h-4 text-blue-800" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" /></svg>
          <h2 className="text-[1.4rem] sm:text-3xl font-extrabold text-[#111827] tracking-tight">Choose your device</h2>
          <svg className="w-4 h-4 text-blue-800" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" /></svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-lg md:max-w-none mx-auto">
          {/* XP Card */}
          <div
            onClick={() => !loading && handleSelect("xp")}
            className="group bg-gradient-to-b from-[#f2f8ff] to-[#e8f1fb] rounded-[32px] border border-blue-100/80 p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.15)] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[32px]" />
            <Image
              src="/assets/hero/xp-desktop.png"
              alt="Windows XP"
              width={260}
              height={180}
              className="w-full max-w-[240px] h-auto drop-shadow-[0_12px_16px_rgba(0,0,0,0.15)] mb-6 group-hover:scale-105 transition-transform duration-500"
            />
            <h3 className="text-[1.4rem] font-bold text-[#1e293b]">Windows XP</h3>
            <p className="text-[15px] font-medium text-[#2563eb] mb-5">Relive your desktop memories</p>
            <button
              disabled={loading}
              className="mt-auto bg-[#1d4ed8] text-white text-[15px] font-semibold px-8 py-3.5 rounded-xl group-hover:bg-[#1e40af] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(29,78,216,0.3)] w-full max-w-[200px]"
            >
              Enter XP 
              <svg className="w-4 h-4 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>

          {/* Nokia Card */}
          <div
            onClick={() => !loading && handleSelect("nokia")}
            className="group bg-gradient-to-b from-[#f4fbf3] to-[#e6f4ea] rounded-[32px] border border-green-200/60 p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(34,197,94,0.15)] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[32px]" />
            <Image
              src="/assets/hero/nokia-phone.png"
              alt="Nokia"
              width={260}
              height={180}
              className="w-full max-w-[240px] h-auto drop-shadow-[0_12px_16px_rgba(0,0,0,0.15)] mb-6 group-hover:scale-105 transition-transform duration-500"
            />
            <h3 className="text-[1.4rem] font-bold text-[#1e293b]">Nokia</h3>
            <p className="text-[15px] font-medium text-[#16a34a] mb-5">Your old keypad world</p>
            <button
              disabled={loading}
              className="mt-auto bg-[#16a34a] text-white text-[15px] font-semibold px-8 py-3.5 rounded-xl group-hover:bg-[#15803d] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(22,163,74,0.3)] w-full max-w-[200px]"
            >
              Enter Nokia 
              <svg className="w-4 h-4 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>

        {loading && <p className="text-[15px] font-medium text-gray-500 text-center mt-6 animate-pulse">Creating your OS...</p>}
        {error && <p className="text-[15px] font-medium text-red-500 text-center mt-6 bg-red-50 px-4 py-2 rounded-lg inline-block">{error}</p>}
      </section>

      {/* ===== TIP SECTION ===== */}
      <section className="relative z-10 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-4 mb-6">
        <div className="bg-[#fdf6e2]/90 backdrop-blur-md rounded-2xl border border-[#ebce9b] shadow-[0_4px_16px_rgba(0,0,0,0.04)] px-6 py-5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 shrink-0 rounded-full bg-[#fde58b] flex items-center justify-center shadow-inner border border-[#f5d96a]">
              <svg className="w-6 h-6 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
              <p className="text-[15px] sm:text-base text-[#1e293b] font-bold">
                Tip: Right-click to create your first memory
              </p>
              <p className="text-[14px] text-gray-700 font-medium mt-1">
                It&apos;s just like the old days <span className="text-amber-500">✨</span>
              </p>
            </div>
          </div>
          {/* Pixelated Cursor SVG */}
          <div className="hidden sm:block shrink-0">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="drop-shadow-md text-gray-800"><path d="M6 0v16l4-4 3 6 2-1-3-6 5-1L6 0z" fill="currentColor" stroke="white" strokeWidth="1" strokeLinejoin="miter"/></svg>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 w-full text-center py-8 pb-14">
        <Image
          src="/assets/icons/heart.png"
          alt=""
          width={24}
          height={24}
          className="mx-auto mb-3 opacity-60"
        />
        <p className="text-[15px] text-gray-700 font-bold">More devices coming soon...</p>
        <p className="text-[14px] text-gray-500 font-medium mt-1">Stay tuned.</p>
      </footer>
    </div>
  );
}