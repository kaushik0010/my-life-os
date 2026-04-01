"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    const id = crypto.randomUUID();
    router.push(`/os/${id}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button onClick={handleClick}>Create My Life OS</Button>
    </main>
  );
}
