"use client";
import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1e1e2a",
          color: "#f0f0f5",
          border: "1px solid #2a2a3a",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#4ade80", secondary: "#0a0a0f" } },
        error: { iconTheme: { primary: "#e63946", secondary: "#0a0a0f" } },
      }}
    />
  );
}
