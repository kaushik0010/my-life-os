"use client";

import { useRouter } from "next/navigation";

const DEVICES = [
  {
    id: "xp",
    icon: "🖥️",
    title: "Windows XP",
    description: "Relive your desktop memories",
    available: true,
  },
  {
    id: "nokia",
    icon: "📱",
    title: "Nokia",
    description: "Your old keypad world",
    available: true,
  },
];

export default function Home() {
  const router = useRouter();

  function handleSelect(deviceId: string) {
    const id = crypto.randomUUID();
    router.push(`/os/${id}?device=${deviceId}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      {/* Hero */}
      <h1 className="text-4xl font-bold text-gray-900 max-w-xl leading-tight">
        What if your memories lived inside old devices?
      </h1>
      <p className="text-base text-gray-500 max-w-md">
        Explore your memories like files, folders, and systems you grew up with.
      </p>
      <p className="text-sm text-gray-400">No login. Just memories.</p>

      {/* Device selection */}
      <div className="mt-6 flex flex-col items-center gap-4 w-full">
        <h2 className="text-xl font-semibold text-gray-700">Choose your device</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {DEVICES.map((device) => (
            <button
              key={device.id}
              onClick={() => device.available && handleSelect(device.id)}
              disabled={!device.available}
              className={`relative p-6 rounded-lg border flex flex-col items-center gap-2 transition-shadow
                ${device.available
                  ? "cursor-pointer hover:shadow-md bg-white"
                  : "cursor-not-allowed opacity-50 bg-gray-50"
                }`}
            >
              <span className="text-5xl">{device.icon}</span>
              <span className="text-base font-semibold text-gray-800">{device.title}</span>
              <span className="text-sm text-gray-500">{device.description}</span>
              {!device.available && (
                <span className="text-xs text-gray-400 border border-gray-300 rounded px-2 py-0.5 mt-1">
                  Coming soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-8 text-xs text-gray-400">More devices coming soon…</p>
    </main>
  );
}
