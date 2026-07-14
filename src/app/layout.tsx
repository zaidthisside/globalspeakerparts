import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CurrencyProvider } from "@/context/CurrencyContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "GLOBAL SPEAKER PARTS | Premium OEM Speaker Components Manufacturer & Exporter",
  description: "Certified wholesale manufacturer, supplier, and exporter of precision speaker cones, voice coils, Nomex spiders, speaker surrounds, frames, magnets, and tweeter parts worldwide.",
  keywords: "speaker parts manufacturer, wholesale speaker components, OEM speaker parts, voice coils supplier, speaker cones exporter, Nomex spiders, speaker frames, industrial speaker components",
  openGraph: {
    title: "GLOBAL SPEAKER PARTS | Premium OEM Speaker Components",
    description: "Premium wholesale supplier and exporter of precision-engineered speaker parts. Serving global audio manufacturers and automotive brands.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white font-sans text-body-slate">
        <CurrencyProvider>
          <Navbar />
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col pt-20 sm:pt-24 xl:pt-28">
            {children}
          </div>
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
