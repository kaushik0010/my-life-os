"use client";

import { useEffect, useState, useCallback } from "react";
import { DeviceFrame } from "@/features/device/DeviceFrame";
import { BootScreen } from "@/features/device/BootScreen";
import { ShutdownScreen } from "@/features/device/ShutdownScreen";
import { PowerOffScreen } from "@/features/device/PowerOffScreen";
import { Desktop } from "@/features/os/Desktop";
import { NokiaDevice } from "@/features/nokia/NokiaDevice";
import { useSound } from "@/hooks/useSound";
import { useAuth } from "@/components/AuthProvider";

type DeviceState = "booting" | "ready" | "shuttingDown" | "off" | "restarting" | "poweredOff";

interface DeviceExperienceProps {
  device?: string;
  osId: string;
  isTemporary?: boolean;
  osUserId?: string | null;
  folders?: Array<{ id: string; name: string; os_id: string }>;
  files?: Array<{ id: string; name: string; content: string; folder_id: string }>;
  messages?: Array<{ id: string; sender: string; content: string; time: string; os_id: string }>;
}

export function DeviceExperience({
  device = "xp",
  osId,
  isTemporary = true,
  osUserId = null,
  folders = [],
  files = [],
  messages = [],
}: DeviceExperienceProps) {
  const { user } = useAuth();

  // Owner if: no owner set (temp OS creator) OR logged-in user matches the owner
  const isOwner = !osUserId || (!!user && user.id === osUserId);

  // Nokia has its own device frame
  if (device === "nokia") {
    return <NokiaDevice osId={osId} isOwner={isOwner} isTemporary={isTemporary} messages={messages} />;
  }

  const [deviceState, setDeviceState] = useState<DeviceState>("booting");
  const playStartup = useSound("/sounds/windows-xp-startup.mp3");

  useEffect(() => {
    if (deviceState !== "booting") return;

    const soundTimer = setTimeout(() => playStartup(), 500);
    const readyTimer = setTimeout(() => setDeviceState("ready"), 2500);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(readyTimer);
    };
  }, [deviceState, playStartup]);

  const handleShutdown = useCallback(() => {
    setDeviceState("shuttingDown");
    setTimeout(() => {
      setDeviceState("off");
      setTimeout(() => setDeviceState("poweredOff"), 1500);
    }, 2000);
  }, []);

  const handleRestart = useCallback(() => {
    setDeviceState("restarting");
    setTimeout(() => setDeviceState("booting"), 1500);
  }, []);

  const handlePower = useCallback(() => {
    if (deviceState === "ready") {
      setDeviceState("shuttingDown");
      setTimeout(() => {
        setDeviceState("off");
        setTimeout(() => setDeviceState("poweredOff"), 1500);
      }, 2000);
    } else if (deviceState === "off" || deviceState === "poweredOff") {
      setDeviceState("booting");
    }
  }, [deviceState]);

  function renderScreen() {
    switch (deviceState) {
      case "booting":
        return <BootScreen />;
      case "ready":
        return (
          <Desktop
            onShutdown={handleShutdown}
            onRestart={handleRestart}
            osId={osId}
            isTemporary={isTemporary}
            isOwner={isOwner}
            dbFolders={folders}
            dbFiles={files}
          />
        );
      case "shuttingDown":
        return <ShutdownScreen message="Windows is shutting down..." />;
      case "restarting":
        return <ShutdownScreen message="Windows is restarting..." />;
      case "off":
        return <PowerOffScreen />;
      case "poweredOff":
        return null;
    }
  }

  return <DeviceFrame onPowerToggle={handlePower}>{renderScreen()}</DeviceFrame>;
}
