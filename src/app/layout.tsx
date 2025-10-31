import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
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
      <body className="antialiased font-sans">
        {children}
        <Toaster richColors theme="light" position="top-center" />
      </body>
    </html>
  );
}
