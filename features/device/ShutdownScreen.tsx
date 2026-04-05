"use client";

interface ShutdownScreenProps {
  message?: string;
}

export function ShutdownScreen({ message = "Windows is shutting down..." }: ShutdownScreenProps) {
  return (
    <div className="w-full h-full bg-blue-900 flex items-center justify-center">
      <p className="text-white text-lg font-mono">{message}</p>
    </div>
  );
}
