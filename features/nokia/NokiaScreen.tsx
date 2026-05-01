"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NokiaMenu } from "@/features/nokia/NokiaMenu";
import { NokiaList } from "@/features/nokia/NokiaList";
import { NokiaMessage } from "@/features/nokia/NokiaMessage";
import { SaveModal } from "@/components/SaveModal";
import { useSound } from "@/hooks/useSound";
import { authFetch } from "@/lib/api-client";

type Screen = "menu" | "list" | "message" | "compose";

interface Message {
  sender: string;
  content: string;
  time: string;
}

export function NokiaScreen({
  osId,
  isOwner = true,
  isTemporary = true,
  dbMessages = [],
}: {
  osId: string;
  isOwner?: boolean;
  isTemporary?: boolean;
  dbMessages?: Array<{ id: string; sender: string; content: string; time: string; os_id: string }>;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeSender, setComposeSender] = useState("");
  const [composeContent, setComposeContent] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const playClick = useSound("/sounds/nokia-beep.mp3");

  const activeMessages: Message[] = dbMessages.map((m) => ({
    sender: m.sender,
    content: m.content,
    time: m.time,
  }));

  // Listen for share event from AuthHandler
  useEffect(() => {
    function openShare() { setShowShareModal(true); }
    window.addEventListener("open-share", openShare);
    return () => window.removeEventListener("open-share", openShare);
  }, []);

  function navigate(to: Screen) {
    playClick();
    setTimeout(() => setScreen(to), 100);
  }

  function handleSelectMessage(msg: Message) {
    playClick();
    setTimeout(() => {
      setSelectedMessage(msg);
      setScreen("message");
    }, 100);
  }

  function startCompose() {
    playClick();
    setComposeSender("");
    setComposeContent("");
    setTimeout(() => setScreen("compose"), 100);
  }

  async function submitMessage() {
    if (!composeSender.trim() || !composeContent.trim()) return;
    playClick();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const res = await authFetch("/api/messages/create", {
        method: "POST",
        body: JSON.stringify({ os_id: osId, sender: composeSender.trim(), content: composeContent.trim(), time }),
      });
      if (res.ok) {
        setScreen("list");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to create message:", err);
    }
  }

  function handleShare() {
    if (isTemporary) {
      localStorage.setItem("pending_os_id", osId);
      localStorage.setItem("pending_device_type", "nokia");
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

  return (
    <div className="relative w-full h-full bg-green-200 overflow-hidden">
      {/* Screen content */}
      <div className="w-full h-full pb-6 overflow-auto">
        {screen === "menu" && (
          <NokiaMenu onOpenMessages={() => navigate("list")} />
        )}

        {screen === "list" && (
          <div className="w-full h-full bg-green-200 font-mono text-black text-sm flex flex-col">
            <div className="bg-green-400 text-center py-1 text-xs font-bold tracking-widest">INBOX</div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("menu")}
                className="text-left px-4 py-2 text-xs hover:bg-green-300 focus:outline-none transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
              >
                &lt; Back
              </button>
              {isOwner && (
                <button
                  onClick={startCompose}
                  className="text-right px-4 py-2 text-xs text-blue-700 hover:bg-green-300 focus:outline-none transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
                >
                  + New
                </button>
              )}
            </div>
            {activeMessages.length > 0 ? (
              <div className="flex flex-col">
                {activeMessages.map((msg) => (
                  <button
                    key={msg.sender + msg.time}
                    onClick={() => handleSelectMessage(msg)}
                    className="text-left px-4 py-2 hover:bg-green-300 focus:outline-none border-t border-green-300 w-full transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
                  >
                    &gt; {msg.sender}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <p className="text-green-800 text-xs">No messages saved yet...</p>
                {isOwner && <p className="text-gray-500 text-xs opacity-70">Press + New to save your first message</p>}
              </div>
            )}
          </div>
        )}

        {screen === "compose" && (
          <div className="w-full h-full bg-green-200 font-mono text-black text-sm flex flex-col">
            <div className="bg-green-400 text-center py-1 text-xs font-bold tracking-widest">NEW MESSAGE</div>
            <button
              onClick={() => navigate("list")}
              className="text-left px-4 py-2 text-xs hover:bg-green-300 focus:outline-none transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
            >
              &lt; Back
            </button>
            <div className="flex flex-col gap-2 px-4 py-2">
              <input
                autoFocus
                value={composeSender}
                onChange={(e) => setComposeSender(e.target.value)}
                placeholder="From"
                className="bg-green-100 border border-green-400 px-2 py-1 text-xs font-mono text-black outline-none"
              />
              <textarea
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                placeholder="Message"
                rows={3}
                className="bg-green-100 border border-green-400 px-2 py-1 text-xs font-mono text-black outline-none resize-none"
              />
              <button
                onClick={submitMessage}
                className="self-end bg-green-500 text-black text-xs px-3 py-1 border border-green-600 hover:bg-green-400 focus:outline-none transition-all duration-100 active:scale-95"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {screen === "message" && selectedMessage && (
          <NokiaMessage
            message={selectedMessage}
            onBack={() => navigate("list")}
          />
        )}
      </div>

      {/* Soft-key bar at bottom */}
      {isOwner && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 py-1 bg-green-300 border-t border-green-400 font-mono">
          {isTemporary ? (
            <button
              onClick={() => setShowSave(true)}
              className="text-xs text-black hover:text-green-800 active:scale-95 transition-all duration-100"
            >
              💾 Save
            </button>
          ) : (
            <span className="text-xs text-green-700">✓ Saved</span>
          )}
          <button
            onClick={handleShare}
            className="text-xs text-black hover:text-green-800 active:scale-95 transition-all duration-100"
          >
            🔗 Share
          </button>
        </div>
      )}

      {/* Save modal */}
      {showSave && <SaveModal osId={osId} deviceType="nokia" onClose={() => setShowSave(false)} />}

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
