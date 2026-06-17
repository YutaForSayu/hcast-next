import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign In",
    template: "%s | HCast",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-56px)] flex items-center justify-center p-4 overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
