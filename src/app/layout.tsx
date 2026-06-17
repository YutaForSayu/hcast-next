import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { getAuthUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "HCast – Read Manga, Manhwa & Manhua",
    template: "%s | HCast",
  },
  description:
    "HCast — Discover and read the latest manga, manhwa, and manhua for free. Updated daily.",
  keywords: ["manga", "manhwa", "manhua", "read online", "HCast", "webtoon"],
  themeColor: "#e63946",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider initialUser={user}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
