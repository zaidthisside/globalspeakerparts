"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Shield, CheckCircle, ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";

// ─── Official brand SVG icons ─────────────────────────────────────────────────

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Social links type ─────────────────────────────────────────────────────────
interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsapp: string;
  linkedin: string;
}

const DEFAULT_SOCIALS: SocialLinks = {
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  whatsapp: "https://wa.me/919829062390",
  linkedin: "https://linkedin.com",
};

export default function Footer() {
  const [socials, setSocials] = useState<SocialLinks>(DEFAULT_SOCIALS);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((data) => setSocials({ ...DEFAULT_SOCIALS, ...data }))
      .catch(() => {});
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.trim()) return;

    setNewsletterStatus("submitting");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        setNewsletterStatus("success");
        setNewsletterEmail("");
        setTimeout(() => setNewsletterStatus("idle"), 3000);
      } else {
        setNewsletterStatus("error");
        setTimeout(() => setNewsletterStatus("idle"), 4000);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Newsletter subscription error:", err);
      setNewsletterStatus("error");
      setTimeout(() => setNewsletterStatus("idle"), 4000);
    }
  };

  const productLinks = [
    { name: "Speaker Cones", href: "/products?cat=cones" },
    { name: "Voice Coils", href: "/products?cat=coils" },
    { name: "Spiders (Dampers)", href: "/products?cat=spiders" },
    { name: "Speaker Edge & Ports", href: "/products?cat=speaker-edge-ports" },
    { name: "Speaker Frames & Yokes", href: "/products?cat=frames" },
    { name: "Tweeter & Complete Parts", href: "/products?cat=tweeters" },
  ];

  const corporateLinks = [
    { name: "Corporate Profile", href: "/about" },
    { name: "Manufacturing Process", href: "/process" },
    { name: "Export & Logistics", href: "/export" },
    { name: "Product Gallery", href: "/products" },
    { name: "B2B Inquiry Desk", href: "/contact" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  const socialIcons = [
    {
      key: "instagram",
      label: "Instagram",
      href: socials.instagram,
      Icon: IconInstagram,
      hoverColor: "hover:text-[#E1306C] hover:border-[#E1306C]",
    },
    {
      key: "facebook",
      label: "Facebook",
      href: socials.facebook,
      Icon: IconFacebook,
      hoverColor: "hover:text-[#1877F2] hover:border-[#1877F2]",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: socials.whatsapp,
      Icon: IconWhatsApp,
      hoverColor: "hover:text-[#25D366] hover:border-[#25D366]",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: socials.linkedin,
      Icon: IconLinkedIn,
      hoverColor: "hover:text-[#0A66C2] hover:border-[#0A66C2]",
    },
  ];

  return (
    <footer className="bg-[#000000] text-[#A3A3A8] font-sans pt-5 pb-5 border-t border-[#2E2E33] relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-end">
          
          {/* Company details */}
          <div className="flex flex-col gap-4.5">
            <Link href="/" className="flex items-center group">
              <Logo className="h-32 sm:h-36 lg:h-40 w-auto mb-1" variant="stacked" light />
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 font-light font-sans">
              Leading OEM/ODM manufacturer, wholesale supplier, and exporter of high-precision speaker components globally. Serving automotive, pro-audio, and consumer electronics brands.
            </p>
            
            {/* Social Media Icons */}
            <div className="mt-1 flex flex-col gap-2">
              <span className="text-[9px] font-bold tracking-widest text-[#A3A3A8] uppercase font-sans">Follow Us:</span>
              <div className="flex items-center gap-2.5">
                {socialIcons.map(({ key, label, href, Icon, hoverColor }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border border-[#2E2E33] text-[#A3A3A8] bg-[#1E1E20] transition-all duration-200 ${hoverColor} hover:scale-110 hover:shadow-lg`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-2">
              <span className="text-[9px] font-bold tracking-widest text-[#A3A3A8] uppercase font-sans">Certifications:</span>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1 text-[10px] bg-[#1E1E20] border border-[#2E2E33] text-white px-2 py-0.5 rounded-premium">
                  <Shield className="w-3 h-3 text-[#A3A3A8]" /> ISO 9001:2015
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-[#1E1E20] border border-[#2E2E33] text-white px-2 py-0.5 rounded-premium">
                  <CheckCircle className="w-3 h-3 text-[#A3A3A8]" /> RoHS Compliant
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-[#1E1E20] border border-[#2E2E33] text-white px-2 py-0.5 rounded-premium">
                  <CheckCircle className="w-3 h-3 text-[#A3A3A8]" /> REACH
                </span>
              </div>
            </div>
          </div>

          {/* Product list */}
          <div>
            <h4 className="font-display text-xs font-bold tracking-wider text-white mb-5 uppercase pb-1.5 border-b border-[#2E2E33]">
              SPEAKER COMPONENTS
            </h4>
            <ul className="flex flex-col gap-3.5 text-xs">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent-cyan transition-colors flex items-center group text-[#A3A3A8]">
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-150" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Corporate list */}
          <div>
            <h4 className="font-display text-xs font-bold tracking-wider text-white mb-5 uppercase pb-1.5 border-b border-[#2E2E33]">
              CORPORATE
            </h4>
            <ul className="flex flex-col gap-3.5 text-xs">
              {corporateLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-accent-cyan transition-colors flex items-center group text-[#A3A3A8]">
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-150" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-5 text-xs text-[#A3A3A8]">
            <div>
              <h4 className="font-display text-xs font-bold tracking-wider text-white mb-5 uppercase pb-1.5 border-b border-[#2E2E33]">
                B2B INQUIRY DESK
              </h4>
              <ul className="flex flex-col gap-3 font-sans">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4.5 h-4.5 text-[#A3A3A8] shrink-0 mt-0.5" />
                  <span className="font-light text-slate-400">
                    Plot 142-A, Industrial Estate Phase-II, Sector 4, export zone, India
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4.5 h-4.5 text-[#A3A3A8] shrink-0" />
                  <a href="tel:+919829062390" className="hover:text-accent-cyan transition-colors font-light text-slate-400">
                    +91 98290 62390 (Global Sales)
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4.5 h-4.5 text-[#A3A3A8] shrink-0" />
                  <a href="mailto:globalspeakerparts@gmail.com" className="hover:text-accent-cyan transition-colors font-light text-slate-400">
                    globalspeakerparts@gmail.com
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Newsletter */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wide font-sans">OEM CATALOG UPDATES</span>
              <form 
                onSubmit={handleNewsletterSubmit}
                className="flex rounded-lg overflow-hidden border border-[#2E2E33] bg-[#1E1E20]"
              >
                <input
                  type="email"
                  placeholder={
                    newsletterStatus === "success" 
                      ? "✓ Subscribed successfully!" 
                      : newsletterStatus === "error"
                      ? "Error subscribing. Try again."
                      : "Enter business email"
                  }
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={newsletterStatus === "submitting" || newsletterStatus === "success"}
                  className="bg-transparent text-xs text-white px-3.5 py-2 outline-none w-full placeholder:text-slate-500 font-sans disabled:opacity-75"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "submitting" || newsletterStatus === "success"}
                  className="bg-white hover:bg-[#E8E8EA] text-[#000000] font-bold px-4 py-2 text-xs transition-colors shrink-0 uppercase tracking-wider font-sans cursor-pointer disabled:bg-slate-400 disabled:text-slate-200 disabled:cursor-not-allowed"
                >
                  {newsletterStatus === "submitting" 
                    ? "WAIT..." 
                    : newsletterStatus === "success"
                    ? "DONE" 
                    : "SUBSCRIBE"}
                </button>
              </form>
            </div>
          </div>
          
        </div>

        {/* Copyright bar */}
        <div className="mt-5 pt-5 border-t border-[#2E2E33] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-550 gap-4">
          <p className="font-sans">
            &copy; {new Date().getFullYear()} GLOBAL SPEAKER PARTS. All rights reserved.
          </p>
          <div className="flex gap-5 font-sans">
            <Link href="/privacy" className="hover:text-accent-cyan transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-supply" className="hover:text-accent-cyan transition-colors">Terms of Supply</Link>
            <Link href="/sitemap" className="hover:text-accent-cyan transition-colors">Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
