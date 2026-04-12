"use client";

interface NokiaMenuProps {
  onOpenMessages: () => void;
}

export function NokiaMenu({ onOpenMessages }: NokiaMenuProps) {
  return (
    <div className="w-full h-full bg-green-200 font-mono text-black text-sm flex flex-col">
      <div className="bg-green-400 text-center py-1 text-xs font-bold tracking-widest">
        MENU
      </div>
      <div className="flex flex-col mt-2">
        <button
          onClick={onOpenMessages}
          className="text-left px-4 py-2 hover:bg-green-300 focus:outline-none w-full transition-all duration-100 active:scale-95 active:brightness-90 active:bg-green-300"
        >
          &gt; Messages
        </button>
        <span className="px-4 py-2 text-gray-500 cursor-not-allowed">
          &nbsp;&nbsp;Memories
        </span>
        <span className="px-4 py-2 text-gray-500 cursor-not-allowed">
          &nbsp;&nbsp;Contacts
        </span>
      </div>
    </div>
  );
}
