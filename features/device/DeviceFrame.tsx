"use client";

interface DeviceFrameProps {
  children: React.ReactNode;
  onPowerToggle: () => void;
}

export function DeviceFrame({ children, onPowerToggle }: DeviceFrameProps) {
  return (
    <div className="min-h-screen bg-neutral-400 flex items-center justify-center">
      {/* Monitor outer frame */}
      <div className="relative bg-gray-200 p-6 rounded-lg shadow-2xl flex flex-col items-center gap-3">
        {/* Screen area */}
        <div
          className="bg-black overflow-hidden rounded-sm"
          style={{ width: "800px", height: "600px" }}
        >
          {children}
        </div>
        {/* Monitor stand base */}
        <div className="w-24 h-3 bg-gray-400 rounded" />
        <div className="w-40 h-2 bg-gray-500 rounded" />
        {/* Power button */}
        <button
          onClick={onPowerToggle}
          title="Power"
          className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-gray-600 border border-gray-700 shadow-inner flex items-center justify-center hover:bg-gray-500 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <span className="w-2 h-2 rounded-full bg-green-400" />
        </button>
      </div>
    </div>
  );
}
