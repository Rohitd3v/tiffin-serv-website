import type { Metadata } from "next";
import { Space_Grotesk, DM_Mono } from "next/font/google";
import { Sakura } from "@/components/Sakura";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Mom's Kitchen | Authentic Home-Style Comfort Delivered",
  description: "Mom's Kitchen brings you the warmth and flavor of a mother's cooking, delivered straight to your door. Fresh, nutritious, and made with love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${spaceGrotesk.variable} ${dmMono.variable} antialiased font-display`}
      >
        <Sakura />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
