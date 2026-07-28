import React from "react";
import Link from "next/link";
import { ArrowLeft, Map, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Sitemap | Global Speaker Parts",
  description: "View the complete directory structure and catalog categories of Global Speaker Parts.",
};

const sitemapData = [
  {
    title: "Catalog Categories",
    items: [
      { name: "Voice Coils", href: "/voice-coils" },
      { name: "Speaker Cones", href: "/speaker-cones" },
      { name: "Speaker Surrounds", href: "/speaker-surrounds" },
      { name: "Speaker Spiders", href: "/speaker-spiders" },
      { name: "Dust Caps", href: "/dust-caps" },
      { name: "Diaphragms", href: "/diaphragms" },
      { name: "Terminals & Lead Wire", href: "/speaker-terminals" },
      { name: "Subwoofers", href: "/subwoofers" },
      { name: "Speaker Frames & baskets", href: "/speaker-frames" },
      { name: "Speaker Edges & Ports", href: "/speaker-edge-ports" },
    ]
  },
  {
    title: "Services & OEM Process",
    items: [
      { name: "OEM Manufacturing", href: "/process" },
      { name: "Private Labeling", href: "/process" },
      { name: "Custom Tooling Specifications", href: "/process" },
      { name: "Quality Control Standards", href: "/process" },
    ]
  },
  {
    title: "Corporate & Inquiry Info",
    items: [
      { name: "Corporate Profile", href: "/about" },
      { name: "Contact & Address Details", href: "/contact" },
      { name: "Products Overview", href: "/products" },
      { name: "Product Gallery", href: "/gallery" },
    ]
  },
  {
    title: "Legal & Logistics",
    items: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
      { name: "Terms of Supply", href: "/terms-of-supply" },
    ]
  }
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-black uppercase tracking-wider font-bold mb-8 transition-colors"
          id="back_to_home_btn_sitemap"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        {/* Header */}
        <div className="bg-black text-white rounded-xl p-8 sm:p-12 mb-8 shadow-sm border border-black relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
            <Map className="w-80 h-80" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
              Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight font-display">
              Sitemap
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-light max-w-xl">
              Navigate quickly to any category, company process document, support page, or corporate resource using our structured index.
            </p>
          </div>
        </div>

        {/* Content Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sitemapData.map((section) => (
            <div key={section.title} className="bg-white border-2 border-black rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-black uppercase text-black border-b border-black pb-2 mb-4 tracking-wider">
                  {section.title}
                </h2>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-black font-semibold transition-colors"
                      >
                        <ExternalLink size={12} className="opacity-45 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
