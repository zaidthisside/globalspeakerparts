import type { Metadata } from "next";
import { Manrope, Inter, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-body-slate">
        <Navbar />
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col pt-20 sm:pt-24 xl:pt-28">
          {children}
        </div>
        {modal}
        <Footer />
      </body>
    </html>
  );
}
