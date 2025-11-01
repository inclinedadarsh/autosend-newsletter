import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "AutoSend Newsletter Example",
  description: "A simple example of how to use AutoSend to send a newsletter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans w-full max-w-2xl mx-auto px-5 md:px-0">
        {children}
        <Toaster richColors theme="light" position="top-center" />
      </body>
    </html>
  );
}
