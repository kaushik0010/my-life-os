"use client";

import { useEffect, useRef } from "react";

interface InlineInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  placeholder?: string;
}

export function InlineInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder,
}: InlineInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
        if (e.key === "Escape") onCancel();
      }}
      onBlur={() => {
        setTimeout(onCancel, 100);
      }}
      placeholder={placeholder}
      className="px-1 py-[2px] text-xs bg-white border border-blue-500 outline-none w-full"
    />
  );
}
