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

    const pendingDeviceType = localStorage.getItem("pending_device_type") ?? "xp";

    async function linkOs() {
      try {
        const res = await authFetch("/api/os/link", {
          method: "POST",
          body: JSON.stringify({ os_id: pendingOsId }),
        });

        if (res.ok) {
          const pendingShare = localStorage.getItem("pending_share");
          if (pendingShare === "true") {
            localStorage.removeItem("pending_share");
            // Dispatch share event after redirect settles
            setTimeout(() => window.dispatchEvent(new Event("open-share")), 500);
          }

          localStorage.removeItem("pending_os_id");
          localStorage.removeItem("pending_device_type");

          // Redirect to the OS page
          router.push(`/os/${pendingOsId}?device=${pendingDeviceType}`);
        } else {
          const data = await res.json().catch(() => ({}));
          const errorMsg = data.error ?? "Failed to save your OS.";
          console.error("Failed to link OS:", errorMsg);

          window.dispatchEvent(new CustomEvent("auth-error", { detail: { message: errorMsg } }));

          localStorage.removeItem("pending_os_id");
          localStorage.removeItem("pending_device_type");
          localStorage.removeItem("pending_share");
        }
      } catch (err) {
        console.error("Failed to link OS:", err);
        window.dispatchEvent(new CustomEvent("auth-error", { detail: { message: "Failed to save your OS. Please try again." } }));
        localStorage.removeItem("pending_os_id");
        localStorage.removeItem("pending_device_type");
        localStorage.removeItem("pending_share");
      }
    }

    linkOs();
  }, [user, handled, router]);

  return null;
}
