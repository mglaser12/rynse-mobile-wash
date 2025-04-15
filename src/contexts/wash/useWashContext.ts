
import { useContext } from "react";
import { WashContext } from "./WashProvider";
import { WashContextType } from "./types";

// Main hook to access the wash context
export function useWashContext(): WashContextType {
  const context = useContext(WashContext);
  if (context === undefined) {
    throw new Error("useWashContext must be used within a WashProvider");
  }
  return context;
}

// Aliases for backward compatibility
export function useWashRequests() {
  return useWashContext();
}

export function useWash() {
  return useWashContext();
}
