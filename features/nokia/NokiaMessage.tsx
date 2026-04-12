"use client";

interface Message {
  sender: string;
  content: string;
  time: string;
}

interface NokiaMessageProps {
  message: Message;
  onBack: () => void;
}

export function NokiaMessage({ message, onBack }: NokiaMessageProps) {
  return (
    <div className="w-full h-full bg-green-200 font-mono text-black text-sm flex flex-col">
      <div className="bg-green-400 text-center py-1 text-xs font-bold tracking-widest">
        MESSAGE
      </div>
      <button
        onClick={onBack}
        className="text-left px-4 py-2 text-xs hover:bg-green-300 focus:outline-none w-full transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
      >
        &lt; Back
      </button>
      <div className="px-4 py-3 flex flex-col gap-2 border-t border-green-300">
        <p className="font-bold">{message.sender}:</p>
        <p className="leading-relaxed">{message.content}</p>
        <p className="text-xs text-gray-600 mt-2">- {message.time}</p>
      </div>
    </div>
  );
}
