"use client";

import { useState } from "react";
import { NokiaMenu } from "@/features/nokia/NokiaMenu";
import { NokiaList } from "@/features/nokia/NokiaList";
import { NokiaMessage } from "@/features/nokia/NokiaMessage";
import { useSound } from "@/hooks/useSound";

type Screen = "menu" | "list" | "message";

interface Message {
  sender: string;
  content: string;
  time: string;
}

const MESSAGES: Message[] = [
  { sender: "Mom", content: "Did you eat food?", time: "2:34 PM" },
  { sender: "Best Friend", content: "come outside bro", time: "5:10 PM" },
  { sender: "Unknown", content: "your recharge is successful", time: "9:00 AM" },
  { sender: "Self", content: "life was simpler then", time: "11:45 PM" },
];

export function NokiaScreen() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const playClick = useSound("/sounds/nokia-beep.mp3");

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

  return (
    <div className="w-full h-full bg-green-200 overflow-hidden">
      {screen === "menu" && (
        <NokiaMenu onOpenMessages={() => navigate("list")} />
      )}
      {screen === "list" && (
        <NokiaList
          messages={MESSAGES}
          onSelect={handleSelectMessage}
          onBack={() => navigate("menu")}
        />
      )}
      {screen === "message" && selectedMessage && (
        <NokiaMessage
          message={selectedMessage}
          onBack={() => navigate("list")}
        />
      )}
    </div>
  );
}
