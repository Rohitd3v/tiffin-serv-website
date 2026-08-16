import type { Metadata } from "next";
import { Space_Grotesk, DM_Mono } from "next/font/google";
import { Sakura } from "@/components/Sakura";
import { Footer } from "@/components/Footer";
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
      <head>
        <meta name="facebook-domain-verification" content="e9d87g49chunoybrjmjooxz3ovic5k" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${dmMono.variable} antialiased font-display flex flex-col min-h-screen`}
      >
        <Sakura />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
