import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/navigation/navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DropSpot",
  description: "Sınırlı stok ve bekleme listesi platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="tr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />

        {/* Sayfa içeriği */}
        <main className="container mx-auto p-4">{children}</main>

        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
