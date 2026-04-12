"use client";

import { useEffect, useState, useCallback } from "react";
import { DeviceFrame } from "@/features/device/DeviceFrame";
import { BootScreen } from "@/features/device/BootScreen";
import { ShutdownScreen } from "@/features/device/ShutdownScreen";
import { PowerOffScreen } from "@/features/device/PowerOffScreen";
import { Desktop } from "@/features/os/Desktop";
import { NokiaDevice } from "@/features/nokia/NokiaDevice";
import { useSound } from "@/hooks/useSound";

type DeviceState = "booting" | "ready" | "shuttingDown" | "off" | "restarting" | "poweredOff";

export function DeviceExperience({ device = "xp" }: { device?: string }) {
  // Nokia has its own device frame — renders outside the XP monitor
  if (device === "nokia") {
    return <NokiaDevice />;
  }
  const [deviceState, setDeviceState] = useState<DeviceState>("booting");
  const playStartup = useSound("/sounds/windows-xp-startup.mp3");

  // Boot sequence — runs whenever state enters "booting"
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
    // ignore clicks during transitions
  }, [deviceState]);

  function renderScreen() {
    switch (deviceState) {
      case "booting":
        return <BootScreen />;
      case "ready":
        return <Desktop onShutdown={handleShutdown} onRestart={handleRestart} />;
      case "shuttingDown":
        return <ShutdownScreen message="Windows is shutting down..." />;
      case "restarting":
        return <ShutdownScreen message="Windows is restarting..." />;
      case "off":
        return <PowerOffScreen />;
      case "poweredOff":
        return null; // black screen — DeviceFrame screen bg-black handles it
    }
  }

  return <DeviceFrame onPowerToggle={handlePower}>{renderScreen()}</DeviceFrame>;
}
