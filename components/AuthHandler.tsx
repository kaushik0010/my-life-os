"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { authFetch } from "@/lib/api-client";

export function AuthHandler() {
  const router = useRouter();
  const { user } = useAuth();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (!user || handled) return;

    const pendingOsId = localStorage.getItem("pending_os_id");
    if (!pendingOsId) return;

    setHandled(true);

    async function linkOs() {
      try {
        await authFetch("/api/os/link", {
          method: "POST",
          body: JSON.stringify({ os_id: pendingOsId }),
        });

        const pendingShare = localStorage.getItem("pending_share");
        if (pendingShare === "true") {
          localStorage.removeItem("pending_share");
          window.dispatchEvent(new Event("open-share"));
        }

        localStorage.removeItem("pending_os_id");
        router.refresh();
      } catch (err) {
        console.error("Failed to link OS:", err);
      }
    }

    linkOs();
  }, [user, handled, router]);

  return null;
}
