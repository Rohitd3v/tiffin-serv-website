import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#0C4A48",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://momskitchen.co.in"),
  title: {
    default: "Mom's Kitchen | Best Homestyle Tiffin & Meal Subscription in Delhi NCR & Gurugram",
    template: "%s | Mom's Kitchen",
  },
  description:
    "Fresh, healthy homestyle tiffin service & meal subscriptions in Delhi NCR & Gurugram. Authentic ghar ka khana, dal tadka, butter rotis & seasonal sabzi delivered hot daily via WhatsApp.",
  keywords: [
    "tiffin service delhi",
    "tiffin service gurugram",
    "ghar ka khana delhi ncr",
    "meal subscription delhi",
    "homestyle meal delivery south delhi",
    "office lunch delivery gurugram",
    "healthy tiffin delivery central delhi",
    "daily tiffin subscription delhi",
    "veg tiffin service delhi ncr",
    "moms kitchen tiffin service",
    "best tiffin service in delhi",
    "home food delivery udyog vihar",
  ],
  authors: [{ name: "Mom's Kitchen Operations", url: "https://momskitchen.co.in" }],
  creator: "Mom's Kitchen",
  publisher: "Mom's Kitchen",
  applicationName: "Mom's Kitchen",
  category: "Food & Drink",
  classification: "Tiffin Service & Meal Subscription",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://momskitchen.co.in",
    siteName: "Mom's Kitchen",
    title: "Mom's Kitchen | Authentic Homestyle Tiffin Service in Delhi NCR & Gurugram",
    description:
      "Fresh, healthy homestyle meals, dal tadka, hot butter rotis, and seasonal sabzi delivered daily across Delhi NCR and Gurugram via WhatsApp.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1280,
        height: 737,
        alt: "Mom's Kitchen - Authentic Homestyle Tiffin & Meal Subscription",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mom's Kitchen | Homestyle Tiffin Service in Delhi NCR & Gurugram",
    description:
      "Freshly prepared ghar ka khana delivered hot to your office or home across Delhi NCR & Gurugram. Easy ordering on WhatsApp.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "q9NWWLYXWHkvBEdckRPwkia5atMhghbE8p2Wlbn_0-0",
    other: {
      "facebook-domain-verification": "e9d87g49chunoybrjmjooxz3ovic5k",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/favicon.ico" }],
  },
  manifest: "/manifest.webmanifest",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://momskitchen.co.in/#organization",
      name: "Mom's Kitchen",
      alternateName: "Mom's Kitchen Tiffin Service",
      url: "https://momskitchen.co.in",
      logo: "https://momskitchen.co.in/og-image.jpg",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91-70335-58836",
          contactType: "customer service",
          areaServed: ["IN", "Delhi NCR", "Gurugram"],
          availableLanguage: ["English", "Hindi"],
        },
      ],
      sameAs: [
        "https://wa.me/917033558836",
        "https://maps.google.com/?q=Mom's+Kitchen+Udyog+Vihar+Sector+18+Gurugram",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://momskitchen.co.in/#website",
      url: "https://momskitchen.co.in",
      name: "Mom's Kitchen",
      description: "Authentic Homestyle Tiffin & Meal Subscription in Delhi NCR & Gurugram",
      publisher: {
        "@id": "https://momskitchen.co.in/#organization",
      },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
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
