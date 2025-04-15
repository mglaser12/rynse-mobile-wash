
import React from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto w-[90%] max-w-md bg-amber-50 text-amber-900 border border-amber-200 rounded-lg p-3 shadow-lg z-50 flex items-center gap-2">
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm">You are currently offline. Some features may be limited.</span>
    </div>
  );
}
