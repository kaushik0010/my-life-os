"use client";

interface Message {
  sender: string;
  content: string;
  time: string;
}

interface NokiaListProps {
  messages: Message[];
  onSelect: (message: Message) => void;
  onBack: () => void;
}

export function NokiaList({ messages, onSelect, onBack }: NokiaListProps) {
  return (
    <div className="w-full h-full bg-green-200 font-mono text-black text-sm flex flex-col">
      <div className="bg-green-400 text-center py-1 text-xs font-bold tracking-widest">
        INBOX
      </div>
      <button
        onClick={onBack}
        className="text-left px-4 py-2 text-xs hover:bg-green-300 focus:outline-none w-full transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
      >
        &lt; Back
      </button>
      <div className="flex flex-col">
        {messages.map((msg) => (
          <button
            key={msg.sender}
            onClick={() => onSelect(msg)}
            className="text-left px-4 py-2 hover:bg-green-300 focus:outline-none border-t border-green-300 w-full transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
          >
            &gt; {msg.sender}
          </button>
        ))}
      </div>
    </div>
  );
}
