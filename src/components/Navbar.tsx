"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";

// Main Menu hierarchy strictly matching user's uploaded branding menu structure
const navigationItems = [
  {
    name: "Products",
    href: "/products",
    subItems: [
      { name: "Voice Coils", href: "/products?cat=coils" },
      { name: "Speaker Cones", href: "/products?cat=cones" },
      { name: "Speaker Surrounds", href: "/products?cat=surrounds" },
      { name: "Speaker Spiders", href: "/products?cat=spiders" },
      { name: "Dust Caps", href: "/products?cat=dustcaps" },
      { name: "Diaphragms", href: "/products?cat=tweeterparts" },
      { name: "Lead Wires", href: "/products" },
      { name: "Speaker Terminals", href: "/products?cat=terminals" },
      { name: "Subwoofers", href: "/products" },
    ]
  },
  {
    name: "OEM Manufacturing",
    href: "/process",
    subItems: [
      { name: "Private Label", href: "/process" },
      { name: "Custom Specifications", href: "/process" },
      { name: "Bulk Orders", href: "/process" },
      { name: "Quality Control", href: "/process" },
    ]
  },
  {
    name: "Industries",
    href: "/about",
    subItems: [
      { name: "Car Audio", href: "/about" },
      { name: "Home Audio", href: "/about" },
      { name: "DJ Speakers", href: "/about" },
      { name: "PA Systems", href: "/about" },
      { name: "subwoofers", href: "/about" },
    ]
  },
  {
    name: "About Us",
    href: "/about",
    subItems: [
      { name: "Company Profile", href: "/about" },
      { name: "Our Factory", href: "/about" },
      { name: "Our Team", href: "/about" },
      { name: "Infrastructures", href: "/about" },
      { name: "Certificates", href: "/about" },
      { name: "Why Choose Us", href: "/about" },
    ]
  },
  {
    name: "Export",
    href: "/export",
    subItems: [
      { name: "Countries We Export to", href: "/export" },
      { name: "Export Process", href: "/export" },
      { name: "Packaging", href: "/export" },
      { name: "Shipping", href: "/export" },
      { name: "Payment Terms", href: "/export" },
      { name: "Frequently Asked Questions", href: "/export" },
    ]
  },
  {
    name: "Quality",
    href: "/about",
    subItems: [
      { name: "Klippel QA Sweeps", href: "/about" },
      { name: "Anechoic Chamber Audits", href: "/about" },
      { name: "THD Threshold Audits", href: "/about" },
      { name: "ISO 9001:2015 Standards", href: "/about" },
    ]
  },
  {
    name: "Resources",
    href: "/products",
    subItems: [
      { name: "Component Catalog PDF", href: "/products" },
      { name: "CAD Model Library", href: "/products" },
      { name: "Material Data Sheets", href: "/about" },
      { name: "B2B Procurement FAQs", href: "/" },
    ]
  },
  {
    name: "Contact Us",
    href: "/contact",
    subItems: [
      { name: "RFQ Specification Intake", href: "/contact" },
      { name: "Jaipur HQ Location", href: "/contact" },
      { name: "Logistics Shipping Desk", href: "/contact" },
      { name: "Direct Sales Phone Line", href: "/contact" },
    ]
  }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  
  const pathname = usePathname();

  useEffect(() => {
    const updateCount = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("gsp_enquiry_cart");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCartCount(parsed.length);
          } catch {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      }
    };
    
    updateCount();
    window.addEventListener("gsp_cart_updated", updateCount);
    window.addEventListener("storage", updateCount);
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("gsp_cart_updated", updateCount);
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out bg-[#000000] border-b border-[#2E2E33] ${
        scrolled ? "py-2 shadow-md" : "py-4"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between">
          
          {/* Left Block: Brand Logo (Top left) */}
          <Link href="/" className="flex items-center group shrink-0 z-10">
            <Logo 
              light={true}
              className={`transition-all duration-500 ease-in-out ${
                scrolled ? "h-8.5 sm:h-9.5 xl:h-10" : "h-12 sm:h-14 xl:h-15"
              } hover:opacity-90 transition-opacity`} 
            />
          </Link>

          {/* Center Block: Desktop Navigation Menu (Left-aligned, larger text, spans to the right) */}
          <nav className="hidden lg:flex items-center justify-start flex-1 ml-6 xl:ml-10 space-x-3 xl:space-x-5 2xl:space-x-7 font-sans text-[11px] xl:text-[12px] 2xl:text-[13px] font-semibold uppercase tracking-wider">
            {navigationItems.map((item) => {
              const isHovered = hoveredMenu === item.name;
              const isActive = pathname.startsWith(item.href);

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredMenu(item.name)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  className="relative py-2.5"
                >
                  <Link 
                    href={item.href}
                    className={`px-1 py-1 rounded transition-colors duration-150 hover:text-accent-cyan ${
                      isActive ? "text-white font-bold" : "text-[#E8E8EA]"
                    }`}
                  >
                    {item.name}
                  </Link>

                  {/* Glassmorphic Sub-Menu Dropdown (Opens on hover) */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-60 bg-[#1E1E20] border border-[#2E2E33] rounded-lg shadow-2xl overflow-hidden py-2 text-left z-50 text-[11px] font-sans normal-case tracking-normal"
                      >
                        <div className="px-3.5 py-1 text-[9px] font-bold text-[#A3A3A8] uppercase tracking-widest border-b border-[#2E2E33] mb-1">
                          {item.name} Options
                        </div>
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-4 py-2.5 text-[#E8E8EA] hover:bg-[#2E2E33] hover:text-accent-cyan font-medium transition-colors border-b border-[#2E2E33]/30 last:border-0"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right Block: Actions & Mobile Hamburger */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 z-10">
            {/* Search Icon */}
            <Link 
              href="/products"
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Search Products"
            >
              <Search className="w-5 h-5 text-[#E8E8EA] hover:text-[#FFFFFF] transition-colors" />
            </Link>

            {/* Cart Icon */}
            <Link 
              href="/products?cart=true"
              className="relative p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#E8E8EA] hover:text-[#FFFFFF] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-cyan text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-accent-cyan font-mono shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Quote button (desktop/tablet) */}
            <Link href="/contact?rfq=true" className="hidden sm:block">
              <button className="bg-white text-[#0F0F10] border border-white px-4 py-2.5 rounded-lg font-semibold text-xs tracking-wider hover:bg-[#E8E8EA] transition-all uppercase cursor-pointer">
                Request Quote
              </button>
            </Link>

            {/* Hamburger menu button (mobile/tablet - Triggered below lg screen width) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white hover:text-[#A3A3A8] transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar Drawer (With Accordion Submenus) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-primary-midnight/20 z-40 lg:hidden backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-md z-50 lg:hidden flex flex-col shadow-2xl border-r border-border-cool"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-cool">
                <div className="flex items-center">
                  <Logo className="h-9" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[#000000] hover:text-[#5C5C63] cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>
              
              {/* Accordion List */}
              <nav className="flex-1 flex flex-col px-4 py-6 space-y-2.5 overflow-y-auto text-xs font-semibold uppercase tracking-wider scrollbar-thin">
                {navigationItems.map((item) => {
                  const isMobileSubOpen = openMobileSub === item.name;
                  return (
                    <div key={item.name} className="border-b border-[#EAEAEA] pb-2">
                      <button
                        onClick={() => setOpenMobileSub(isMobileSubOpen ? null : item.name)}
                        className="w-full flex items-center justify-between py-2 text-[#000000] hover:text-[#5C5C63] text-left font-bold"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isMobileSubOpen ? "transform rotate-180 text-[#5C5C63]" : ""
                        }`} />
                      </button>

                      {/* Sub-Items Accordion Loop strictly matching uploaded list */}
                      {isMobileSubOpen && (
                        <div className="pl-4 py-2 flex flex-col space-y-2 normal-case tracking-normal text-[11px] font-medium text-slate-600 bg-[#F7F7F8] rounded-lg mt-1 border border-[#EAEAEA]">
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setIsOpen(false)}
                              className="py-1.5 block hover:text-accent-cyan border-b border-[#EAEAEA]/40 last:border-0"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="mt-auto px-6 py-6 border-t border-[#EAEAEA]">
                <Link href="/contact?rfq=true" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-[#000000] text-white py-3 rounded-lg font-bold text-xs tracking-widest hover:bg-[#2E2E33] transition-all cursor-pointer">
                    REQUEST B2B QUOTE
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
