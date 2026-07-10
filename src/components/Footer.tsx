"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Shield, CheckCircle, ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  const productLinks = [
    { name: "Speaker Cones", href: "/products?cat=cones" },
    { name: "Voice Coils", href: "/products?cat=coils" },
    { name: "Spiders (Dampers)", href: "/products?cat=spiders" },
    { name: "Magnets & Spares", href: "/products?cat=magnets" },
    { name: "Speaker Frames & Yokes", href: "/products?cat=frames" },
    { name: "Tweeter & Complete Parts", href: "/products?cat=tweeters" },
  ];

  const corporateLinks = [
    { name: "Corporate Profile", href: "/about" },
    { name: "Manufacturing Process", href: "/process" },
    { name: "Export & Logistics", href: "/export" },
    { name: "Product Gallery", href: "/gallery" },
    { name: "B2B Inquiry Desk", href: "/contact" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="bg-primary-midnight text-slate-400 font-sans pt-16 pb-8 border-t border-secondary-graphite/50 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Company details */}
          <div className="flex flex-col gap-4.5">
            <Link href="/" className="flex items-center group">
              <Logo className="h-28 mb-1" variant="stacked" light />
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 font-light">
              Leading OEM/ODM manufacturer, wholesale supplier, and exporter of high-precision speaker components globally. Serving automotive, pro-audio, and consumer electronics brands.
            </p>
            
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Certifications:</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1 text-[10px] bg-secondary-graphite/40 border border-secondary-graphite/80 text-white px-2 py-0.5 rounded-premium">
                  <Shield className="w-3 h-3 text-accent-cyan" /> ISO 9001:2015
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-secondary-graphite/40 border border-secondary-graphite/80 text-white px-2 py-0.5 rounded-premium">
                  <CheckCircle className="w-3 h-3 text-accent-cyan" /> RoHS Compliant
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-secondary-graphite/40 border border-secondary-graphite/80 text-white px-2 py-0.5 rounded-premium">
                  <CheckCircle className="w-3 h-3 text-accent-cyan" /> REACH
                </span>
              </div>
            </div>
          </div>

          {/* Product list */}
          <div>
            <h4 className="font-display text-xs font-bold tracking-wider text-white mb-5 uppercase pb-1.5 border-b border-secondary-graphite/40">
              SPEAKER COMPONENTS
            </h4>
            <ul className="flex flex-col gap-3.5 text-xs">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent-cyan transition-colors flex items-center group text-slate-400">
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-150" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Corporate list */}
          <div>
            <h4 className="font-display text-xs font-bold tracking-wider text-white mb-5 uppercase pb-1.5 border-b border-secondary-graphite/40">
              CORPORATE
            </h4>
            <ul className="flex flex-col gap-3.5 text-xs">
              {corporateLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent-cyan transition-colors flex items-center group text-slate-400">
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-150" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-5 text-xs text-slate-400">
            <div>
              <h4 className="font-display text-xs font-bold tracking-wider text-white mb-5 uppercase pb-1.5 border-b border-secondary-graphite/40">
                B2B INQUIRY DESK
              </h4>
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4.5 h-4.5 text-accent-cyan shrink-0 mt-0.5" />
                  <span className="font-light">
                    Plot 142-A, Industrial Estate Phase-II, Sector 4, export zone, India
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4.5 h-4.5 text-accent-cyan shrink-0" />
                  <a href="tel:+919876543210" className="hover:text-accent-cyan transition-colors font-light">
                    +91 98765 43210 (Global Sales)
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4.5 h-4.5 text-accent-cyan shrink-0" />
                  <a href="mailto:export@globalspeakerparts.com" className="hover:text-accent-cyan transition-colors font-light">
                    export@globalspeakerparts.com
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-350 block mb-2 uppercase tracking-wide">OEM CATALOG UPDATES</span>
              <form 
                onSubmit={(e) => e.preventDefault()}
                className="flex rounded-full overflow-hidden border border-secondary-graphite/60 bg-secondary-graphite/20"
              >
                <input
                  type="email"
                  placeholder="Enter business email"
                  required
                  className="bg-transparent text-xs text-white px-3.5 py-2 outline-none w-full placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="bg-accent-cyan hover:bg-accent-cyan-hover text-primary-midnight font-bold px-4 py-2 text-xs transition-colors shrink-0 uppercase tracking-wider"
                >
                  SUBSCRIBE
                </button>
              </form>
            </div>
          </div>
          
        </div>

        {/* Copyright bar */}
        <div className="mt-14 pt-7 border-t border-secondary-graphite/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} GLOBAL SPEAKER PARTS. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Supply</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
